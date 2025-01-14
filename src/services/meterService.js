import axios from 'axios';

import {PROD_IP} from './ipconfig';

const API_URL = PROD_IP;

const meterService = {
  /**
   * Fetch all meters.
   * @returns {Promise<Array>} A list of all meters.
   */
  getMeterUsageByMonth: async (meterId, month) => {
    try {
      const response = await axios.get(`${API_URL}/meter_usages/${meterId}/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meter usage by month:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch meter usage.');
    }
  },
  fetchMeters: async (selectedMonth) => {
    try {
      const response = await axios.get(`${API_URL}/meter_usages_month/${selectedMonth}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meters and usage:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meters and usage.');
    }
  },
  
  getMeters: async () => {
    try {
      const response = await axios.get(`${API_URL}/meters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meters:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meters.');
    }
  },

  /**
   * Add a new meter.
   * @param {Object} meter - The meter details.
   * @returns {Promise<Object>} The created meter.
   */
  addMeter: async (meter) => {
    try {
      const response = await axios.post(`${API_URL}/meters`, meter);
      console.log("API Response:", response.data); // Debugging: Log API response
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Failed to add meter.");
    }
  },
  /**
   * Add monthly usage for multiple meters.
   * @param {Array<Object>} meterUsages - A list of meter usage objects.
   * @returns {Promise<Array>} The created meter usages.
   */
  addMeterUsage: async (meterUsages) => {
    try {
      const response = await axios.post(`${API_URL}/meter_usages`, meterUsages);
      return response.data;
    } catch (error) {
      console.error('Error adding meter usage:', error);
      throw new Error(error.response?.data?.message || 'Failed to add meter usage.');
    }
  },

  /**
   * Bind a meter to a contract.
   * @param {Object} payload - The contract and meter IDs.
   * @returns {Promise<Object>} The created contract-meters binding.
   */
  bindMeterToContract: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}/contract_have_meters`, payload);
      return response.data;
    } catch (error) {
      console.error('Error binding meter to contract:', error);
      throw new Error(error.response?.data?.message || 'Failed to bind meter to contract.');
    }
  },

  /**
   * Fetch all contracts.
   * @returns {Promise<Array>} A list of all contracts.
   */
  getContracts: async () => {
    try {
      const response = await axios.get(`${API_URL}/contracts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch contracts.');
    }
  },
  getLatestMeterUsages: async (meterId) => {
    try {
      const response = await axios.get(`${API_URL}/meter_usages/${meterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest meter usages:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch latest meter usages.');
    }
  },  

  /**
   * Add meter usage for the current month.
   * @param {Array} usages - List of meter usage data.
   * @returns {Promise<Object>} Response message.
   */
  addMeterUsage: async (usages) => {
    try {
      const response = await axios.post(`${API_URL}/meter_usages`, usages);
      return response.data;
    } catch (error) {
      console.error('Error adding meter usage:', error);
      throw new Error(error.response?.data?.detail || 'Failed to add meter usage.');
    }
  },

  updateMeterUsageApi: async (dataUpdate) => {
    try {
      const response = await axios.put(`${API_URL}/meter_usages/update`, dataUpdate);
      return response.data;
    } catch (error) {
      console.error('Error adding meter usage:', error);
      throw new Error(error.response?.data?.detail || 'Failed to add meter usage.');
    }
  },
};

export default meterService;
