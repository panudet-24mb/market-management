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
      const response = await axios.post(`${BASE_URL}/create-bills?created_by=1&send_notification_via_line=true`, bills, {
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


  getBillDetails: async (billNumber, refNumber) => {
    const response = await axios.get(`${BASE_URL}/get-bill-details`, {
      params: { bill_number: billNumber, ref_number: refNumber },
    });
    return response.data;
  },

  sendPaymentSlip: async (formData) => {
    const response = await axios.post(`${BASE_URL}/send-payment-slip`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default billService;
