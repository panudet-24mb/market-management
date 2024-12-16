import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';

const ZoneDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Heading size="md">Zone Detail (ID: {id})</Heading>
      <Text mt={2}>Details about zone {id}...</Text>
      <Button mt={4} onClick={() => navigate('/zones')}>Back to Zones</Button>
    </Box>
  );
};

export default ZoneDetailPage;
