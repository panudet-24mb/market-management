import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import zoneService from '../../services/zoneService';

const ZoneCreateModal = ({ onZoneCreated }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [zoneName, setZoneName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreateZone = async () => {
    setLoading(true);
    try {
      const newZone = await zoneService.createZone({ name: zoneName, status: 'ACTIVE' }); // Always pass "ACTIVE"
      toast({
        title: 'Zone created successfully',
        description: `Zone "${newZone.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onZoneCreated(newZone);
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating zone',
        description: error.message || 'Unable to create zone',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>Create Zone</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Zone</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Zone Name</FormLabel>
              <Input
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Enter zone name"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={handleCreateZone}
              isLoading={loading}
              isDisabled={!zoneName.trim()} // Disable button if zone name is empty
            >
              Create
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ZoneCreateModal;
