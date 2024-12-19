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
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import meterService from '../../services/meterService';
import MeterModal from '../../components/MeterModal';

const MeterManagementPage = () => {
  const [meters, setMeters] = useState([]);
  const [meterUsage, setMeterUsage] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newMeter, setNewMeter] = useState({ meter_type: '', meter_number: '', meter_serial: '', note: '' });
  const toast = useToast();

  useEffect(() => {
    fetchMeters(month);
  }, [month]);

  const fetchMeters = async (selectedMonth) => {
    try {
      const data = await meterService.getMeters();
      const initialUsage = {};

      for (const meter of data) {
        try {
          const usage = await meterService.getMeterUsageByMonth(meter.id, selectedMonth);
          initialUsage[meter.id] = {
            meter_id: meter.id,
            meter_start: usage.meter_start,
            meter_end: usage.meter_end || 0,
            meter_usage: usage.meter_usage || 0,
            img_path: usage.img_path,
          };
        } catch {
          initialUsage[meter.id] = {
            meter_id: meter.id,
            meter_start: 0,
            meter_end: 0,
            meter_usage: 0,
            img_path: null,
          };
        }
      }

      setMeters(data);
      setMeterUsage(initialUsage);
    } catch (error) {
      toast({
        title: 'Error fetching meters',
        description: error.message || 'An error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMonthlyInput = async () => {
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
    }
  };

  const updateMeterUsage = (meterId, field, value) => {
    setMeterUsage((prev) => {
      const updated = { ...prev[meterId], [field]: parseInt(value, 10) || 0 };
      if (field === 'meter_end') {
        updated.meter_usage = updated.meter_end - updated.meter_start;
      }
      return { ...prev, [meterId]: updated };
    });
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Meter Management
      </Heading>
      <Tabs>
        <TabList>
          <Tab>Manage Meters</Tab>
          <Tab>Input Monthly Usage</Tab>
        </TabList>
        <TabPanels>
          {/* Manage Meters Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>Existing Meters</Heading>
            <Button colorScheme="teal" mb={4} onClick={onOpen}>
              Add New Meter
            </Button>
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Number</Th>
                  <Th>Serial</Th>
                  <Th>Note</Th>
                </Tr>
              </Thead>
              <Tbody>
                {meters.map((meter) => (
                  <Tr key={meter.id}>
                    <Td>{meter.id}</Td>
                    <Td>
                    <Tag
  colorScheme={meter.meter_type === 'Water Meter' ? 'blue' : 'orange'}
  size="lg"
>
  <TagLeftIcon as={meter.meter_type === 'Water Meter' ? InfoIcon : WarningIcon} />
  <TagLabel>
    {meter.meter_type === 'Water Meter' ? 'Water Meter' : 'Electric Meter'}
  </TagLabel>
</Tag>

                    </Td>
                    <Td>{meter.meter_number}</Td>
                    <Td>{meter.meter_serial}</Td>
                    <Td>{meter.note}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          {/* Input Monthly Usage Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>Input Monthly Usage</Heading>
            <Box mb={4}>
              <Select value={month} onChange={handleMonthChange}>
                {Array.from({ length: 15 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - 12 + i); // 12 months back, 3 months forward
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
                  <Th>Start Reading</Th>
                  <Th>End Reading</Th>
                  <Th>Usage</Th>
                  <Th>Proof</Th>
                </Tr>
              </Thead>
              <Tbody>
                {meters.map((meter) => (
                  <Tr key={meter.id}>
                    <Td>{meter.id}</Td>
                    <Td>
                    <Tag
  colorScheme={meter.meter_type === 'Water Meter' ? 'blue' : 'orange'}
  size="lg"
>
  <TagLeftIcon as={meter.meter_type === 'Water Meter' ? InfoIcon : WarningIcon} />
  <TagLabel>
    {meter.meter_type === 'Water Meter' ? 'Water Meter' : 'Electric Meter'}
  </TagLabel>
</Tag>

                    </Td>
                    <Td>{meter.meter_number}</Td>
                    <Td>{meterUsage[meter.id]?.meter_start || 0}</Td>
                    <Td>
                      <Input
                        type="number"
                        value={meterUsage[meter.id]?.meter_end || ''}
                        onChange={(e) => updateMeterUsage(meter.id, 'meter_end', e.target.value)}
                        placeholder="End"
                      />
                    </Td>
                    <Td>{meterUsage[meter.id]?.meter_usage || 0}</Td>
                    <Td>
                      {meterUsage[meter.id]?.img_path ? (
                        <Image src={meterUsage[meter.id].img_path} alt="Proof" boxSize="50px" />
                      ) : (
                        <Tag colorScheme="gray">No Proof</Tag>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button colorScheme="teal" mt={4} onClick={handleMonthlyInput}>
              Submit Monthly Usage
            </Button>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add Meter Modal */}
      <MeterModal
        isOpen={isOpen}
        onClose={onClose}
        newMeter={newMeter}
        setNewMeter={setNewMeter}
        handleAddMeter={async () => {
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
          }
        }}
      />
    </Box>
  );
};

export default MeterManagementPage;
