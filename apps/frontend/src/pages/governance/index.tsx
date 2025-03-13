import React from 'react';
import { Container, Box } from '@mui/material';
import ProposalList from '@/components/governance/ProposalList';
import Layout from '@/components/Layout/Layout';

const GovernancePage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box py={4}>
          <ProposalList />
        </Box>
      </Container>
    </Layout>
  );
};

export default GovernancePage; 