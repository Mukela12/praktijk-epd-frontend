const axios = require('axios');
const fs = require('fs');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_RESULTS = [];

// Test users
const TEST_USERS = {
  admin: { email: 'admin@example.com', password: 'password123' },
  therapist: { email: 'therapist1@example.com', password: 'password123' },
  client: { email: 'client1@example.com', password: 'password123' },
  assistant: { email: 'assistant1@example.com', password: 'password123' },
  bookkeeper: { email: 'bookkeeper1@example.com', password: 'password123' }
};

// Helper function to log results
function logResult(testName, success, details = '') {
  const status = success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} ${testName} ${details ? `- ${details}` : ''}`);
  TEST_RESULTS.push({ testName, success, details });
}

// Helper function to login and get token
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data.accessToken;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Test dashboard endpoints
async function testDashboardEndpoints() {
  console.log(`\n${colors.blue}Testing Dashboard Endpoints...${colors.reset}`);
  
  for (const [role, credentials] of Object.entries(TEST_USERS)) {
    const token = await loginUser(credentials.email, credentials.password);
    if (!token) {
      logResult(`${role} dashboard`, false, 'Failed to login');
      continue;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/${role}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logResult(`${role} dashboard`, true, `Status: ${response.status}`);
    } catch (error) {
      logResult(`${role} dashboard`, false, error.response?.status || error.message);
    }
  }
}

// Test client messages endpoint
async function testClientMessagesEndpoint() {
  console.log(`\n${colors.blue}Testing Client Messages Endpoint...${colors.reset}`);
  
  const token = await loginUser(TEST_USERS.client.email, TEST_USERS.client.password);
  if (!token) {
    logResult('Client messages', false, 'Failed to login');
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/client/messages?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    logResult('Client messages', true, `Retrieved ${response.data.data?.messages?.length || 0} messages`);
  } catch (error) {
    if (error.response?.status === 403) {
      logResult('Client messages', false, '403 Forbidden - Expected if not implemented yet');
    } else {
      logResult('Client messages', false, error.response?.status || error.message);
    }
  }
}

// Test bookkeeper endpoints
async function testBookkeeperEndpoints() {
  console.log(`\n${colors.blue}Testing Bookkeeper Endpoints...${colors.reset}`);
  
  const token = await loginUser(TEST_USERS.bookkeeper.email, TEST_USERS.bookkeeper.password);
  if (!token) {
    logResult('Bookkeeper login', false, 'Failed to login');
    return;
  }

  const endpoints = [
    { path: '/bookkeeper/financial/overview', name: 'Financial overview' },
    { path: '/bookkeeper/invoices', name: 'Invoices list' },
    { path: '/bookkeeper/reports', name: 'Reports' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint.path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logResult(`Bookkeeper ${endpoint.name}`, true, `Status: ${response.status}`);
    } catch (error) {
      logResult(`Bookkeeper ${endpoint.name}`, false, error.response?.status || error.message);
    }
  }
}

// Test navigation consistency
async function testNavigationConsistency() {
  console.log(`\n${colors.blue}Testing Navigation Consistency...${colors.reset}`);
  
  // Check if bookkeeper should have calendar route
  const bookKeeperToken = await loginUser(TEST_USERS.bookkeeper.email, TEST_USERS.bookkeeper.password);
  if (bookKeeperToken) {
    try {
      // This should fail as bookkeepers shouldn't have calendar access
      const response = await axios.get(`${API_BASE_URL}/bookkeeper/agenda`, {
        headers: { Authorization: `Bearer ${bookKeeperToken}` }
      });
      
      logResult('Bookkeeper calendar restriction', false, 'Calendar accessible (should be restricted)');
    } catch (error) {
      if (error.response?.status === 404) {
        logResult('Bookkeeper calendar restriction', true, 'Calendar properly restricted');
      } else {
        logResult('Bookkeeper calendar restriction', false, error.response?.status || error.message);
      }
    }
  }
}

// Test report generation functionality
async function testReportGeneration() {
  console.log(`\n${colors.blue}Testing Report Generation...${colors.reset}`);
  
  const token = await loginUser(TEST_USERS.bookkeeper.email, TEST_USERS.bookkeeper.password);
  if (!token) {
    logResult('Report generation', false, 'Failed to login');
    return;
  }

  try {
    // Test financial summary report
    const response = await axios.post(`${API_BASE_URL}/bookkeeper/reports/generate`, {
      reportType: 'financial_summary',
      period: 'this_month',
      format: 'csv'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    logResult('Report generation', true, 'Financial summary report');
  } catch (error) {
    if (error.response?.status === 404) {
      logResult('Report generation', false, 'Endpoint not implemented yet');
    } else {
      logResult('Report generation', false, error.response?.status || error.message);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.blue}=== PraktijkEPD Functionality Test Suite ===${colors.reset}`);
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  await testDashboardEndpoints();
  await testClientMessagesEndpoint();
  await testBookkeeperEndpoints();
  await testNavigationConsistency();
  await testReportGeneration();

  // Summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
  const passed = TEST_RESULTS.filter(r => r.success).length;
  const failed = TEST_RESULTS.filter(r => !r.success).length;
  const total = TEST_RESULTS.length;
  
  console.log(`Total tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

  // Save detailed results
  const reportContent = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, successRate: `${((passed / total) * 100).toFixed(1)}%` },
    details: TEST_RESULTS
  };

  fs.writeFileSync('functionality-test-report.json', JSON.stringify(reportContent, null, 2));
  console.log(`\nDetailed report saved to: functionality-test-report.json`);
}

// Run tests
runAllTests().catch(console.error);