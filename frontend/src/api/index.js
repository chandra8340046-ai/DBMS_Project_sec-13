const API_BASE = '/api';

export const api = {
  // Check backend and MongoDB connection status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // Fetch properties with filters
  async getProperties(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        query.append(key, value);
      }
    });

    const url = `${API_BASE}/properties${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch properties (${res.status})`);
    }
    return await res.json();
  },

  // Get single property details
  async getProperty(id) {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (!res.ok) throw new Error('Failed to fetch property details');
    return await res.json();
  },

  // Create a new property
  async createProperty(propertyData) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create property');
    return data;
  },

  // Submit an enquiry/lead
  async submitEnquiry(enquiryData) {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit enquiry');
    return data;
  },

  // Seed sample properties
  async seedProperties() {
    const res = await fetch(`${API_BASE}/properties/seed`, {
      method: 'POST',
    });
    return await res.json();
  },

  // User authentication
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },
};

export default api;
