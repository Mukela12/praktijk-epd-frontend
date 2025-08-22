#!/usr/bin/env node

/**
 * Enhanced Comprehensive Test Script for PraktijkEPD Backend
 * 
 * This script tests all implemented endpoints with proper authentication,
 * role-based access control, and saves results to a file.
 */

import axios from 'axios';
import { writeFileSync } from 'fs';
import path from 'path';

// Configuration
const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app/api';
const TEST_TIMEOUT = 15000;
const RESULTS_FILE = 'current-endpoints-results.txt';

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
let testResults = [];
let startTime = null;

// Test users credentials - 2FA codes provided by user
const testUsers = {
  admin: {
    email: 'banturide5@gmail.com',
    password: 'Milan18$',
    twoFactorCode: '300116' // Replace with fresh 2FA code before running
  },
  therapist: {
    email: 'codelibrary21@gmail.com',
    password: 'Milan18$',
    twoFactorCode: '687435' // Replace with fresh 2FA code before running
  },
  client: {
    email: 'mukelathegreat@gmail.com',
    password: 'Milan18$'
  }
};

// Helper to colorize output for console
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
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

  const startTime = Date.now();
  
  try {
    const response = await axios(config);
    const duration = Date.now() - startTime;
    return { 
      success: true, 
      data: response.data, 
      status: response.status,
      duration,
      headers: response.headers
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 0,
      duration,
      headers: error.response?.headers || {}
    };
  }
}

// Test result logger
function logTestResult(testName, result, details = null) {
  const timestamp = new Date().toISOString();
  const status = result.success ? 'PASS' : 'FAIL';
  const statusSymbol = result.success ? '✅' : '❌';
  
  // Console output
  if (result.success) {
    console.log(`${statusSymbol} ${colors.green(testName)}`);
    if (details) {
      console.log(`   ${colors.gray(details)}`);
    }
  } else {
    console.log(`${statusSymbol} ${colors.red(testName)}`);
    console.log(`   ${colors.red(`Error: ${JSON.stringify(result.error)}`)}`);
    if (result.status) {
      console.log(`   ${colors.red(`Status: ${result.status}`)}`);
    }
  }
  
  // Store result for file output
  testResults.push({
    timestamp,
    testName,
    status,
    statusCode: result.status,
    duration: result.duration || 0,
    details: details || '',
    error: result.error || null,
    response: result.success ? result.data : null
  });
}

// Save results to file
function saveResults() {
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
  
  let output = `PraktijkEPD Backend API Test Results\n`;
  output += `=====================================\n`;
  output += `Test Date: ${new Date().toLocaleString()}\n`;
  output += `API Base URL: ${API_BASE_URL}\n`;
  output += `Total Duration: ${totalDuration} seconds\n`;
  output += `\n`;
  
  // Summary
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  
  output += `Test Summary\n`;
  output += `------------\n`;
  output += `Total Tests: ${total}\n`;
  output += `Passed: ${passed}\n`;
  output += `Failed: ${failed}\n`;
  output += `Success Rate: ${((passed/total) * 100).toFixed(2)}%\n`;
  output += `\n`;
  
  // Detailed results by category
  const categories = {
    'Authentication': [],
    'Profile Management': [],
    'Appointment System': [],
    'Session Management': [],
    'Notification System': [],
    'Resource Management': [],
    'Survey System': [],
    'Challenge System': [],
    'Smart Pairing': []
  };
  
  // Categorize results
  testResults.forEach(result => {
    for (const category in categories) {
      if (result.testName.toLowerCase().includes(category.toLowerCase().split(' ')[0])) {
        categories[category].push(result);
        break;
      }
    }
  });
  
  // Output by category
  for (const [category, results] of Object.entries(categories)) {
    if (results.length > 0) {
      output += `\n${category}\n`;
      output += '-'.repeat(category.length) + '\n';
      
      results.forEach(result => {
        const status = result.status === 'PASS' ? '[PASS]' : '[FAIL]';
        output += `${status} ${result.testName} (${result.duration}ms)\n`;
        
        if (result.details) {
          output += `      Details: ${result.details}\n`;
        }
        
        if (result.error) {
          output += `      Error: ${JSON.stringify(result.error)}\n`;
          output += `      Status Code: ${result.statusCode}\n`;
        }
        
        if (result.response && result.testName.includes('login')) {
          output += `      User ID: ${result.response.user?.id || 'N/A'}\n`;
          output += `      User Role: ${result.response.user?.role || 'N/A'}\n`;
        }
      });
    }
  }
  
  // Failed tests detail
  const failedTests = testResults.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    output += `\n\nFailed Tests Detail\n`;
    output += `===================\n`;
    
    failedTests.forEach(result => {
      output += `\nTest: ${result.testName}\n`;
      output += `Timestamp: ${result.timestamp}\n`;
      output += `Status Code: ${result.statusCode}\n`;
      output += `Error: ${JSON.stringify(result.error, null, 2)}\n`;
      output += '-'.repeat(50) + '\n';
    });
  }
  
  // Write to file
  writeFileSync(RESULTS_FILE, output);
  console.log(`\n📄 Results saved to ${colors.green(RESULTS_FILE)}`);
}

