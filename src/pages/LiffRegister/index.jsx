import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Text, Avatar, VStack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import liff from '@line/liff';
import { IoIosLink } from "react-icons/io";
import { Logo_FULL_JPG } from '../../assets/Images';
import tenantService from '../../services/tenentService'; // Import the service

const SettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [linkStatus, setLinkStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to store error messages
  const [searchParams] = useSearchParams();
  const customerCode = searchParams.get('customer_code');

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2006705482-9Dl1LXVO" });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUserData({
            name: profile.displayName,
            avatar: profile.pictureUrl,
          });
        } else {
          liff.login();
        }
      } catch (error) {
        console.error("LIFF initialization failed:", error);
        setErrorMessage("Failed to initialize LIFF. Please try again.");
      }
    };

    initializeLiff();
  }, []);

  const handleLinkAPI = async () => {
    if (!customerCode) {
      setErrorMessage("Customer code is missing. Please contact support.");
      return;
    }

    try {
      setLinkStatus('loading');
      setErrorMessage(''); // Clear any previous error message

      const response = await tenantService.updateTenantFromLine({
        customer_code: customerCode,
        line_img: userData?.avatar,
        line_name: userData?.name,
        line_id: liff.getContext().userId,
      });

      console.log("API Response:", response); // Log the response

      setLinkStatus('success');
      alert('เชื่อมต่อสำเร็จ! ระบบจะปิดหน้าต่างนี้');
      liff.closeWindow(); // Close LIFF app
    } catch (error) {
      console.error("API Error:", error); // Log the error
      setErrorMessage(error.message || "An unexpected error occurred.");
      setLinkStatus('failed');
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box
        p={6}
        maxW="400px"
        mx="auto"
        mt={8}
        bg="gray.50"
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
        flex="1"
      >
        <VStack spacing={4} align="center">
          <Heading size="md">เชื่อมต่อกับ GoGo Market</Heading>
          <Text>เชื่อมต่อบัญชี LINE ของคุณกับ GoGo Market เพื่อจัดการร้านค้าของคุณได้ง่ายขึ้น</Text>
          <Text fontWeight="bold" color="blue.500">
            Customer Code: {customerCode || 'No customer code provided'}
          </Text>
          {errorMessage && (
            <Text color="red.500" mt={2}>
              {errorMessage}
            </Text>
          )}
          {userData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={Logo_FULL_JPG} style={{ width: "100px" }} alt="GoGo Market Logo" />
                <IoIosLink size="30px" style={{ margin: '0 20px' }} />
                <Avatar size="xl" src={userData.avatar} />
              </div>
              <Text fontSize="lg" fontWeight="bold">
                ยินดีต้อนรับ, {userData.name}!
              </Text>
              <Button
                colorScheme="teal"
                onClick={handleLinkAPI}
                width="full"
                isLoading={linkStatus === 'loading'}
              >
                เชื่อมต่อบัญชี LINE กับระบบ
              </Button>
              {linkStatus === 'success' && (
                <Text color="green.500">เชื่อมต่อสำเร็จ! ระบบจะปิดหน้าต่างนี้</Text>
              )}
              {linkStatus === 'failed' && (
                <Text color="red.500">การเชื่อมต่อล้มเหลว กรุณาลองใหม่อีกครั้ง</Text>
              )}
            </>
          ) : (
            <Text>กรุณารอสักครู่ ข้อมูลโปรไฟล์ของคุณกำลังโหลด...</Text>
          )}
        </VStack>
      </Box>

      <Box as="footer" bg="gray.700" color="white" py={4} textAlign="center">
        <Text fontSize="sm">© {new Date().getFullYear()} Copyright by Noksoft. All rights reserved.</Text>
      </Box>
    </Box>
  );
};

export default SettingsPage;
