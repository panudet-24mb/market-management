import React, { useState, useEffect } from "react";
import LockReservesTable from "./LockReservesTable";
import {
  fetchLockReserves,
  addLockReserve,
  removeLockReserve,
  uploadAttachment,
  fetchLockReservesHistory, // Add history fetch
} from "../../services/lockReserveService";
import { ChakraProvider, Center, Spinner, Box, Text } from "@chakra-ui/react";

const LockReservesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchLockReserves();
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddReserve = async (newReserve) => {
    const addedReserve = await addLockReserve(newReserve);
    fetchData();
    return addedReserve;
  };

  const handleRemoveReserve = async (reserveId) => {
    await removeLockReserve(reserveId);
    fetchData();
  };

  const handleUploadFiles = async (reserveId, file) => {
    await uploadAttachment(reserveId, file);
  };

  const handleFetchHistory = async (lockId) => {
    if (!lockId) {
      console.error("Lock ID is required to fetch history.");
      throw new Error("Lock ID is required to fetch history.");
    }
    try {
      return await fetchLockReservesHistory(lockId); // Pass the lockId to the API call
    } catch (err) {
      console.error("Failed to fetch history:", err);
      return [];
    }
  };
  
  if (loading) {
    return (
      <ChakraProvider>
        <Center height="100vh">
          <Spinner size="xl" speed="0.8s" color="teal.500" />
          <Box ml={4}>
            <Text fontSize="lg" fontWeight="bold">
              Loading data, please wait...
            </Text>
          </Box>
        </Center>
      </ChakraProvider>
    );
  }

  if (error) {
    return (
      <ChakraProvider>
        <Center height="100vh">
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              Error: {error}
            </Text>
          </Box>
        </Center>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <LockReservesTable
        data={data}
        onAddReserve={handleAddReserve}
        onRemoveReserve={handleRemoveReserve}
        uploadFiles={handleUploadFiles}
        fetchHistory={handleFetchHistory} // Pass the fetch history function
      />
    </ChakraProvider>
  );
};

export default LockReservesPage;
