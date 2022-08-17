import { TypePolicy } from '@apollo/client/cache'
import { Maybe, Organization } from '@app/generated/civic.apollo'
export const CvcUserPolicy: TypePolicy = {
  fields: {
    mostRecentOrg: {
      read: (org: Maybe<Organization>, { readField }) => {
        console.log(`user.policy mostRecentOrg read()`)
        return undefined
        // if (v.mostRecentOrganizationId) {
        //   return v.organizations.find(
        //     (o) => o.id === v.mostRecentOrganizationId
        //   )
        // } else {
        //   return undefined
        // }
      },
    },
  },
}