// Test sections
async function testAuthentication() {
  console.log(`\n${colors.cyan(colors.bold('🔐 Testing Authentication Endpoints'))}`);
  
  // Test admin login with 2FA
  const adminLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.admin.email,
    password: testUsers.admin.password,
    twoFactorCode: testUsers.admin.twoFactorCode
  });
  logTestResult('Admin login with 2FA', adminLogin);
  if (adminLogin.success) {
    adminToken = adminLogin.data.token || adminLogin.data.accessToken;
    if (!adminToken) {
      console.log(colors.yellow('⚠️  Admin token not found in response'));
    }
  }

  // Test therapist login with 2FA
  const therapistLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.therapist.email,
    password: testUsers.therapist.password,
    twoFactorCode: testUsers.therapist.twoFactorCode
  });
  logTestResult('Therapist login with 2FA', therapistLogin);
  if (therapistLogin.success) {
    therapistToken = therapistLogin.data.token || therapistLogin.data.accessToken;
    testTherapistId = therapistLogin.data.user?.id;
    if (!therapistToken) {
      console.log(colors.yellow('⚠️  Therapist token not found in response'));
    }
  }

  // Test client login
  const clientLogin = await apiRequest('POST', '/auth/login', {
    email: testUsers.client.email,
    password: testUsers.client.password
  });
  logTestResult('Client login', clientLogin);
  if (clientLogin.success) {
    clientToken = clientLogin.data.token || clientLogin.data.accessToken;
    testClientId = clientLogin.data.user?.id;
    if (!clientToken) {
      console.log(colors.yellow('⚠️  Client token not found in response'));
    }
  }

  // Test token refresh
  if (clientToken) {
    const refreshToken = await apiRequest('POST', '/auth/refresh', {}, clientToken);
    logTestResult('Token refresh', refreshToken);
  }
}

async function testProfileManagement() {
  console.log(`\n${colors.cyan(colors.bold('👤 Testing Profile Management Endpoints'))}`);
  
  // Get current user profile
  const getProfile = await apiRequest('GET', '/auth/me', null, clientToken);
  logTestResult('Get current user profile', getProfile);
  
  // Get all users as admin
  const getUsers = await apiRequest('GET', '/admin/users?page=1&limit=10', null, adminToken);
  logTestResult('Get all users', getUsers, `Found ${getUsers.data?.data?.users?.length || 0} users`);
  
  if (getUsers.success && getUsers.data.data.users.length > 0) {
    testUserId = getUsers.data.data.users[0].id;
  }

  // Get user by ID
  if (testUserId) {
    const getUserById = await apiRequest('GET', `/admin/users/${testUserId}`, null, adminToken);
    logTestResult('Get user by ID', getUserById);
  }

  // Edit user profile
  if (testUserId) {
    const editProfile = await apiRequest('PUT', `/admin/users/${testUserId}`, {
      firstName: 'Test',
      lastName: 'Updated',
      phone: '+31612345678'
    }, adminToken);
    logTestResult('Edit user profile', editProfile);
  }

  // Test therapist specializations
  if (testTherapistId) {
    const updateSpecializations = await apiRequest('PUT', `/admin/therapists/${testTherapistId}/specializations`, {
      specializations: ['anxiety', 'depression', 'trauma', 'relationship_issues']
    }, adminToken);
    logTestResult('Update therapist specializations', updateSpecializations);
  }

  // Get therapist profile
  if (testTherapistId) {
    const getTherapistProfile = await apiRequest('GET', `/therapists/${testTherapistId}`, null, clientToken);
    logTestResult('Get therapist profile', getTherapistProfile);
  }

  // Test address change requests
  const getAddressRequests = await apiRequest('GET', '/admin/address-change-requests', null, adminToken);
  logTestResult('Get address change requests', getAddressRequests);

  // Create address change request
  const createAddressRequest = await apiRequest('POST', '/client/address-change-request', {
    type: 'address',
    newValue: 'Test Street 123, Amsterdam, 1234AB',
    reason: 'Moving to new location'
  }, clientToken);
  logTestResult('Create address change request', createAddressRequest);
}

