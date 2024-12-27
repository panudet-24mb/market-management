import React from "react";
import { Flex, VStack, Text, Image, Divider, Box } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { Logo_FULL_JPG } from "../../assets/Images";

const ThankYouPage = () => {
  const location = useLocation();
  const { transactionDetails } = location.state || {};


  return (
    <Flex align="center" justify="center" h="80vh" bg="gray.50" p={6}>
      <VStack spacing={6} align="center">
        <Image src={Logo_FULL_JPG} alt="Market Logo" boxSize="100px" />
        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
          Thank You for Your Submission
        </Text>
        <Text mt={4} fontSize="sm" color="gray.500">
           SpaceDee - พื้นที่ดี ชีวิตดี ระบบจัดการพื้นที่เช่าครบวงจร ทั้งตลาดและที่พักอาศัย
         </Text>
       
      </VStack>
      
    </Flex>
  );
};


//   return (
//     <Flex direction="column" align="center" h="100vh" bg="gray.50" p={6}>
//       <VStack spacing={6} align="center">
//         <Image src={Logo_FULL_JPG} alt="Market Logo" boxSize="100px" />
//         <Text fontSize="2xl" fontWeight="bold" color="teal.500">
//           Thank You for Your Submission
//         </Text>
        
//       </VStack>
//       <Box mt={8} textAlign="center">
//         <Divider />
//         <Text mt={4} fontSize="sm" color="gray.500">
//           SpaceDee - พื้นที่ดี ชีวิตดี ระบบจัดการพื้นที่เช่าครบวงจร ทั้งตลาดและที่พักอาศัย
//         </Text>
//       </Box>
//     </Flex>
//   );
// };

export default ThankYouPage;
