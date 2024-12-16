import React from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
  Button,
  Stack,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import tenantService from '../../services/tenentService';

const TenantSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  contact: Yup.string().required('Contact is required'),
  rentRate: Yup.number().min(0, 'Rent rate must be positive').required('Rent rate is required'),
  deposit: Yup.number().min(0, 'Deposit must be positive').required('Deposit is required'),
  advance: Yup.number().min(0, 'Advance must be positive').required('Advance is required'),
  note: Yup.string(),
});

const TenantCreatePage = () => {
  const toast = useToast();

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await tenantService.createTenant(values);
      toast({
        title: 'Tenant created successfully!',
        description: `${values.firstName} ${values.lastName} has been added.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      resetForm();
    } catch (error) {
      toast({
        title: 'Error creating tenant',
        description: error.message || 'Something went wrong.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} maxWidth="600px" mx="auto" bg="gray.50" borderRadius="md" boxShadow="md">
      <Heading size="lg" mb={6}>
        Create New Tenant
      </Heading>
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

export default TenantCreatePage;