async function testAppointmentSystem() {
  console.log(`\n${colors.cyan(colors.bold('📅 Testing Appointment System'))}`);
  
  // Create appointment request as client
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointmentRequest = await apiRequest('POST', '/client/appointment-request', {
    preferredDate: tomorrow.toISOString().split('T')[0],
    preferredTime: '14:00',
    problemDescription: 'Test appointment for anxiety management',
    urgency: 'normal',
    preferredTherapistId: testTherapistId
  }, clientToken);
  logTestResult('Create appointment request', appointmentRequest);

  // Get unassigned appointment requests as admin
  const unassignedRequests = await apiRequest('GET', '/admin/appointment-requests', null, adminToken);
  logTestResult('Get unassigned appointment requests', unassignedRequests, 
    `Found ${unassignedRequests.data?.data?.requests?.length || 0} unassigned requests`);

  // Assign appointment request if any exist
  if (unassignedRequests.success && unassignedRequests.data?.data?.requests?.length > 0 && testTherapistId) {
    const requestId = unassignedRequests.data.data.requests[0].id;
    const assignRequest = await apiRequest('PUT', `/admin/appointment-requests/${requestId}/assign`, {
      therapistId: testTherapistId
    }, adminToken);
    logTestResult('Assign appointment request to therapist', assignRequest);
  }

  // Get therapist availability
  if (testTherapistId) {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const availability = await apiRequest('GET', 
      `/client/therapists/${testTherapistId}/availability?startDate=${startDate}&endDate=${endDate}`, 
      null, clientToken);
    logTestResult('Get therapist availability', availability);
  }

  // Create appointment directly as therapist
  // Try to find an available time slot first
  let createAppointment = null;
  
  // Try different days and time slots to avoid conflicts
  const daysToTry = [7, 8, 9, 10, 14, 21]; // Try different days
  const timeSlots = [
    { startTime: '09:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '17:00' }
  ];
  
  outerLoop: for (const daysAhead of daysToTry) {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + daysAhead);
    
    for (const slot of timeSlots) {
      createAppointment = await apiRequest('POST', '/therapist/appointments', {
        clientId: testClientId,
        appointmentDate: appointmentDate.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        therapyType: 'individual',
        location: 'office',
        notes: 'Regular therapy session'
      }, therapistToken);
      
      if (createAppointment.success) {
        logTestResult('Create appointment', createAppointment, `Created on day +${daysAhead} at ${slot.startTime}`);
        testAppointmentId = createAppointment.data.data.id;
        break outerLoop;
      } else if (createAppointment.status !== 409) {
        // If it's not a time conflict, log the error and stop trying
        logTestResult('Create appointment', createAppointment);
        break outerLoop;
      }
    }
  }
  
  // If all slots failed due to conflicts
  if (!createAppointment || (!createAppointment.success && createAppointment.status === 409)) {
    logTestResult('Create appointment', createAppointment || { success: false, status: 409 }, 'All time slots conflicted');
  }

  // Get appointments
  const getAppointments = await apiRequest('GET', '/appointments', null, therapistToken);
  logTestResult('Get appointments', getAppointments, 
    `Found ${getAppointments.data?.data?.length || 0} appointments`);

  // Test calendar view
  const calendarView = await apiRequest('GET', 
    `/appointments/calendar?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&view=month`, 
    null, therapistToken);
  logTestResult('Get calendar view', calendarView);

  // Test available slots
  if (testTherapistId) {
    const availableSlots = await apiRequest('GET', 
      `/appointments/available-slots?therapistId=${testTherapistId}&date=${tomorrow.toISOString().split('T')[0]}`, 
      null, adminToken);
    logTestResult('Get available slots', availableSlots);
  }

  // Update appointment
  if (testAppointmentId) {
    const updateAppointment = await apiRequest('PUT', `/appointments/${testAppointmentId}`, {
      status: 'confirmed',
      notes: 'Updated appointment notes'
    }, therapistToken);
    logTestResult('Update appointment', updateAppointment);
  }
}

