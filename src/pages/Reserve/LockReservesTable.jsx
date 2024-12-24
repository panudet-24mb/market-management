import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Tag,
  Text,
  VStack,
  HStack,
  Stack,
  Heading,
  Button,
  useToast,
  Image,
  Link,
  Spacer,
} from "@chakra-ui/react";
import AddReserveModal from "./AddReserveModal";
import HistoryModal from "./HistoryModal";


const LockReservesTable = ({ data, onAddReserve, onRemoveReserve, uploadFiles , fetchHistory }) => {
  const [search, setSearch] = useState("");
  const toast = useToast();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedLockId, setSelectedLockId] = useState(null);
  const [newReserve, setNewReserve] = useState({
    status: "",
    contract_name: "",
    contract_type: "",
    contract_number: "",
    contract_note: "",
    deposit: 0,
    advance: 0,
  });

  const [historyData, setHistoryData] = useState([]);
  const [files, setFiles] = useState([]);

  const BASE_URL = "http://37.27.181.156:18992/uploads/";

  // const BASE_URL = "http://localhost:4000/uploads/";

  const filteredData = data.filter(
    (lock) =>
      lock.lock_name.toLowerCase().includes(search.toLowerCase()) ||
      lock.lock_id.toString().includes(search)
  );

  const openModal = (lockId) => {
    setSelectedLockId(lockId);
    setModalOpen(true);
  };

  const openHistoryModal = async (lockId) => {
    try {
      if (!lockId) {
        throw new Error("Invalid Lock ID");
      }
      const history = await fetchHistory(lockId); // Pass lockId to fetchHistory
      setHistoryData(history.data.lock_reserves); // Update state with fetched history data
      setHistoryModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch history.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setHistoryData([]);
  };



  const closeModal = () => {
    setModalOpen(false);
    setNewReserve({
      status: "",
      contract_name: "",
      contract_type: "",
      contract_number: "",
      contract_note: "",
      deposit: 0,
      advance: 0,
    });
    setFiles([]);
  };

  const handleInputChange = (field, value) => {
    setNewReserve((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleAddReserveSubmit = async () => {
    try {
      const reserve = {
        lock_id: selectedLockId,
        ...newReserve,
      };

      const addedReserve = await onAddReserve(reserve);

      if (files.length > 0) {
        await Promise.all(files.map((file) => uploadFiles(addedReserve.id, file)));
      }

      toast({
        title: "Reserve Added",
        description: `A new reserve has been added for Lock ID ${selectedLockId}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reserve or upload files.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveReserve = async (reserveId) => {
    try {
      await onRemoveReserve(reserveId);
      toast({
        title: "Reserve Removed",
        description: `Reserve ID ${reserveId} has been removed`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove reserve.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isImage = (filename) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    const ext = filename.split(".").pop().toLowerCase();
    return imageExtensions.includes(ext);
  };

  return (
    <ChakraProvider>
      <Box p={6}>
        <VStack spacing={4} align="stretch">
          <Heading size="lg" textAlign="center">
            Reserve Management System
          </Heading>
          <Input
            placeholder="Search by Lock Name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="lg"
          />
          <TableContainer borderWidth="1px" borderRadius="md" shadow="lg">
            <Table variant="striped" colorScheme="gray" size="lg">
              <Thead>
                <Tr>
                  <Th>Lock ID</Th>
                  <Th>Lock Name</Th>
                  <Th>Reserves</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((lock) => (
                  <Tr key={lock.lock_id}>
                    <Td>{lock.lock_id}</Td>
                    <Td>{lock.lock_name}</Td>
                    <Td>
                      {lock.lock_reserves.length > 0 ? (
                        <VStack align="start" spacing={4}>
                          {lock.lock_reserves.map((reserve) => (
                            <Box
                              key={reserve.id}
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              shadow="sm"
                              bg="gray.50"
                              w="100%"
                            >
                              <Stack spacing={2}>
                                <Text>
                                  <Tag colorScheme="blue">
                                    <strong>Status:</strong> {reserve.status}
                                  </Tag>
                                </Text>
                       
                                <Text>
                                  <strong> Name:</strong> {reserve.contract_name}
                                </Text>
                                <Text>
                                  <strong>MobilePhone:</strong> {reserve.contract_number}
                                </Text>
                     
                                <Text>
                                  <strong> Note:</strong> {reserve.contract_note}
                                </Text>
                                <HStack>
                                  <Tag colorScheme="green">Deposit: {reserve.deposit}</Tag>
                                  <Tag colorScheme="blue">Advance: {reserve.advance}</Tag>
                                </HStack>
                                <VStack align="start">
                                  <Text fontWeight="bold">Attachments:</Text>
                                  {reserve.attachments.map((attachment) =>
                                    isImage(attachment.filename) ? (
                                      <Image
                                        key={attachment.id}
                                        src={`${BASE_URL}${attachment.filename}`}
                                        alt={attachment.filename}
                                        boxSize="100px"
                                        objectFit="contain"
                                        mb={2}
                                      />
                                    ) : (
                                      <Link
                                        key={attachment.id}
                                        href={`${BASE_URL}${attachment.filename}`}
                                        download={attachment.filename}
                                        color="blue.500"
                                        isExternal
                                      >
                                        {attachment.filename}
                                      </Link>
                                    )
                                  )}
                                </VStack>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  mt={2}
                                  onClick={() => handleRemoveReserve(reserve.id)}
                                >
                                  Remove Reserve
                                </Button>
                              </Stack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Tag colorScheme="gray">No Reserves</Tag>
                      )}
                    </Td>
                    <Td  style={ {margin: "50px"}}> 
                      <Button colorScheme="teal" onClick={() => openModal(lock.lock_id)}>
                        Add Reserve
                      </Button> 
                    
                      <Button colorScheme="orange" onClick={() => openHistoryModal(lock.lock_id)}>
                          History
                        </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
        <AddReserveModal
          isOpen={isModalOpen}
          onClose={closeModal}
          newReserve={newReserve}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleAddReserveSubmit={handleAddReserveSubmit}
        />
          <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={closeHistoryModal}
          data={historyData}
        />
      </Box>
    </ChakraProvider>
  );
};

export default LockReservesTable;
