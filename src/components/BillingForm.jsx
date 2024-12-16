import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Box
} from '@chakra-ui/react';

const BillingForm = ({ initialValues = { month: '', year: '', waterRate: '', electricRate: '' }, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object({
        month: Yup.string().required('Please specify month'),
        year: Yup.number().required('Please specify year'),
        waterRate: Yup.number().required('Please specify water rate'),
        electricRate: Yup.number().required('Please specify electric rate')
      })}
      onSubmit={onSubmit}
    >
      {formik => (
        <Form>
          <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
            <FormControl mb={4} isInvalid={formik.touched.month && formik.errors.month}>
              <FormLabel>Month</FormLabel>
              <Input name="month" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.month} />
              <FormErrorMessage>{formik.errors.month}</FormErrorMessage>
            </FormControl>

            <FormControl mb={4} isInvalid={formik.touched.year && formik.errors.year}>
              <FormLabel>Year</FormLabel>
              <Input name="year" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.year} />
              <FormErrorMessage>{formik.errors.year}</FormErrorMessage>
            </FormControl>

            <FormControl mb={4} isInvalid={formik.touched.waterRate && formik.errors.waterRate}>
              <FormLabel>Water Rate</FormLabel>
              <Input name="waterRate" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.waterRate} />
              <FormErrorMessage>{formik.errors.waterRate}</FormErrorMessage>
            </FormControl>

            <FormControl mb={4} isInvalid={formik.touched.electricRate && formik.errors.electricRate}>
              <FormLabel>Electric Rate</FormLabel>
              <Input name="electricRate" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.electricRate} />
              <FormErrorMessage>{formik.errors.electricRate}</FormErrorMessage>
            </FormControl>

            <Button type="submit" colorScheme="teal">Save</Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default BillingForm;
