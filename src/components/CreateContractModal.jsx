import React from 'react';
import {
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
  Textarea,
  Stack,
  Button,
  InputGroup, InputLeftElement,
} from '@chakra-ui/react';

const CreateContractModal = ({
  isOpen,
  onClose,
  contractDetails,
  setContractDetails,
  locks,
  handleCreateContract,
  handleFileChange,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContractDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
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
                name="lock_id"
                value={contractDetails.lock_id}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select a lock
                </option>
                {locks.map((lock) => (
                  <option key={lock.id} value={lock.id}>
                    {lock.name} (Zone: {lock.zone_name} - {lock.lock_number} - {lock.lock_name})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Contract Name</FormLabel>
              <Input
                type="text"
                name="contract_name"
                value={contractDetails.contract_name}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                name="start_date"
                value={contractDetails.start_date}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                name="end_date"
                value={contractDetails.end_date}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
  <FormLabel>Rent Rate</FormLabel>
  <InputGroup>
    <InputLeftElement pointerEvents="none" color="gray.400" fontSize="1.2em">
    ฿
    </InputLeftElement>
    <Input
      type="number"
      name="rent_rate"
      value={contractDetails.rent_rate}
      onChange={handleInputChange}
      placeholder="Enter amount"
    />
  </InputGroup>
</FormControl>
            <FormControl>
              <FormLabel>Water Rate</FormLabel>
              <Input
                type="number"
                name="water_rate"
                value={contractDetails.water_rate}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Electric Rate</FormLabel>
              <Input
                type="number"
                name="electric_rate"
                value={contractDetails.electric_rate}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Advance</FormLabel>
              <Input
                type="number"
                name="advance"
                value={contractDetails.advance}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Deposit</FormLabel>
              <Input
                type="number"
                name="deposit"
                value={contractDetails.deposit}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea
                name="note"
                value={contractDetails.note}
                onChange={handleInputChange}
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
  );
};

export default CreateContractModal;
