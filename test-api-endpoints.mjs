#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:3000';
const testResults = [];

// Test data
let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZDQzZTQzZS0yNzBhLTQ1NWMtYWZhZS0zMWI4MGQzMzAyOGYiLCJlbWFpbCI6ImFkbWluQHByYWt0aWprZXBkLm5sIiwicm9sZSI6ImFkbWluIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzU0OTYzMDQwLCJleHAiOjE3NTQ5NjM5NDB9.DXJcIOY-WznYZnPOSMazoC-M8qBeZObS_oIE7x3zVgw';
let therapistToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNzI4OTNmNC0yODdjLTQyZDUtYmI4ZC1hZWNjNGE2Y2EwZjkiLCJlbWFpbCI6ImVtbWEuZGVqb25nQGV4YW1wbGUuY29tIiwicm9sZSI6InRoZXJhcGlzdCIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc1NDk2Mjk4MiwiZXhwIjoxNzU0OTYzODgyfQ.vL2fhlRFzq9WUS8L8M_HWbiDIptF3vvi9YbJDZsCyTE';
let clientToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYjU3NDBiNC0wYjU3LTRhNTEtOWJlNy05YWI3OWRlOTE5MzgiLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJzdGF0dXMiOiJhY3RpdmUiLCJpYXQiOjE3NTQ5NjIwNzcsImV4cCI6MTc1NDk2Mjk3N30.Ok58nRPjTXCSmQ7sROiFCpBKbI6Nofuu6J_FsTIom3A';

let newClientId = null;
let newTherapistId = null;
let newAppointmentId = null;
let newResourceId = null;
let newChallengeId = null;
let newSurveyId = null;

async function testEndpoint(method, path, data = null, token = null, description = '') {
  const config = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    testResults.push({
      success: true,
      method,
      path,
      description,
      status: response.status,
      data: response.data
    });
    console.log(`✅ ${method} ${path} - ${description}`);
    return response.data;
  } catch (error) {
    testResults.push({
      success: false,
      method,
      path,
      description,
      status: error.response?.status || 'ERROR',
      error: error.response?.data?.message || error.message
    });
    console.log(`❌ ${method} ${path} - ${description} - ${error.response?.status || 'ERROR'}`);
    return null;
  }
}

async function refreshTokens() {
  console.log('\n=== Refreshing Tokens ===');
  
  // Admin login
  const adminLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'admin@praktijkepd.nl',
    password: 'Admin123!@#'
  }, null, 'Admin Login');
  
  if (adminLogin?.accessToken) {
    adminToken = adminLogin.accessToken;
  }

  // Therapist login
  const therapistLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'emma.dejong@example.com',
    password: 'TherapistPass123!'
  }, null, 'Therapist Login');
  
  if (therapistLogin?.accessToken) {
    therapistToken = therapistLogin.accessToken;
  }

  // Client login
  const clientLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'client@example.com',
    password: 'ClientPass123!'
  }, null, 'Client Login');
  
  if (clientLogin?.accessToken) {
    clientToken = clientLogin.accessToken;
  }
}

