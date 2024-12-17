import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Switch,
  Stack,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons'; // Import eye icon
import { useNavigate } from 'react-router-dom';
import lockService from '../../services/lockService';
import zoneService from '../../services/zoneService';

const ITEMS_PER_PAGE = 5;

const LockListPage = () => {
  const [locks, setLocks] = useState([]);
  const [zones, setZones] = useState([]);
  const [filteredLocks, setFilteredLocks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    lock_number: '',
    zone_id: '',
    size: '',
    active: true,
  });

  useEffect(() => {
    const fetchLocksAndZones = async () => {
      try {
        const locksData = await lockService.getLocks();
        const zonesData = await zoneService.getZones();

        setLocks(locksData);
        setFilteredLocks(locksData);
        setZones(zonesData);
      } catch (error) {
        toast({
          title: 'Error loading data',
          description: error.message || 'An error occurred while fetching locks and zones.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLocksAndZones();
  }, [toast]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value;
    setSearch(searchQuery);
    applyFilters(searchQuery, selectedZone);
  };

  const handleZoneFilter = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    applyFilters(search, zoneId);
  };

  const applyFilters = (searchQuery, zoneId) => {
    let filtered = [...locks];

    if (searchQuery) {
      filtered = filtered.filter((lock) =>
        lock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (zoneId) {
      filtered = filtered.filter((lock) => lock.zone_id === parseInt(zoneId));
    }

    setFilteredLocks(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLocks.length / ITEMS_PER_PAGE);
  const displayedLocks = filteredLocks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleCreateLock = async () => {
    try {
      const newLock = await lockService.createLock(formData);

      toast({
        title: 'Lock created successfully',
        description: `Lock ${newLock.name} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setLocks((prevLocks) => [...prevLocks, newLock]);
      setFilteredLocks((prevLocks) => [...prevLocks, newLock]);
      onClose();
      setFormData({ name: '', lock_number: '', zone_id: '', size: '', active: true });
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

  const goToDetails = (lockId) => {
    navigate(`/locks/${lockId}`);
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Lock Management
      </Heading>

      <Flex mb={4} gap={4}>
        <Input placeholder="Search by lock name" value={search} onChange={handleSearch} />
        <Select placeholder="Filter by zone" value={selectedZone} onChange={handleZoneFilter}>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </Select>
        <Button colorScheme="teal" onClick={onOpen}>
          +
        </Button>
      </Flex>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      ) : (
        <>
          <Table variant="striped" size="md">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Lock Number</Th>
                <Th>Zone</Th>
                <Th>Size</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedLocks.map((lock) => (
                <Tr key={lock.id}>
                  <Td>{lock.id}</Td>
                  <Td>{lock.name}</Td>
                  <Td>{lock.lock_number}</Td>
                  <Td>{zones.find((zone) => zone.id === lock.zone_id)?.name || 'Unknown'}</Td>
                  <Td>{lock.size}</Td>
                  <Td>{lock.active ? 'Yes' : 'No'}</Td>
                  <Td>
                    <IconButton
                      icon={<ViewIcon />}
                      colorScheme="blue"
                      onClick={() => goToDetails(lock.id)}
                      aria-label="View Lock Details"
                      size="sm"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent="space-between" mt={4}>
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </Flex>
        </>
      )}

      {/* Create Lock Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Lock</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Lock Number</FormLabel>
                <Input
                  name="lock_number"
                  value={formData.lock_number}
                  onChange={(e) => setFormData({ ...formData, lock_number: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Zone</FormLabel>
                <Select
                  name="zone_id"
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleCreateLock}>
              Create
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LockListPage;
