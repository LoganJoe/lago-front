import { gql } from '@apollo/client'

import {
  TimezoneEnum,
  usePortalGetOrganizationInfosQuery,
  MainOrganizationInfosFragment,
} from '~/generated/graphql'
import { TimeZonesConfig, TimezoneConfigObject } from '~/core/timezone'
import { formatDateToTZ } from '~/core/timezone'

gql`
  fragment MainOrganizationInfos on Organization {
    id
    name
    logoUrl
    timezone
  }

  query getOrganizationInfos {
    organization {
      ...MainOrganizationInfos
    }
  }
`

type UseOrganizationInfos = () => {
  organization?: MainOrganizationInfosFragment
  timezone: TimezoneEnum
  timezoneConfig: TimezoneConfigObject
  formatTimeOrgaTZ: (date: string, format?: string) => string
}

export const usePortalOrganizationInfos: UseOrganizationInfos = () => {
  const { data } = usePortalGetOrganizationInfosQuery({
    fetchPolicy: 'cache-first',
    canonizeResults: true,
  })
  const orgaTimezone = data?.organization?.timezone || TimezoneEnum.TzUtc
  const timezoneConfig = TimeZonesConfig[orgaTimezone]

  return {
    organization: data?.organization || undefined,
    timezone: orgaTimezone || TimezoneEnum.TzUtc,
    timezoneConfig,
    formatTimeOrgaTZ: (date, format) =>
      formatDateToTZ(date, orgaTimezone, format || 'LLL. dd, yyyy'),
  }
}
