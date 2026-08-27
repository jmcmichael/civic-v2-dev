import { ApolloLink } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import possibleTypesResult from '@app/generated/civic.possible-types'
import { CvcTypePolicies } from '@app/graphql/graphql.type-policies'
import { provideApollo } from 'apollo-angular'
import { Observable } from 'rxjs'

/** One GraphQL operation as the mock link saw it. */
export interface MockGraphqlOperation {
  operationName: string
  variables: Record<string, any>
}

/**
 * Return this from `respond` to answer an operation with GraphQL errors —
 * the client surfaces them as a CombinedGraphQLErrors rejection/error.
 */
export function graphqlErrors(...messages: string[]) {
  return { __graphqlErrors: messages.map((message) => ({ message })) }
}

/**
 * Apollo providers for tests that exercise queries: a real InMemoryCache plus a
 * link that answers each operation from `respond` and records it, so specs can
 * assert how many times (and with what variables) a field queried.
 */
export function provideMockApollo(
  respond: (operation: MockGraphqlOperation) => any,
  recorded?: MockGraphqlOperation[]
) {
  return provideApollo(() => ({
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const called: MockGraphqlOperation = {
            operationName: operation.operationName ?? '',
            variables: operation.variables as Record<string, any>,
          }
          recorded?.push(called)
          const deliver = (result: any) => {
            if (result?.__graphqlErrors) {
              observer.next({ data: null, errors: result.__graphqlErrors })
            } else {
              observer.next({ data: result })
            }
            observer.complete()
          }
          const result = respond(called)
          // a Promise result lets a spec hold a response in flight
          // (synchronous delivery is preserved for everything else)
          if (result instanceof Promise) {
            result.then(deliver, (err) => observer.error(err))
          } else {
            deliver(result)
          }
        })
    ),
    cache: new InMemoryCache({
      possibleTypes: possibleTypesResult.possibleTypes,
      typePolicies: CvcTypePolicies,
    }),
  }))
}

/**
 * Apollo providers for cache-oriented component tests (e.g. CvcTag /
 * watchFragment): a real InMemoryCache configured exactly like the app's
 * (possibleTypes + type policies), optionally pre-seeded via `seed`, with a
 * terminating link that fails loudly if a test unexpectedly reaches the
 * network. For typeahead/query tests use `provideMockApollo` instead.
 */
export function provideSeededApollo(seed?: (cache: InMemoryCache) => void) {
  return provideApollo(() => {
    const cache = new InMemoryCache({
      possibleTypes: possibleTypesResult.possibleTypes,
      typePolicies: CvcTypePolicies,
    })
    seed?.(cache)
    return {
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            observer.error(
              new Error(
                `Unexpected network operation in seeded-cache test: ${operation.operationName}`
              )
            )
          })
      ),
      cache,
    }
  })
}
