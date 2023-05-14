import { ApolloError, gql } from '@apollo/client'
import styled from 'styled-components'

import {
  useGetCustomerQuery,
  CustomerMainInfosFragmentDoc,
  AddCustomerDrawerFragmentDoc,
  TimezoneEnum,
  StatusTypeEnum,
  useGetCustomerSubscriptionForUsageQuery,
} from '~/generated/graphql'
import { theme, NAV_HEIGHT } from '~/styles'
import { Typography } from '~/components/designSystem'
import { UsageItem, UsageItemSkeleton } from '~/components/customers/usage/UsageItem'
import { useGetPortalCustomerInfosQuery } from '~/generated/graphql'

gql`
  query getPortalCustomerInfos {
    customerPortalUser {
      id
      name
      legalName
      paymentProvider
      email
      addressLine1
      addressLine2
      state
      country
      city
      zipcode
    }
  }
`

interface CustomerUsageSectionProps {
  translate: Function
}

const PortalCustomerUsage = ({ translate }: CustomerUsageSectionProps) => {
  const { data, loading, error } = useGetPortalCustomerInfosQuery()
  const customerPortalUser = data?.customerPortalUser

  return (
    <section role="grid" tabIndex={-1}>
      <PageHeader>
        <Typography variant="subhead" color="grey700">
          {translate('text_62c3f3fca8a1625624e8337b')}
        </Typography>
      </PageHeader>
      <CustomerUsageSection
        customerId={customerPortalUser?.id}
        translate={translate}
        parentLoading={loading}
        parentError={error}
      />
    </section>
  )
}

gql`
  fragment CustomerDetails on Customer {
    id
    name
    externalId
    hasActiveWallet
    currency
    hasCreditNotes
    creditNotesCreditsAvailableCount
    creditNotesBalanceAmountCents
    applicableTimezone
    activeSubscriptionCount
    ...AddCustomerDrawer
    ...CustomerMainInfos
  }

  query getCustomer($id: ID!) {
    customer(id: $id) {
      ...CustomerDetails
    }
  }

  mutation generateCustomerPortalUrl($input: GenerateCustomerPortalUrlInput!) {
    generateCustomerPortalUrl(input: $input) {
      url
    }
  }

  ${AddCustomerDrawerFragmentDoc}
  ${CustomerMainInfosFragmentDoc}
`

interface CustomerUsageSectionProps {
  customerId?: string
  translate: Function
  parentLoading?: boolean
  parentError?: ApolloError
}

const CustomerUsageSection = ({
  customerId,
  translate,
  parentLoading,
  parentError,
}: CustomerUsageSectionProps) => {
  const { data, loading, error } = useGetCustomerQuery({
    variables: { id: customerId as string },
    skip: !customerId,
    notifyOnNetworkStatusChange: true,
  })

  const { applicableTimezone } = data?.customer || {}
  const safeTimezone = applicableTimezone || TimezoneEnum.TzUtc

  return (
    <section>
      <CustomerUsageContent
        customerTimezone={safeTimezone}
        translate={translate}
        customerId={customerId}
        parentLoading={parentLoading || loading}
        parentError={parentError || error}
      />
    </section>
  )
}

gql`
  fragment CustomerSubscriptionForUsage on Subscription {
    id
    name
    status
    plan {
      id
      name
      code
    }
  }

  query getCustomerSubscriptionForUsage($id: ID!) {
    customer(id: $id) {
      id
      subscriptions(status: [active, pending]) {
        id
        ...CustomerSubscriptionForUsage
      }
    }
  }
`

interface CustomerUsageContentProps {
  customerTimezone: TimezoneEnum
  customerId?: string
  translate: Function
  parentLoading?: boolean
  parentError?: ApolloError
}

export const CustomerUsageContent = ({
  customerTimezone,
  customerId: id,
  translate,
  parentLoading,
  parentError,
}: CustomerUsageContentProps) => {
  const { data, loading, error } = useGetCustomerSubscriptionForUsageQuery({
    variables: { id: id as string },
    skip: !id,
  })
  const subscriptions = data?.customer?.subscriptions
  const isError = parentError || error
  const isLoading = parentLoading || loading

  return (
    <div>
      {isError || subscriptions?.filter((s) => s.status === StatusTypeEnum.Active).length === 0 ? (
        <Typography>{translate('text_6419c64eace749372fc72b3f')}</Typography>
      ) : (
        <>
          {isLoading ? (
            <Content>
              {[0, 1, 2].map((i) => (
                <UsageItemSkeleton key={`customer-usage-skeleton-${i}`} />
              ))}
            </Content>
          ) : (
            <Content>
              {subscriptions
                ?.filter((s) => s.status === StatusTypeEnum.Active)
                .map((subscription) => (
                  <UsageItem
                    key={subscription?.id}
                    customerId={id as string}
                    subscription={subscription}
                    customerTimezone={customerTimezone}
                  />
                ))}
            </Content>
          )}
        </>
      )}
    </div>
  )
}

const PageHeader = styled.div<{ $isEmpty?: boolean }>`
  align-items: center;
  display: flex;
  height: ${NAV_HEIGHT}px;
  justify-content: space-between;

  box-shadow: ${theme.shadows[7]};
  margin-bottom: ${theme.spacing(6)};
`

const Content = styled.div`
  > :not(:last-child) {
    margin-bottom: ${theme.spacing(4)};
  }
`

export default PortalCustomerUsage
