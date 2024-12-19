import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Button,
  Select,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FaWater, FaBolt } from 'react-icons/fa';

const MeterModal = ({ isOpen, onClose, newMeter, setNewMeter, handleAddMeter }) => {
  const handleSubmit = async () => {
    console.log("New Meter Submitted:", newMeter); // Debugging
    await handleAddMeter(); // Call the passed function
    setNewMeter({ meter_type: '', meter_number: '', meter_serial: '', note: '' }); // Reset the form
    onClose(); // Close the modal
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Meter</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex align="center" gap={2} mb={2}>
            <Text fontWeight="bold">Meter Type:</Text>
            <Select
              placeholder="Select Meter Type"
              value={newMeter.meter_type}
              onChange={(e) => setNewMeter({ ...newMeter, meter_type: e.target.value })}
            >
              <option value="Water Meter">
                <Flex align="center" gap={2}>
                  <FaWater /> Water Meter
                </Flex>
              </option>
              <option value="Electric Meter">
                <Flex align="center" gap={2}>
                  <FaBolt /> Electric Meter
                </Flex>
              </option>
            </Select>
          </Flex>
          <Input
            placeholder="Meter Number"
            value={newMeter.meter_number}
            onChange={(e) => setNewMeter({ ...newMeter, meter_number: e.target.value })}
            mb={2}
          />
          <Input
            placeholder="Meter Serial"
            value={newMeter.meter_serial}
            onChange={(e) => setNewMeter({ ...newMeter, meter_serial: e.target.value })}
            mb={2}
          />
          <Input
            placeholder="Note"
            value={newMeter.note}
            onChange={(e) => setNewMeter({ ...newMeter, note: e.target.value })}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MeterModal;
