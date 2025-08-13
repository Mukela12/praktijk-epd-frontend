const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const testUsers = {
  client: { email: 'client@example.com', password: 'ClientPass123!' },
  therapist: { email: 'emma.dejong@example.com', password: 'TherapistPass123!' },
  bookkeeper: { email: 'lucas.martin@example.com', password: 'BookkeeperPass123!' }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
async function login(role) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUsers[role]);
    return response.data.accessToken;
  } catch (error) {
    console.error(`${colors.red}❌ Login failed for ${role}:${colors.reset}`, error.response?.data?.message || error.message);
    return null;
  }
}

function logSuccess(message, data = null) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message, error = null) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
  if (error) {
    console.error(error.response?.data || error.message);
  }
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Test Functions
async function testClientPaymentFlow() {
  logSection('CLIENT PAYMENT FLOW TEST');
  
  const token = await login('client');
  if (!token) return;
  
  const headers = { Authorization: `Bearer ${token}` };
  let testResults = { passed: 0, failed: 0 };
  
  // 1. Get client invoices
  try {
    logInfo('Fetching client invoices...');
    const response = await axios.get(`${API_BASE_URL}/client/invoices`, { headers });
    const invoices = response.data.data?.invoices || [];
    
    logSuccess(`Found ${invoices.length} invoices`);
    
    if (invoices.length > 0) {
      const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
      
      console.log(`  - Unpaid: ${unpaidInvoices.length}`);
      console.log(`  - Paid: ${paidInvoices.length}`);
      console.log(`  - Overdue: ${overdueInvoices.length}`);
      
      // Show sample invoice
      const sampleInvoice = invoices[0];
      console.log('\nSample Invoice:');
      console.log(`  - Number: ${sampleInvoice.invoice_number}`);
      console.log(`  - Amount: €${sampleInvoice.total_amount}`);
      console.log(`  - Status: ${sampleInvoice.status}`);
      console.log(`  - Due Date: ${new Date(sampleInvoice.due_date).toLocaleDateString()}`);
    }
    
    testResults.passed++;
  } catch (error) {
    logError('Failed to fetch invoices', error);
    testResults.failed++;
  }
  
  // 2. Get payment methods
  try {
    logInfo('\nFetching payment methods...');
    const response = await axios.get(`${API_BASE_URL}/client/payment-methods`, { headers });
    const methods = response.data.data?.paymentMethods || [];
    
    logSuccess(`Found ${methods.length} payment methods`);
    
    methods.forEach(method => {
      console.log(`  - Type: ${method.type}, Last 4: ${method.last4 || 'N/A'}, Default: ${method.is_default}`);
    });
    
    testResults.passed++;
  } catch (error) {
    if (error.response?.status === 404) {
      logInfo('Payment methods endpoint not implemented yet');
    } else {
      logError('Failed to fetch payment methods', error);
    }
    testResults.failed++;
  }
  
  // 3. Test payment center data
  try {
    logInfo('\nFetching payment center data...');
    const response = await axios.get(`${API_BASE_URL}/client/payment-center`, { headers });
    logSuccess('Payment center data retrieved');
    testResults.passed++;
  } catch (error) {
    if (error.response?.status === 404) {
      logInfo('Payment center endpoint not implemented yet');
    } else {
      logError('Failed to fetch payment center', error);
    }
    testResults.failed++;
  }
  
  return testResults;
}

async function testTherapistBillingFlow() {
  logSection('THERAPIST BILLING FLOW TEST');
  
  const token = await login('therapist');
  if (!token) return;
  
  const headers = { Authorization: `Bearer ${token}` };
  let testResults = { passed: 0, failed: 0 };
  
  // 1. Get treatment codes
  try {
    logInfo('Fetching treatment codes...');
    const response = await axios.get(`${API_BASE_URL}/billing/treatment-codes`, { headers });
    const codes = response.data.data || [];
    
    logSuccess(`Found ${codes.length} treatment codes`);
    
    // Show first 5 treatment codes
    codes.slice(0, 5).forEach(code => {
      console.log(`  - Code: ${code.code}, Description: ${code.description}, Price: €${code.base_price}`);
    });
    
    testResults.passed++;
  } catch (error) {
    logError('Failed to fetch treatment codes', error);
    testResults.failed++;
  }
  
  // 2. Get therapist appointments (for billing)
  try {
    logInfo('\nFetching therapist appointments...');
    const response = await axios.get(`${API_BASE_URL}/therapist/appointments`, { headers });
    const appointments = response.data.data || [];
    
    logSuccess(`Found ${appointments.length} appointments`);
    
    const billableAppointments = appointments.filter(apt => apt.status === 'completed' && !apt.invoiced);
    console.log(`  - Billable appointments: ${billableAppointments.length}`);
    
    testResults.passed++;
  } catch (error) {
    logError('Failed to fetch appointments', error);
    testResults.failed++;
  }
  
  return testResults;
}

