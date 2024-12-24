import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  NumberInput,
  NumberInputField,
  Button,
} from "@chakra-ui/react";

const AddReserveModal = ({
  isOpen,
  onClose,
  newReserve,
  handleInputChange,
  handleFileChange,
  handleAddReserveSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Reserve</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Status</FormLabel>
            <Select
              placeholder="Select Status"
              value={newReserve.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Contract Type</FormLabel>
            <Select
              placeholder="Select Contract Type"
              value={newReserve.contract_type}
              onChange={(e) => handleInputChange("contract_type", e.target.value)}
            >
              <option value="RESIDENCE">Residence</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Contract Name</FormLabel>
            <Input
              placeholder="Enter contract name"
              value={newReserve.contract_name}
              onChange={(e) => handleInputChange("contract_name", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Contract Number</FormLabel>
            <Input
              placeholder="Enter phone number"
              value={newReserve.contract_number}
              onChange={(e) => handleInputChange("contract_number", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Contract Note</FormLabel>
            <Textarea
              placeholder="Enter notes"
              value={newReserve.contract_note}
              onChange={(e) => handleInputChange("contract_note", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Deposit</FormLabel>
            <NumberInput
              min={0}
              value={newReserve.deposit}
              onChange={(value) => handleInputChange("deposit", value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Advance</FormLabel>
            <NumberInput
              min={0}
              value={newReserve.advance}
              onChange={(value) => handleInputChange("advance", value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Upload Attachments</FormLabel>
            <Input type="file" multiple onChange={handleFileChange} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleAddReserveSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddReserveModal;
