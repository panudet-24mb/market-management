// src/services/zoneService.js
const API_URL = 'http://localhost:4000/api';

const contractService = {
  getContractsWithDocumentsByTenantId: async (tenantId) => {
    const response = await fetch(`${API_URL}/contracts/tenant/${tenantId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch contracts for the tenant');
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
  };
  
  export default contractService;
  