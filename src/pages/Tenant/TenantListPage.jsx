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
  Text,
  HStack,
} from '@chakra-ui/react';
import { FaLine } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import tenantService from '../../services/tenentService';
import TenantCreatePage from './TenantCreatePage'; // Import the create tenant component

const LIFF_URL = "https://liff.line.me/2006705987-JqM5Ky0Q";

const TenantListPage = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null); // Store selected tenant for modal
  const toast = useToast();
  const { isOpen: isQrModalOpen, onOpen: onQrModalOpen, onClose: onQrModalClose } = useDisclosure();
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure(); // Modal controls for tenant creation
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

  const generateQRCode = (tenant) => {
    const qrUrl = `${LIFF_URL}?customer_code=${tenant.code}`;
    setQrCodeData(qrUrl);
    setSelectedTenant(tenant); // Store selected tenant for modal
    onQrModalOpen();
  };

  const handleTenantCreated = async () => {
    onCreateModalClose(); // Close the creation modal
    try {
      // Refresh tenant list after creation
      const data = await tenantService.getTenants();
      setTenants(data);
      setFilteredTenants(data);
      toast({
        title: 'Tenant created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error refreshing tenants',
        description: error.message || 'Failed to update tenant list.',
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
        <Button colorScheme="teal" onClick={onCreateModalOpen}>
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
            <Th>LINE</Th>
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
                {tenant.line_register ? (
                  <HStack>
                    <FaLine size="24px" color="green" />
                    <Avatar
                      size="sm"
                      src={tenant.line_img || 'https://via.placeholder.com/150'}
                      name={tenant.line_name || 'LINE User'}
                    />
                    <Text>{tenant.line_name || 'LINE User'}</Text>
                  </HStack>
                ) : (
                  <Text color="gray.500">Not Registered</Text>
                )}
              </Td>
              <Td>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={() => generateQRCode(tenant)}
                  mr={2}
                >
                  {tenant.line_register ? 'Update LINE' : 'Generate QR'}
                </Button>
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

      {/* QR Code Modal */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            QR Code for {selectedTenant?.first_name} {selectedTenant?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <QRCode value={qrCodeData} size={256} />
              <Text mt={4} fontSize="lg" fontWeight="bold">
                {selectedTenant?.first_name} {selectedTenant?.last_name}
              </Text>
              <Text mt={2}>Customer Code: {selectedTenant?.code}</Text>
              <Text>Phone: {selectedTenant?.phone}</Text>
            </Box>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button onClick={onQrModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Tenant Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Tenant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TenantCreatePage onSubmit={handleTenantCreated} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TenantListPage;
