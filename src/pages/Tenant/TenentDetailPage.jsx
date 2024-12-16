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
  Input,
  Select,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import tenantService from '../../services/tenentService';
import contractService from '../../services/contractService';
import lockService from '../../services/lockService';

const TenantDetailPage = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractDetails, setContractDetails] = useState({
    lockId: '',
    startDate: '',
    endDate: '',
    contractDocuments: [],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const tenantData = await tenantService.getTenantById(id);
        const tenantContracts = await contractService.getContractsWithDocumentsByTenantId(id);
        const lockData = await lockService.getLocks();

        setTenant({ ...tenantData, contracts: tenantContracts });
        setLocks(lockData);
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

    fetchTenantDetails();
  }, [id, toast]);

  const handleCreateContract = async () => {
    try {
      const formData = new FormData();
      formData.append('tenantId', tenant.id);
      formData.append('lockId', contractDetails.lockId);
      formData.append('startDate', contractDetails.startDate);
      formData.append('endDate', contractDetails.endDate);

      contractDetails.contractDocuments.forEach((file) => {
        formData.append('documents', file);
      });

      const savedContract = await contractService.createContract(formData);

      toast({
        title: 'Contract created successfully',
        description: `Contract ${savedContract.contractNumber} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setTenant((prevTenant) => ({
        ...prevTenant,
        contracts: Array.isArray(prevTenant.contracts)
          ? [...prevTenant.contracts, savedContract]
          : [savedContract],
      }));

      setContractDetails({
        lockId: '',
        startDate: '',
        endDate: '',
        contractDocuments: [],
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error creating contract',
        description: error.message || 'An error occurred while creating the contract.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileChange = (e) => {
    setContractDetails({
      ...contractDetails,
      contractDocuments: Array.from(e.target.files),
    });
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!tenant) {
    return (
      <Box p={6} textAlign="center">
        <Text fontSize="lg" color="gray.500">
          Tenant not found.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      {/* Tenant Details Section */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        mb={6}
        boxShadow="lg"
        bg="white"
      >
        <Stack direction="row" spacing={6} alignItems="center">
          <Avatar
            size="xl"
            src={tenant.profile_image || 'https://via.placeholder.com/150'}
            name={`${tenant.first_name} ${tenant.last_name}`}
          />
          <Box>
            <Heading size="lg">{tenant.first_name} {tenant.last_name}</Heading>
            <Text fontSize="md" color="gray.600">{tenant.nick_name ? `Nickname: ${tenant.nick_name}` : 'No nickname'}</Text>
            <Text fontSize="md"><strong>Contact:</strong> {tenant.contact || 'N/A'}</Text>
            <Text fontSize="md"><strong>Phone:</strong> {tenant.phone || 'N/A'}</Text>
            <Text fontSize="md"><strong>Address:</strong> {tenant.address || 'N/A'}</Text>
            <Text fontSize="md"><strong>Note:</strong> {tenant.note || 'No additional notes'}</Text>
          </Box>
        </Stack>
      </Box>

      {/* Create Contract Button */}
      <Button colorScheme="teal" onClick={onOpen} mb={6}>
        Create New Contract
      </Button>

      {/* Contracts Section */}
      <Heading size="md" mb={4}>
        Contracts
      </Heading>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Contract Number</Th>
            <Th>Lock</Th>
            <Th>Start Date</Th>
            <Th>End Date</Th>
            <Th>Status</Th>
            <Th>Documents</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tenant.contracts?.map((contract) => (
            <Tr key={contract.id}>
              <Td>{contract.contractNumber}</Td>
              <Td>{locks.find((lock) => lock.id === contract.lockId)?.name || 'Unknown'}</Td>
              <Td>{contract.startDate}</Td>
              <Td>{contract.endDate}</Td>
              <Td>
                {new Date(contract.endDate) > new Date() ? (
                  <Badge colorScheme="green">Active</Badge>
                ) : (
                  <Badge colorScheme="red">Expired</Badge>
                )}
              </Td>
              <Td>
                {contract.documents?.map((doc) => (
                  <Button
                    as="a"
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    colorScheme="blue"
                    key={doc.filename}
                  >
                    {doc.filename}
                  </Button>
                ))}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Create Contract Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Contract</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Select Lock</FormLabel>
                <Select
                  value={contractDetails.lockId}
                  onChange={(e) =>
                    setContractDetails({ ...contractDetails, lockId: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select a lock
                  </option>
                  {locks.map((lock) => (
                    <option key={lock.id} value={lock.id}>
                      {lock.name} (Zone: {lock.zone})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={contractDetails.startDate}
                  onChange={(e) =>
                    setContractDetails({ ...contractDetails, startDate: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={contractDetails.endDate}
                  onChange={(e) =>
                    setContractDetails({ ...contractDetails, endDate: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Upload Contract Documents</FormLabel>
                <Input type="file" multiple onChange={handleFileChange} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleCreateContract}>
              Create Contract
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

export default TenantDetailPage;
