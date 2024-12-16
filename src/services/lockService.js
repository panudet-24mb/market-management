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
  getLocks: async () => {
    const response = await fetch(`${API_URL}/locks`);
    if (!response.ok) {
      throw new Error('Failed to fetch locks');
    }
    return await response.json();
  },
};

export default lockService;