async function testSessionManagement() {
  console.log(`\n${colors.cyan(colors.bold('🏥 Testing Session Management'))}`);
  
  // Get appointments first to find one we can start a session for
  const appointments = await apiRequest('GET', '/appointments', null, therapistToken);
  if (appointments.success && appointments.data.data.length > 0) {
    // Find an appointment that hasn't been used for a session yet
    for (const apt of appointments.data.data) {
      if (apt.status === 'confirmed' && !apt.sessionId) {
        testAppointmentId = apt.id;
        break;
      }
    }
  }

  // Start session
  if (testAppointmentId) {
    const startSession = await apiRequest('POST', '/sessions/start', {
      appointmentId: testAppointmentId,
      clientPresent: true,
      location: 'office',
      initialNotes: 'Client arrived on time, appears anxious'
    }, therapistToken);
    logTestResult('Start session', startSession);
    
    if (startSession.success) {
      testSessionId = startSession.data.data.id;
    }
  }

  // Add session progress notes
  if (testSessionId) {
    const sessionProgress = await apiRequest('POST', `/sessions/${testSessionId}/progress`, {
      progressNotes: 'Client showed good progress in managing anxiety triggers',
      goalsDiscussed: 'Breathing techniques, identifying anxiety patterns',
      clientMoodStart: 5,
      clientMoodEnd: 7,
      techniquesUsed: ['CBT', 'Mindfulness']
    }, therapistToken);
    logTestResult('Add session progress', sessionProgress);
  }

  // End session
  if (testSessionId) {
    const endSession = await apiRequest('POST', `/sessions/${testSessionId}/end`, {
      summary: 'Productive session focusing on anxiety management techniques',
      homework: 'Practice breathing exercises daily',
      nextSessionGoals: 'Review progress with techniques, introduce exposure therapy',
      clientMoodEnd: 7
    }, therapistToken);
    logTestResult('End session', endSession);
  }

  // Get session history
  const sessionHistory = await apiRequest('GET', '/sessions', null, therapistToken);
  logTestResult('Get session history', sessionHistory, 
    `Found ${sessionHistory.data?.data?.sessions?.length || 0} sessions`);

  // Get session statistics
  const sessionStats = await apiRequest('GET', '/sessions/statistics', null, therapistToken);
  logTestResult('Get session statistics', sessionStats);

  // Get client session history (correct endpoint)
  const clientSessions = await apiRequest('GET', '/client/sessions', null, clientToken);
  logTestResult('Get client session history', clientSessions);
}

async function testNotificationSystem() {
  console.log(`\n${colors.cyan(colors.bold('🔔 Testing Notification System'))}`);
  
  // Get notifications
  const notifications = await apiRequest('GET', '/notifications', null, clientToken);
  logTestResult('Get notifications', notifications, 
    `Found ${notifications.data?.data?.notifications?.length || 0} notifications`);

  // Get unread count
  const unreadCount = await apiRequest('GET', '/notifications/unread-count', null, clientToken);
  logTestResult('Get unread notification count', unreadCount);

  // Mark notification as read
  if (notifications.success && notifications.data.data.notifications.length > 0) {
    const notificationId = notifications.data.data.notifications[0].id;
    const markRead = await apiRequest('PUT', `/notifications/${notificationId}/read`, null, clientToken);
    logTestResult('Mark notification as read', markRead);
  }

  // Mark all as read
  const markAllRead = await apiRequest('PUT', '/notifications/mark-all-read', null, clientToken);
  logTestResult('Mark all notifications as read', markAllRead);

  // Test notification preferences
  const getPreferences = await apiRequest('GET', '/notifications/preferences', null, clientToken);
  logTestResult('Get notification preferences', getPreferences);

  // Update notification preferences
  const updatePreferences = await apiRequest('PUT', '/notifications/preferences', {
    email_notifications: true,
    push_notifications: false,
    appointment_reminders: true,
    session_reminders: true,
    treatment_updates: true,
    newsletter_subscription: false
  }, clientToken);
  logTestResult('Update notification preferences', updatePreferences);
}

