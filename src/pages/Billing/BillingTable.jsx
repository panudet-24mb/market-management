import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  useToast,
} from "@chakra-ui/react";

const BillingTable = ({ year, month }) => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchBillingData(year, month);
  }, [year, month]);

  const fetchBillingData = async (year, month) => {
    try {
      const response = await fetch(`/api/eligible-locks-for-billing?year=${year}&month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch billing data");
      }
      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmBill = async (lockId) => {
    try {
      const response = await fetch("/api/generate-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lock_id: lockId, year, month }),
      });
      if (!response.ok) {
        throw new Error("Failed to confirm bill");
      }
      toast({
        title: "Bill generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchBillingData(year, month); // Refresh data after confirming
    } catch (error) {
      toast({
        title: "Error generating bill",
        description: error.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Lock Name</Th>
            <Th>Tenant</Th>
            <Th>Contract</Th>
            <Th>Water Usage</Th>
            <Th>Electric Usage</Th>
            <Th>Total Rent</Th>
            <Th>Total</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan="8" textAlign="center">
                <Spinner />
              </Td>
            </Tr>
          ) : billingData.length > 0 ? (
            billingData.map((bill) => (
              <Tr key={bill.lock_id}>
                <Td>{bill.lock_name}</Td>
                <Td>{bill.tenant_name}</Td>
                <Td>{bill.contract_name}</Td>
                <Td>{bill.total_water.toFixed(2)} Baht</Td>
                <Td>{bill.total_electric.toFixed(2)} Baht</Td>
                <Td>{bill.total_rent.toFixed(2)} Baht</Td>
                <Td>{bill.total_bill.toFixed(2)} Baht</Td>
                <Td>
                  <Button colorScheme="teal" onClick={() => confirmBill(bill.lock_id)}>
                    Confirm
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan="8" textAlign="center">
                No data available for the selected month.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default BillingTable;
