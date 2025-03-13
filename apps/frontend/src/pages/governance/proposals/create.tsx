import React from 'react';
import { Container, Box } from '@mui/material';
import CreateProposal from '@/components/governance/CreateProposal';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const CreateProposalPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // 如果用户未登录，重定向到登录页面
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/governance/proposals/create');
    }
  }, [isAuthenticated, router]);

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box py={4}>
          <CreateProposal />
        </Box>
      </Container>
    </Layout>
  );
};

export default CreateProposalPage; 