async function testResourceManagement() {
  console.log(`\n${colors.cyan(colors.bold('📚 Testing Resource Management'))}`);
  
  // Create resource as admin
  const createResource = await apiRequest('POST', '/resources', {
    title: 'Understanding Anxiety: A Comprehensive Guide',
    description: 'Learn about anxiety, its causes, and effective management strategies',
    type: 'article',
    category: 'anxiety',
    contentBody: `
      # Understanding Anxiety
      
      Anxiety is a natural response to stress, but when it becomes overwhelming...
      
      ## Common Symptoms
      - Racing heart
      - Sweating
      - Difficulty concentrating
      
      ## Management Techniques
      1. Deep breathing exercises
      2. Progressive muscle relaxation
      3. Mindfulness meditation
    `,
    tags: ['anxiety', 'mental-health', 'self-help'],
    isPublic: true
  }, adminToken);
  logTestResult('Create resource', createResource);
  
  if (createResource.success) {
    testResourceId = createResource.data.data.id;
  }

  // Get resources
  const getResources = await apiRequest('GET', '/resources?category=anxiety', null, clientToken);
  logTestResult('Get resources', getResources, 
    `Found ${getResources.data?.data?.resources?.length || 0} resources`);

  // Get resource by ID
  if (testResourceId) {
    const getResourceById = await apiRequest('GET', `/resources/${testResourceId}`, null, clientToken);
    logTestResult('Get resource by ID', getResourceById);
  }

  // Assign resource to client
  if (testResourceId && testClientId) {
    const assignResource = await apiRequest('POST', `/resources/${testResourceId}/assign`, {
      clientId: testClientId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Please read this before our next session'
    }, therapistToken);
    logTestResult('Assign resource to client', assignResource);
  }

  // Get assigned resources as client (correct endpoint)
  const assignedResources = await apiRequest('GET', '/client/resources', null, clientToken);
  logTestResult('Get assigned resources', assignedResources);

  // Track resource engagement
  if (testResourceId) {
    const trackEngagement = await apiRequest('POST', `/resources/${testResourceId}/engagement`, {
      action: 'view',
      timeSpent: 300,
      completed: false
    }, clientToken);
    logTestResult('Track resource engagement (view)', trackEngagement);

    // Mark as completed
    const completeResource = await apiRequest('POST', `/resources/${testResourceId}/engagement`, {
      action: 'complete',
      timeSpent: 900,
      completed: true,
      feedback: 'Very helpful resource'
    }, clientToken);
    logTestResult('Track resource engagement (complete)', completeResource);
  }

  // Get resource analytics
  if (testResourceId) {
    const resourceAnalytics = await apiRequest('GET', `/resources/${testResourceId}/analytics`, null, therapistToken);
    logTestResult('Get resource analytics', resourceAnalytics);
  }
}

async function testSurveySystem() {
  console.log(`\n${colors.cyan(colors.bold('📋 Testing Survey System'))}`);
  
  // Create survey as therapist
  const createSurvey = await apiRequest('POST', '/surveys', {
    title: 'Weekly Mental Health Check-in',
    description: 'A comprehensive assessment of your mental health this week',
    type: 'assessment',
    isTemplate: true,
    questions: [
      {
        id: 'q1',
        text: 'How would you rate your overall mood this week?',
        type: 'scale',
        required: true,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        scaleLabels: {
          min: 'Very Poor',
          max: 'Excellent'
        }
      },
      {
        id: 'q2',
        text: 'Which of the following emotions did you experience most frequently?',
        type: 'multipleChoice',
        required: true,
        options: ['Happy', 'Anxious', 'Sad', 'Angry', 'Calm', 'Excited', 'Frustrated']
      },
      {
        id: 'q3',
        text: 'What challenges did you face this week?',
        type: 'text',
        required: false,
        maxLength: 500
      },
      {
        id: 'q4',
        text: 'How many days did you practice the recommended coping strategies?',
        type: 'number',
        required: true,
        min: 0,
        max: 7
      }
    ]
  }, therapistToken);
  logTestResult('Create survey', createSurvey);
  
  if (createSurvey.success) {
    testSurveyId = createSurvey.data.data.id;
  }

  // Get survey templates
  const getSurveyTemplates = await apiRequest('GET', '/surveys/templates', null, therapistToken);
  logTestResult('Get survey templates', getSurveyTemplates);

  // Assign survey to client
  if (testSurveyId && testClientId) {
    const assignSurvey = await apiRequest('POST', `/surveys/${testSurveyId}/assign`, {
      clientId: testClientId,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      recurring: true,
      recurrencePattern: 'weekly'
    }, therapistToken);
    logTestResult('Assign survey to client', assignSurvey);
  }

  // Get assigned surveys as client (using working endpoint)
  const assignedSurveys = await apiRequest('GET', '/surveys', null, clientToken);
  logTestResult('Get assigned surveys', assignedSurveys);

  // Submit survey response (using working endpoint)
  if (testSurveyId) {
    const submitResponse = await apiRequest('POST', `/surveys/${testSurveyId}/respond`, {
      responses: {
        q1: '7',
        q2: 'Calm',
        q3: 'Had some work-related stress but managed it well',
        q4: 5
      }
    }, clientToken);
    logTestResult('Submit survey response', submitResponse);
  }

  // Get survey responses as therapist
  if (testSurveyId) {
    const getSurveyResponses = await apiRequest('GET', `/surveys/${testSurveyId}/responses`, null, therapistToken);
    logTestResult('Get survey responses', getSurveyResponses);
  }

  // Get survey analytics
  if (testSurveyId) {
    const surveyAnalytics = await apiRequest('GET', `/surveys/${testSurveyId}/analytics`, null, therapistToken);
    logTestResult('Get survey analytics', surveyAnalytics);
  }
}

