import {PROD_IP} from './ipconfig';

const API_URL = PROD_IP;

const zoneService = {
  getZones: async () => {
    const response = await fetch(`${API_URL}/zones`);
    if (!response.ok) {
      throw new Error('Failed to fetch zones');
    }
    return await response.json();
  },

  createZone: async (zoneData) => {
    const response = await fetch(`${API_URL}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneData),
    });
    if (!response.ok) {
      throw new Error('Failed to create zone');
    }
    return await response.json();
  },
};

export default zoneService;
