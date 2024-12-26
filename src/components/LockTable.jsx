import React, { useState } from "react";
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
  Box,
  VStack,
  Text,
  HStack
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import contractService from "../services/contractService";
import lockService from "../services/lockService";

const LockTable = ({ displayedLocks, zones, goToDetails, onClickIconEye, openAddMeterModal, fetchLocksAndZones }) => {
  const toast = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const cancelRef = React.useRef();

  const openDialog = (contractId) => {
    setSelectedContractId(contractId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedContractId(null);
    setIsDialogOpen(false);
  };

  const handleCancelContract = async () => {
    try {
      if (!Number.isInteger(selectedContractId)) {
        throw new Error("Invalid contract ID. It must be an integer.");
      }

      await contractService.cancelContract(selectedContractId);

      toast({
        title: "Contract cancelled successfully",
        description: "The contract has been cancelled.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedContractId(null);
      setIsDialogOpen(false);
      fetchLocksAndZones();
    } catch (error) {
      toast({
        title: "Error cancelling contract",
        description: error.message || "An error occurred while cancelling the contract.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveMeter = async (lockId, meterId) => {
    try {
      await lockService.removeMeterFromLock(lockId, meterId);
      toast({
        title: "Meter removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchLocksAndZones();
    } catch (error) {
      toast({
        title: "Error removing meter",
        description: error.message || "An error occurred while removing the meter.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderBgTable = (data) => {
    if (data.days_left && data.days_left <= 60) {
      return "red.100";
    } else {
      if (data.contract_number) {
        return "green.100";
      } else if (data.lock_reserves.length > 0) {
        return "orange.100";
      }
    }
  };

  return (
    <>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Lock Number</Th>
            <Th>Zone</Th>
            <Th>Status</Th>
            <Th>PIC</Th>
            <Th>Tenant</Th>
            <Th>Contract Name</Th>
            <Th>Contract Number</Th>
            <Th>Start</Th>
            <Th>End</Th>
            <Th>Days Left</Th>
            <Th>Reserve List</Th>
            <Th>Meters</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {displayedLocks.map((lock) => (
            <Tr key={lock.lock_id} bg={renderBgTable(lock)}>
              <Td>{lock.lock_id}</Td>
              <Td>{lock.lock_name}</Td>
              <Td>{lock.lock_number}</Td>
              <Td>{zones.find((zone) => zone.id === lock.zone_id)?.name || "Unknown"}</Td>
              <Td>
                <Tag colorScheme={lock.active ? "green" : "red"}>
                  <TagLeftIcon as={lock.active ? CheckCircleIcon : WarningIcon} />
                  {lock.active ? "Active" : "Inactive"}
                </Tag>
              </Td>
              <Td>
                <Avatar
                  name={lock.profile_image || "U"}
                  src={lock.profile_image && lock.profile_image !== "" ? lock.profile_image : undefined}
                  size="sm"
                />
              </Td>
              <Td>{lock.tenant_name || "No Tenant"}</Td>
              <Td>
                {lock.contract_name ? <Tag colorScheme="blue">{lock.contract_name}</Tag> : "N/A"}
              </Td>
              <Td>
                {lock.contract_number ? <Tag colorScheme="blue">{lock.contract_number}</Tag> : "N/A"}
              </Td>
              <Td>{lock.start_date || "N/A"}</Td>
              <Td>{lock.end_date || "N/A"}</Td>
              <Td>
                {lock.days_left !== null ? (
                  <Tag colorScheme={lock.is_near_expiry ? "red" : "blue"}>
                    <TagLeftIcon as={TimeIcon} />
                    {lock.days_left} days
                  </Tag>
                ) : (
                  "N/A"
                )}
              </Td>
              <Td>
                {lock.lock_reserves.length > 0 ? (
                  <VStack align="start">
                    {lock.lock_reserves.map((reserve) => (
                      <Box key={reserve.reserve_id} p={2} borderWidth="1px" borderRadius="md" backgroundColor={"blue.200"}>
                        <Tag colorScheme="purple">{reserve.contract_name}</Tag>
                        <Text fontSize="sm">Contract Number: {reserve.contract_number}</Text>
                        <Text fontSize="sm">Contract Note: {reserve.contract_note}</Text>
                        <Text fontSize="sm">Created: {new Date(reserve.created_at).toLocaleString()}</Text>
                        <Tag colorScheme="green">Deposit: {reserve.deposit}</Tag>
                        <Tag colorScheme="green">Advance: {reserve.advance}</Tag>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  "No Reserves"
                )}
              </Td>
              <Td>
  {lock.meters && lock.meters.length > 0 ? (
    <VStack align="start" spacing={4} w="100%">
      {lock.meters.map((meter) => (
        <Box
          key={meter.meter_id}
          p={4}
          borderWidth="2px"
          borderColor="blue.300"
          borderRadius="lg"
          backgroundColor="gray.100"
          shadow="md"
          w="100%"
          display="flex"
          flexDirection="column"
          alignItems="start"
        >
          {/* Header */}
          <Box
            bg="blue.500"
            color="white"
            w="100%"
            p={2}
            borderRadius="md"
            textAlign="center"
            fontWeight="bold"
          >
            {meter.meter_type}
          </Box>
          {/* Body */}
          <VStack align="start" spacing={2} mt={3} w="100%">
            <HStack spacing={2} w="100%">
              <Tag colorScheme="blue" size="md">
                <strong>Number:</strong> {meter.meter_number}
              </Tag>
              <Tag colorScheme="green" size="md">
                <strong>Serial:</strong> {meter.meter_serial}
              </Tag>
            </HStack>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Meter Status: <strong>Active</strong>
            </Text>
          </VStack>
          {/* Footer */}
          <Button
            size="sm"
            colorScheme="red"
            mt={3}
            onClick={() => handleRemoveMeter(lock.lock_id, meter.meter_id)}
          >
            Remove Meter
          </Button>
        </Box>
      ))}
    </VStack>
  ) : (
    <Text color="gray.500">No Meters</Text>
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
                  onClick={() => openDialog(lock.contract_id)}
                  isDisabled={!lock.contract_id}
                  ml={2}
                >
                  Cancel
                </Button>
                <br/>
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => openAddMeterModal(lock.lock_id)}
                  ml={2}
                >
                  + Meters
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AlertDialog isOpen={isDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDialog}>
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
