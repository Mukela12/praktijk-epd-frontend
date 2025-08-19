#!/usr/bin/env node

/**
 * Test script to verify therapist endpoints
 */

import axios from 'axios';

const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app/api';

// Test credentials
const therapistCredentials = {
  email: 'codelibrary21@gmail.com',
  password: 'Milan18$'
};

let therapistToken = null;

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    timeout: 10000,
    headers: {}
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { 
      success: true, 
      data: response.data, 
      status: response.status
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 0,
      fullError: error.response
    };
  }
}

async function testTherapistEndpoints() {
  console.log('Testing Therapist Endpoints...\n');

  // 1. Login
  console.log('1. Testing Login...');
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: therapistCredentials.email,
    password: therapistCredentials.password
  });

  if (loginResult.success) {
    console.log('✅ Login successful');
    console.log('Need 2FA code. Please provide the 2FA code for therapist.');
    process.exit(0);
  } else {
    console.log('❌ Login failed:', loginResult.error);
    if (loginResult.status === 500) {
      console.log('Server returned 500 error. Full error:', JSON.stringify(loginResult.fullError?.data, null, 2));
    }
  }
}

// Add command line argument support for 2FA
const args = process.argv.slice(2);
if (args.length > 0 && args[0]) {
  // If 2FA code is provided, continue with full test
  testFullFlow(args[0]);
} else {
  // Otherwise just test login
  testTherapistEndpoints();
}

async function testFullFlow(twoFactorCode) {
  console.log('Testing Full Therapist Flow with 2FA...\n');

  // 1. Login
  console.log('1. Logging in...');
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: therapistCredentials.email,
    password: therapistCredentials.password
  });

  // Check if 2FA is required
  if (loginResult.data?.requiresTwoFactor) {
    console.log('✅ Login successful, 2FA required');
    
    // 2. Retry login with 2FA code
    console.log('2. Retrying login with 2FA code...');
    const loginWith2FA = await apiRequest('POST', '/auth/login', {
      email: therapistCredentials.email,
      password: therapistCredentials.password,
      twoFactorCode: twoFactorCode
    });

    if (!loginWith2FA.success) {
      console.log('❌ 2FA login failed:', loginWith2FA.error);
      return;
    }

    // Extract token from 2FA login result
    therapistToken = loginWith2FA.data.data?.access_token || 
                   loginWith2FA.data.access_token || 
                   loginWith2FA.data.token ||
                   loginWith2FA.data.data?.token ||
                   loginWith2FA.data.accessToken;
                   
    if (!therapistToken) {
      console.log('❌ Could not find access token in 2FA login response');
      console.log('2FA login response structure:', JSON.stringify(loginWith2FA.data, null, 2));
      return;
    }
    
    console.log('✅ 2FA login successful');
  } else if (loginResult.success) {
    // Direct login without 2FA
    therapistToken = loginResult.data.data?.access_token || 
                   loginResult.data.access_token || 
                   loginResult.data.token ||
                   loginResult.data.data?.token;
                   
    if (!therapistToken) {
      console.log('❌ Login successful but no token received');
      return;
    }
    console.log('✅ Login successful (no 2FA required)');
  } else {
    console.log('❌ Login failed:', loginResult.error);
    return;
  }

  // 3. Test endpoints
  console.log('\n3. Testing Therapist Endpoints...\n');

  // Test general endpoints that therapists can access
  console.log('Testing /appointments...');
  const appointmentsResult = await apiRequest('GET', '/appointments', null, therapistToken);
  console.log(appointmentsResult.success ? '✅ Appointments endpoint works' : `❌ Appointments failed: ${appointmentsResult.status} - ${JSON.stringify(appointmentsResult.error)}`);

  // Test clients
  console.log('\nTesting /clients...');
  const clientsResult = await apiRequest('GET', '/clients', null, therapistToken);
  console.log(clientsResult.success ? '✅ Clients endpoint works' : `❌ Clients failed: ${clientsResult.status} - ${JSON.stringify(clientsResult.error)}`);

  // Test sessions
  console.log('\nTesting /sessions...');
  const sessionsResult = await apiRequest('GET', '/sessions', null, therapistToken);
  console.log(sessionsResult.success ? '✅ Sessions endpoint works' : `❌ Sessions failed: ${sessionsResult.status} - ${JSON.stringify(sessionsResult.error)}`);

  // Test surveys
  console.log('\nTesting /surveys...');
  const surveysResult = await apiRequest('GET', '/surveys', null, therapistToken);
  console.log(surveysResult.success ? '✅ Surveys endpoint works' : `❌ Surveys failed: ${surveysResult.status} - ${JSON.stringify(surveysResult.error)}`);

  // Test challenges
  console.log('\nTesting /challenges...');
  const challengesResult = await apiRequest('GET', '/challenges', null, therapistToken);
  console.log(challengesResult.success ? '✅ Challenges endpoint works' : `❌ Challenges failed: ${challengesResult.status} - ${JSON.stringify(challengesResult.error)}`);

  // Test resources
  console.log('\nTesting /resources...');
  const resourcesResult = await apiRequest('GET', '/resources', null, therapistToken);
  console.log(resourcesResult.success ? '✅ Resources endpoint works' : `❌ Resources failed: ${resourcesResult.status} - ${JSON.stringify(resourcesResult.error)}`);

  // Test notifications
  console.log('\nTesting /notifications...');
  const notificationsResult = await apiRequest('GET', '/notifications', null, therapistToken);
  console.log(notificationsResult.success ? '✅ Notifications endpoint works' : `❌ Notifications failed: ${notificationsResult.status} - ${JSON.stringify(notificationsResult.error)}`);

  // Test profile
  console.log('\nTesting /auth/me...');
  const profileResult = await apiRequest('GET', '/auth/me', null, therapistToken);
  console.log(profileResult.success ? '✅ Profile endpoint works' : `❌ Profile failed: ${profileResult.status} - ${JSON.stringify(profileResult.error)}`);
  
  if (profileResult.success) {
    console.log('  User:', profileResult.data.data.user.email);
    console.log('  Role:', profileResult.data.data.user.role);
  }

  console.log('\n✅ All tests completed!');
  
  // Show summary
  console.log('\n📊 Summary:');
  console.log('The backend uses general endpoints with role-based access control.');
  console.log('Therapists access the same endpoints as other roles but get filtered data.');
}

console.log(`
Usage:
  node test-therapist-endpoints.js                    # Test login only
  node test-therapist-endpoints.js <2FA_CODE>         # Test all endpoints with 2FA

Example:
  node test-therapist-endpoints.js 123456
`);