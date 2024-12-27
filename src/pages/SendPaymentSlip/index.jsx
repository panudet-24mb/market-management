import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  useToast,
  Image,
  FormControl,
  FormLabel,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { useSearchParams, useNavigate } from "react-router-dom"; // React Router v6
import billService from "../../services/billService";
import { Logo_FULL_JPG } from '../../assets/Images';

const SendPaymentSlipPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const billNumber = searchParams.get("bill_number");
  const refNumber = searchParams.get("ref_number");
  const [billDetails, setBillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchBillDetails = async () => {
      if (!billNumber || !refNumber) {
        toast({
          title: "Invalid URL",
          description: "Missing bill_number or ref_number in URL.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      try {
        const details = await billService.getBillDetails(billNumber, refNumber);
        setBillDetails(details);
      } catch (error) {
        toast({
          title: "Error Fetching Bill",
          description: "Could not fetch bill details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillDetails();
  }, [billNumber, refNumber, toast]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a payment slip file to upload.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("bill_number", billNumber);
    formData.append("ref_number", refNumber);
    formData.append("transaction_type", "Payment Slip");
    formData.append("amount", billDetails?.total_vat || 0);
    formData.append("transaction_date", new Date().toISOString().split("T")[0]);
    formData.append("files", selectedFile);

    try {
      const response = await billService.sendPaymentSlip(formData);
      setTransactionDetails(response); // Save transaction details
      toast({
        title: "Success",
        description: "Payment slip submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate("/thank-you", { state: { transactionDetails: response } }); // Redirect to thank you page
      }, 2000);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment slip.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" p={6}>
      {/* Header with Logo */}
      <HStack justify="center" mb={6}>
        <Image src={Logo_FULL_JPG} alt="Market Logo" boxSize="80px" />
        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
          Market Payment Slip
        </Text>
      </HStack>

      {billDetails ? (
        <Box
          w="full"
          maxW="lg"
          p={6}
          bg="white"
          borderRadius="lg"
          shadow="xl"
          border="1px"
          borderColor="gray.200"
        >
          {/* Bill Details */}
          <VStack align="start" spacing={3} mb={6}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Bill Details
            </Text>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Bill Number:</Text>
              <Tag colorScheme="blue">{billDetails.bill_number}</Tag>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Bill Status:</Text>
              <Tag colorScheme="blue">{billDetails.bill_status}</Tag>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Reference Number:</Text>
              <Tag colorScheme="green">{billDetails.ref_number}</Tag>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Bill Name:</Text>
              <Text>{billDetails.bill_name}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Date:</Text>
              <Text>{billDetails.date_check}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Rent:</Text>
              <Text>{billDetails.rent?.toFixed(2)} ฿</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Water:</Text>
              <Text>{billDetails.water?.toFixed(2)} ฿</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Electric:</Text>
              <Text>{billDetails.electric?.toFixed(2)} ฿</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Total:</Text>
              <Text color="teal.500" fontWeight="bold">
                {billDetails.total_vat?.toFixed(2)} ฿
              </Text>
            </HStack>
          </VStack>

          {/* Upload Payment Slip */}
          <FormControl mb={6}>
            <FormLabel fontWeight="bold" color="gray.700">
              Upload Payment Slip
            </FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              borderColor="teal.400"
              focusBorderColor="teal.500"
            />
          </FormControl>

          {/* Submit Button */}
          <Button colorScheme="teal" w="full" onClick={handleSubmit}>
            Submit Payment Slip
          </Button>
          <Box mt={8} textAlign="center">
        <Divider />
        <Text mt={4} fontSize="sm" color="gray.500">
          SpaceDee - พื้นที่ดี ชีวิตดี ระบบจัดการพื้นที่เช่าครบวงจร ทั้งตลาดและที่พักอาศัย
        </Text>
      </Box>
        </Box>

        
      ) : (
        <Text color="red.500" fontWeight="bold">
          No bill details found for the provided parameters.
        </Text>
      )}
    </Flex>
  );
};

export default SendPaymentSlipPage;