async function testBookkeeperFinancialFlow() {
  logSection('BOOKKEEPER FINANCIAL FLOW TEST');
  
  const token = await login('bookkeeper');
  if (!token) return;
  
  const headers = { Authorization: `Bearer ${token}` };
  let testResults = { passed: 0, failed: 0 };
  
  // 1. Get financial dashboard
  try {
    logInfo('Fetching financial dashboard...');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/dashboard`, { headers });
    logSuccess('Financial dashboard retrieved');
    
    const data = response.data.data || {};
    console.log(`  - Total Revenue: €${data.totalRevenue || 0}`);
    console.log(`  - Outstanding: €${data.outstandingAmount || 0}`);
    console.log(`  - Overdue: ${data.overdueInvoices || 0} invoices`);
    
    testResults.passed++;
  } catch (error) {
    logError('Failed to fetch dashboard', error);
    testResults.failed++;
  }
  
  // 2. Get all invoices
  try {
    logInfo('\nFetching all invoices...');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/invoices`, { headers });
    const invoices = response.data.data?.invoices || [];
    
    logSuccess(`Found ${invoices.length} total invoices`);
    
    // Group by status
    const statusCounts = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} invoices`);
    });
    
    testResults.passed++;
  } catch (error) {
    logError('Failed to fetch invoices', error);
    testResults.failed++;
  }
  
  // 3. Get client balances
  try {
    logInfo('\nFetching client balances...');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/clients/balances`, { headers });
    logSuccess('Client balances retrieved');
    testResults.passed++;
  } catch (error) {
    if (error.response?.status === 404) {
      logInfo('Client balances endpoint not implemented yet');
    } else {
      logError('Failed to fetch client balances', error);
    }
    testResults.failed++;
  }
  
  // 4. Get financial overview
  try {
    logInfo('\nFetching financial overview...');
    const response = await axios.get(`${API_BASE_URL}/bookkeeper/financial-overview`, { headers });
    logSuccess('Financial overview retrieved');
    testResults.passed++;
  } catch (error) {
    if (error.response?.status === 404) {
      logInfo('Financial overview endpoint not implemented yet');
    } else {
      logError('Failed to fetch financial overview', error);
    }
    testResults.failed++;
  }
  
  return testResults;
}

async function testPaymentIntegration() {
  logSection('PAYMENT INTEGRATION TEST');
  
  let testResults = { passed: 0, failed: 0 };
  
  // Test Mollie webhook endpoint
  try {
    logInfo('Testing payment webhook endpoint...');
    const response = await axios.post(`${API_BASE_URL}/webhooks/mollie`, {
      id: 'test_payment_id'
    });
    logSuccess('Webhook endpoint accessible');
    testResults.passed++;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logInfo('Webhook endpoint requires authentication/verification');
      testResults.passed++;
    } else {
      logError('Webhook endpoint error', error);
      testResults.failed++;
    }
  }
  
  return testResults;
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}COMPREHENSIVE PAYMENT FLOW TESTS${colors.reset}`);
  console.log(`${colors.yellow}Backend URL: ${API_BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  
  let totalResults = { passed: 0, failed: 0 };
  
  // Run all test suites
  const clientResults = await testClientPaymentFlow();
  if (clientResults) {
    totalResults.passed += clientResults.passed;
    totalResults.failed += clientResults.failed;
  }
  
  const therapistResults = await testTherapistBillingFlow();
  if (therapistResults) {
    totalResults.passed += therapistResults.passed;
    totalResults.failed += therapistResults.failed;
  }
  
  const bookkeeperResults = await testBookkeeperFinancialFlow();
  if (bookkeeperResults) {
    totalResults.passed += bookkeeperResults.passed;
    totalResults.failed += bookkeeperResults.failed;
  }
  
  const integrationResults = await testPaymentIntegration();
  if (integrationResults) {
    totalResults.passed += integrationResults.passed;
    totalResults.failed += integrationResults.failed;
  }
  
  // Summary
  logSection('TEST SUMMARY');
  console.log(`${colors.green}Passed: ${totalResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${totalResults.failed}${colors.reset}`);
  console.log(`${colors.cyan}Total: ${totalResults.passed + totalResults.failed}${colors.reset}`);
  
  const successRate = totalResults.passed / (totalResults.passed + totalResults.failed) * 100;
  console.log(`\n${colors.yellow}Success Rate: ${successRate.toFixed(1)}%${colors.reset}`);
  
  if (totalResults.failed > 0) {
    console.log(`\n${colors.yellow}Note: Some endpoints may not be implemented yet or require additional setup.${colors.reset}`);
  }
}

// Run tests
runAllTests().catch(console.error);