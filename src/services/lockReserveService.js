import axios from "axios";


import {PROD_IP} from './ipconfig';

const BASE_IP = PROD_IP;


export const fetchLockReserves = async () => {
  const response = await axios.get(`${BASE_IP}/locks-reserves`);
  return response.data.data;
};

export const addLockReserve = async (reserve) => {
  const response = await axios.post(`${BASE_IP}/lock-reserves`, reserve);
  return response.data; // Return the full response
};

export const removeLockReserve = async (reserveId) => {
  await axios.put(`${BASE_IP}/lock-reserves/${reserveId}`, {
    deleted_at: new Date().toISOString(),
  });
};

export const uploadAttachment = async (reserveId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  await axios.post(
   `${BASE_IP}/lock-reserves/${reserveId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};


export const fetchLockReservesHistory = async (lockId) => {
  if (!lockId) {
    throw new Error("Lock ID is required to fetch history.");
  }
  const response = await axios.get(`${BASE_IP}/locks-reserves/${lockId}/history`);
  return response.data;
};