async function runTests() {
  // First refresh all tokens
  await refreshTokens();

  console.log('\n=== Testing Authentication Endpoints ===');
  
  // Test registration
  await testEndpoint('POST', '/api/auth/register', {
    email: `newuser${Date.now()}@example.com`,
    password: 'NewUser123!',
    firstName: 'New',
    lastName: 'User',
    role: 'client',
    phone: '+31612345678'
  }, null, 'Register New User');

  // Test refresh token
  await testEndpoint('POST', '/api/auth/refresh-token', {
    refreshToken: clientToken
  }, null, 'Refresh Token');

  // Test get current user
  await testEndpoint('GET', '/api/auth/me', null, clientToken, 'Get Current User');

  console.log('\n=== Testing Admin Endpoints ===');
  
  // Dashboard
  await testEndpoint('GET', '/api/admin/dashboard', null, adminToken, 'Admin Dashboard');
  
  // Financial Overview
  await testEndpoint('GET', '/api/admin/financial/overview', null, adminToken, 'Financial Overview');
  
  // Get all clients
  const clientsResponse = await testEndpoint('GET', '/api/admin/clients', null, adminToken, 'Get All Clients');
  
  // Get clients with pagination
  await testEndpoint('GET', '/api/admin/clients?page=1&limit=5', null, adminToken, 'Get Clients (Paginated)');
  
  // Create new client (as admin)
  const newClientData = await testEndpoint('POST', '/api/admin/users', {
    email: `testclient${Date.now()}@example.com`,
    password: 'TestClient123!',
    firstName: 'Test',
    lastName: 'Client',
    role: 'client',
    phone: '+31687654321'
  }, adminToken, 'Create New Client');
  
  if (newClientData?.data?.id) {
    newClientId = newClientData.data.id;
    
    // Update client
    await testEndpoint('PUT', `/api/admin/users/${newClientId}`, {
      phone: '+31612121212',
      status: 'active'
    }, adminToken, 'Update Client');
    
    // Get specific client
    await testEndpoint('GET', `/api/admin/clients/${newClientId}`, null, adminToken, 'Get Specific Client');
  }
  
  // Get therapists
  await testEndpoint('GET', '/api/admin/therapists', null, adminToken, 'Get All Therapists');
  
  // Get waiting list
  await testEndpoint('GET', '/api/admin/waiting-list', null, adminToken, 'Get Waiting List');
  
  // Get appointments
  await testEndpoint('GET', '/api/admin/appointments', null, adminToken, 'Get All Appointments');
  
  // Get reports
  await testEndpoint('GET', '/api/admin/reports?reportType=revenue', null, adminToken, 'Get Revenue Report');

  console.log('\n=== Testing Therapist Endpoints ===');
  
  // Therapist dashboard
  await testEndpoint('GET', '/api/therapist/dashboard', null, therapistToken, 'Therapist Dashboard');
  
  // Get profile
  await testEndpoint('GET', '/api/therapist/profile', null, therapistToken, 'Get Therapist Profile');
  
  // Update profile
  await testEndpoint('PUT', '/api/therapist/profile', {
    bio: 'Updated bio for testing',
    specializations: ['Anxiety', 'Depression', 'CBT'],
    maxClientsPerDay: 8
  }, therapistToken, 'Update Therapist Profile');
  
  // Get clients
  await testEndpoint('GET', '/api/therapist/clients', null, therapistToken, 'Get Therapist Clients');
  
  // Get appointments
  await testEndpoint('GET', '/api/therapist/appointments', null, therapistToken, 'Get Therapist Appointments');
  
  // Create appointment
  const appointmentData = await testEndpoint('POST', '/api/therapist/appointments', {
    clientId: clientsResponse?.data?.clients?.[0]?.id || 'test-id',
    appointmentDate: '2025-09-15',
    startTime: '14:00',
    endTime: '15:00',
    therapyType: 'counseling',
    location: 'office',
    notes: 'Test appointment'
  }, therapistToken, 'Create Appointment');
  
  if (appointmentData?.data?.id) {
    newAppointmentId = appointmentData.data.id;
    
    // Update appointment
    await testEndpoint('PUT', `/api/therapist/appointments/${newAppointmentId}`, {
      status: 'confirmed',
      notes: 'Updated notes'
    }, therapistToken, 'Update Appointment');
  }
  
  // Get schedule
  await testEndpoint('GET', '/api/therapist/schedule', null, therapistToken, 'Get Schedule');
  
  // Get availability
  await testEndpoint('GET', '/api/therapist/availability', null, therapistToken, 'Get Availability');

  console.log('\n=== Testing Client Endpoints ===');
  
  // Client dashboard
  await testEndpoint('GET', '/api/client/dashboard', null, clientToken, 'Client Dashboard');
  
  // Get profile
  await testEndpoint('GET', '/api/client/profile', null, clientToken, 'Get Client Profile');
  
  // Update profile
  await testEndpoint('PUT', '/api/client/profile', {
    phone: '+31698765432',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '+31612345678'
  }, clientToken, 'Update Client Profile');
  
  // Get appointments
  await testEndpoint('GET', '/api/client/appointments', null, clientToken, 'Get Client Appointments');
  
  // Request appointment
  await testEndpoint('POST', '/api/client/appointments/request', {
    preferredDate: '2025-08-20',
    preferredTime: '10:00',
    therapyType: 'counseling',
    urgencyLevel: 'normal',
    reason: 'Regular session'
  }, clientToken, 'Request Appointment');
  
  // Get therapist
  await testEndpoint('GET', '/api/client/therapist', null, clientToken, 'Get Assigned Therapist');
  
  // Get messages
  await testEndpoint('GET', '/api/client/messages', null, clientToken, 'Get Messages');
  
  // Send message
  await testEndpoint('POST', '/api/client/messages', {
    recipient_id: 'c72893f4-287c-42d5-bb8d-aecc4a6ca0f9', // Therapist ID
    subject: 'Test Message',
    content: 'This is a test message',
    priority_level: 'normal'
  }, clientToken, 'Send Message');
  
  // Submit intake form
  await testEndpoint('POST', '/api/client/intake-form', {
    reasonForTherapy: 'Test intake form',
    therapyGoals: ['Goal 1', 'Goal 2'],
    medicalHistory: 'None',
    medications: 'None',
    previousTherapy: false,
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '+31612345678'
  }, clientToken, 'Submit Intake Form');
  
  // Get preferences
  await testEndpoint('GET', '/api/client/preferences', null, clientToken, 'Get Preferences');
  
  // Get invoices
  await testEndpoint('GET', '/api/client/invoices', null, clientToken, 'Get Invoices');
  
  // Get session history
  await testEndpoint('GET', '/api/client/session-history', null, clientToken, 'Get Session History');

  console.log('\n=== Testing Resources Endpoints ===');
  
  // Create resource (as therapist)
  const resourceData = await testEndpoint('POST', '/api/resources', {
    title: 'Test Resource',
    description: 'A test resource for API testing',
    type: 'article',
    category: 'anxiety',
    contentBody: 'This is the content of the test resource',
    difficulty: 'beginner',
    tags: ['test', 'anxiety'],
    isPublic: true
  }, therapistToken, 'Create Resource');
  
  if (resourceData?.data?.id) {
    newResourceId = resourceData.data.id;
    
    // Get resource
    await testEndpoint('GET', `/api/resources/${newResourceId}`, null, clientToken, 'Get Resource');
    
    // Update resource
    await testEndpoint('PUT', `/api/resources/${newResourceId}`, {
      title: 'Updated Test Resource'
    }, therapistToken, 'Update Resource');
    
    // Assign resource to client
    await testEndpoint('POST', `/api/resources/${newResourceId}/assign`, {
      clientId: 'ab5740b4-0b57-4a51-9be7-9ab79de91938',
      dueDate: '2025-08-31',
      priority: 'high'
    }, therapistToken, 'Assign Resource');
  }
  
  // Get all resources
  await testEndpoint('GET', '/api/resources', null, clientToken, 'Get All Resources');
  
  // Get client resources
  await testEndpoint('GET', '/api/client/resources', null, clientToken, 'Get Client Resources');

  console.log('\n=== Testing Challenges Endpoints ===');
  
  // Create challenge
  const challengeData = await testEndpoint('POST', '/api/challenges', {
    title: '7-Day Test Challenge',
    description: 'A test challenge for API testing',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 7,
    targetValue: 7,
    targetUnit: 'days',
    isPublic: true
  }, therapistToken, 'Create Challenge');
  
  if (challengeData?.data?.id) {
    newChallengeId = challengeData.data.id;
    
    // Get challenge
    await testEndpoint('GET', `/api/challenges/${newChallengeId}`, null, clientToken, 'Get Challenge');
    
    // Join challenge
    await testEndpoint('POST', `/api/challenges/${newChallengeId}/join`, null, clientToken, 'Join Challenge');
    
    // Update progress
    await testEndpoint('POST', `/api/challenges/${newChallengeId}/progress`, {
      progressData: { daysCompleted: 3 },
      progressPercentage: 43
    }, clientToken, 'Update Challenge Progress');
  }
  
  // Get all challenges
  await testEndpoint('GET', '/api/challenges', null, clientToken, 'Get All Challenges');

  console.log('\n=== Testing Surveys Endpoints ===');
  
  // Create survey
  const surveyData = await testEndpoint('POST', '/api/surveys', {
    title: 'Test Survey',
    description: 'A test survey for API testing',
    type: 'assessment',
    questions: [
      {
        id: 'q1',
        text: 'How are you feeling?',
        type: 'scale',
        required: true,
        scale: { min: 1, max: 10 }
      },
      {
        id: 'q2',
        text: 'Any comments?',
        type: 'text',
        required: false
      }
    ]
  }, therapistToken, 'Create Survey');
  
  if (surveyData?.data?.id) {
    newSurveyId = surveyData.data.id;
    
    // Get survey
    await testEndpoint('GET', `/api/surveys/${newSurveyId}`, null, clientToken, 'Get Survey');
    
    // Submit response
    await testEndpoint('POST', `/api/surveys/${newSurveyId}/respond`, {
      responses: {
        q1: 7,
        q2: 'Feeling good'
      }
    }, clientToken, 'Submit Survey Response');
  }
  
  // Get all surveys
  await testEndpoint('GET', '/api/surveys', null, clientToken, 'Get All Surveys');

  // Generate report
  console.log('\n=== Generating Test Report ===');
  
  const successCount = testResults.filter(r => r.success).length;
  const failCount = testResults.filter(r => !r.success).length;
  const successRate = ((successCount / testResults.length) * 100).toFixed(1);
  
  const report = {
    summary: {
      totalTests: testResults.length,
      successful: successCount,
      failed: failCount,
      successRate: `${successRate}%`,
      timestamp: new Date().toISOString()
    },
    results: testResults
  };
  
  await fs.writeFile('api-test-report.json', JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Tests completed: ${successCount}/${testResults.length} passed (${successRate}%)`);
  console.log(`📄 Full report saved to api-test-report.json`);
  
  // Cleanup - delete created resources
  if (newAppointmentId && therapistToken) {
    await testEndpoint('DELETE', `/api/therapist/appointments/${newAppointmentId}`, null, therapistToken, 'Cleanup: Delete Appointment');
  }
  if (newResourceId && adminToken) {
    await testEndpoint('DELETE', `/api/resources/${newResourceId}`, null, adminToken, 'Cleanup: Delete Resource');
  }
  if (newChallengeId && adminToken) {
    await testEndpoint('DELETE', `/api/challenges/${newChallengeId}`, null, adminToken, 'Cleanup: Delete Challenge');
  }
  if (newSurveyId && adminToken) {
    await testEndpoint('DELETE', `/api/surveys/${newSurveyId}`, null, adminToken, 'Cleanup: Delete Survey');
  }
}

// Run tests
runTests().catch(console.error);