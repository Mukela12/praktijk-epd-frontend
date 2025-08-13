const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
const users = {
  client: { email: 'client@example.com', password: 'ClientPass123!' },
  bookkeeper: { email: 'lucas.martin@example.com', password: 'BookkeeperPass123!' },
  therapist: { email: 'emma.dejong@example.com', password: 'TherapistPass123!' },
  admin: { email: 'admin@praktijkepd.nl', password: 'Admin123!@#' }
};

// Helper function to login
async function login(role) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, users[role]);
    return response.data.accessToken;
  } catch (error) {
    console.error(`Login failed for ${role}:`, error.response?.data || error.message);
    // Try without 2FA for testing
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        ...users[role],
        skipTwoFactor: true
      });
      return response.data.accessToken;
    } catch (retryError) {
      console.error(`Retry login failed for ${role}:`, retryError.response?.data || retryError.message);
      return null;
    }
  }
}

// Test Client Payment Endpoints
async function testClientPaymentEndpoints() {
  console.log('\n=== TESTING CLIENT PAYMENT ENDPOINTS ===\n');
  
  const token = await login('client');
  if (!token) {
    console.error('Client login failed');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test payment methods
  try {
    console.log('1. Getting client payment methods');
    const response = await axios.get(`${API_BASE_URL}/client/payment-methods`, { headers });
    console.log('✅ Payment methods:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get payment methods:', error.response?.data || error.message);
  }
  
  // Test invoices
  try {
    console.log('\n2. Getting client invoices');
    const response = await axios.get(`${API_BASE_URL}/client/invoices`, { headers });
    console.log('✅ Invoices:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get invoices:', error.response?.data || error.message);
  }
  
  // Test payment center data
  try {
    console.log('\n3. Getting payment center data');
    const response = await axios.get(`${API_BASE_URL}/client/payment-center`, { headers });
    console.log('✅ Payment center:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get payment center:', error.response?.data || error.message);
  }
}

// Test Bookkeeper Endpoints
async function testBookkeeperEndpoints() {
  console.log('\n=== TESTING BOOKKEEPER ENDPOINTS ===\n');
  
  const token = await login('bookkeeper');
  if (!token) {
    console.error('Bookkeeper login failed');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test dashboard
  try {
    console.log('1. Getting bookkeeper dashboard');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/dashboard`, { headers });
    console.log('✅ Dashboard:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get dashboard:', error.response?.data || error.message);
  }
  
  // Test invoices
  try {
    console.log('\n2. Getting all invoices');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/invoices`, { headers });
    console.log('✅ Invoices:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get invoices:', error.response?.data || error.message);
  }
  
  // Test payments
  try {
    console.log('\n3. Getting all payments');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/payments`, { headers });
    console.log('✅ Payments:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get payments:', error.response?.data || error.message);
  }
  
  // Test client balances
  try {
    console.log('\n4. Getting client balances');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/clients/balances`, { headers });
    console.log('✅ Client balances:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get client balances:', error.response?.data || error.message);
  }
  
  // Test financial overview
  try {
    console.log('\n5. Getting financial overview');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/financial-overview`, { headers });
    console.log('✅ Financial overview:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get financial overview:', error.response?.data || error.message);
  }
}

// Test Therapist Billing Endpoints
async function testTherapistBillingEndpoints() {
  console.log('\n=== TESTING THERAPIST BILLING ENDPOINTS ===\n');
  
  const token = await login('therapist');
  if (!token) {
    console.error('Therapist login failed');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test treatment codes
  try {
    console.log('1. Getting treatment codes');
    const response = await axios.get(`${API_BASE_URL}/billing/treatment-codes`, { headers });
    console.log('✅ Treatment codes:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get treatment codes:', error.response?.data || error.message);
  }
  
  // Test therapist invoices
  try {
    console.log('\n2. Getting therapist invoices');
    const response = await axios.get(`${API_BASE_URL}/therapist/invoices`, { headers });
    console.log('✅ Therapist invoices:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get therapist invoices:', error.response?.data || error.message);
  }
}

// Test Invoice Details
async function testInvoiceDetails() {
  console.log('\n=== TESTING INVOICE DETAILS ===\n');
  
  const clientToken = await login('client');
  if (!clientToken) {
    console.error('Client login failed');
    return;
  }
  
  const headers = { Authorization: `Bearer ${clientToken}` };
  
  try {
    // First get invoices
    const invoicesResponse = await axios.get(`${API_BASE_URL}/client/invoices`, { headers });
    const invoices = invoicesResponse.data.data?.invoices || [];
    
    if (invoices.length > 0) {
      const invoiceId = invoices[0].id;
      console.log(`Testing invoice details for invoice: ${invoiceId}`);
      
      // Get invoice details
      const detailsResponse = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`, { headers });
      console.log('✅ Invoice details:', JSON.stringify(detailsResponse.data, null, 2));
    } else {
      console.log('No invoices found for client');
    }
  } catch (error) {
    console.error('❌ Failed to get invoice details:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting payment and billing endpoint tests...\n');
  console.log('Backend URL:', API_BASE_URL);
  
  await testClientPaymentEndpoints();
  await testBookkeeperEndpoints();
  await testTherapistBillingEndpoints();
  await testInvoiceDetails();
  
  console.log('\n=== TESTING COMPLETE ===');
}

runTests().catch(console.error);