async function testChallengeSystem() {
  console.log(`\n${colors.cyan(colors.bold('🎯 Testing Challenge System'))}`);
  
  // Create challenge as therapist
  const createChallenge = await apiRequest('POST', '/challenges', {
    title: 'Daily Mindfulness Practice',
    description: 'Practice mindfulness meditation for better anxiety management',
    category: 'mindfulness',
    difficulty: 'beginner',
    durationMinutes: 15,
    duration: 30, // 30 days
    targetValue: 450, // 450 minutes total
    targetUnit: 'minutes',
    instructions: [
      'Find a quiet, comfortable place',
      'Sit with your back straight',
      'Focus on your breath for 15 minutes',
      'Gently return focus when mind wanders',
      'End with 3 deep breaths'
    ],
    benefits: [
      'Reduced anxiety',
      'Better focus',
      'Improved emotional regulation'
    ],
    tips: [
      'Same time each day helps build habit',
      'Use a meditation app if helpful',
      'Start with just 5 minutes if 15 feels too long'
    ]
  }, therapistToken);
  logTestResult('Create challenge', createChallenge);
  
  if (createChallenge.success) {
    testChallengeId = createChallenge.data.data.id;
  }

  // Get available challenges
  const getAvailableChallenges = await apiRequest('GET', '/challenges?category=mindfulness', null, therapistToken);
  logTestResult('Get available challenges', getAvailableChallenges);

  // Assign challenge to client
  if (testChallengeId && testClientId) {
    const assignChallenge = await apiRequest('POST', `/challenges/${testChallengeId}/assign`, {
      clientId: testClientId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'daily',
      customInstructions: 'Try to do this in the morning before starting your day'
    }, therapistToken);
    logTestResult('Assign challenge to client', assignChallenge);
  }

  // Get client challenges
  const clientChallenges = await apiRequest('GET', '/client/challenges', null, clientToken);
  logTestResult('Get client challenges', clientChallenges);

  // Start challenge check-in
  let checkInId = null;
  if (testChallengeId) {
    const startCheckIn = await apiRequest('POST', `/client/challenges/${testChallengeId}/check-in`, {
      moodBefore: 5,
      anxietyBefore: 7
    }, clientToken);
    logTestResult('Start challenge check-in', startCheckIn);
    
    if (startCheckIn.success && startCheckIn.data?.data?.checkInId) {
      checkInId = startCheckIn.data.data.checkInId;
      
      // Complete challenge check-in
      const completeCheckIn = await apiRequest('PUT', `/client/challenges/${testChallengeId}/check-in/complete`, {
        checkInId: checkInId,
        moodAfter: 7,
        anxietyAfter: 4,
        duration: 15,
        notes: 'Felt much calmer after the session',
        difficulty: 'easy',
        completed: true
      }, clientToken);
      logTestResult('Complete challenge check-in', completeCheckIn);
    }
  }

  // Get challenge progress
  if (testChallengeId) {
    const challengeProgress = await apiRequest('GET', `/client/challenges/${testChallengeId}/progress`, null, clientToken);
    logTestResult('Get challenge progress', challengeProgress);
  }

  // Get challenge analytics as therapist
  if (testChallengeId) {
    const challengeAnalytics = await apiRequest('GET', `/challenges/${testChallengeId}/analytics?clientId=${testClientId}`, null, therapistToken);
    logTestResult('Get challenge analytics', challengeAnalytics);
  }

  // Test challenges with filters (working endpoint)
  const challengesWithFilters = await apiRequest('GET', '/challenges?category=relaxation&difficulty=easy', null, clientToken);
  logTestResult('Get challenges with filters', challengesWithFilters);
}

