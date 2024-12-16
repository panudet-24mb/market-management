const API_URL = 'http://localhost:4000/api';

const tenantService = {
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
};

export default tenantService;
