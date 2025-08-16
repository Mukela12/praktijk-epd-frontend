#!/usr/bin/env node

/**
 * Comprehensive Test Script for PraktijkEPD Backend
 * 
 * This script tests all implemented endpoints with proper authentication
 * and role-based access control.
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 5000;

// Test data storage
let adminToken = null;
let therapistToken = null;
let clientToken = null;
let testUserId = null;
let testTherapistId = null;
let testClientId = null;
let testAppointmentId = null;
let testSessionId = null;
let testResourceId = null;
let testSurveyId = null;
let testChallengeId = null;

// Test users credentials
const testUsers = {
  admin: {
    email: 'admin@praktijkepd.nl',
    password: 'Admin123!@#'
  },
  therapist: {
    email: 'therapist@praktijkepd.nl',
    password: 'Therapist123!@#'
  },
  client: {
    email: 'client@praktijkepd.nl',
    password: 'Client123!@#'
  }
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    timeout: TEST_TIMEOUT,
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
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 0
    };
  }
}

// Test result logger
function logTestResult(testName, result, details = null) {
  if (result.success) {
    console.log(`✅ ${testName}`.green);
    if (details) {
      console.log(`   ${details}`.gray);
    }
  } else {
    console.log(`❌ ${testName}`.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    if (result.status) {
      console.log(`   Status: ${result.status}`.red);
    }
  }
}

// Test sections
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints'.cyan.bold);
  
  // Test admin login
  const adminLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.admin.email,
    password: testUsers.admin.password
  });
  logTestResult('Admin login', adminLogin);
  if (adminLogin.success) {
    adminToken = adminLogin.data.accessToken;
  }

  // Test therapist login
  const therapistLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.therapist.email,
    password: testUsers.therapist.password
  });
  logTestResult('Therapist login', therapistLogin);
  if (therapistLogin.success) {
    therapistToken = therapistLogin.data.accessToken;
    testTherapistId = therapistLogin.data.user.id;
  }

  // Test client login
  const clientLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.client.email,
    password: testUsers.client.password
  });
  logTestResult('Client login', clientLogin);
  if (clientLogin.success) {
    clientToken = clientLogin.data.accessToken;
    testClientId = clientLogin.data.user.id;
  }
}

async function testProfileManagement() {
  console.log('\n👤 Testing Profile Management Endpoints'.cyan.bold);
  
  // Get all users
  const getUsers = await apiRequest('GET', '/admin/users?page=1&limit=10', null, adminToken);
  logTestResult('Get all users', getUsers, `Found ${getUsers.data?.data?.users?.length || 0} users`);
  
  if (getUsers.success && getUsers.data.data.users.length > 0) {
    testUserId = getUsers.data.data.users[0].id;
  }

  // Edit user profile
  if (testUserId) {
    const editProfile = await apiRequest('PUT', `/admin/users/${testUserId}`, {
      firstName: 'Test',
      lastName: 'Updated'
    }, adminToken);
    logTestResult('Edit user profile', editProfile);
  }

  // Test therapist specializations
  if (testTherapistId) {
    const updateSpecializations = await apiRequest('PUT', `/admin/therapists/${testTherapistId}/specializations`, {
      specializations: ['anxiety', 'depression', 'trauma']
    }, adminToken);
    logTestResult('Update therapist specializations', updateSpecializations);
  }

  // Test address change requests
  const getAddressRequests = await apiRequest('GET', '/admin/address-change-requests', null, adminToken);
  logTestResult('Get address change requests', getAddressRequests);
}

async function testAppointmentSystem() {
  console.log('\n📅 Testing Appointment System'.cyan.bold);
  
  // Create appointment request as client
  const appointmentRequest = await apiRequest('POST', '/client/appointment-request', {
    preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferredTime: '14:00',
    problemDescription: 'Test appointment request',
    urgency: 'normal'
  }, clientToken);
  logTestResult('Create appointment request', appointmentRequest);

  // Get unassigned appointment requests as admin
  const unassignedRequests = await apiRequest('GET', '/admin/appointment-requests', null, adminToken);
  logTestResult('Get unassigned appointment requests', unassignedRequests);

  // Get therapist availability
  if (testTherapistId) {
    const availability = await apiRequest('GET', `/client/therapists/${testTherapistId}/availability?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, null, clientToken);
    logTestResult('Get therapist availability', availability);
  }

  // Test calendar view
  const calendarView = await apiRequest('GET', `/appointments/calendar?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&view=month`, null, therapistToken);
  logTestResult('Get calendar view', calendarView);

  // Test available slots
  if (testTherapistId) {
    const availableSlots = await apiRequest('GET', `/appointments/available-slots?therapistId=${testTherapistId}&date=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`, null, adminToken);
    logTestResult('Get available slots', availableSlots);
  }
}

async function testSessionManagement() {
  console.log('\n🏥 Testing Session Management'.cyan.bold);
  
  // Get appointments first
  const appointments = await apiRequest('GET', '/appointments', null, therapistToken);
  if (appointments.success && appointments.data.data.length > 0) {
    testAppointmentId = appointments.data.data[0].id;
  }

  // Start session
  if (testAppointmentId) {
    const startSession = await apiRequest('POST', '/sessions/start', {
      appointmentId: testAppointmentId,
      clientPresent: true,
      location: 'office'
    }, therapistToken);
    logTestResult('Start session', startSession);
    
    if (startSession.success) {
      testSessionId = startSession.data.data.id;
    }
  }

  // Add session progress
  if (testSessionId) {
    const sessionProgress = await apiRequest('POST', `/sessions/${testSessionId}/progress`, {
      progressNotes: 'Client showed good progress',
      goalsDiscussed: 'Anxiety management techniques',
      clientMoodStart: 6,
      clientMoodEnd: 8
    }, therapistToken);
    logTestResult('Add session progress', sessionProgress);
  }

  // Get session history
  const sessionHistory = await apiRequest('GET', '/sessions', null, therapistToken);
  logTestResult('Get session history', sessionHistory);

  // Get session statistics
  const sessionStats = await apiRequest('GET', '/sessions/statistics', null, therapistToken);
  logTestResult('Get session statistics', sessionStats);
}

async function testNotificationSystem() {
  console.log('\n🔔 Testing Notification System'.cyan.bold);
  
  // Get notifications
  const notifications = await apiRequest('GET', '/notifications', null, clientToken);
  logTestResult('Get notifications', notifications);

  // Mark notification as read
  if (notifications.success && notifications.data.data.notifications.length > 0) {
    const notificationId = notifications.data.data.notifications[0].id;
    const markRead = await apiRequest('PUT', `/notifications/${notificationId}/read`, null, clientToken);
    logTestResult('Mark notification as read', markRead);
  }

  // Mark all as read
  const markAllRead = await apiRequest('PUT', '/notifications/mark-all-read', null, clientToken);
  logTestResult('Mark all notifications as read', markAllRead);
}

async function testResourceManagement() {
  console.log('\n📚 Testing Resource Management'.cyan.bold);
  
  // Create resource as admin
  const createResource = await apiRequest('POST', '/resources', {
    title: 'Test Resource',
    description: 'A test resource for anxiety management',
    type: 'article',
    category: 'anxiety',
    contentBody: 'This is the content of the test resource...',
    isPublic: true
  }, adminToken);
  logTestResult('Create resource', createResource);
  
  if (createResource.success) {
    testResourceId = createResource.data.data.id;
  }

  // Get resources
  const getResources = await apiRequest('GET', '/resources', null, clientToken);
  logTestResult('Get resources', getResources);

  // Assign resource to client
  if (testResourceId && testClientId) {
    const assignResource = await apiRequest('POST', `/resources/${testResourceId}/assign`, {
      clientId: testClientId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, therapistToken);
    logTestResult('Assign resource to client', assignResource);
  }

  // Track engagement
  if (testResourceId) {
    const trackEngagement = await apiRequest('POST', `/resources/${testResourceId}/engagement`, {
      action: 'view',
      timeSpent: 10
    }, clientToken);
    logTestResult('Track resource engagement', trackEngagement);
  }
}

async function testSurveySystem() {
  console.log('\n📋 Testing Survey System'.cyan.bold);
  
  // Create survey as therapist
  const createSurvey = await apiRequest('POST', '/surveys', {
    title: 'Weekly Check-in',
    description: 'How are you feeling this week?',
    type: 'assessment',
    questions: [
      {
        id: 'q1',
        text: 'Rate your anxiety level',
        type: 'scale',
        required: true,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      },
      {
        id: 'q2',
        text: 'What challenges did you face?',
        type: 'text',
        required: false
      }
    ]
  }, therapistToken);
  logTestResult('Create survey', createSurvey);
  
  if (createSurvey.success) {
    testSurveyId = createSurvey.data.data.id;
  }

  // Assign survey
  if (testSurveyId && testClientId) {
    const assignSurvey = await apiRequest('POST', `/surveys/${testSurveyId}/assign`, {
      clientId: testClientId,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }, therapistToken);
    logTestResult('Assign survey to client', assignSurvey);
  }

  // Get assigned surveys
  const assignedSurveys = await apiRequest('GET', '/client/surveys', null, clientToken);
  logTestResult('Get assigned surveys', assignedSurveys);
}

async function testChallengeSystem() {
  console.log('\n🎯 Testing Challenge System'.cyan.bold);
  
  // Create challenge as therapist
  const createChallenge = await apiRequest('POST', '/challenges', {
    title: 'Daily Breathing Exercise',
    description: 'Practice deep breathing for 10 minutes',
    category: 'mindfulness',
    difficulty: 'beginner',
    durationMinutes: 10,
    duration: 7,
    targetValue: 70,
    targetUnit: 'minutes',
    instructions: [
      'Find a quiet place',
      'Breathe in for 4 counts',
      'Hold for 4 counts',
      'Breathe out for 4 counts'
    ]
  }, therapistToken);
  logTestResult('Create challenge', createChallenge);
  
  if (createChallenge.success) {
    testChallengeId = createChallenge.data.data.id;
  }

  // Assign challenge
  if (testChallengeId && testClientId) {
    const assignChallenge = await apiRequest('POST', `/challenges/${testChallengeId}/assign`, {
      clientId: testClientId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'daily'
    }, therapistToken);
    logTestResult('Assign challenge to client', assignChallenge);
  }

  // Get client challenges
  const clientChallenges = await apiRequest('GET', '/client/challenges', null, clientToken);
  logTestResult('Get client challenges', clientChallenges);

  // Start challenge check-in
  if (testChallengeId) {
    const startCheckIn = await apiRequest('POST', `/challenges/${testChallengeId}/check-in`, {
      moodBefore: 6
    }, clientToken);
    logTestResult('Start challenge check-in', startCheckIn);
  }
}

async function testSmartPairing() {
  console.log('\n🤖 Testing Smart Pairing System'.cyan.bold);
  
  // Get therapist recommendations
  if (testClientId) {
    const recommendations = await apiRequest('GET', `/admin/smart-pairing/recommendations?clientId=${testClientId}&problemCategory=anxiety`, null, adminToken);
    logTestResult('Get therapist recommendations', recommendations, 
      `Found ${recommendations.data?.data?.recommendations?.length || 0} recommendations`);
  }

  // Get pairing analytics
  const analytics = await apiRequest('GET', `/admin/smart-pairing/analytics?startDate=${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`, null, adminToken);
  logTestResult('Get pairing analytics', analytics);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting PraktijkEPD Backend API Tests'.yellow.bold);
  console.log(`📍 API Base URL: ${API_BASE_URL}`.gray);
  console.log('═'.repeat(50).gray);

  try {
    await testAuthentication();
    
    if (!adminToken || !therapistToken || !clientToken) {
      console.log('\n❌ Authentication failed. Cannot proceed with other tests.'.red.bold);
      return;
    }

    await testProfileManagement();
    await testAppointmentSystem();
    await testSessionManagement();
    await testNotificationSystem();
    await testResourceManagement();
    await testSurveySystem();
    await testChallengeSystem();
    await testSmartPairing();

    console.log('\n✨ All tests completed!'.green.bold);
    console.log('═'.repeat(50).gray);
    
  } catch (error) {
    console.error('\n💥 Test runner error:'.red.bold, error);
  }
}

// Check if colors module is installed
try {
  require('colors');
} catch (error) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install colors', { stdio: 'inherit' });
}

// Run tests
runAllTests();