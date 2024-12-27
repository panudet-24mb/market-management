import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Image,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  Tag,
  Button,
  Spinner,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa"; // Import a user icon for fallback
import billService from "../../services/billService";

const BillingRow = ({ contract, isSelected, onSelect }) => {
  const hasProfileImage = !!contract.tenant_profile_image;
  const [total, setTotal] = useState(contract.calculations.total_bill);
  const [discount, setDiscount] = useState(0);
  const [vat, setVat] = useState(0);

  const calculateTotal = () => {
    const subtotal =
      contract.calculations.total_rent +
      contract.calculations.total_water_bill +
      contract.calculations.total_electric_bill -
      discount;
    const vatAmount = vat > 0 ? (subtotal * vat) / 100 : 0;
    setTotal(subtotal + vatAmount);
  };

  return (
    <Tr bg={isSelected ? "blue.50" : "white"}> {/* Highlight selected row */}
      <Td>
        <Checkbox
          isChecked={isSelected}
          isDisabled={!!contract.bill} // Disable checkbox if the contract has an existing bill
          onChange={() => onSelect(contract.contract_id)} // Use contract_id
        />
      </Td>
      <Td position="sticky" left={0} bg={isSelected ? "blue.100" : "white"} zIndex={1}>
        <VStack align="start">
          <HStack>
            {hasProfileImage ? (
              <Image
                src={contract.tenant_profile_image}
                alt={`${contract.tenant_name} Profile`}
                boxSize="40px"
                borderRadius="full"
                objectFit="cover"
                fallbackSrc="path/to/default-icon.png"
              />
            ) : (
              <Icon as={FaUserCircle} boxSize="40px" color="gray.400" />
            )}
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{contract.contract_number}</Text>
              <Text>{contract.tenant_name}</Text>
            </VStack>
          </HStack>
        </VStack>
      </Td>
      <Td>
        {contract.locks.map((lock) => (
          <Tag key={lock.lock_id} colorScheme="blue" mr={1}>
            {lock.lock_name}
          </Tag>
        ))}
      </Td>
      <Td>{contract.calculations.total_rent.toFixed(2)}</Td>
      <Td>{contract.calculations.total_water_bill.toFixed(2)}</Td>
      <Td>{contract.calculations.total_electric_bill.toFixed(2)}</Td>
      <Td>
        <NumberInput
          value={discount}
          min={0}
          onChange={(value) => {
            setDiscount(Number(value));
            calculateTotal();
          }}
        >
          <NumberInputField />
        </NumberInput>
      </Td>
      <Td>
        <NumberInput
          value={vat}
          min={0}
          onChange={(value) => {
            setVat(Number(value));
            calculateTotal();
          }}
        >
          <NumberInputField />
        </NumberInput>
      </Td>
      <Td>
        <Tag colorScheme="green">{total.toFixed(2)}</Tag>
      </Td>
      <Td>
        {contract.bill ? (
          <VStack align="start" spacing={1}>
            <Tag colorScheme="teal">{contract.bill.status || "Pending"}</Tag>
            <Text fontSize="sm">Bill No: {contract.bill.bill_number || "N/A"}</Text>
            <Tag colorScheme="blue">{contract.bill.ref_number || "N/A"}</Tag>
            <Text fontSize="sm">Total: {contract.bill.total?.toFixed(2) || "0.00"} ฿</Text>
            <Text fontSize="sm">Date: {contract.bill.date_check || "N/A"}</Text>
          </VStack>
        ) : (
          <Tag colorScheme="red">No Bill</Tag>
        )}
      </Td>
    </Tr>
  );
};

const BillingListPage = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const toast = useToast();

  const handleSelectContract = (contractId) => {
    setSelectedContracts((prevSelected) =>
      prevSelected.includes(contractId)
        ? prevSelected.filter((id) => id !== contractId)
        : [...prevSelected, contractId]
    );
  };

  const handleSaveSelected = async () => {
    const selectedData = contracts
      .filter((contract) => selectedContracts.includes(contract.contract_id))
      .map((contract) => ({
        contract_id: contract.contract_id, // Pass correct contract_id
        year: selectedYear,
        month: selectedMonth,
        discount: 0, // Add logic to handle dynamic discounts if required
        vat_percent: 0, // Add logic to handle dynamic VAT if required
      }));

    try {
      setIsLoading(true); // Start loading spinner
      await billService.createBills(selectedData); // Call the API to save bills
      toast({
        title: "Success",
        description: "Bills created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSelectedContracts([]); // Clear selected contracts after saving
      await fetchBillingData(); // Re-fetch billing data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bills.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  const fetchBillingData = async () => {
    try {
      setIsLoading(true); // Show loading spinner
      const data = await billService.getEligibleLocksForBilling(selectedYear, selectedMonth);
      setContracts(data);
    } catch (error) {
      toast({
        title: "Error Fetching Data",
        description: "Could not fetch billing data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [selectedYear, selectedMonth]);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Billing List
      </Text>

      <HStack mb={4}>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(0, month - 1).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </Select>
        <Button colorScheme="teal" onClick={handleSaveSelected} size={"md"}>
          Save
        </Button>
      </HStack>

      <Box overflowX="auto" w="100%">
        <Table variant="" size="md">
          <Thead>
            <Tr>
              <Th>Select</Th>
              <Th position="sticky" left={0} bg="gray.100" zIndex={2}>
                Contract Details
              </Th>
              <Th>Locks</Th>
              <Th>Rent (บาท)</Th>
              <Th>Water Bill (บาท)</Th>
              <Th>Electric Bill (บาท)</Th>
              <Th>Discount (บาท)</Th>
              <Th>VAT (%)</Th>
              <Th>Total (บาท)</Th>
              <Th>Bill Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contracts.map((contract) => (
              <BillingRow
                key={contract.contract_id}
                contract={contract}
                isSelected={selectedContracts.includes(contract.contract_id)}
                onSelect={handleSelectContract}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default BillingListPage;
