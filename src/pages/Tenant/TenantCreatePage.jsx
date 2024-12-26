import React from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
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
  prefix: Yup.string().required('Prefix is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  nick_name: Yup.string().required('Nickname is required'),
  contact: Yup.string().required('Contact is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  line_id: Yup.string(),
  note: Yup.string(),
});

const TenantCreatePage = () => {
  const toast = useToast();

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await tenantService.createTenant(values);
      toast({
        title: 'Tenant created successfully!',
        description: `${values.prefix} ${values.first_name} ${values.last_name} has been added.`,
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
          prefix: '',
          first_name: '',
          last_name: '',
          nick_name: '',
          contact: '',
          phone: '',
          address: '',
          line_id: '',
          note: '',
        }}
        validationSchema={TenantSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <Stack spacing={4}>
              <FormControl isInvalid={formik.touched.prefix && formik.errors.prefix}>
                <FormLabel>Prefix</FormLabel>
                <Select
                  name="prefix"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.prefix}
                  placeholder="Select prefix"
                >
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="นาง">นาง</option>
                </Select>
                <FormErrorMessage>{formik.errors.prefix}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.first_name && formik.errors.first_name}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="first_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.first_name}
                  placeholder="Enter first name"
                />
                <FormErrorMessage>{formik.errors.first_name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.last_name && formik.errors.last_name}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="last_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.last_name}
                  placeholder="Enter last name"
                />
                <FormErrorMessage>{formik.errors.last_name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.nick_name && formik.errors.nick_name}>
                <FormLabel>Nickname</FormLabel>
                <Input
                  name="nick_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nick_name}
                  placeholder="Enter nickname"
                />
                <FormErrorMessage>{formik.errors.nick_name}</FormErrorMessage>
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

              <FormControl isInvalid={formik.touched.phone && formik.errors.phone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  placeholder="Enter phone number"
                />
                <FormErrorMessage>{formik.errors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.address && formik.errors.address}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  placeholder="Enter address"
                />
                <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>LINE ID</FormLabel>
                <Input
                  name="line_id"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.line_id}
                  placeholder="Enter LINE ID (optional)"
                />
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
