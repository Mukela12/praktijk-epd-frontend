#!/usr/bin/env node

/**
 * Comprehensive Backend Test Suite for PraktijkEPD - Updated Version
 * 
 * This test demonstrates the complete flow of all endpoints organized by user role.
 * It tests both role-specific and shared endpoints across all user types.
 * 
 * User Roles:
 * - Admin: Full system management and oversight
 * - Therapist: Client sessions and therapy management
 * - Client: Personal portal and appointment management
 * - Assistant: Administrative support and coordination
 * - Bookkeeper: Financial management and reporting
 * 
 * New Features:
 * - Resources: Educational content management and assignment
 * - Challenges: Goal-based activities and progress tracking
 * - Surveys: Assessment and feedback collection
 * 
 * Test Flow:
 * 1. System health check
 * 2. Authentication flow for each role
 * 3. Role-specific endpoint testing
 * 4. Cross-role interactions
 * 5. Shared endpoints testing
 * 6. New features testing (Resources, Challenges, Surveys)
 * 7. Error handling and edge cases
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_DELAY = 50; // Small delay between requests to prevent rate limiting

// Test users from database
const TEST_USERS = {
    admin: {
        email: 'admin@praktijkepd.nl',
        password: 'Admin123!@#',
        role: 'admin'
    },
    therapist: {
        email: 'emma.dejong@example.com',
        password: 'TherapistPass123!',
        role: 'therapist'
    },
    client: {
        email: 'client@example.com',
        password: 'ClientPass123!',
        role: 'client'
    },
    assistant: {
        email: 'sophie.williams@example.com',
        password: 'AssistantPass123!',
        role: 'assistant'
    },
    bookkeeper: {
        email: 'lucas.martin@example.com',
        password: 'BookkeeperPass123!',
        role: 'bookkeeper'
    },
    substitute: {
        email: 'olivia.janssen@example.com',
        password: 'SubstitutePass123!',
        role: 'substitute'
    }
};

// Store tokens and user data
const authTokens = {};
const refreshTokens = {};
const userData = {};
const testResults = {
    total: 0,
    successful: 0,
    failed: 0,
    byRole: {},
    byEndpoint: [],
    startTime: new Date(),
    endTime: null
};

// Store created resource IDs for later use
const createdResources = {
    resourceId: null,
    challengeId: null,
    surveyId: null,
    addressChangeRequestId: null
};

// Store successful test data
const testData = {
    createdByAdmin: {
        resourceIds: [],
        challengeIds: [],
        surveyIds: []
    },
    createdByTherapist: {
        resourceIds: [],
        challengeIds: [],
        surveyIds: []
    },
    assignments: {
        resourceAssignments: [],
        challengeAssignments: [],
        surveyAssignments: []
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(80));
    log(title, 'bright');
    console.log('='.repeat(80));
}

function logSubSection(title) {
    console.log('\n' + '-'.repeat(60));
    log(title, 'cyan');
    console.log('-'.repeat(60));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, path, data = null, token = null, role = 'unknown') {
    try {
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

        const response = await axios(config);
        
        testResults.total++;
        testResults.successful++;
        testResults.byEndpoint.push({
            role,
            method,
            path,
            status: response.status,
            success: true,
            timestamp: new Date()
        });
        
        log(`✓ ${method} ${path} - Status: ${response.status}`, 'green');
        
        if (response.data) {
            // Store resource/challenge/survey IDs for later use
            if (path.includes('/resources') && method === 'POST' && response.data.data?.id) {
                createdResources.resourceId = response.data.data.id;
                if (role === 'admin') {
                    testData.createdByAdmin.resourceIds.push(response.data.data.id);
                } else if (role === 'therapist') {
                    testData.createdByTherapist.resourceIds.push(response.data.data.id);
                }
            }
            if (path.includes('/challenges') && method === 'POST' && response.data.data?.id) {
                createdResources.challengeId = response.data.data.id;
                if (role === 'admin') {
                    testData.createdByAdmin.challengeIds.push(response.data.data.id);
                } else if (role === 'therapist') {
                    testData.createdByTherapist.challengeIds.push(response.data.data.id);
                }
            }
            if (path.includes('/surveys') && method === 'POST' && response.data.data?.id) {
                createdResources.surveyId = response.data.data.id;
                if (role === 'admin') {
                    testData.createdByAdmin.surveyIds.push(response.data.data.id);
                } else if (role === 'therapist') {
                    testData.createdByTherapist.surveyIds.push(response.data.data.id);
                }
            }
            if (path.includes('/address-change') && method === 'POST' && response.data.data?.id) {
                createdResources.addressChangeRequestId = response.data.data.id;
            }
            
            console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        }
        
        await delay(TEST_DELAY);
        return response.data;
        
    } catch (error) {
        testResults.total++;
        testResults.failed++;
        
        const status = error.response?.status || 'ERR';
        const message = error.response?.data?.message || error.message;
        
        testResults.byEndpoint.push({
            role,
            method,
            path,
            status,
            success: false,
            error: message,
            timestamp: new Date()
        });
        
        if (status === 501) {
            log(`→ ${method} ${path} - Status: ${status} (Not Implemented)`, 'yellow');
        } else {
            log(`✗ ${method} ${path} - Status: ${status} - ${message}`, 'red');
        }
        
        await delay(TEST_DELAY);
        throw error;
    }
}

async function authenticateAllUsers() {
    logSection('AUTHENTICATING ALL USERS');
    
    for (const [role, user] of Object.entries(TEST_USERS)) {
        logSubSection(`Authenticating ${role}`);
        try {
            const response = await makeRequest('POST', '/api/auth/login', {
                email: user.email,
                password: user.password
            }, null, role);
            
            if (response?.accessToken) {
                authTokens[role] = response.accessToken;
                refreshTokens[role] = response.refreshToken;
                userData[role] = response.user;
                log(`✓ ${role} authenticated successfully`, 'green');
            }
        } catch (error) {
            log(`✗ Failed to authenticate ${role}`, 'red');
        }
    }
}

async function testAdminEndpoints() {
    logSection('ADMIN ENDPOINTS TEST');
    
    if (!authTokens.admin) {
        log('Admin not authenticated, skipping admin tests', 'yellow');
        return;
    }
    
    const endpoints = [
        // Dashboard and Overview
        { method: 'GET', path: '/api/admin/dashboard', description: 'Admin Dashboard' },
        
        // User Management
        { method: 'GET', path: '/api/admin/users', description: 'Get All Users' },
        { method: 'GET', path: '/api/admin/users?page=1&limit=10', description: 'Get Users with Pagination' },
        { method: 'GET', path: '/api/admin/users?role=client&status=active', description: 'Get Filtered Users' },
        { method: 'GET', path: '/api/admin/users?search=emma', description: 'Search Users' },
        
        // Client Management
        { method: 'GET', path: '/api/admin/clients', description: 'Get All Clients' },
        { method: 'GET', path: '/api/admin/clients?status=active', description: 'Get Active Clients' },
        
        // Therapist Management
        { method: 'GET', path: '/api/admin/therapists', description: 'Get All Therapists' },
        
        // Waiting List Management
        { method: 'GET', path: '/api/admin/waiting-list', description: 'Get Waiting List' },
        { method: 'GET', path: '/api/admin/waiting-list?urgency=high', description: 'Get High Priority Waiting List' },
        
        // Financial Overview
        { method: 'GET', path: '/api/admin/financial/overview', description: 'Financial Overview' },
        
        // Address Change Requests (NEW)
        { method: 'GET', path: '/api/admin/address-change-requests', description: 'Get Address Change Requests' },
        { method: 'GET', path: '/api/admin/address-change-requests?status=pending', description: 'Get Pending Address Changes' },
        
        // User Role Management (if we have a client ID)
        { method: 'POST', path: '/api/admin/users', description: 'Create New User', data: {
            email: `test.user.${Date.now()}@example.com`,
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'client',
            phone: '+31612345678'
        }},
        
        // Analytics & Reports
        { method: 'GET', path: '/api/admin/reports', description: 'Get Admin Reports' },
        { method: 'GET', path: '/api/admin/reports?reportType=therapist_performance', description: 'Get Therapist Performance Report' },
        { method: 'GET', path: '/api/admin/reports?reportType=revenue_breakdown', description: 'Get Revenue Report' },
        
        // Resources, Challenges, Surveys (Admin endpoints)
        { method: 'GET', path: '/api/resources?role=admin', description: 'Get All Resources (Admin)' },
        { method: 'GET', path: '/api/challenges?role=admin', description: 'Get All Challenges (Admin)' },
        { method: 'GET', path: '/api/surveys?role=admin', description: 'Get All Surveys (Admin)' },
        
        // System Health & Backup
        { method: 'GET', path: '/api/admin/health', description: 'System Health Check' },
        { method: 'POST', path: '/api/admin/backup', description: 'Create System Backup' },
        { method: 'POST', path: '/api/admin/import-data', description: 'Import Data', data: {
            dataType: 'users',
            data: [{
                email: 'imported@example.com',
                firstName: 'Imported',
                lastName: 'User',
                role: 'client'
            }],
            options: {
                skipExisting: true,
                validateOnly: false
            }
        }},
        
        // Security & Audit
        { method: 'GET', path: '/api/admin/audit-logs', description: 'Get Audit Logs' },
        { method: 'GET', path: '/api/admin/audit-logs?eventType=login', description: 'Get Login Logs' },
        
        // Scheduling Endpoints
        { method: 'GET', path: '/api/admin/appointments', description: 'Get All Appointments' },
        { method: 'GET', path: '/api/admin/appointments?status=scheduled', description: 'Get Scheduled Appointments' },
        { method: 'GET', path: `/api/admin/appointments?therapistId=${userData.therapist?.id || 'test-id'}`, description: 'Get Therapist Appointments' },
        { method: 'GET', path: `/api/admin/appointments?clientId=${userData.client?.id || 'test-id'}`, description: 'Get Client Appointments' },
        
        // Not Implemented Endpoints (expecting 501)
        { method: 'GET', path: '/api/admin/reports/users', description: 'User Reports (501)' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                authTokens.admin,
                'admin'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testTherapistEndpoints() {
    logSection('THERAPIST ENDPOINTS TEST');
    
    if (!authTokens.therapist) {
        log('Therapist not authenticated, skipping therapist tests', 'yellow');
        return;
    }
    
    const endpoints = [
        // Dashboard and Profile
        { method: 'GET', path: '/api/therapist/dashboard', description: 'Therapist Dashboard' },
        { method: 'GET', path: '/api/therapist/profile', description: 'Get Profile' },
        
        // Client Management
        { method: 'GET', path: '/api/therapist/clients', description: 'Get Assigned Clients' },
        { method: 'GET', path: '/api/therapist/clients?status=active', description: 'Get Active Clients' },
        
        // Appointment Management
        { method: 'GET', path: '/api/therapist/appointments', description: 'Get Appointments' },
        { method: 'GET', path: '/api/therapist/appointments?date=2025-08-08', description: 'Get Today\'s Appointments' },
        
        // Profile Update
        { method: 'PUT', path: '/api/therapist/profile', description: 'Update Profile', data: {
            bio: 'Updated bio for testing',
            specializations: ['Anxiety', 'Depression', 'CBT'],
            maxClientsPerDay: 8
        }},
        
        // Create Appointment
        { method: 'POST', path: '/api/therapist/appointments', description: 'Create Appointment', data: {
            clientId: userData.client?.id || 'c3d12345-6789-0123-4567-890123456789',
            appointmentDate: '2025-09-15',
            startTime: '16:00',
            endTime: '17:00',
            therapyType: 'counseling',
            location: 'office',
            notes: 'Initial consultation'
        }},
        
        // Documents
        { method: 'GET', path: '/api/therapist/documents', description: 'Get Therapist Documents' },
        { method: 'POST', path: '/api/therapist/documents', description: 'Upload Document', data: {
            filename: 'session-notes.pdf',
            originalName: 'Session Notes.pdf',
            fileType: 'application/pdf',
            fileSize: 512000,
            mimeType: 'application/pdf',
            category: 'clinical',
            description: 'Session notes for client',
            tags: ['session', 'notes']
        }},
        
        // Messages
        { method: 'POST', path: '/api/therapist/messages', description: 'Send Message to Client', data: {
            recipientId: userData.client?.id || 'test-client-id',
            subject: 'Session Reminder',
            content: 'This is a reminder about our upcoming session'
        }},
        
        // Statistics & Analytics
        { method: 'GET', path: '/api/therapist/statistics', description: 'Get Therapist Statistics' },
        
        // Client Progress
        { method: 'GET', path: `/api/therapist/clients/${userData.client?.id || 'test-id'}/progress`, description: 'Get Client Progress' },
        
        // AI Insights
        { method: 'POST', path: '/api/therapist/ai/insights', description: 'Get AI Insights', data: {
            clientId: userData.client?.id || 'test-id',
            insightType: 'progress'
        }},
        
        // Scheduling Endpoints
        { method: 'GET', path: '/api/therapist/schedule', description: 'Get Schedule' },
        { method: 'GET', path: '/api/therapist/schedule?startDate=2025-08-09&endDate=2025-08-15', description: 'Get Schedule for Date Range' },
        { method: 'GET', path: '/api/therapist/appointments/today', description: 'Get Today\'s Appointments' },
        { method: 'GET', path: '/api/therapist/appointments/upcoming', description: 'Get Upcoming Appointments' },
        { method: 'GET', path: '/api/therapist/availability', description: 'Get Availability' },
        { method: 'POST', path: '/api/therapist/availability', description: 'Set Availability', data: {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true
        }}
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                authTokens.therapist,
                'therapist'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testClientEndpoints() {
    logSection('CLIENT ENDPOINTS TEST');
    
    if (!authTokens.client) {
        log('Client not authenticated, skipping client tests', 'yellow');
        return;
    }
    
    const endpoints = [
        // Dashboard and Profile
        { method: 'GET', path: '/api/client/dashboard', description: 'Client Dashboard' },
        { method: 'GET', path: '/api/client/profile', description: 'Get Profile' },
        
        // Appointments
        { method: 'GET', path: '/api/client/appointments', description: 'Get Appointments' },
        { method: 'GET', path: '/api/client/appointments?page=1&limit=5', description: 'Get Appointments with Pagination' },
        
        // Therapist Information
        { method: 'GET', path: '/api/client/therapist', description: 'Get Assigned Therapist' },
        
        // Messages
        { method: 'GET', path: '/api/client/messages', description: 'Get Messages' },
        { method: 'GET', path: '/api/client/messages?page=1&limit=10', description: 'Get Messages with Pagination' },
        
        // Preferences
        { method: 'GET', path: '/api/client/preferences', description: 'Get Preferences' },
        
        // Profile Update with Bank Account (NEW)
        { method: 'PUT', path: '/api/client/profile', description: 'Update Profile with Bank Account', data: {
            phone: '+31612345678',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '+31687654321',
            bankAccountNumber: '1234567890',
            bankAccountHolder: 'Test Client',
            bankAccountIban: 'NL91ABNA0417164300'
        }},
        
        // Address Change Request (NEW)
        { method: 'PUT', path: '/api/client/profile', description: 'Request Address Change', data: {
            streetAddress: 'New Street 123',
            postalCode: '1234AB',
            city: 'Amsterdam',
            country: 'Netherlands',
            addressChangeReason: 'Moved to new location'
        }},
        
        // Request Appointment
        { method: 'POST', path: '/api/client/appointments/request', description: 'Request Appointment', data: {
            preferredDate: '2025-08-20',
            preferredTime: '10:00',
            therapyType: 'counseling',
            urgencyLevel: 'normal',
            reason: 'Need morning appointment if possible'
        }},
        
        // Send Message
        { method: 'POST', path: '/api/client/messages', description: 'Send Message', data: {
            recipient_id: userData.therapist?.id || 'th123456-7890-1234-5678-901234567890',
            subject: 'Test Message',
            content: 'This is a test message from the client.',
            priority_level: 'normal'
        }},
        
        // Submit Intake Form
        { method: 'POST', path: '/api/client/intake-form', description: 'Submit Intake Form', data: {
            reasonForTherapy: 'Testing intake form submission',
            therapyGoals: ['Goal 1', 'Goal 2'],
            medicalHistory: 'No significant medical history',
            medications: 'None',
            previousTherapy: false,
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '+31687654321'
        }},
        
        // Document Management
        { method: 'GET', path: '/api/client/documents', description: 'Get My Documents' },
        { method: 'POST', path: '/api/client/documents', description: 'Upload Document', data: {
            filename: 'medical-report.pdf',
            originalName: 'Medical Report.pdf',
            fileType: 'application/pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            category: 'medical',
            description: 'Recent medical report',
            tags: ['medical', 'report']
        }},
        
        // Payment Methods
        { method: 'GET', path: '/api/client/payment-methods', description: 'Get Payment Methods' },
        { method: 'POST', path: '/api/client/payment-methods/sepa', description: 'Add SEPA Payment Method', data: {
            iban: 'NL91ABNA0417164300',
            accountHolder: 'Test Client',
            mandateText: 'I authorize the payments'
        }},
        
        // Invoices
        { method: 'GET', path: '/api/client/invoices', description: 'Get My Invoices' },
        { method: 'GET', path: '/api/client/invoices?status=unpaid', description: 'Get Unpaid Invoices' },
        
        // Session History
        { method: 'GET', path: '/api/client/session-history', description: 'Get Session History' },
        
        // Resources (Client endpoints)
        { method: 'GET', path: '/api/client/resources', description: 'Get Assigned Resources' },
        { method: 'POST', path: '/api/client/resources/progress', description: 'Update Resource Progress', data: {
            resourceId: createdResources.resourceId || 'test-id',
            progress: 75,
            status: 'in_progress'
        }},
        
        // Challenges (Client endpoints)
        { method: 'GET', path: '/api/challenges/client/assigned', description: 'Get My Challenges' },
        { method: 'POST', path: '/api/challenges/client/join', description: 'Join Challenge', data: {
            challengeId: createdResources.challengeId || 'test-id'
        }},
        
        // Surveys (Client endpoints)
        { method: 'GET', path: '/api/surveys/client/assigned', description: 'Get My Surveys' },
        { method: 'POST', path: '/api/surveys/client/responses', description: 'Submit Survey Response', data: {
            surveyId: createdResources.surveyId || 'test-id',
            responses: {
                q1: 7,
                q2: ['Option1', 'Option2']
            }
        }},
        
        // Data Export (GDPR)
        { method: 'GET', path: '/api/users/export-data', description: 'Export My Data' },
        
        // Not Implemented Endpoints (expecting 501)
        { method: 'GET', path: '/api/client/notes', description: 'Get Therapy Notes (501)' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                authTokens.client,
                'client'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testAssistantEndpoints() {
    logSection('ASSISTANT ENDPOINTS TEST');
    
    if (!authTokens.assistant) {
        log('Assistant not authenticated, skipping assistant tests', 'yellow');
        return;
    }
    
    const endpoints = [
        // Dashboard
        { method: 'GET', path: '/api/assistant/dashboard', description: 'Assistant Dashboard' },
        
        // Support Tickets
        { method: 'GET', path: '/api/assistant/support-tickets', description: 'Get Support Tickets' },
        { method: 'GET', path: '/api/assistant/support-tickets?status=new', description: 'Get New Tickets' },
        { method: 'GET', path: '/api/assistant/support-tickets?priority=high', description: 'Get High Priority Tickets' },
        
        // Appointments
        { method: 'GET', path: '/api/assistant/appointments', description: 'Get Appointments for Coordination' },
        
        // Waiting List
        { method: 'GET', path: '/api/assistant/waiting-list', description: 'Get Waiting List' },
        
        // Create Support Ticket
        { method: 'POST', path: '/api/assistant/support-tickets', description: 'Create Support Ticket', data: {
            clientId: userData.client?.id || 'c3d12345-6789-0123-4567-890123456789',
            issueType: 'scheduling',
            priority: 'normal',
            subject: 'Test Support Ticket',
            description: 'This is a test support ticket created by the assistant'
        }},
        
        // Send Message
        { method: 'POST', path: '/api/assistant/messages', description: 'Send Message', data: {
            recipientId: userData.client?.id || 'c3d12345-6789-0123-4567-890123456789',
            subject: 'Appointment Reminder',
            content: 'This is a test message from the assistant.',
            messageType: 'internal',
            priority: 'normal'
        }},
        
        // Update Support Ticket
        { method: 'PUT', path: '/api/assistant/support-tickets/b2c3d4e5-f6a7-8901-bcde-f12345678901', description: 'Update Support Ticket', data: {
            status: 'in_progress',
            priority: 'high',
            resolutionNotes: 'Updated by assistant'
        }},
        
        // Additional endpoints
        { method: 'GET', path: '/api/assistant/appointments/today', description: 'Get Today\'s Appointments' },
        { method: 'POST', path: '/api/assistant/appointments', description: 'Schedule Appointment', data: {
            clientId: userData.client?.id || 'test-client-id',
            therapistId: userData.therapist?.id || 'test-therapist-id',
            appointmentDate: '2025-08-25',
            startTime: '14:00',
            endTime: '15:00'
        }},
        { method: 'GET', path: '/api/assistant/clients/search?q=test', description: 'Search Clients' },
        { method: 'GET', path: '/api/assistant/therapists', description: 'Get All Therapists' },
        { method: 'POST', path: '/api/assistant/waiting-list', description: 'Add to Waiting List', data: {
            clientId: userData.client?.id || 'test-client-id',
            urgencyLevel: 'medium',
            reasonForTherapy: 'Anxiety support',
            preferredTherapist: userData.therapist?.id
        }},
        
        // Not Implemented Endpoints (expecting 501)
        { method: 'GET', path: '/api/assistant/clients', description: 'Get All Clients (501)' },
        
        // Scheduling Endpoints
        { method: 'GET', path: '/api/assistant/therapists/availability', description: 'Get Therapist Availability' },
        { method: 'GET', path: '/api/assistant/therapists/availability?date=2025-08-09', description: 'Get Therapist Availability for Date' },
        { method: 'GET', path: `/api/assistant/therapists/availability?therapistId=${userData.therapist?.id || 'test-id'}&duration=60`, description: 'Get Specific Therapist Availability' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                authTokens.assistant,
                'assistant'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testBookkeeperEndpoints() {
    logSection('BOOKKEEPER ENDPOINTS TEST');
    
    if (!authTokens.bookkeeper) {
        log('Bookkeeper not authenticated, skipping bookkeeper tests', 'yellow');
        return;
    }
    
    const endpoints = [
        // Dashboard
        { method: 'GET', path: '/api/bookkeeper/dashboard', description: 'Bookkeeper Dashboard' },
        
        // Invoices
        { method: 'GET', path: '/api/bookkeeper/invoices', description: 'Get All Invoices' },
        { method: 'GET', path: '/api/bookkeeper/invoices?status=paid', description: 'Get Paid Invoices' },
        { method: 'GET', path: '/api/bookkeeper/invoices?status=overdue', description: 'Get Overdue Invoices' },
        { method: 'GET', path: '/api/bookkeeper/invoices?clientId=' + (userData.client?.id || ''), description: 'Get Client Invoices' },
        
        // Reports
        { method: 'GET', path: '/api/bookkeeper/reports?reportType=revenue', description: 'Revenue Report' },
        { method: 'GET', path: '/api/bookkeeper/reports?reportType=outstanding', description: 'Outstanding Payments Report' },
        { method: 'GET', path: '/api/bookkeeper/reports?reportType=client_analysis', description: 'Client Analysis Report' },
        { method: 'GET', path: '/api/bookkeeper/reports?reportType=therapist_revenue', description: 'Therapist Revenue Report' },
        
        // Create Invoice
        { method: 'POST', path: '/api/bookkeeper/invoices', description: 'Create Invoice', data: {
            clientId: userData.client?.id || 'c3d12345-6789-0123-4567-890123456789',
            therapistId: userData.therapist?.id || 'th123456-7890-1234-5678-901234567890',
            appointmentId: 'apt12345-6789-0123-4567-890123456789',
            amount: 85.00,
            taxAmount: 17.85,
            description: 'Individual Therapy Session - 60 minutes',
            dueDate: '2025-08-31',
            paymentTerms: 30
        }},
        
        // Update Invoice Status
        { method: 'PUT', path: '/api/bookkeeper/invoices/a1b2c3d4-e5f6-7890-abcd-ef1234567890/status', description: 'Update Invoice Status', data: {
            status: 'paid',
            paymentDate: '2025-08-08',
            paymentMethod: 'bank_transfer',
            paymentReference: 'REF-12345'
        }},
        
        // Send Payment Reminder
        { method: 'POST', path: '/api/bookkeeper/invoices/a1b2c3d4-e5f6-7890-abcd-ef1234567890/reminder', description: 'Send Payment Reminder' },
        
        // Financial Overview
        { method: 'GET', path: '/api/bookkeeper/financial-overview', description: 'Get Financial Overview' },
        { method: 'GET', path: '/api/bookkeeper/financial-overview?period=month', description: 'Get Monthly Overview' },
        
        // Payments
        { method: 'GET', path: '/api/bookkeeper/payments', description: 'Get All Payments' },
        { method: 'GET', path: '/api/bookkeeper/payments?status=completed', description: 'Get Completed Payments' },
        { method: 'POST', path: '/api/bookkeeper/payments', description: 'Process Payment', data: {
            invoiceId: 'test-invoice-id',
            amount: 85.00,
            paymentMethod: 'sepa',
            paymentDate: '2025-08-08'
        }},
        
        // Client Balances
        { method: 'GET', path: '/api/bookkeeper/clients/balances', description: 'Get Client Balances' },
        { method: 'GET', path: '/api/bookkeeper/clients/balances?includeZero=true', description: 'Get All Client Balances' },
        
        // Additional Reports
        { method: 'GET', path: '/api/bookkeeper/reports/revenue', description: 'Get Revenue Report' },
        { method: 'GET', path: '/api/bookkeeper/reports/outstanding', description: 'Get Outstanding Payments' },
        { method: 'GET', path: '/api/bookkeeper/reports/tax', description: 'Get Tax Report' },
        
        // Export
        { method: 'GET', path: '/api/bookkeeper/export/invoices?format=csv', description: 'Export Invoices CSV' },
        { method: 'GET', path: '/api/bookkeeper/export/payments?format=csv', description: 'Export Payments CSV' },
        
        // Not Implemented Endpoints (expecting 501)
        { method: 'GET', path: '/api/bookkeeper/analytics/revenue-trends', description: 'Revenue Trends (501)' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                authTokens.bookkeeper,
                'bookkeeper'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testResourcesEndpoints() {
    logSection('RESOURCES ENDPOINTS TEST (NEW FEATURE)');
    
    // Test as Admin/Therapist creating resources
    if (authTokens.therapist) {
        logSubSection('Creating Resources (Therapist)');
        
        const createEndpoints = [
            { method: 'POST', path: '/api/resources', description: 'Create Article Resource', data: {
                title: 'Understanding Anxiety',
                description: 'A comprehensive guide to understanding and managing anxiety',
                shortDescription: 'Learn about anxiety and coping strategies',
                type: 'article',
                category: 'anxiety',
                contentBody: 'This is the article content about anxiety...',
                difficulty: 'beginner',
                tags: ['anxiety', 'mental-health', 'coping'],
                authorName: 'Dr. Emma de Jong',
                isPublic: true
            }},
            
            { method: 'POST', path: '/api/resources', description: 'Create Video Resource', data: {
                title: 'Meditation Basics',
                description: 'Introduction to meditation techniques',
                type: 'video',
                category: 'mindfulness',
                contentUrl: 'https://example.com/meditation-video',
                durationMinutes: 15,
                difficulty: 'beginner',
                isPublic: true
            }}
        ];
        
        for (const endpoint of createEndpoints) {
            try {
                await makeRequest(
                    endpoint.method,
                    endpoint.path,
                    endpoint.data,
                    authTokens.therapist,
                    'therapist'
                );
            } catch (error) {
                // Continue
            }
        }
    }
    
    // Test resource browsing and assignment
    const endpoints = [
        // Get resources (all roles)
        { method: 'GET', path: '/api/resources', description: 'Get All Resources', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/resources?category=anxiety', description: 'Get Anxiety Resources', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/resources?type=video', description: 'Get Video Resources', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/resources?assignedToMe=true', description: 'Get Assigned Resources', token: authTokens.client, role: 'client' },
        
        // Get specific resource
        { method: 'GET', path: `/api/resources/${createdResources.resourceId || 'test-id'}`, description: 'Get Resource Details', token: authTokens.client, role: 'client' },
        
        // Therapist assigns resource to client
        { method: 'POST', path: `/api/resources/${createdResources.resourceId || 'test-id'}/assign`, description: 'Assign Resource to Client', data: {
            clientId: userData.client?.id || 'test-client-id',
            dueDate: '2025-08-31',
            priority: 'high',
            notes: 'Please review this resource before our next session'
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Client engagement
        { method: 'POST', path: `/api/resources/${createdResources.resourceId || 'test-id'}/engagement`, description: 'Track Resource View', data: {
            action: 'view',
            timeSpent: 5
        }, token: authTokens.client, role: 'client' },
        
        { method: 'POST', path: `/api/resources/${createdResources.resourceId || 'test-id'}/engagement`, description: 'Bookmark Resource', data: {
            action: 'bookmark'
        }, token: authTokens.client, role: 'client' },
        
        // Therapist views assignments
        { method: 'GET', path: '/api/resources/assignments', description: 'Get Resource Assignments', token: authTokens.therapist, role: 'therapist' },
        { method: 'GET', path: `/api/resources/assignments?clientId=${userData.client?.id || 'test-id'}`, description: 'Get Client Resource Assignments', token: authTokens.therapist, role: 'therapist' },
        
        // Update resource (admin/creator)
        { method: 'PUT', path: `/api/resources/${createdResources.resourceId || 'test-id'}`, description: 'Update Resource', data: {
            title: 'Understanding Anxiety - Updated',
            tags: ['anxiety', 'mental-health', 'coping', 'updated']
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Delete resource (admin only)
        { method: 'DELETE', path: `/api/resources/${createdResources.resourceId || 'test-id'}`, description: 'Delete Resource', token: authTokens.admin, role: 'admin' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method,
                endpoint.path,
                endpoint.data || null,
                endpoint.token,
                endpoint.role
            );
        } catch (error) {
            // Continue
        }
    }
}

async function testChallengesEndpoints() {
    logSection('CHALLENGES ENDPOINTS TEST (NEW FEATURE)');
    
    // Test as Admin/Therapist creating challenges
    if (authTokens.therapist) {
        logSubSection('Creating Challenges (Therapist)');
        
        const createEndpoints = [
            { method: 'POST', path: '/api/challenges', description: 'Create Mindfulness Challenge', data: {
                title: '7-Day Mindfulness Challenge',
                description: 'Practice mindfulness meditation for 7 consecutive days',
                shortDescription: 'Build a daily meditation habit',
                category: 'mindfulness',
                difficulty: 'beginner',
                duration: 7,
                targetValue: 7,
                targetUnit: 'days',
                milestones: [
                    { percentage: 30, title: 'Getting Started', description: '3 days completed' },
                    { percentage: 70, title: 'Almost There', description: '5 days completed' },
                    { percentage: 100, title: 'Challenge Complete!', description: 'All 7 days completed' }
                ],
                rewards: {
                    completion: { points: 100, badge: 'mindfulness-beginner' }
                },
                instructions: ['Meditate for at least 10 minutes daily', 'Use any meditation app or technique', 'Track your progress daily'],
                tips: ['Start with guided meditations', 'Set a consistent time each day', 'Create a quiet space'],
                isPublic: true
            }},
            
            { method: 'POST', path: '/api/challenges', description: 'Create Exercise Challenge', data: {
                title: '30-Day Fitness Journey',
                description: 'Complete physical exercise for 30 days',
                category: 'fitness',
                difficulty: 'intermediate',
                duration: 30,
                targetValue: 30,
                targetUnit: 'sessions',
                isPublic: true
            }}
        ];
        
        for (const endpoint of createEndpoints) {
            try {
                await makeRequest(
                    endpoint.method,
                    endpoint.path,
                    endpoint.data,
                    authTokens.therapist,
                    'therapist'
                );
            } catch (error) {
                // Continue
            }
        }
    }
    
    // Test challenge browsing and participation
    const endpoints = [
        // Get challenges (all roles)
        { method: 'GET', path: '/api/challenges', description: 'Get All Challenges', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/challenges?category=mindfulness', description: 'Get Mindfulness Challenges', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/challenges?difficulty=beginner', description: 'Get Beginner Challenges', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/challenges?assignedToMe=true', description: 'Get Assigned Challenges', token: authTokens.client, role: 'client' },
        
        // Get specific challenge
        { method: 'GET', path: `/api/challenges/${createdResources.challengeId || 'test-id'}`, description: 'Get Challenge Details', token: authTokens.client, role: 'client' },
        
        // Therapist assigns challenge to client
        { method: 'POST', path: `/api/challenges/${createdResources.challengeId || 'test-id'}/assign`, description: 'Assign Challenge to Client', data: {
            clientId: userData.client?.id || 'test-client-id',
            dueDate: '2025-09-08',
            notes: 'Let\'s work on building mindfulness habits'
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Client joins challenge
        { method: 'POST', path: `/api/challenges/${createdResources.challengeId || 'test-id'}/join`, description: 'Join Challenge', token: authTokens.client, role: 'client' },
        
        // Client updates progress
        { method: 'POST', path: `/api/challenges/${createdResources.challengeId || 'test-id'}/progress`, description: 'Update Challenge Progress', data: {
            progressData: { daysCompleted: 3, lastActivity: '2025-08-08' },
            progressPercentage: 43,
            milestoneReached: { percentage: 30, title: 'Getting Started' }
        }, token: authTokens.client, role: 'client' },
        
        // Therapist views assignments
        { method: 'GET', path: '/api/challenges/assignments', description: 'Get Challenge Assignments', token: authTokens.therapist, role: 'therapist' },
        { method: 'GET', path: `/api/challenges/assignments?clientId=${userData.client?.id || 'test-id'}`, description: 'Get Client Challenge Assignments', token: authTokens.therapist, role: 'therapist' },
        
        // Update challenge (admin/creator)
        { method: 'PUT', path: `/api/challenges/${createdResources.challengeId || 'test-id'}`, description: 'Update Challenge', data: {
            title: '7-Day Mindfulness Challenge - Enhanced',
            tips: ['Start with guided meditations', 'Set a consistent time each day', 'Create a quiet space', 'Journal your experience']
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Delete challenge (admin only)
        { method: 'DELETE', path: `/api/challenges/${createdResources.challengeId || 'test-id'}`, description: 'Delete Challenge', token: authTokens.admin, role: 'admin' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method,
                endpoint.path,
                endpoint.data || null,
                endpoint.token,
                endpoint.role
            );
        } catch (error) {
            // Continue
        }
    }
}

async function testSurveysEndpoints() {
    logSection('SURVEYS ENDPOINTS TEST (NEW FEATURE)');
    
    // Test as Admin/Therapist creating surveys
    if (authTokens.therapist) {
        logSubSection('Creating Surveys (Therapist)');
        
        const createEndpoints = [
            { method: 'POST', path: '/api/surveys', description: 'Create Progress Survey', data: {
                title: 'Weekly Progress Check-In',
                description: 'A brief survey to track your weekly progress and well-being',
                type: 'progress',
                purpose: 'Track client progress and adjust treatment plans',
                questions: [
                    {
                        id: 'q1',
                        text: 'How would you rate your overall mood this week?',
                        type: 'scale',
                        required: true,
                        scale: {
                            min: 1,
                            max: 10,
                            minLabel: 'Very Low',
                            maxLabel: 'Very High'
                        }
                    },
                    {
                        id: 'q2',
                        text: 'Which coping strategies did you use this week?',
                        type: 'multiple_choice',
                        required: true,
                        options: ['Meditation', 'Exercise', 'Journaling', 'Talking to friends', 'Deep breathing', 'Other']
                    },
                    {
                        id: 'q3',
                        text: 'What challenges did you face this week?',
                        type: 'text',
                        required: false
                    },
                    {
                        id: 'q4',
                        text: 'Do you feel you made progress toward your therapy goals?',
                        type: 'boolean',
                        required: true
                    }
                ],
                isAnonymous: false,
                allowEdit: true,
                validFrom: '2025-08-08',
                validUntil: '2025-12-31'
            }},
            
            { method: 'POST', path: '/api/surveys', description: 'Create Satisfaction Survey', data: {
                title: 'Client Satisfaction Survey',
                description: 'Help us improve our services',
                type: 'satisfaction',
                questions: [
                    {
                        id: 'q1',
                        text: 'How satisfied are you with your therapy sessions?',
                        type: 'scale',
                        required: true,
                        scale: { min: 1, max: 5 }
                    }
                ],
                isAnonymous: true
            }}
        ];
        
        for (const endpoint of createEndpoints) {
            try {
                await makeRequest(
                    endpoint.method,
                    endpoint.path,
                    endpoint.data,
                    authTokens.therapist,
                    'therapist'
                );
            } catch (error) {
                // Continue
            }
        }
    }
    
    // Test survey management and responses
    const endpoints = [
        // Get surveys (all roles)
        { method: 'GET', path: '/api/surveys', description: 'Get All Surveys', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/surveys?type=progress', description: 'Get Progress Surveys', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/surveys?status=published', description: 'Get Published Surveys', token: authTokens.client, role: 'client' },
        { method: 'GET', path: '/api/surveys?assignedToMe=true', description: 'Get Assigned Surveys', token: authTokens.client, role: 'client' },
        
        // Get specific survey
        { method: 'GET', path: `/api/surveys/${createdResources.surveyId || 'test-id'}`, description: 'Get Survey Details', token: authTokens.client, role: 'client' },
        
        // Therapist assigns survey to client
        { method: 'POST', path: `/api/surveys/${createdResources.surveyId || 'test-id'}/assign`, description: 'Assign Survey to Client', data: {
            clientId: userData.client?.id || 'test-client-id',
            dueDate: '2025-08-15',
            priority: 'normal',
            notes: 'Please complete this weekly check-in'
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Client submits response
        { method: 'POST', path: `/api/surveys/${createdResources.surveyId || 'test-id'}/respond`, description: 'Submit Survey Response', data: {
            responses: {
                q1: 7,
                q2: ['Meditation', 'Exercise'],
                q3: 'Had some difficulty sleeping this week',
                q4: true
            }
        }, token: authTokens.client, role: 'client' },
        
        // Therapist views responses
        { method: 'GET', path: `/api/surveys/${createdResources.surveyId || 'test-id'}/responses`, description: 'Get Survey Responses', token: authTokens.therapist, role: 'therapist' },
        
        // Therapist views assignments
        { method: 'GET', path: '/api/surveys/assignments', description: 'Get Survey Assignments', token: authTokens.therapist, role: 'therapist' },
        { method: 'GET', path: `/api/surveys/assignments?clientId=${userData.client?.id || 'test-id'}`, description: 'Get Client Survey Assignments', token: authTokens.therapist, role: 'therapist' },
        
        // Update survey (admin/creator)
        { method: 'PUT', path: `/api/surveys/${createdResources.surveyId || 'test-id'}`, description: 'Update Survey', data: {
            title: 'Weekly Progress Check-In - Updated',
            validUntil: '2026-01-31'
        }, token: authTokens.therapist, role: 'therapist' },
        
        // Delete survey (admin only)
        { method: 'DELETE', path: `/api/surveys/${createdResources.surveyId || 'test-id'}`, description: 'Delete Survey', token: authTokens.admin, role: 'admin' }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method,
                endpoint.path,
                endpoint.data || null,
                endpoint.token,
                endpoint.role
            );
        } catch (error) {
            // Continue
        }
    }
}

async function testSecurityEndpoints() {
    logSection('SECURITY ENDPOINTS TEST');
    
    const endpoints = [
        // Password Management
        { method: 'PUT', path: '/api/users/change-password', description: 'Change Password', data: {
            currentPassword: 'ClientPass123!',
            newPassword: 'NewClientPass123!@#'
        }, token: authTokens.client },
        
        // Session Management
        { method: 'GET', path: '/api/users/sessions', description: 'Get Active Sessions', token: authTokens.client },
        
        // Restore password for future tests
        { method: 'PUT', path: '/api/users/change-password', description: 'Restore Original Password', data: {
            currentPassword: 'NewClientPass123!@#',
            newPassword: 'ClientPass123!'
        }, token: authTokens.client }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method,
                endpoint.path,
                endpoint.data || null,
                endpoint.token,
                'security'
            );
        } catch (error) {
            // Continue
        }
    }
}

async function testAuthenticationEndpoints() {
    logSection('AUTHENTICATION ENDPOINTS TEST');
    
    const endpoints = [
        // Public endpoints (no auth required)
        { method: 'POST', path: '/api/auth/register', description: 'Register New User', data: {
            email: `test.${Date.now()}@example.com`,
            password: 'ComplexPass123!',
            confirmPassword: 'ComplexPass123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'client',
            phone: '+31612345678'
        }},
        
        { method: 'POST', path: '/api/auth/forgot-password', description: 'Forgot Password', data: {
            email: 'admin@praktijkepd.nl'
        }},
        
        // Logout
        { method: 'POST', path: '/api/auth/logout', description: 'Logout User', token: authTokens.substitute }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                endpoint.token || null,
                'auth'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testSharedEndpoints() {
    logSection('SHARED ENDPOINTS TEST');
    
    const endpoints = [
        // Public endpoints
        { method: 'GET', path: '/health', description: 'Health Check' },
        
        // Messages (authenticated users)
        { method: 'GET', path: '/api/messages', description: 'Get Messages', token: authTokens.client },
        { method: 'PUT', path: '/api/messages/msg-test-001/read', description: 'Mark Message Read', token: authTokens.client },
        
        // Documents (expecting errors for non-existent documents)
        { method: 'GET', path: '/api/documents/doc-test-001/download', description: 'Download Document', token: authTokens.client },
        { method: 'POST', path: '/api/documents/doc-test-001/share', description: 'Share Document', data: {
            shareWith: [userData.therapist?.id || 'test-therapist-id'],
            permissions: ['read']
        }, token: authTokens.client },
        { method: 'DELETE', path: '/api/documents/doc-test-001', description: 'Delete Document', token: authTokens.client }
    ];
    
    for (const endpoint of endpoints) {
        logSubSection(endpoint.description);
        try {
            await makeRequest(
                endpoint.method, 
                endpoint.path, 
                endpoint.data || null, 
                endpoint.token || null,
                'shared'
            );
        } catch (error) {
            // Continue testing other endpoints
        }
    }
}

async function testCrossRoleInteractions() {
    logSection('CROSS-ROLE INTERACTION TEST');
    
    logSubSection('Complete Therapy Flow with New Features');
    
    // 1. Client requests appointment
    if (authTokens.client && userData.therapist) {
        try {
            log('1. Client requests appointment...', 'blue');
            await makeRequest('POST', '/api/client/appointments/request', {
                preferredDate: '2025-08-25',
                preferredTime: '15:00',
                therapyType: 'counseling',
                urgencyLevel: 'normal',
                reason: 'Initial consultation for anxiety'
            }, authTokens.client, 'client');
        } catch (error) {
            // Continue
        }
    }
    
    // 2. Therapist assigns resources to prepare
    if (authTokens.therapist && userData.client) {
        try {
            log('2. Therapist assigns preparatory resources...', 'blue');
            const resourceId = testData.createdByTherapist.resourceIds[0] || testData.createdByAdmin.resourceIds[0] || createdResources.resourceId;
            if (resourceId) {
                await makeRequest('POST', `/api/resources/${resourceId}/assign`, {
                    clientId: userData.client.id,
                    dueDate: '2025-08-24',
                    priority: 'high',
                    notes: 'Please review this before our first session'
                }, authTokens.therapist, 'therapist');
            } else {
                log('No resource ID available for assignment', 'yellow');
            }
        } catch (error) {
            // Continue
        }
    }
    
    // 3. Therapist assigns initial survey
    if (authTokens.therapist && userData.client) {
        try {
            log('3. Therapist assigns intake survey...', 'blue');
            const surveyId = testData.createdByTherapist.surveyIds[0] || testData.createdByAdmin.surveyIds[0] || createdResources.surveyId;
            if (surveyId) {
                await makeRequest('POST', `/api/surveys/${surveyId}/assign`, {
                    clientId: userData.client.id,
                    dueDate: '2025-08-24',
                    priority: 'high',
                    notes: 'Please complete this assessment before our meeting'
                }, authTokens.therapist, 'therapist');
            } else {
                log('No survey ID available for assignment', 'yellow');
            }
        } catch (error) {
            // Continue
        }
    }
    
    // 4. Client completes survey
    if (authTokens.client) {
        try {
            log('4. Client completes survey...', 'blue');
            const surveyId = testData.createdByTherapist.surveyIds[0] || testData.createdByAdmin.surveyIds[0] || createdResources.surveyId;
            if (surveyId) {
                await makeRequest('POST', `/api/surveys/${surveyId}/respond`, {
                    responses: {
                        q1: 6,
                        q2: ['Meditation', 'Talking to friends'],
                        q3: 'Experiencing anxiety in social situations',
                        q4: true
                    },
                    timeSpentMinutes: 5
                }, authTokens.client, 'client');
            } else {
                log('No survey ID available for response', 'yellow');
            }
        } catch (error) {
            // Continue
        }
    }
    
    // 5. Therapist reviews and assigns challenge
    if (authTokens.therapist && userData.client) {
        try {
            log('5. Therapist assigns therapeutic challenge...', 'blue');
            const challengeId = testData.createdByTherapist.challengeIds[0] || testData.createdByAdmin.challengeIds[0] || createdResources.challengeId;
            if (challengeId) {
                await makeRequest('POST', `/api/challenges/${challengeId}/assign`, {
                    clientId: userData.client.id,
                    dueDate: '2025-09-01',
                    notes: 'Let\'s start with this mindfulness practice'
                }, authTokens.therapist, 'therapist');
            } else {
                log('No challenge ID available for assignment', 'yellow');
            }
        } catch (error) {
            // Continue
        }
    }
    
    // 6. Client joins and updates challenge progress
    if (authTokens.client) {
        try {
            log('6. Client joins challenge and updates progress...', 'blue');
            const challengeId = testData.createdByTherapist.challengeIds[0] || testData.createdByAdmin.challengeIds[0] || createdResources.challengeId;
            if (challengeId) {
                await makeRequest('POST', `/api/challenges/${challengeId}/join`, {}, authTokens.client, 'client');
                
                await delay(100);
                
                await makeRequest('POST', `/api/challenges/${challengeId}/progress`, {
                    progressData: { daysCompleted: 2 },
                    progressPercentage: 29
                }, authTokens.client, 'client');
            } else {
                log('No challenge ID available for participation', 'yellow');
            }
        } catch (error) {
            // Continue
        }
    }
}

async function generateReport() {
    logSection('TEST RESULTS SUMMARY');
    
    testResults.endTime = new Date();
    const duration = (testResults.endTime - testResults.startTime) / 1000;
    
    console.log(`\nTotal Tests: ${testResults.total}`);
    console.log(`${colors.green}Successful: ${testResults.successful}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    console.log(`Success Rate: ${((testResults.successful / testResults.total) * 100).toFixed(2)}%`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    // Count by status code
    const statusCounts = {};
    testResults.byEndpoint.forEach(result => {
        const status = result.status.toString();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\nResults by Status Code:');
    Object.entries(statusCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
    
    // Count by role
    const roleCounts = {};
    testResults.byEndpoint.forEach(result => {
        roleCounts[result.role] = roleCounts[result.role] || { total: 0, success: 0, failed: 0 };
        roleCounts[result.role].total++;
        if (result.success) {
            roleCounts[result.role].success++;
        } else {
            roleCounts[result.role].failed++;
        }
    });
    
    console.log('\nResults by Role:');
    Object.entries(roleCounts).forEach(([role, counts]) => {
        console.log(`  ${role}: ${counts.success}/${counts.total} (${((counts.success / counts.total) * 100).toFixed(2)}%)`);
    });
    
    // Failed endpoints
    const failedEndpoints = testResults.byEndpoint.filter(r => !r.success && r.status !== 501);
    if (failedEndpoints.length > 0) {
        console.log('\n' + colors.red + 'Failed Endpoints (excluding 501):' + colors.reset);
        failedEndpoints.forEach(endpoint => {
            console.log(`  ${endpoint.method} ${endpoint.path} - Status: ${endpoint.status} - ${endpoint.error}`);
        });
    }
    
    // Not implemented endpoints
    const notImplemented = testResults.byEndpoint.filter(r => r.status === 501);
    console.log(`\nNot Implemented Endpoints (501): ${notImplemented.length}`);
    
    // Success
    if (testResults.failed === 0) {
        log('\n✅ All tests passed successfully!', 'green');
    } else {
        log(`\n⚠️  ${testResults.failed} tests failed`, 'yellow');
    }
}

// Main test runner
async function runTests() {
    console.log(colors.bright + '\n🚀 Starting Comprehensive Backend Test Suite for PraktijkEPD' + colors.reset);
    console.log('Complete version with ALL endpoints including new features');
    console.log(`Target: ${BASE_URL}`);
    console.log(`Time: ${new Date().toLocaleString()}\n`);
    
    try {
        // Check if server is running
        try {
            await axios.get(`${BASE_URL}/health`);
        } catch (error) {
            log('❌ Server is not running at ' + BASE_URL, 'red');
            log('Please start the server with: npm run dev', 'yellow');
            process.exit(1);
        }
        
        // Run all tests
        await authenticateAllUsers();
        
        // Test role-specific endpoints
        await testAdminEndpoints();
        await testTherapistEndpoints();
        await testClientEndpoints();
        await testAssistantEndpoints();
        await testBookkeeperEndpoints();
        
        // Test new features
        await testResourcesEndpoints();
        await testChallengesEndpoints();
        await testSurveysEndpoints();
        
        // Test security & authentication
        await testSecurityEndpoints();
        await testAuthenticationEndpoints();
        await testSharedEndpoints();
        
        // Test cross-role interactions
        await testCrossRoleInteractions();
        
        // Generate report
        await generateReport();
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
runTests();