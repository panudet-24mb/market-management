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
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa"; // Import a user icon for fallback
import billService from "../../services/billService";

const BillingRow = ({ contract }) => {
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
    <Tr>
      <Td position="sticky" left={0} bg="white" zIndex={1}>
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
        <Button colorScheme="teal">Save</Button>
      </Td>
    </Tr>
  );
};

const BillingListPage = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const toast = useToast();

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
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
        setIsLoading(false);
      }
    };
    fetchBillingData();
  }, [selectedYear, selectedMonth, toast]);

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
        {/* <Button
          colorScheme="teal"
          onClick={() => {
            setIsLoading(true);
            setContracts([]);
          }}
        >
          Refresh
        </Button> */}
      </HStack>

      <Box overflowX="auto" w="100%">
        <Table variant="striped" size="md">
          <Thead>
            <Tr>
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
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contracts.map((contract) => (
              <BillingRow key={contract.contract_number} contract={contract} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default BillingListPage;