async function testSmartPairing() {
  console.log(`\n${colors.cyan(colors.bold('🤖 Testing Smart Pairing System'))}`);
  
  // Get therapist recommendations for client
  if (testClientId) {
    const recommendations = await apiRequest('GET', 
      `/admin/smart-pairing/recommendations?clientId=${testClientId}&problemCategory=anxiety&includeScores=true`, 
      null, adminToken);
    logTestResult('Get therapist recommendations', recommendations, 
      `Found ${recommendations.data?.data?.recommendations?.length || 0} recommendations`);
  }

  // Test pairing with specific criteria
  const criteriaRecommendations = await apiRequest('POST', '/admin/smart-pairing/recommend', {
    clientId: testClientId,
    criteria: {
      problemCategories: ['anxiety', 'depression'],
      preferredGender: 'any',
      preferredLanguages: ['English', 'Dutch'],
      maxDistance: 50,
      insuranceAccepted: true
    }
  }, adminToken);
  logTestResult('Get recommendations with specific criteria', criteriaRecommendations);

  // Get pairing analytics
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  const analytics = await apiRequest('GET', 
    `/admin/smart-pairing/analytics?startDate=${startDate}&endDate=${endDate}`, 
    null, adminToken);
  logTestResult('Get pairing analytics', analytics);

  // Test pairing score calculation
  if (testClientId && testTherapistId) {
    const pairingScore = await apiRequest('GET', 
      `/admin/smart-pairing/score?clientId=${testClientId}&therapistId=${testTherapistId}`, 
      null, adminToken);
    logTestResult('Calculate pairing score', pairingScore);
  }
}

async function testAdditionalEndpoints() {
  console.log(`\n${colors.cyan(colors.bold('🔧 Testing Additional Endpoints'))}`);
  
  // Test health check (no /api prefix)
  const healthCheckConfig = {
    method: 'GET',
    url: 'https://praktijk-epd-backend-production.up.railway.app/health',
    timeout: TEST_TIMEOUT
  };
  try {
    const response = await axios(healthCheckConfig);
    logTestResult('Health check', { success: true, data: response.data, status: response.status });
  } catch (error) {
    logTestResult('Health check', { success: false, error: error.response?.data || error.message, status: error.response?.status || 0 });
  }

  // Test database schema check
  const schemaCheck = await apiRequest('GET', '/test/check-schema?token=final-fix-2025-temp', null, null);
  logTestResult('Database schema check', schemaCheck);

  // Test statistics endpoints
  const globalStats = await apiRequest('GET', '/admin/statistics/global', null, adminToken);
  logTestResult('Get global statistics', globalStats);

  // Test search functionality
  const searchUsers = await apiRequest('GET', '/admin/users/search?query=test', null, adminToken);
  logTestResult('Search users', searchUsers);

  // Test export functionality
  const exportData = await apiRequest('GET', '/admin/export/users?format=csv', null, adminToken);
  logTestResult('Export users data', exportData);

  // Test audit logs
  const auditLogs = await apiRequest('GET', '/admin/audit-logs?limit=10', null, adminToken);
  logTestResult('Get audit logs', auditLogs);
}

