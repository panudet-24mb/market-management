// Mock data
const fakeZones = [
    { id: 1, name: 'Zone A', lockCount: 10 },
    { id: 2, name: 'Zone B', lockCount: 5 }
  ];
  
  const api = {
    get: async (url) => {
      if (url === '/zones') {
        // Simulate an async fetch
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(fakeZones);
          }, 300);
        });
      }
      return [];
    }
  }
  
  export default api;
  