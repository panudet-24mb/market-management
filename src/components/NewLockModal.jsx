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
  Switch,
  Button,
} from '@chakra-ui/react';

const NewLockModal = ({
  isOpen,
  onClose,
  newLock,
  setNewLock,
  zones,
  handleAddNewLock,
}) => {
  // Validate if `zone_id` exists
  const isZoneSelected = !!newLock.zone_id;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Lock</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              value={newLock.lock_name}
              onChange={(e) =>
                setNewLock({ ...newLock, lock_name: e.target.value })
              }
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Lock Number</FormLabel>
            <Input
              value={newLock.lock_number}
              onChange={(e) =>
                setNewLock({ ...newLock, lock_number: e.target.value })
              }
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Zone</FormLabel>
            <Select
              value={newLock.zone_id}
              placeholder="Select a zone"
              onChange={(e) =>
                setNewLock({ ...newLock, zone_id: e.target.value })
              }
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Size</FormLabel>
            <Input
              value={newLock.size}
              onChange={(e) =>
                setNewLock({ ...newLock, size: e.target.value })
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Active</FormLabel>
            <Switch
              isChecked={newLock.active}
              onChange={(e) =>
                setNewLock({ ...newLock, active: e.target.checked })
              }
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={handleAddNewLock}
            isDisabled={!isZoneSelected} // Disable the button if `zone_id` is not selected
          >
            Add Lock
          </Button>
          <Button onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewLockModal;
