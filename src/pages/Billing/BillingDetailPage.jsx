import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';

const BillingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <Box p={4}>
      <Heading size="md">Billing Detail (ID: {id})</Heading>
      <Text mt={2}>Details about billing {id}...</Text>
      <Button mt={4} onClick={() => navigate('/billings')}>Back to Billings</Button>
    </Box>
  );
};

export default BillingDetailPage;
