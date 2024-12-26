import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const DashboardPage = () => {
  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>SpaceDee - สเปซดี</Heading>
      <Text fontSize="md" mb={6}>
      ยินดีต้อนรับสู่ SpaceDee พื้นที่ดี ชีวิตดี ระบบจัดการพื้นที่เช่าครบวงจร ทั้งตลาดและที่พักอาศัย
      </Text>
      
      <Heading size="md" mb={3}>Version Updates</Heading>
      
      <Box>
      <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.6</Text>
      <Text> ระบบออกบิล </Text>


      <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.5</Text>
      <Text>- Pair meter with lock for next calculate billing</Text>


      <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.4</Text>
      <Text>- Add Watcher for meter reading.</Text>
      <Text>- Add  MeterSystem</Text>
      <Text>- Watcher OCR V0.0.0.1</Text>
        <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.3</Text>
        <Text>- Implemented Line system for better communication and management.</Text>

        <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.2</Text>
        <Text>- Added advanced meter tracking for utilities.</Text>
        <Text>- Introduced the reservation system to streamline bookings.</Text>

        <Text fontSize="lg" fontWeight="bold" mt={4}>v0.0.1</Text>
        <Text>- Launched the Zone system for market segmentation.</Text>
        <Box ml={4}>
          <Text>- Integrated lock functionality for enhanced security.</Text>
          <Text>- Introduced tenant management system for seamless operations.</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
