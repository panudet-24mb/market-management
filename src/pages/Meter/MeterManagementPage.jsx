import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useDisclosure,
  Select,
  Image,
  Tag,
  TagLeftIcon,
  TagLabel,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon } from '@chakra-ui/icons';
import meterService from '../../services/meterService';
import MeterModal from '../../components/MeterModal';

const MeterManagementPage = () => {
  const [loadingSubmitMetter, setloadingSubmitMetter] = useState(false)
  const [meters, setMeters] = useState([]);
  const [meterUsage, setMeterUsage] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [loading, setLoading] = useState(false); // New loading state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newMeter, setNewMeter] = useState({ meter_type: '', meter_number: '', meter_serial: '', note: '' });
  const toast = useToast();
  const [meterSelected, setMeterSelected] = useState([])

  const clearStateMeterSelected = () => {
    setMeterSelected([])
  }

  useEffect(() => {
    clearStateMeterSelected()
    fetchMeters(month);
  }, [month]);

  const [selectedImage, setSelectedImage] = useState(null);
  const fetchMeters = async (selectedMonth) => {
    setLoading(true); // Start loading
    try {
      const data = await meterService.fetchMeters(selectedMonth);
      // Map data directly into `meters` and `meterUsage`
      const formattedMeters = data.map((meter) => ({
        id: meter.meter_id,
        meter_type: meter.meter_type,
        meter_number: meter.meter_number,
        meter_serial: meter.meter_serial,
        meter_asset_tag: meter.meter_asset_tag,
        note: meter.note,
        status: meter.status,
        meter_usage_id : meter.meter_usage_id,
      }));

      const formattedMeterUsage = data.reduce((acc, meter) => {
        acc[meter.meter_id] = {
          meter_id: meter.meter_id,
          meter_start: meter.meter_start,
          meter_end: meter.meter_end,
          note: meter.note,
          meter_usage: meter.meter_usage,
          meter_asset_tag: meter.meter_asset_tag,
          img_path: meter.img_path,
          status: meter.status,
          meter_usage_id : meter.meter_usage_id,
        };
        return acc;
      }, {});

      setMeters(formattedMeters);
      setMeterUsage(formattedMeterUsage);
    } catch (error) {
      toast({
        title: 'Error fetching meters',
        description: error.message || 'An error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // End loading
    }
  };


  const handleImageClick = (imagePath) => {
    setSelectedImage(`https://gogo.justfordev.online/uploads/${imagePath}`);
    openImageModal();
  };
  const handleMonthlyInput = async () => {
    setLoading(true); // Start loading
    try {
      const usageData = Object.values(meterUsage).map((usage) => ({
        ...usage,
        month,
      }));
      await meterService.addMeterUsage(usageData);
      toast({
        title: 'Meter usage added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMeters(month); // Refresh data for the current month
    } catch (error) {
      toast({
        title: 'Error submitting meter usage',
        description: error.message || 'Failed to submit meter usage.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // End loading
    }
  };

  const updateMeterUsage = (meterId, field, value, type) => {
    setMeterUsage((prev) => {
      const updated = { ...prev[meterId], [field]: type === "number" ? parseInt(value, 10) || 0 : value ? value : null };
      if (field === 'meter_end') {
        updated.meter_usage = updated.meter_end - updated.meter_start;
      }
      return { ...prev, [meterId]: updated };
    });
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const {
    isOpen: isImageModalOpen,
    onOpen: openImageModal,
    onClose: closeImageModal,
  } = useDisclosure();

  const onChangeCheckbox = (check, obj, meterUsage) => {
    const dataMeter = [...meterSelected]        
    if (check) {
      if (meterUsage.meter_end !== null && meterUsage.meter_start !== null) {
        dataMeter.push({
          id: obj.id,
          meter_end: meterUsage.meter_end,
          note: meterUsage.note,
          meter_usage_id: meterUsage.meter_usage_id,
          meter_start: meterUsage.meter_start,
        })
        setMeterSelected(dataMeter)
      } else {
        toast({
          title: 'โปรดกรอกค่า meter ก่อน',
          description: "โปรดกรอกค่า meter ก่อน",
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      const indexRemove = dataMeter.findIndex(item => item.id === obj.id);
      if (indexRemove !== -1) {
        dataMeter.splice(indexRemove, 1);
        setMeterSelected(dataMeter)
      }
    }
  }

  const checkMeterIsSelected = (id) => {
    const indexIsChecked = meterSelected.findIndex(item => item.id === id);
    if (indexIsChecked !== -1) {
      return true
    } else {
      return false
    }
  }

  const submitMetter = async () => {
    const resultMetterSelected = []
    meterSelected.map(data => {
      if (data.id && data.meter_end) {
        resultMetterSelected.push({
          meter_id: data.meter_usage_id ? null : data.id,
          meter_end: data.meter_end,
          note: data.note ? data.note : null,
          meter_usage_id: data.meter_usage_id ? data.meter_usage_id : null,
          meter_start: data.meter_start,
        })
      }
    })
    if (resultMetterSelected.length > 0) {
      setloadingSubmitMetter(true)
      const dataMetter = {
        month: month,
        data: resultMetterSelected
      }

      try {
        const data = await meterService.updateMeterUsageApi(dataMetter)
        
        setloadingSubmitMetter(false)
        fetchMeters(month);
        clearStateMeterSelected()
        toast({
          title: 'อัพเดทค่า meter สำเร็จ',
          description: "อัพเดทค่า meter สำเร็จ",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {

        setloadingSubmitMetter(false)
        toast({
          title: 'อัพเดทค่า meter ไม่สำเร็จ',
          description: "อัพเดทค่า meter ไม่สำเร็จ",
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      // clearStateMeterSelected() // ถ้ายิง api เสร็จแล้ว ให้เปิดบรรทัดนี้ จะ clear ค่า state ของ metter ที่เคยเลือกไป ให้เป็น array ว่างๆ

    } else {
      toast({
        title: 'โปรดเลือกค่า meter',
        description: "โปรดเลือกค่า meter",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }
  
  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Meter Management
      </Heading>
      {loading ? (
        <Center>
          <Spinner size="xl" color="teal.500" />
        </Center>
      ) : (
        <Tabs>
          <TabList>
            <Tab>Manage Meters</Tab>
            <Tab>Input Monthly Usage</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Heading size="md" mb={4}>
                Existing Meters
              </Heading>
              <Button colorScheme="teal" mb={4} onClick={onOpen}>
                Add New Meter
              </Button>
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Type</Th>
                    <Th>AssetTag</Th>
                    <Th>Number</Th>
                    <Th>Serial</Th>
                    <Th>Note</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {meters.map((meter, index) => (
                    <Tr key={index}>
                      <Td>{meter.id}</Td>
                      <Td>
                        <Tag
                          colorScheme={meter.meter_type === 'Water Meter' ? 'blue' : 'orange'}
                          size="lg"
                        >
                          <TagLeftIcon
                            as={meter.meter_type === 'Water Meter' ? InfoIcon : WarningIcon}
                          />
                          <TagLabel>
                            {meter.meter_type === 'Water Meter' ? 'Water Meter' : 'Electric Meter'}
                          </TagLabel>
                        </Tag>
                      </Td>
                      <Td>
                        <Tag size="lg">{meter.meter_asset_tag}</Tag>
                      </Td>
                      <Td>{meter.meter_number}</Td>
                      <Td>{meter.meter_serial}</Td>
                      <Td>{meter.note}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            <TabPanel>

              <div>
                <Heading size="md">
                  Input Monthly Usage
                  <Button disabled={loadingSubmitMetter} style={{ float: "right", marginBottom: "20px" }} colorScheme="teal" onClick={() => submitMetter()}>บันทึก</Button>
                </Heading>
                <div
                  style={{
                    clear: "both"
                  }}
                />
              </div>
              <Box mb={4}>
                <Select value={month} onChange={handleMonthChange}>
                  {Array.from({ length: 15 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - 12 + i);
                    const monthString = date.toISOString().slice(0, 7);
                    return (
                      <option key={monthString} value={monthString}>
                        {monthString}
                      </option>
                    );
                  })}
                </Select>
              </Box>
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Type</Th>
                    <Th>Number</Th>
                    <Th>Asset Tag</Th>
                    <Th>Start Reading</Th>
                    <Th>End Reading</Th>
                    <Th>Note</Th>
                    <Th>Usage</Th>
                    <Th>Status</Th>
                    <Th>Proof</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {meters.map((meter, index) => {
                    const usage = meterUsage[meter.id]?.meter_usage || 0;
                    const meterEnd = meterUsage[meter.id]?.meter_end || 0;
                    return (
                      <Tr
                        bg={meter.status === 'CONFIRMED' ? 'green.100' : meterEnd ? 'orange.100' : "transparent"}
                        key={index}
                      >
                        <Td>{meter.id}</Td>
                        <Td>
                          <Tag
                            colorScheme={meter.meter_type === 'Water Meter' ? 'blue' : 'orange'}
                            size="lg"
                          >
                            <TagLeftIcon
                              as={meter.meter_type === 'Water Meter' ? InfoIcon : WarningIcon}
                            />
                            <TagLabel>
                              {meter.meter_type === 'Water Meter' ? 'Water Meter' : 'Electric Meter'}
                            </TagLabel>
                          </Tag>
                        </Td>
                        <Td>{meter.meter_number}</Td>
                        <Td>
                          <Tag size="lg">{meter.meter_asset_tag}</Tag>
                        </Td>
                        <Td>
                          <Input
                            type="number"
                            value={meterUsage[meter.id]?.meter_start || ''}
                            onChange={(e) => updateMeterUsage(meter.id, 'meter_start', e.target.value, "number")}
                            placeholder="Start"
                            disabled={meter.status === 'CONFIRMED' ? true : checkMeterIsSelected(meter.id)}
                            style={{ width: "200px" }}
                          />
                        </Td>
                        <Td>
                          <Input
                            type="number"
                            value={meterUsage[meter.id]?.meter_end || ''}
                            onChange={(e) => updateMeterUsage(meter.id, 'meter_end', e.target.value, "number")}
                            placeholder="End"
                            disabled={meter.status === 'CONFIRMED' ? true : checkMeterIsSelected(meter.id)}
                            style={{ width: "200px" }}
                          />
                        </Td>
                        <Td>
                          <Input
                            value={meterUsage[meter.id]?.note || ''}
                            onChange={(e) => updateMeterUsage(meter.id, 'note', e.target.value, "text")}
                            placeholder="Note"
                            disabled={meter.status === 'CONFIRMED' ? true : checkMeterIsSelected(meter.id)}
                            style={{ width: "200px" }}
                          />
                        </Td>
                        <Td>
                          <Box textAlign="center">
                            <Tag
                              size="lg"
                              colorScheme="teal"
                              borderRadius="full"
                              px={6}
                              py={3}
                              fontSize="2xl"
                              fontWeight="bold"
                            >
                              {usage} kWh
                            </Tag>
                          </Box>
                        </Td>
                        <Td>

                          <Tag
                            colorScheme={
                              meterUsage[meter.id]?.status === 'UNCONFIRMED'
                                ? 'blue'
                                : meterUsage[meter.id]?.status === 'CONFIRMED'
                                  ? 'green'
                                  : 'gray'
                            }
                          >
                            {meterUsage[meter.id]?.status || 'Pending'}
                          </Tag>
                        </Td>
                        <Td>
                          {meterUsage[meter.id]?.img_path ? (
                            <Image
                              src={`https://gogo.justfordev.online/uploads/${meterUsage[meter.id].img_path}`}
                              alt="Proof"
                              boxSize="50px"
                              cursor="pointer"
                              onClick={() => handleImageClick(meterUsage[meter.id]?.img_path)}
                            />
                          ) : (
                            <Tag colorScheme="gray">No Proof</Tag>
                          )}
                        </Td>
                        <Td>
                          {
                            meter.status !== 'CONFIRMED' && (
                              <Checkbox isChecked={checkMeterIsSelected(meter.id)} color="green.400" variant="solid"
                                onChange={e => onChangeCheckbox(e.target.checked, meter, meterUsage[meter.id])}
                              >
                                ยืนยัน
                              </Checkbox>
                            )
                          }
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* Add Meter Modal */}
      <MeterModal
        isOpen={isOpen}
        onClose={onClose}
        newMeter={newMeter}
        setNewMeter={setNewMeter}
        handleAddMeter={async () => {
          setLoading(true);
          try {
            await meterService.addMeter(newMeter);
            toast({
              title: 'Meter added successfully',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            fetchMeters(month);
          } catch (error) {
            toast({
              title: 'Error adding meter',
              description: error.message || 'Failed to add meter.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* Image Modal */}
      <Modal isOpen={isImageModalOpen} onClose={closeImageModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Proof Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image src={selectedImage} alt="Proof" maxW="100%" maxH="500px" />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeImageModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MeterManagementPage;



// {
//   "month": "2024-12",
//   "data": [
//     {"meter_id": 1, "meter_end": 20, "note": "Monthly update"}
//   ]
// }

// http://localhost:4000/api/meter_usages/update method put 