async function testEnhancedFeatures() {
  console.log(`\n${colors.cyan(colors.bold('✨ Testing Enhanced Features'))}`);
  
  // Test enhanced client registration with auto-assignment
  const registerClient = await apiRequest('POST', '/auth/register-client', {
    email: 'newclient' + Date.now() + '@test.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'Client',
    phone: '+31612345678',
    preferredCity: 'Amsterdam',
    appointmentRequest: {
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preferredTime: '14:00',
      therapyType: 'individual',
      location: 'office'
    },
    problemDescription: 'Anxiety and stress management'
  }, null);
  logTestResult('Enhanced client registration', registerClient);
  
  let newClientToken = null;
  let newClientId = null;
  if (registerClient.success) {
    newClientToken = registerClient.data.data.token;
    newClientId = registerClient.data.data.user.id;
  }

  // Test intake form submission
  if (newClientToken) {
    const submitIntakeForm = await apiRequest('POST', '/client/intake-form/submit', {
      formId: '123e4567-e89b-12d3-a456-426614174000', // Placeholder form ID
      responses: {
        medicalHistory: 'No significant medical history',
        currentMedications: 'None',
        allergies: 'None',
        emergencyContact: {
          name: 'John Doe',
          phone: '+31612345679',
          relationship: 'Spouse'
        }
      }
    }, newClientToken);
    logTestResult('Submit intake form', submitIntakeForm);
  }

  // Test get all therapists
  const getAllTherapists = await apiRequest('GET', '/client/therapists', null, clientToken);
  logTestResult('Get all therapists', getAllTherapists);

  // Test book appointment with specific therapist
  if (testTherapistId) {
    const bookWithTherapist = await apiRequest('POST', '/client/appointments/book', {
      therapistId: testTherapistId,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '15:00',
      therapyType: 'individual',
      notes: 'Looking forward to the session'
    }, clientToken);
    logTestResult('Book appointment with specific therapist', bookWithTherapist);
  }

  // Test payment restrictions
  const checkBookingEligibility = await apiRequest('GET', '/payments/client/booking-eligibility', null, clientToken);
  logTestResult('Check booking eligibility', checkBookingEligibility);

  // Test get unpaid invoices
  const getUnpaidInvoices = await apiRequest('GET', '/payments/client/invoices/unpaid', null, clientToken);
  logTestResult('Get unpaid invoices', getUnpaidInvoices);

  // Test immediate payment
  if (testAppointmentId) {
    const makeImmediatePayment = await apiRequest('POST', '/payments/immediate', {
      appointmentId: testAppointmentId,
      amount: 75.00,
      paymentMethod: 'ideal'
    }, clientToken);
    logTestResult('Make immediate payment', makeImmediatePayment);
  }

  // Test challenge filters
  const getChallengesWithFilters = await apiRequest('GET', '/challenges?category=mindfulness&difficulty=beginner&participationStatus=not_started', null, clientToken);
  logTestResult('Get challenges with filters', getChallengesWithFilters);

  // Test mark client as completed (therapist)
  // First, ensure the client is assigned to the therapist
  if (testClientId && testTherapistId && adminToken) {
    // Assign client to therapist as admin
    const assignClient = await apiRequest('POST', `/admin/clients/${testClientId}/assign-therapist`, {
      therapistId: testTherapistId
    }, adminToken);
    
    let markCompleted;
    if (assignClient.success) {
      // Now mark as completed
      markCompleted = await apiRequest('POST', `/therapist/clients/${testClientId}/complete`, {
        completionReason: 'Treatment goals achieved',
        finalNotes: 'Client has made significant progress'
      }, therapistToken);
      logTestResult('Mark client as completed', markCompleted);
    } else {
      // If assignment fails, still try to mark as completed (maybe already assigned)
      markCompleted = await apiRequest('POST', `/therapist/clients/${testClientId}/complete`, {
        completionReason: 'Treatment goals achieved',
        finalNotes: 'Client has made significant progress'
      }, therapistToken);
      logTestResult('Mark client as completed', markCompleted);
    }
    
    // Test submit completion survey
    if (markCompleted && markCompleted.success && markCompleted.data?.data?.surveyId) {
      const submitCompletionSurvey = await apiRequest('POST', `/client/completion-survey/${markCompleted.data.data.surveyId}/submit`, {
        overallRating: 5,
        wouldRecommend: true,
        responses: {
          treatmentHelpful: 5,
          goalsAchieved: 4,
          therapistRating: 5,
          communicationRating: 5
        },
        additionalFeedback: 'Excellent therapy experience, highly recommend!'
      }, clientToken);
      logTestResult('Submit completion survey', submitCompletionSurvey);
    }
  }

  // Test deactivate user (instead of delete)
  // Skip this test as it uses a placeholder ID
  // const testDeactivateUserId = '123e4567-e89b-12d3-a456-426614174999'; // Placeholder ID
  // const deactivateUser = await apiRequest('POST', `/users/${testDeactivateUserId}/deactivate`, null, adminToken);
  // logTestResult('Deactivate user account', deactivateUser);
}

// Main test runner
async function runAllTests() {
  startTime = Date.now();
  
  console.log(colors.yellow(colors.bold('🚀 Starting PraktijkEPD Backend API Tests')));
  console.log(colors.gray(`📍 API Base URL: ${API_BASE_URL}`));
  console.log(colors.gray('═'.repeat(50)));

  try {
    await testAuthentication();
    
    if (!adminToken || !therapistToken) {
      console.log(colors.red(colors.bold('\n❌ Critical authentication failed. Cannot proceed with tests.')));
      saveResults();
      return;
    }
    
    if (!clientToken) {
      console.log(colors.yellow('\n⚠️  Client authentication failed - will skip client-specific tests'));
    }

    await testProfileManagement();
    await testAppointmentSystem();
    await testSessionManagement();
    await testNotificationSystem();
    await testResourceManagement();
    await testSurveySystem();
    await testChallengeSystem();
    await testSmartPairing();
    await testAdditionalEndpoints();
    await testEnhancedFeatures();

    console.log(colors.green(colors.bold('\n✨ All tests completed!')));
    console.log(colors.gray('═'.repeat(50)));
    
  } catch (error) {
    console.error(colors.red(colors.bold('\n💥 Test runner error:')), error);
  } finally {
    saveResults();
  }
}

// Run tests
console.log(colors.gray('Starting test execution...\n'));
runAllTests();