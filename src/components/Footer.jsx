import React from 'react';
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';

const Footer = () => {
  const bg = useColorModeValue('gray.100', 'gray.900');
  const color = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box bg={bg} color={color} py={4} mt={8}>
      <Flex justify="center" align="center">
        <Text fontSize="sm">
          © {new Date().getFullYear()} Noksoft Company. All Rights Reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
