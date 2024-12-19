import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLeftIcon,
  Avatar,
  IconButton,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, TimeIcon, ViewIcon } from '@chakra-ui/icons';
import contractService from '../services/contractService';

const LockTable = ({ displayedLocks, zones, goToDetails, onClickIconEye, fetchLocksAndZones }) => {
  const toast = useToast();

  // State for the AlertDialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const cancelRef = React.useRef();

  // Open and close dialog
  const openDialog = (contractId) => {
    setSelectedContractId(contractId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedContractId(null);
    setIsDialogOpen(false);
  };

  // Cancel contract handler
  const handleCancelContract = async () => {
    try {
      if (!Number.isInteger(selectedContractId)) {
        throw new Error('Invalid contract ID. It must be an integer.');
      }

      await contractService.cancelContract(selectedContractId);

      toast({
        title: 'Contract cancelled successfully',
        description: 'The contract has been cancelled.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedContractId(null);
      setIsDialogOpen(false);
      fetchLocksAndZones();

      // Refresh lock data
      // if (fetchLocksAndZones) {
      //   await fetchLocksAndZones(); // Ensure it re-fetches data
      // }
    } catch (error) {
      toast({
        title: 'Error cancelling contract',
        description: error.message || 'An error occurred while cancelling the contract.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Lock Number</Th>
            <Th>Zone</Th>
            {/* <Th>Size</Th> */}
            <Th>Status</Th>
            <Th>PIC</Th>
            <Th>Tenant</Th>
            <Th>ContractName</Th>
            <Th>Contract Number</Th>
            <Th>Start</Th>
            <Th>End</Th>
            <Th>Days Left</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {displayedLocks.map((lock) => (
            <Tr key={lock.lock_id}>
              <Td>{lock.lock_id}</Td>
              <Td>{lock.lock_name}</Td>
              <Td>{lock.lock_number}</Td>
              <Td>{zones.find((zone) => zone.id === lock.zone_id)?.name || 'Unknown'}</Td>
              {/* <Td>{lock.size}</Td> */}
              <Td>
                <Tag colorScheme={lock.active ? 'green' : 'red'}>
                  <TagLeftIcon as={lock.active ? CheckCircleIcon : WarningIcon} />
                  {lock.active ? 'Active' : 'Inactive'}
                </Tag>
              </Td>
              <Td>
                <Avatar
                  name={lock.profile_image || 'U'}
                  src={lock.profile_image && lock.profile_image !== '' ? lock.profile_image : undefined}
                  size="sm"
                />
              </Td>
              <Td>{lock.tenant_name || 'No Tenant'}</Td>
              <Td>
                {lock.contract_name ? (
                  <Tag colorScheme="blue">{lock.contract_name}</Tag>
                ) : (
                  'N/A'
                )}
              </Td>
              <Td>
                {lock.contract_number ? (
                  <Tag colorScheme="blue">{lock.contract_number}</Tag>
                ) : (
                  'N/A'
                )}
              </Td>
              <Td>{lock.start_date || 'N/A'}</Td>
              <Td>{lock.end_date || 'N/A'}</Td>
              <Td>
                {lock.days_left !== null ? (
                  <Tag colorScheme={lock.is_near_expiry ? 'red' : 'blue'}>
                    <TagLeftIcon as={TimeIcon} />
                    {lock.days_left} days
                  </Tag>
                ) : (
                  'N/A'
                )}
              </Td>
              <Td>
                <IconButton
                  icon={<ViewIcon />}
                  colorScheme="blue"
                  onClick={() => onClickIconEye(lock.lock_id)}
                  aria-label="View Lock Details"
                  size="sm"
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => goToDetails(lock.lock_id)}
                  isDisabled={lock.contract_id !== null && lock.contract_id !== undefined}
                  ml={2}
                >
                  Bind Contract
                </Button>
                <Button
                  colorScheme="yellow"
                  size="sm"
                  onClick={() => openDialog(lock.contract_id)} // Open confirmation dialog
                  isDisabled={!lock.contract_id}
                  ml={2}
                >
                  Cancel
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Contract
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel this contract? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDialog}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleCancelContract} ml={3}>
                Yes, Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default LockTable;
