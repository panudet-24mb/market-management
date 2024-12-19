// src/components/NavigationBar.jsx
import React from 'react';
import { Flex, Box, Heading, HStack, Button, IconButton, Icon, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FaBuilding, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

const NavigationBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  const bg = useColorModeValue('green.600', 'green.800');
  const textColor = useColorModeValue('white', 'gray.100');
  const hoverBg = useColorModeValue('green.700', 'green.900');
  const navButtonBg = useColorModeValue('green.500', 'green.700');

  return (
    <Flex
      as="nav"
      bg={bg}
      color={textColor}
      p={4}
      justify="space-between"
      align="center"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="sm"
    >
      {/* Logo and Site Name */}
      <HStack spacing={3} cursor="pointer" onClick={() => navigate('/')}>
        <Icon as={FaBuilding} boxSize={6} color="white" />
        <Heading as="h1" size="md" color="white">
          GoGo Market
        </Heading>
      </HStack>

      {/* Navigation Links */}
      <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
        <Button variant="ghost" color="white" _hover={{ bg: hoverBg }} onClick={() => navigate('/zones')}>
          Zones
        </Button>
        
        {/* New link for Locks page */}
        <Button variant="ghost" color="white" _hover={{ bg: hoverBg }} onClick={() => navigate('/locks')}>
          Locks
        </Button>
        
        <Button variant="ghost" color="white" _hover={{ bg: hoverBg }} onClick={() => navigate('/billings')}>
          Billing
        </Button>
        <Button variant="ghost" color="white" _hover={{ bg: hoverBg }} onClick={() => navigate('/tenant-list')}>
          Tenants
        </Button>
        <Button variant="ghost" color="white" _hover={{ bg: hoverBg }} onClick={() => navigate('/meters')}>
          Meters
        </Button>
      </HStack>

      {/* User Actions */}
      <HStack spacing={2}>
        {isAuthenticated ? (
          <IconButton
            icon={<FaSignOutAlt />}
            aria-label="Logout"
            colorScheme="red"
            variant="outline"
            onClick={() => dispatch(logout())}
            title="Logout"
          />
        ) : (
          <IconButton
            icon={<FaSignInAlt />}
            aria-label="Login"
            bg={navButtonBg}
            color="white"
            _hover={{ bg: hoverBg }}
            onClick={() => navigate('/login')}
            title="Login"
          />
        )}
      </HStack>
    </Flex>
  );
};

export default NavigationBar;
