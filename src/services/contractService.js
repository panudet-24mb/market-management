// src/services/zoneService.js
const API_URL = 'http://localhost:4000/api';
import axios from 'axios';
const contractService = {
  getNonExpiredContracts: async () => {
    try {
      const response = await fetch(`${API_URL}/contracts/non_expired`);
      if (!response.ok) {
        throw new Error(`Failed to fetch non-expired contracts: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },


  bindContractToLock: async (lockId, contractId, status = 'active') => {
    try {
      const response = await fetch(`${API_URL}/lock_has_contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lock_id: lockId,
          contract_id: contractId,
          status: status,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to bind contract to lock: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },


  getContractsWithDocumentsByTenantId: async (tenantId) => {
    const response = await fetch(`${API_URL}/contracts/tenant/${tenantId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch contracts for the tenant');
    }
    return await response.json();
  },

  addDocumentsToContract: async (contractId, formData) => {
    const response = await fetch(`${API_URL}/contracts/${contractId}/documents`, {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to add documents: ${errorMessage}`);
    }
  
    return await response.json();
  },  
    createContract: async (formData) => {
      const response = await fetch(`${API_URL}/contracts`, {
        method: 'POST',
        body: formData, // Send FormData directly
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to create contract: ${errorMessage}`);
      }
  
      return await response.json();
    },
  
    getContractsByTenantId: async (tenantId) => {
      const response = await fetch(`${API_URL}/contracts/tenant/${tenantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contracts for the tenant');
      }
      return await response.json();
    },

     handleCancelContract : async (contractId) => {
      try {
        await axios.post(`/api/contracts/${contractId}/cancel`);
        toast({
          title: "Contract cancelled successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchLocksAndZones(); // Refresh data
      } catch (error) {
        toast({
          title: "Error cancelling contract",
          description: error.response?.data?.detail || "Failed to cancel contract",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },

    cancelContract : async (contractId) => {
      if (!Number.isInteger(contractId)) {
        throw new Error('Invalid contract ID. It must be an integer.');
      }
    
      const response = await axios.post(`${API_URL}/contracts/${contractId}/cancel`);
      return response.data;
    },
    
    
  };
  
  export default contractService;
  