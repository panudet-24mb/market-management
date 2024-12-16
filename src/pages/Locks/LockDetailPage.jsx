import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Stack,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
  useToast,
  SimpleGrid,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import lockService from '../../services/lockService';
import adminService from '../../services/adminService'; // Mock admin service

const PaymentSchema = Yup.object().shape({
  month: Yup.string().required('Please specify the month (YYYY-MM)'),
  rent: Yup.number().required('Rent amount is required'),
  discount: Yup.number().required('Discount is required (set 0 if none)'),
  waterStart: Yup.number().required('Starting water meter reading is required'),
  waterEnd: Yup.number().required('Ending water meter reading is required'),
  electricStart: Yup.number().required('Starting electricity meter reading is required'),
  electricEnd: Yup.number().required('Ending electricity meter reading is required'),
  admin: Yup.string().required('Admin name is required'),
});

const LockDetailPage = () => {
  const { id } = useParams();
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]); // List of admins for selection
  const toast = useToast();

  useEffect(() => {
    const fetchLock = async () => {
      try {
        const lockData = await lockService.getLockById(id);
        setLock(lockData);
        const adminData = await adminService.getAdmins(); // Mock admin list
        setAdmins(adminData);
      } catch (err) {
        console.error('Error fetching lock details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLock();
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!lock) {
    return (
      <Box p={4}>
        <Heading size="md">Lock not found</Heading>
      </Box>
    );
  }

  const initialValues = {
    month: '',
    rent: lock.rentRate || 0,
    discount: 0,
    waterStart: 0,
    waterEnd: 0,
    electricStart: 0,
    electricEnd: 0,
    admin: '',
  };

  const handleSubmitPayment = async (values, { resetForm }) => {
    const payment = {
      month: values.month,
      rent: Number(values.rent),
      discount: Number(values.discount),
      waterStart: Number(values.waterStart),
      waterEnd: Number(values.waterEnd),
      electricStart: Number(values.electricStart),
      electricEnd: Number(values.electricEnd),
      admin: values.admin,
      paid: false,
    };

    const updatedPayments = lock.payments ? [...lock.payments, payment] : [payment];

    try {
      const res = await lockService.updateLock(lock.id, { payments: updatedPayments });
      if (res.success) {
        toast({
          title: 'Payment round created successfully',
          description: `Payment round for ${values.month} has been added`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setLock(res.data);
        resetForm();
      } else {
        throw new Error('Failed to update lock data');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not create payment round',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error(err);
    }
  };

  return (
    <Box p={4}>
      {/* Header Section */}
      <Heading size="md" mb={4}>{lock.name} (Zone: {lock.zone})</Heading>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontWeight="bold">Rent Rate: {lock.rentRate} ฿/month</Text>
          {lock.isOccupied && lock.tenant ? (
            <>
              <Text fontWeight="bold">Tenant: {lock.tenant.firstName} {lock.tenant.lastName}</Text>
              <Text>Contact: {lock.tenant.contact}</Text>
            </>
          ) : (
            <Text>No tenant currently assigned</Text>
          )}
        </Box>
        <Button colorScheme="blue" onClick={() => alert('Feature not implemented yet')}>
          Change/Assign Tenant
        </Button>
      </Flex>
      <Divider />

      {/* Rent Form Section */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <Box>
          <Heading size="sm" mb={4}>Create Payment Round</Heading>
          <Formik
            initialValues={initialValues}
            validationSchema={PaymentSchema}
            onSubmit={handleSubmitPayment}
          >
            {(formik) => (
              <Form>
                <Stack spacing={3}>
                  <FormControl isInvalid={formik.touched.month && formik.errors.month}>
                    <FormLabel>Month (YYYY-MM)</FormLabel>
                    <Input
                      name="month"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.month}
                      placeholder="2023-11"
                    />
                    <FormErrorMessage>{formik.errors.month}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.rent && formik.errors.rent}>
                    <FormLabel>Rent</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="rent"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.rent}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.rent}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.discount && formik.errors.discount}>
                    <FormLabel>Discount</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="discount"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.discount}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.discount}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.waterStart && formik.errors.waterStart}>
                    <FormLabel>Water Start (units)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="waterStart"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.waterStart}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.waterStart}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.waterEnd && formik.errors.waterEnd}>
                    <FormLabel>Water End (units)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="waterEnd"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.waterEnd}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.waterEnd}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.electricStart && formik.errors.electricStart}>
                    <FormLabel>Electric Start (units)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="electricStart"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.electricStart}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.electricStart}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.electricEnd && formik.errors.electricEnd}>
                    <FormLabel>Electric End (units)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="electricEnd"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.electricEnd}
                      />
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.electricEnd}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formik.touched.admin && formik.errors.admin}>
                    <FormLabel>Admin</FormLabel>
                    <Input
                      as="select"
                      name="admin"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.admin}
                    >
                      <option value="">Select Admin</option>
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.name}>
                          {admin.name}
                        </option>
                      ))}
                    </Input>
                    <FormErrorMessage>{formik.errors.admin}</FormErrorMessage>
                  </FormControl>

                  <Button type="submit" colorScheme="teal">Save Payment Round</Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Box>
      </SimpleGrid>
      <Divider mt={6} />

      {/* Payment History Section */}
      <Box mt={6}>
        <Heading size="sm" mb={4}>Payment History</Heading>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Month</Th>
              <Th>Rent</Th>
              <Th>Discount</Th>
              <Th>Water Usage</Th>
              <Th>Electric Usage</Th>
              <Th>Admin</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {lock.payments && lock.payments.length > 0 ? (
              lock.payments.map((payment, index) => (
                <Tr key={index}>
                  <Td>{payment.month}</Td>
                  <Td>{payment.rent} ฿</Td>
                  <Td>{payment.discount} ฿</Td>
                  <Td>{payment.waterStart} - {payment.waterEnd} units</Td>
                  <Td>{payment.electricStart} - {payment.electricEnd} units</Td>
                  <Td>{payment.admin}</Td>
                  <Td>
                    {payment.paid ? (
                      <Badge colorScheme="green">Paid</Badge>
                    ) : (
                      <Badge colorScheme="red">Unpaid</Badge>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="7" textAlign="center">No payment records found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default LockDetailPage;
