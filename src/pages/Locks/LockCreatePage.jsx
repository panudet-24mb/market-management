import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Stack,
  useToast,
  Switch,
} from '@chakra-ui/react';
import lockService from '../../services/lockService';
import zoneService from '../../services/zoneService';
import { useNavigate } from 'react-router-dom';

const LockCreatePage = () => {
  const [zones, setZones] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    lock_number: '',
    zone_id: '',
    size: '',
    active: true,
  });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await zoneService.getZones();
        setZones(data);
      } catch (error) {
        toast({
          title: 'Error loading zones',
          description: error.message || 'An error occurred while fetching zones.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchZones();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      active: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newLock = await lockService.createLock(formData);

      toast({
        title: 'Lock created successfully',
        description: `Lock ${newLock.name} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/locks');
    } catch (error) {
      toast({
        title: 'Error creating lock',
        description: error.message || 'An error occurred while creating the lock.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Create New Lock
      </Heading>
      <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter lock name"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Lock Number</FormLabel>
            <Input
              name="lock_number"
              value={formData.lock_number}
              onChange={handleInputChange}
              placeholder="Enter lock number"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Zone</FormLabel>
            <Select
              name="zone_id"
              value={formData.zone_id}
              onChange={handleInputChange}
              placeholder="Select zone"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Size</FormLabel>
            <Input
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="Enter lock size"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Status</FormLabel>
            <Switch
              isChecked={formData.active}
              onChange={handleSwitchChange}
              colorScheme="teal"
            >
              Active
            </Switch>
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg">
            Create Lock
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default LockCreatePage;
