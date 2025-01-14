import {PROD_IP} from './ipconfig';
import axios from 'axios';


const API_URL = PROD_IP;

const tenantService = {
  getContractsByTenant: async (tenantId) => {
    try {
      const response = await fetch(`${API_URL}/contracts/tenant/${tenantId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch contracts for the tenant.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts by tenant:', error.message);
      throw error;
    }
  },
  getAllTenants: async () => {
    try {
      const response = await fetch(`${API_URL}/tenants`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch tenants.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenants:', error.message);
      throw error;
    }
  },
  getTenants: async () => {
    const response = await fetch(`${API_URL}/tenants`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    return await response.json();
  },
  getTenantById: async (id) => {
    const response = await fetch(`${API_URL}/tenants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch tenant details');
    return response.json();
  },

  createTenant: async (tenant) => {
    const response = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenant),
    });

    if (!response.ok) {
      throw new Error('Failed to create tenant');
    }
    return await response.json();
  },

  getTenantById: async (id) => {
    const response = await fetch(`${API_URL}/tenants/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }
    return await response.json();
  },

  updateTenant: async (id, tenant) => {
    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenant),
    });

    if (!response.ok) {
      throw new Error('Failed to update tenant');
    }
    return await response.json();
  },
  updateTenantFromLine: async ({ customer_code, line_img, line_name, line_id }) => {
    try {
      const response = await axios.post(`${API_URL}/tenants/line-connect`, {
        customer_code,
        line_img,
        line_name,
        line_id,
      });

      return response.data; // Return the response data
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || 'Failed to update tenant from LINE.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  },
  getTenantByCustomerCode: async (customerCode) => {
    try {
      const response = await axios.get(`${API_URL}/tenants-find-cus-code/${customerCode}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || 'Failed to fetch tenant by customer code.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  },
};

export default tenantService;
