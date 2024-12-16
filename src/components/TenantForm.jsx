import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, FormErrorMessage,
  Textarea, NumberInput, NumberInputField, SimpleGrid, Heading, Image, Text,
  Stack, Card, CardHeader, CardBody, InputGroup, InputLeftAddon, Icon, Divider
} from '@chakra-ui/react';
import { PhoneIcon, AtSignIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const TenantSchema = Yup.object().shape({
  firstName: Yup.string().required('กรุณากรอกชื่อ'),
  lastName: Yup.string().required('กรุณากรอกนามสกุล'),
  contact: Yup.string().required('กรุณากรอกช่องทางติดต่อ'),
  rentRate: Yup.number().typeError('ต้องเป็นตัวเลข').required('กรุณากรอกค่าเช่า'),
  deposit: Yup.number().typeError('ต้องเป็นตัวเลข').required('กรุณากรอกค่าประกัน'),
  advance: Yup.number().typeError('ต้องเป็นตัวเลข').required('กรุณากรอกค่าเช่าล่วงหน้า')
});

const TenantForm = ({ initialValues, onSubmit }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [contractDocument, setContractDocument] = useState(null);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleIdDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdDocument(file);
    }
  };

  const handleContractDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractDocument(file);
    }
  };

  return (
    <Formik
      initialValues={initialValues || {
        firstName: '',
        lastName: '',
        contact: '',
        rentRate: '',
        deposit: '',
        advance: '',
        note: ''
      }}
      validationSchema={TenantSchema}
      onSubmit={(values) => {
        const formData = {
          ...values,
          idDocument,
          contractDocument
        };
        onSubmit(formData);
      }}
    >
      {(formik) => (
        <Form>
          <Card bg="white" borderRadius="md" boxShadow="sm" p={4}>
            <CardHeader>
              <Heading size="md">ข้อมูลผู้เช่า</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                เพิ่มหรือแก้ไขข้อมูลผู้เช่าสำหรับตลาด
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={6}>
                {/* Personal Information Section */}
                <Box>
                  <Heading size="sm" mb={3}>ข้อมูลส่วนตัว</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isInvalid={formik.touched.firstName && formik.errors.firstName}>
                      <FormLabel>ชื่อ</FormLabel>
                      <Input
                        name="firstName"
                        placeholder="เช่น สมชาย"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.firstName}
                      />
                      <FormErrorMessage>{formik.errors.firstName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={formik.touched.lastName && formik.errors.lastName}>
                      <FormLabel>นามสกุล</FormLabel>
                      <Input
                        name="lastName"
                        placeholder="เช่น ใจดี"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.lastName}
                      />
                      <FormErrorMessage>{formik.errors.lastName}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Contact Section */}
                <Box>
                  <Heading size="sm" mb={3}>ข้อมูลการติดต่อ</Heading>
                  <FormControl isInvalid={formik.touched.contact && formik.errors.contact}>
                    <FormLabel>ช่องทางติดต่อ</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg="gray.100">
                        <Icon as={AtSignIcon} color="gray.500"/>
                      </InputLeftAddon>
                      <Input
                        name="contact"
                        placeholder="เบอร์โทร / อีเมล / ไลน์"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.contact}
                      />
                    </InputGroup>
                    <FormErrorMessage>{formik.errors.contact}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Divider />

                {/* Rent Details Section */}
                <Box>
                  <Heading size="sm" mb={3}>รายละเอียดค่าเช่า</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isInvalid={formik.touched.rentRate && formik.errors.rentRate}>
                      <FormLabel>เรทค่าเช่า (บาท/เดือน)</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField
                          name="rentRate"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.rentRate}
                          placeholder="0"
                        />
                      </NumberInput>
                      <FormErrorMessage>{formik.errors.rentRate}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={formik.touched.deposit && formik.errors.deposit}>
                      <FormLabel>ค่าประกัน (บาท)</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField
                          name="deposit"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.deposit}
                          placeholder="0"
                        />
                      </NumberInput>
                      <FormErrorMessage>{formik.errors.deposit}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={formik.touched.advance && formik.errors.advance}>
                      <FormLabel>ค่าเช่าล่วงหน้า (บาท)</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField
                          name="advance"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.advance}
                          placeholder="0"
                        />
                      </NumberInput>
                      <FormErrorMessage>{formik.errors.advance}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <FormControl>
                  <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                  <Textarea
                    name="note"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.note}
                    placeholder="ข้อมูลอื่น ๆ ที่เกี่ยวข้อง..."
                  />
                </FormControl>

                <Divider />

                {/* Documents Section */}
                <Box>
                  <Heading size="sm" mb={3}>เอกสารและรูปภาพ</Heading>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>รูปผู้เช่า</FormLabel>
                      <Input type="file" accept="image/*" onChange={handleProfileImageChange} />
                      {profileImage && (
                        <Box mt={2}>
                          <Image
                            src={profileImage}
                            alt="Profile Preview"
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                          />
                        </Box>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>เอกสารบัตรประชาชน</FormLabel>
                      <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleIdDocumentChange} />
                      {idDocument && (
                        <Text mt={2} fontSize="sm" color="gray.600">
                          อัปโหลดไฟล์แล้ว: {idDocument.name}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>เอกสารสัญญา</FormLabel>
                      <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleContractDocumentChange} />
                      {contractDocument && (
                        <Text mt={2} fontSize="sm" color="gray.600">
                          อัปโหลดไฟล์แล้ว: {contractDocument.name}
                        </Text>
                      )}
                    </FormControl>
                  </Stack>
                </Box>

                <Divider />

                {/* Submit Button */}
                <Box textAlign="right">
                  <Button type="submit" colorScheme="teal">
                    บันทึกข้อมูล
                  </Button>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default TenantForm;
