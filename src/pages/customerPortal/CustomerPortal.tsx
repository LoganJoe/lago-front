import { gql } from '@apollo/client'
import styled from 'styled-components'

import { theme } from '~/styles'
import { useGetPortalOrgaInfosQuery } from '~/generated/graphql'
import { Skeleton, Typography } from '~/components/designSystem'
import Logo from '~/public/images/logo/lago-logo-grey.svg'
import { PortalCustomerInfos } from '~/components/customerPortal/PortalCustomerInfos'
import PortalInvoicesList from '~/components/customerPortal/PortalInvoicesList'
import PortalCustomerUsage from '~/components/customerPortal/PortalCustomerUsage'
import PortalCustomerDebugger from '~/components/customerPortal/PortalCustomerDebugger'

gql`
  query getPortalOrgaInfos {
    customerPortalOrganization {
      id
      name
      logoUrl
    }
  }
`

interface CutsomerPortalProps {
  translate: Function
}

const CustomerPortal = ({ translate }: CutsomerPortalProps) => {
  const { data, loading } = useGetPortalOrgaInfosQuery()

  return (
    <PageWrapper>
      <PageHeader>
        {loading ? (
          <InlineItems>
            <Skeleton variant="connectorAvatar" size="medium" marginRight={theme.spacing(3)} />
            <Skeleton variant="text" height={12} width={120} />
          </InlineItems>
        ) : (
          <InlineItems>
            {!!data?.customerPortalOrganization?.logoUrl && (
              <OrgaLogoContainer>
                <img
                  src={data.customerPortalOrganization?.logoUrl}
                  alt={`${data.customerPortalOrganization?.name}'s logo`}
                />
              </OrgaLogoContainer>
            )}
            <Typography variant="headline">{data?.customerPortalOrganization?.name}</Typography>
          </InlineItems>
        )}
        
      </PageHeader>

      <PortalCustomerInfos translate={translate} />
      <PortalInvoicesList translate={translate} />
      <PortalCustomerUsage translate={translate} />
      <PortalCustomerDebugger translate={translate}/>
    </PageWrapper>
  )
}

const InlineItems = styled.div`
  display: flex;
  align-items: center;
`

const InlinePoweredByTypography = styled(Typography)`
  margin-right: ${theme.spacing(1)};
`

const StyledLogo = styled(Logo)`
  width: 40px;
`

const PageWrapper = styled.div`
  max-width: 1024px;
  margin: ${theme.spacing(20)} auto;
  padding: 0 ${theme.spacing(4)};

  > section {
    margin-bottom: ${theme.spacing(12)};
  }
`

const PageHeader = styled.section`
  display: flex;
  justify-content: space-between;

  > div:first-child {
    width: 100%;
    flex: 1;
  }
`

const OrgaLogoContainer = styled.div`
  width: 32px;
  height: 32px;
  margin-right: ${theme.spacing(3)};
  border-radius: 8px;

  > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export default CustomerPortal
