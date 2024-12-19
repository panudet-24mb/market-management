import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Stack,
  Spinner,
  useToast,
  Avatar,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import tenantService from '../../services/tenentService';
import contractService from '../../services/contractService';
import lockService from '../../services/lockService';
import CreateContractModal from '../../components/CreateContractModal';
import AddDocumentsModal from '../../components/AddDocumentsModal';

const TenantDetailPage = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [locks, setLocks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractDetails, setContractDetails] = useState({
    lock_id: '',
    start_date: '',
    end_date: '',
    rent_rate: '',
    water_rate: '',
    electric_rate: '',
    advance: '',
    deposit: '',
    note: '',
    documents: [],
  });
  const [selectedContract, setSelectedContract] = useState(null);
  const toast = useToast();
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isAddDocumentsModalOpen, setIsAddDocumentsModalOpen] = useState(false);

  const fetchTenantDetails = async () => {
    setLoading(true);
    try {
      const tenantData = await tenantService.getTenantById(id);
      setTenant(tenantData);

      const tenantContracts = await contractService.getContractsWithDocumentsByTenantId(id);
      setContracts(tenantContracts || []);

      const lockData = await lockService.getLocks();
      setLocks(lockData || []);
    } catch (error) {
      toast({
        title: 'Error loading tenant details',
        description: error.message || 'An error occurred while fetching tenant details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, [id]);

  const handleAddDocuments = async (newDocuments) => {
    if (!selectedContract) return;

    try {
      const formData = new FormData();
      newDocuments.forEach((file) => {
        formData.append('files', file);
      });

      await contractService.addDocumentsToContract(selectedContract.id, formData);

      toast({
        title: 'Documents added successfully',
        description: 'New documents have been added to the contract.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchTenantDetails();
      setIsAddDocumentsModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error adding documents',
        description: error.message || 'An error occurred while adding documents.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
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
      {/* Tenant Details Section */}
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="lg" bg="white">
        <Stack direction={['column', 'row']} spacing={6} alignItems="center">
          <Avatar
            size="xl"
            src={tenant?.profile_image || 'https://via.placeholder.com/150'}
            name={`${tenant?.first_name} ${tenant?.last_name}`}
          />
          <Box>
            <Heading size="lg">{tenant?.first_name} {tenant?.last_name}</Heading>
            <Text fontSize="md" color="gray.600">{tenant?.nick_name || 'No nickname'}</Text>
            <Text fontSize="md"><strong>Contact:</strong> {tenant?.contact || 'N/A'}</Text>
            <Text fontSize="md"><strong>Phone:</strong> {tenant?.phone || 'N/A'}</Text>
            <Text fontSize="md"><strong>Address:</strong> {tenant?.address || 'N/A'}</Text>
          </Box>
        </Stack>
      </Box>

      {/* Contracts Table */}
      <Button colorScheme="teal" onClick={() => setIsContractModalOpen(true)} mb={6}>
        Create New Contract
      </Button>
      <CreateContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contractDetails={contractDetails}
        setContractDetails={setContractDetails}
        locks={locks}
        handleCreateContract={() => fetchTenantDetails()}
      />
      <Box borderWidth="1px" borderRadius="lg" p={4} boxShadow="lg" bg="white" mb={6}>
        <Heading size="md" mb={4}>
          Contracts
        </Heading>
        {contracts.length > 0 ? (
          <Box overflowX="auto">
            <Table variant="striped" size="sm">
              <Thead>
                <Tr>
                  <Th>Contract Number</Th>
                  <Th>Lock</Th>
                  <Th>Rent Rate</Th>
                  <Th>Water Rate</Th>
                  <Th>Electric Rate</Th>
                  <Th>Advance</Th>
                  <Th>Deposit</Th>
                  <Th>Days Left</Th>
                  <Th>Documents</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contracts.map((contract) => {
                  const daysLeft = getDaysLeft(contract.end_date);
                  return (
                    <Tr key={contract.id}>
                      <Td>{contract.contract_number}</Td>
                      <Td>{locks.find((lock) => lock.id === contract.lock_id)?.name || 'Unknown'}</Td>
                      <Td>{parseFloat(contract.rent_rate).toFixed(2)}</Td>
                      <Td>{parseFloat(contract.water_rate).toFixed(2)}</Td>
                      <Td>{parseFloat(contract.electric_rate).toFixed(2)}</Td>
                      <Td>{parseFloat(contract.advance).toFixed(2)}</Td>
                      <Td>{parseFloat(contract.deposit).toFixed(2)}</Td>
                      <Td>
                        {daysLeft > 0 ? (
                          <Badge colorScheme={daysLeft <= 60 ? 'red' : daysLeft <= 180 ? 'orange' : 'green'}>
                            {daysLeft} days
                          </Badge>
                        ) : (
                          <Text color="red">Expired</Text>
                        )}
                      </Td>
                      <Td>
                        {contract.documents?.length > 0 ? (
                          <Wrap spacing={2}>
                            {contract.documents.map((doc, index) => (
                              <WrapItem key={index}>
                                <a
                                  href={`http://localhost:4000/${doc.path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: 'underline', color: 'blue' }}
                                >
                                  {doc.filename}
                                </a>
                              </WrapItem>
                            ))}
                          </Wrap>
                        ) : (
                          <Text>No documents</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={new Date(contract.end_date) > new Date() ? 'green' : 'red'}>
                          {new Date(contract.end_date) > new Date() ? 'Active' : 'Expired'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsAddDocumentsModalOpen(true);
                          }}
                        >
                          Add Documents
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Text textAlign="center" color="gray.500">
            No contracts available.
          </Text>
        )}
      </Box>

      {/* Add Documents Modal */}
      <AddDocumentsModal
        isOpen={isAddDocumentsModalOpen}
        onClose={() => setIsAddDocumentsModalOpen(false)}
        handleAddDocuments={handleAddDocuments}
      />
    </Box>
  );
};

export default TenantDetailPage;
