import axios from 'axios';

// src/services/zoneService.js
import {PROD_IP} from './ipconfig';

const BASE_URL = PROD_IP;

const billService = {
  /**
   * Fetch locks eligible for billing.
   * @param {number} year - Year for billing.
   * @param {number} month - Month for billing (1-12).
   * @returns {Promise} - Axios promise with the eligible locks.
   */
  getEligibleLocksForBilling: async (year, month) => {
    try {
      const response = await axios.get(`${BASE_URL}/eligible-locks-for-billing`, {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching eligible locks for billing:', error);
      throw error;
    }
  },

   /**
   * Create bills for selected contracts.
   * @param {Array} bills - Array of bills to create.
   * @returns {Promise} - Axios promise with the creation result.
   */
   createBills: async (bills) => {
    try {
      const response = await axios.post(`${BASE_URL}/create-bills`, bills, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating bills:', error);
      throw error;
    }
  },


  /**
   * Submit a new bill.
   * @param {Object} billData - The bill data to submit.
   * @returns {Promise} - Axios promise with the submission result.
   */
  submitBill: async (billData) => {
    try {
      const response = await axios.post(`${BASE_URL}/bills`, billData);
      return response.data;
    } catch (error) {
      console.error('Error submitting bill:', error);
      throw error;
    }
  },

  /**
   * Fetch all bills.
   * @returns {Promise} - Axios promise with all bills.
   */
  getAllBills: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/bills`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all bills:', error);
      throw error;
    }
  },
};

export default billService;
