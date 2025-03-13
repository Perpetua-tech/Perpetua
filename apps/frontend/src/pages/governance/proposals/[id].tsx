import React from 'react';
import { Container, Box } from '@mui/material';
import { useRouter } from 'next/router';
import ProposalDetail from '@/components/governance/ProposalDetail';
import Layout from '@/components/Layout/Layout';

const ProposalDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box py={4}>
          {id && typeof id === 'string' && <ProposalDetail proposalId={id} />}
        </Box>
      </Container>
    </Layout>
  );
};

export default ProposalDetailPage; 