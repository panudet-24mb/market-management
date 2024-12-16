import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Avatar,
  Badge,
  Button,
  Flex,
  useToast,
} from '@chakra-ui/react';
import zoneService from '../../services/zoneService';
import ZoneCreateModal from './ZoneCreateModal';

const ZoneListPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [toast]);

  const handleZoneCreated = (newZone) => {
    setZones((prevZones) => [...prevZones, newZone]);
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Zones Management</Heading>
        <ZoneCreateModal onZoneCreated={handleZoneCreated} />
      </Flex>

      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Image</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {zones.map((zone) => (
            <Tr key={zone.id}>
              <Td>{zone.id}</Td>
              <Td>
                <Avatar
                  size="md"
                  src={`https://source.unsplash.com/100x100/?market,${zone.name}`}
                  name={zone.name}
                  bg="gray.200"
                />
              </Td>
              <Td>{zone.name}</Td>
              <Td>
                <Badge colorScheme={zone.status === 'ACTIVE' ? 'green' : 'red'}>
                  {zone.status}
                </Badge>
              </Td>
              <Td>
                {/* <Button size="sm" colorScheme="blue">
                  Edit
                </Button> */}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ZoneListPage;
