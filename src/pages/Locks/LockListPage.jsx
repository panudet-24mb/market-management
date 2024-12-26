import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Select,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import LockTable from '../../components/LockTable';
import NewLockModal from '../../components/NewLockModal';
import BindContractModal from '../../components/BindContractModal';
import AddMeterModal from '../../components/AddMeterModal'; // Import AddMeterModal
import lockService from '../../services/lockService';
import zoneService from '../../services/zoneService';

const ITEMS_PER_PAGE = 100;

const LockListPage = () => {
  const [locks, setLocks] = useState([]);
  const [zones, setZones] = useState([]);
  const [filteredLocks, setFilteredLocks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [isAddMeterModalOpen, setIsAddMeterModalOpen] = useState(false); // State for AddMeterModal
  const [selectedLockId, setSelectedLockId] = useState(null);
  const [newLock, setNewLock] = useState({
    lock_name: '',
    lock_number: '',
    zone_id: '',
    size: '',
    active: true,
  });

  const fetchLocksAndZones = async () => {
    setLoading(true);
    try {
      const locksData = await lockService.getLocksWithContracts();
      const zonesData = await zoneService.getZones();

      setLocks(locksData);
      setFilteredLocks(locksData);
      setZones(zonesData);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error.message || 'An error occurred while fetching locks and zones.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocksAndZones();
  }, [toast]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value;
    setSearch(searchQuery);
    applyFilters(searchQuery, selectedZone);
  };

  const handleZoneFilter = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    applyFilters(search, zoneId);
  };

  const applyFilters = (searchQuery, zoneId) => {
    let filtered = [...locks];

    if (searchQuery) {
      filtered = filtered.filter((lock) =>
        lock.lock_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (zoneId) {
      filtered = filtered.filter((lock) => lock.zone_id === parseInt(zoneId));
    }

    setFilteredLocks(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLocks.length / ITEMS_PER_PAGE);
  const displayedLocks = filteredLocks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const openBindContractModal = (lockId) => {
    setSelectedLockId(lockId);
    setIsBindModalOpen(true);
  };

  const closeBindContractModal = () => {
    setSelectedLockId(null);
    setIsBindModalOpen(false);
  };

  const openAddMeterModal = (lockId) => {
    setSelectedLockId(lockId);
    setIsAddMeterModalOpen(true);
  };

  const closeAddMeterModal = () => {
    setSelectedLockId(null);
    setIsAddMeterModalOpen(false);
  };

  const onClickEyeIcon = (id) => {
    console.log("onClickEyeIcon");
    console.log(id);
  };

  const handleAddNewLock = async () => {
    try {
      await lockService.createLock(newLock);
      toast({
        title: 'Lock created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsModalOpen(false);
      fetchLocksAndZones();
    } catch (error) {
      toast({
        title: 'Error creating lock',
        description: error.message || 'Failed to add new lock',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Lock Management
      </Heading>
      <Flex mb={4} gap={4}>
        <Input placeholder="Search by lock name" value={search} onChange={handleSearch} />
        <Select placeholder="Filter by zone" value={selectedZone} onChange={handleZoneFilter}>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </Select>
        <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
          +
        </Button>
      </Flex>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      ) : (
        <>
          <Box overflowX="auto">
            <LockTable
              displayedLocks={displayedLocks}
              zones={zones}
              goToDetails={openBindContractModal}
              onClickIconEye={onClickEyeIcon}
              openAddMeterModal={openAddMeterModal} // Pass this function
              fetchLocksAndZones={fetchLocksAndZones}
            />
          </Box>

          <Flex justifyContent="space-between" mt={4}>
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </Flex>
        </>
      )}

      <NewLockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newLock={newLock}
        setNewLock={setNewLock}
        zones={zones}
        handleAddNewLock={handleAddNewLock}
      />

      <BindContractModal
        isOpen={isBindModalOpen}
        onClose={closeBindContractModal}
        lockId={selectedLockId}
        refreshLocks={fetchLocksAndZones}
      />

      <AddMeterModal
        isOpen={isAddMeterModalOpen}
        onClose={closeAddMeterModal}
        lockId={selectedLockId}
        refreshLocks={fetchLocksAndZones}
        fetchLocksAndZones={fetchLocksAndZones} 
      />
    </Box>
  );
};

export default LockListPage;
