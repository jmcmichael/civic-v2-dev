import { TypePolicies } from '@apollo/client/cache'
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { AppErrorsService } from '@app/core/services/app-errors.service'
import { LocalState } from '@apollo/client/local-state'
import result from '@app/generated/civic.possible-types'
import { provideApollo } from 'apollo-angular'
import { HttpBatchLink, HttpLink } from 'apollo-angular/http'
import { CvcTypePolicies } from './graphql.type-policies'
import { onError } from '@apollo/client/link/error'
import { inject } from '@angular/core'

const uri = '/api/graphql' // <-- URL of the GraphQL server

const typePolicies: TypePolicies = CvcTypePolicies

/**
 * Operations opt into batching with `context: { batch: true }` at the call site.
 *
 * Deliberately opt-in rather than app-wide. A batch is bounded by operation
 * *count*, not cost, so mixing cheap lookups with expensive detail queries makes
 * that bound meaningless — 25 tag lookups and 25 full entity queries are the same
 * number and wildly different work. Keeping batches homogeneous is what makes the
 * cap mean something.
 *
 * Opting in by context rather than by operation name is also deliberate: a name
 * convention drifts silently, and on the server a name proves nothing anyway
 * since the client supplies it.
 */
export const BATCHED = { batch: true } as const

export function createApollo(
  httpLink: HttpLink,
  batchLink: HttpBatchLink,
  appErrors?: AppErrorsService
): ApolloClient.Options {
  const http = httpLink.create({ uri: uri, withCredentials: true })

  // batchMax 25 covers the heaviest form measured (an assertion revise fires 25
  // tag lookups), so that form becomes one request. Exceeding it is not a
  // failure: Apollo dispatches a full batch and starts another, so 60 operations
  // become three requests. The server's cap is 100, anchored to the schema's
  // default_max_page_size.
  const batched = batchLink.create({
    uri: uri,
    withCredentials: true,
    batchInterval: 10,
    batchMax: 25,
  })

  const transport = ApolloLink.split(
    (operation) => operation.getContext()['batch'] === true,
    batched,
    http
  )

  const analyticsLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        'Civic-Client-Name': 'civic-frontend',
      },
    })
    return forward(operation)
  })
  const errorHandler = onError(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      // graphql results are handled where the operation ran (form alerts,
      // query error states)
      console.error('GraphQL Error:', error.errors)
    } else {
      // transport failures on ANY operation report once, here — form
      // submits included, so FormMutationService never forwards them
      console.error('Network Error:', error)
      appErrors?.report(error, operation.operationName)
    }
  })
  return {
    link: analyticsLink.concat(errorHandler).concat(transport),
    cache: new InMemoryCache({
      possibleTypes: result.possibleTypes,
      typePolicies: typePolicies,
    }),
    // @client fields need an explicit LocalState in AC4; the only one,
    // AdvancedSearchResult.formQuery, is computed by a type-policy read
    // function, so no resolvers
    localState: new LocalState(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
        // errorPolicy 'none' and returnPartialData false are AC4's defaults;
        // declaring them needs DeclareDefaultOptions module augmentation
      },
    },
  }
}

export const graphqlProvider = provideApollo(
  (
    httpLink: HttpLink = inject(HttpLink),
    batchLink: HttpBatchLink = inject(HttpBatchLink),
    appErrors: AppErrorsService = inject(AppErrorsService)
  ) => createApollo(httpLink, batchLink, appErrors)
)
