// Mock service for fetching admin details
const admins = [
    { id: 1, name: "Admin One" },
    { id: 2, name: "Admin Two" },
    { id: 3, name: "Admin Three" },
  ];
  
  const adminService = {
    getAdmins: async () => {
      // Simulating an API call with a delay
      return new Promise((resolve) => {
        setTimeout(() => resolve(admins), 500); // Mock delay of 500ms
      });
    },
  };
  
  export default adminService;
  