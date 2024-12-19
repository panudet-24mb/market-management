const API_URL = 'http://localhost:4000/api';

const lockService = {

  
  createLock: async (lock) => {
    const response = await fetch(`${API_URL}/locks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lock),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to create lock: ${errorMessage}`);
    }

    return await response.json();
  },
  getLocksWithContracts: async () => {
    const response = await fetch(`${API_URL}/locks-with-contracts`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  },
  

  getLocks: async () => {
    const response = await fetch(`${API_URL}/locks`);
    if (!response.ok) {
      throw new Error('Failed to fetch locks');
    }
    return await response.json();
  },

   fetchLocksAndZones : async () => {
    setLoading(true); // Set loading to true when the function starts
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
      setLoading(false); // Set loading to false when the function ends
    }
  },
  getNonExpiredContracts: async () => {
    const response = await axios.get(`${API_URL}/contracts/non_expired`);
    return response.data;
  },
  bindContractToLock: async (lockId, contractId) => {
    const response = await axios.post(`${API_URL}/lock_has_contracts`, {
      lock_id: lockId,
      contract_id: contractId,
      status: 'active',
    });
    return response.data;
  },
  
};

export default lockService;
