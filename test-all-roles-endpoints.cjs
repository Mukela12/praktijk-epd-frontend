const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials for each role
const users = {
  admin: { email: 'admin@praktijkepd.nl', password: 'Admin123!@#' },
  therapist: { email: 'emma.dejong@example.com', password: 'TherapistPass123!' },
  client: { email: 'client@example.com', password: 'ClientPass123!' },
  bookkeeper: { email: 'lucas.martin@example.com', password: 'BookkeeperPass123!' },
  assistant: { email: 'sophie.williams@example.com', password: 'AssistantPass123!' }
};

// Helper function to login and get token
async function login(role) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, users[role]);
    return response.data.accessToken;
  } catch (error) {
    console.error(`Login failed for ${role}:`, error.response?.data || error.message);
    return null;
  }
}

// Test Bookkeeper Endpoints
async function testBookkeeperEndpoints() {
  console.log('\n=== TESTING BOOKKEEPER ENDPOINTS ===\n');
  
  const token = await login('bookkeeper');
  if (!token) {
    console.error('Bookkeeper login failed - testing with mock data');
  }
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const endpoints = [
    { method: 'GET', url: '/bookkeeper/dashboard', name: 'Dashboard' },
    { method: 'GET', url: '/bookkeeper/invoices', name: 'All Invoices' },
    { method: 'GET', url: '/bookkeeper/invoices?status=overdue', name: 'Overdue Invoices' },
    { method: 'GET', url: '/bookkeeper/financial-overview', name: 'Financial Overview' },
    { method: 'GET', url: '/bookkeeper/reports?reportType=revenue', name: 'Revenue Report' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        headers
      });
      console.log('✅ Success:', response.data.success ? 'Data received' : 'Response received');
    } catch (error) {
      console.error('❌ Failed:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

// Test Assistant Endpoints
async function testAssistantEndpoints() {
  console.log('\n=== TESTING ASSISTANT ENDPOINTS ===\n');
  
  const token = await login('assistant');
  if (!token) {
    console.error('Assistant login failed - testing with mock data');
  }
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const endpoints = [
    { method: 'GET', url: '/assistant/dashboard', name: 'Dashboard' },
    { method: 'GET', url: '/assistant/support-tickets', name: 'Support Tickets' },
    { method: 'GET', url: '/assistant/appointments', name: 'Appointments' },
    { method: 'GET', url: '/assistant/waiting-list', name: 'Waiting List' },
    { method: 'GET', url: '/assistant/clients/search?q=test', name: 'Search Clients' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        headers
      });
      console.log('✅ Success:', response.data.success ? 'Data received' : 'Response received');
    } catch (error) {
      console.error('❌ Failed:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

// Test Admin Endpoints
async function testAdminEndpoints() {
  console.log('\n=== TESTING ADMIN ENDPOINTS ===\n');
  
  const token = await login('admin');
  if (!token) {
    console.error('Admin login failed - testing with mock data');
  }
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const endpoints = [
    { method: 'GET', url: '/admin/dashboard', name: 'Dashboard' },
    { method: 'GET', url: '/admin/clients', name: 'All Clients' },
    { method: 'GET', url: '/admin/therapists', name: 'All Therapists' },
    { method: 'GET', url: '/admin/financial/overview', name: 'Financial Overview' },
    { method: 'GET', url: '/admin/waiting-list', name: 'Waiting List' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        headers
      });
      console.log('✅ Success:', response.data.success ? 'Data received' : 'Response received');
    } catch (error) {
      console.error('❌ Failed:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

// Test Therapist Endpoints
async function testTherapistEndpoints() {
  console.log('\n=== TESTING THERAPIST ENDPOINTS ===\n');
  
  const token = await login('therapist');
  if (!token) {
    console.error('Therapist login failed - testing with mock data');
  }
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const endpoints = [
    { method: 'GET', url: '/therapist/dashboard', name: 'Dashboard' },
    { method: 'GET', url: '/therapist/clients', name: 'My Clients' },
    { method: 'GET', url: '/therapist/appointments', name: 'My Appointments' },
    { method: 'GET', url: '/therapist/schedule', name: 'My Schedule' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        headers
      });
      console.log('✅ Success:', response.data.success ? 'Data received' : 'Response received');
    } catch (error) {
      console.error('❌ Failed:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

// Test Client Endpoints
async function testClientEndpoints() {
  console.log('\n=== TESTING CLIENT ENDPOINTS ===\n');
  
  const token = await login('client');
  if (!token) {
    console.error('Client login failed - testing with mock data');
  }
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const endpoints = [
    { method: 'GET', url: '/client/dashboard', name: 'Dashboard' },
    { method: 'GET', url: '/client/profile', name: 'My Profile' },
    { method: 'GET', url: '/client/appointments', name: 'My Appointments' },
    { method: 'GET', url: '/client/invoices', name: 'My Invoices' },
    { method: 'GET', url: '/client/messages', name: 'My Messages' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.url}`,
        headers
      });
      console.log('✅ Success:', response.data.success ? 'Data received' : 'Response received');
    } catch (error) {
      console.error('❌ Failed:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('Starting endpoint tests for all roles...\n');
  
  await testAdminEndpoints();
  await testTherapistEndpoints();
  await testClientEndpoints();
  await testBookkeeperEndpoints();
  await testAssistantEndpoints();
  
  console.log('\n=== TESTING COMPLETE ===');
  console.log('\nNote: If endpoints fail with 401/403, it may be due to:');
  console.log('1. Invalid credentials');
  console.log('2. Two-factor authentication requirement');
  console.log('3. Email verification requirement');
  console.log('4. Backend not running on port 3000');
  console.log('\nThe frontend screens are configured to handle these cases gracefully.');
}

runTests().catch(console.error);