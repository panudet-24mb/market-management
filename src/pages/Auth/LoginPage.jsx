import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, Text } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';
import Footer from '../../components/Footer';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { error } = useSelector(state => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    dispatch(login({ username, password }));
  };

  return (
<>
<Box maxW="md" mx="auto" mt={10} p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Heading size="md" mb={4}>Login</Heading>
      <FormControl mb={4}>
        <FormLabel>Username</FormLabel>
        <Input
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          placeholder="1234"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      {error && (
        <Text color="red.500" mb={4}>{error}</Text>
      )}
      <Button colorScheme="teal" onClick={handleLogin}>
        Login
      </Button>
    </Box>

    <Footer />
</>
  );
};


export default LoginPage;
