import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Stack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { saveTenant, clearTenantState } from '../../store/tenantSlice';

const TenantSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  contact: Yup.string().required('Contact information is required'),
  rentRate: Yup.number().min(0, 'Rent rate cannot be negative').required('Rent rate is required'),
  deposit: Yup.number().min(0, 'Deposit cannot be negative').required('Deposit is required'),
  advance: Yup.number().min(0, 'Advance cannot be negative').required('Advance is required'),
  note: Yup.string(),
});

const TenantPage = () => {
  const dispatch = useDispatch();
  const { tenant, loading, error } = useSelector((state) => state.tenant);
  const toast = useToast();

  useEffect(() => {
    return () => {
      dispatch(clearTenantState());
    };
  }, [dispatch]);

  const handleSubmit = (values, { resetForm }) => {
    dispatch(saveTenant(values));
    toast({
      title: 'Tenant Saved',
      description: `Tenant ${values.firstName} ${values.lastName} has been saved successfully.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    resetForm();
  };

  return (
    <Box p={6} maxWidth="600px" mx="auto" bg="gray.50" borderRadius="md" boxShadow="md">
      <Heading size="lg" mb={6}>
        Add / Edit Tenant
      </Heading>

      {loading && <Spinner />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {tenant && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          Tenant saved successfully: {tenant.firstName} {tenant.lastName}
        </Alert>
      )}

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          contact: '',
          rentRate: 0,
          deposit: 0,
          advance: 0,
          note: '',
        }}
        validationSchema={TenantSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <Stack spacing={4}>
              {/* First Name */}
              <FormControl isInvalid={formik.touched.firstName && formik.errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  placeholder="Enter first name"
                />
                <FormErrorMessage>{formik.errors.firstName}</FormErrorMessage>
              </FormControl>

              {/* Last Name */}
              <FormControl isInvalid={formik.touched.lastName && formik.errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  placeholder="Enter last name"
                />
                <FormErrorMessage>{formik.errors.lastName}</FormErrorMessage>
              </FormControl>

              {/* Contact */}
              <FormControl isInvalid={formik.touched.contact && formik.errors.contact}>
                <FormLabel>Contact</FormLabel>
                <Input
                  name="contact"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.contact}
                  placeholder="Enter contact information"
                />
                <FormErrorMessage>{formik.errors.contact}</FormErrorMessage>
              </FormControl>

              {/* Rent Rate */}
              <FormControl isInvalid={formik.touched.rentRate && formik.errors.rentRate}>
                <FormLabel>Rent Rate (฿/month)</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    name="rentRate"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.rentRate}
                    placeholder="Enter rent rate"
                  />
                </NumberInput>
                <FormErrorMessage>{formik.errors.rentRate}</FormErrorMessage>
              </FormControl>

              {/* Deposit */}
              <FormControl isInvalid={formik.touched.deposit && formik.errors.deposit}>
                <FormLabel>Deposit (฿)</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    name="deposit"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.deposit}
                    placeholder="Enter deposit amount"
                  />
                </NumberInput>
                <FormErrorMessage>{formik.errors.deposit}</FormErrorMessage>
              </FormControl>

              {/* Advance */}
              <FormControl isInvalid={formik.touched.advance && formik.errors.advance}>
                <FormLabel>Advance (฿)</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    name="advance"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.advance}
                    placeholder="Enter advance amount"
                  />
                </NumberInput>
                <FormErrorMessage>{formik.errors.advance}</FormErrorMessage>
              </FormControl>

              {/* Note */}
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Textarea
                  name="note"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.note}
                  placeholder="Enter additional notes (optional)"
                />
              </FormControl>

              {/* Submit Button */}
              <Button type="submit" colorScheme="teal" width="full">
                Save Tenant
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default TenantPage;
