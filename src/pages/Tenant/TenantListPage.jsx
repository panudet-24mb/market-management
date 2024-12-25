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
  Button,
  Avatar,
  Input,
  Spinner,
  Stack,
  useToast,
  Badge,
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
  Textarea,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import tenantService from '../../services/tenentService';

const TenantListPage = () => {
  const [loadingApi, setLoadingApi] = useState(false)
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTenant, setNewTenant] = useState({
    prefix: '',
    first_name: '',
    last_name: '',
    nick_name: '',
    contact: '',
    phone: '',
    address: '',
    line_id: '',
    note: '',
  });

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await tenantService.getTenants();
        setTenants(data);
        setFilteredTenants(data);
      } catch (error) {
        toast({
          title: 'Error loading tenants',
          description: error.message || 'An error occurred while fetching tenants.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [toast]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = tenants.filter(
      (tenant) =>
        tenant.first_name.toLowerCase().includes(query) ||
        tenant.last_name.toLowerCase().includes(query) ||
        tenant.nick_name?.toLowerCase().includes(query) ||
        tenant.phone?.includes(query)
    );
    setFilteredTenants(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTenant((prevTenant) => ({ ...prevTenant, [name]: value }));
  };

  const handleCreateTenant = async () => {
    setLoadingApi(true)
    try {
      const createdTenant = await tenantService.createTenant(newTenant);
      setTenants((prevTenants) => [...prevTenants, createdTenant]);
      setFilteredTenants((prevTenants) => [...prevTenants, createdTenant]);

      toast({
        title: 'Tenant created successfully',
        description: `Tenant ${createdTenant.first_name} ${createdTenant.last_name} has been added.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setNewTenant({
        prefix: '',
        first_name: '',
        last_name: '',
        nick_name: '',
        contact: '',
        phone: '',
        address: '',
        line_id: '',
        note: '',
      });
      setLoadingApi(false)
      onClose();
    } catch (error) {
      setLoadingApi(false)
      toast({
        title: 'Error creating tenant',
        description: error.message || 'An error occurred while creating the tenant.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Tenant Management
      </Heading>

      <Stack direction="row" spacing={4} mb={4}>
        <Input
          placeholder="Search tenants..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <Button colorScheme="teal" onClick={onOpen}>
          Add New Tenant
        </Button>
      </Stack>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Avatar</Th>
            <Th>Code</Th>
            <Th>Prefix</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Phone</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredTenants.map((tenant) => (
            <Tr key={tenant.id}>
              <Td>{tenant.id}</Td>
              <Td>
                <Avatar
                  src={tenant.profile_image || 'https://via.placeholder.com/150'}
                  name={`${tenant.first_name} ${tenant.last_name}`}
                />
              </Td>
              <Td>
                <Badge colorScheme="blue">{tenant.code}</Badge>
              </Td>
              <Td>{tenant.prefix}</Td>
              <Td>{tenant.first_name}</Td>
              <Td>{tenant.last_name}</Td>
              <Td>{tenant.phone}</Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  View Details
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Create Tenant Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Tenant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Prefix</FormLabel>
                <Input
                  name="prefix"
                  value={newTenant.prefix}
                  onChange={handleInputChange}
                  placeholder="Enter prefix (e.g., Mr, Mrs)"
                />
              </FormControl>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="first_name"
                  value={newTenant.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="last_name"
                  value={newTenant.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nickname</FormLabel>
                <Input
                  name="nick_name"
                  value={newTenant.nick_name}
                  onChange={handleInputChange}
                  placeholder="Enter nickname"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={newTenant.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  value={newTenant.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Line ID</FormLabel>
                <Input
                  name="line_id"
                  value={newTenant.line_id}
                  onChange={handleInputChange}
                  placeholder="Enter Line ID"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Textarea
                  name="note"
                  value={newTenant.note}
                  onChange={handleInputChange}
                  placeholder="Enter note"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleCreateTenant} disabled={loadingApi} >
              Create Tenant
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

export default TenantListPage;