import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  Spinner,
  useToast,
  Box,
  Text,
  Tag,
  TagLeftIcon,
  VStack,
} from '@chakra-ui/react';
import { TimeIcon, WarningIcon } from '@chakra-ui/icons';
import tenantService from '../services/tenentService';
import contractService from '../services/contractService';

const BindContractModal = ({ isOpen, onClose, lockId, refreshLocks }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await tenantService.getAllTenants();
        setTenants(data);
      } catch (error) {
        toast({
          title: 'Error loading tenants',
          description: error.response?.data?.detail || 'Failed to fetch tenants.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingTenants(false);
      }
    };

    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen, toast]);

  const handleTenantChange = async (tenantId) => {
    setSelectedTenant(tenantId);
    setContracts([]);
    setSelectedContract('');
    setLoadingContracts(true);

    try {
      const data = await contractService.getContractsWithDocumentsByTenantId(tenantId);
      setContracts(data);
    } catch (error) {
      toast({
        title: 'Error loading contracts',
        description: error.response?.data?.detail || 'Failed to fetch contracts for the selected tenant.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleBindContract = async () => {
    try {
      await contractService.bindContractToLock(lockId, selectedContract);

      toast({
        title: 'Contract bound successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      refreshLocks(); // Refresh the lock data in the parent component
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to bind contract to lock.';
      toast({
        title: 'Error binding contract',
        description: errorMessage,
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    }
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const timeDiff = end - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bind Contract</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loadingTenants ? (
            <Spinner size="xl" />
          ) : (
            <Box mb={4}>
              <Text mb={2}>Step 1: Select a Tenant</Text>
              <Select
                placeholder="Select a tenant"
                value={selectedTenant}
                onChange={(e) => handleTenantChange(e.target.value)}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name}
                  </option>
                ))}
              </Select>
            </Box>
          )}

          {selectedTenant && (
            <Box>
              <Text mb={2}>Step 2: Select a Contract</Text>
              {loadingContracts ? (
                <Spinner size="xl" />
              ) : contracts.length > 0 ? (
                <Select
                  placeholder="Select a contract"
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                >
                  {contracts.map((contract) => {
                    const daysLeft = calculateDaysLeft(contract.end_date);
                    const statusText = daysLeft > 0 ? (
                      <Tag colorScheme={daysLeft <= 30 ? 'red' : 'green'}>
                        <TagLeftIcon as={TimeIcon} /> {daysLeft} days left
                      </Tag>
                    ) : (
                      <Tag colorScheme="red">
                        <TagLeftIcon as={WarningIcon} /> Expired
                      </Tag>
                    );
                    return (
                      <option key={contract.id} value={contract.id}>
                        {contract.contract_number} - {contract.start_date} to {contract.end_date} {statusText}
                      </option>
                    );
                  })}
                </Select>
              ) : (
                <Text>No contracts available for the selected tenant.</Text>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={handleBindContract}
            isDisabled={!selectedContract}
          >
            Bind Contract
          </Button>
          <Button onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BindContractModal;
