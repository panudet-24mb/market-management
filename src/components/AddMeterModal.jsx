import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react";
import lockService from "../services/lockService";

const AddMeterModal = ({ isOpen, onClose, lockId, fetchLocksAndZones }) => {
  const toast = useToast();
  const [availableMeters, setAvailableMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      console.log("Fetching available meters...1."); // Debug log
      fetchAvailableMeters().then(() => {
        console.log("Fetching available meters...2."); // Debug log
      }).catch((error) => {
        console.error("Error fetching meters:", error); // Debug log for errors
      });
    }
  }, [isOpen]);
  
  const fetchAvailableMeters = async () => {
    try {
      const meters = await lockService.getAvailableMeters();
      console.log("Fetching available meters..2."); // Debug log
      setAvailableMeters(meters);
    } catch (error) {
      toast({
        title: "Error fetching meters",
        description: error.message || "Failed to fetch available meters.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddMeter = async () => {
    if (!selectedMeterId) {
      toast({
        title: "Please select a meter",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await lockService.addMeterToLock(lockId, selectedMeterId);
      toast({
        title: "Meter added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchLocksAndZones(); // Refresh locks and zones
      onClose(); // Close the modal
    } catch (error) {
      toast({
        title: "Error adding meter",
        description: error.message || "Failed to add meter.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Meters</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Select
              placeholder="Select a meter"
              value={selectedMeterId}
              onChange={(e) => setSelectedMeterId(e.target.value)}
            >
              {availableMeters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                 {meter.id} {meter.meter_name} {meter.meter_number} {meter.meter_serial}
                </option>
              ))}
            </Select>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleAddMeter} isLoading={loading}>
            Add Meter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMeterModal;
