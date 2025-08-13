const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test credentials
const bookkeeper = { email: 'lucas.vanderberg@praktijkepd.nl', password: 'Welcome123!' };
const assistant = { email: 'sophie.williams@praktijkepd.nl', password: 'Welcome123!' };

// Helper function to login
async function login(credentials) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data.accessToken;
    } catch (error) {
        console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
        return null;
    }
}

// Test Bookkeeper Endpoints
async function testBookkeeperEndpoints() {
    console.log('\n=== TESTING BOOKKEEPER ENDPOINTS ===\n');
    
    const token = await login(bookkeeper);
    if (!token) {
        console.error('Bookkeeper login failed');
        return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test endpoints
    const endpoints = [
        { method: 'GET', url: '/bookkeeper/dashboard', name: 'Dashboard' },
        { method: 'GET', url: '/bookkeeper/invoices', name: 'All Invoices' },
        { method: 'GET', url: '/bookkeeper/invoices?status=overdue', name: 'Overdue Invoices' },
        { method: 'GET', url: '/bookkeeper/financial-overview', name: 'Financial Overview' },
        { method: 'GET', url: '/bookkeeper/reports?reportType=revenue', name: 'Revenue Report' },
        { method: 'GET', url: '/bookkeeper/reports?reportType=payments', name: 'Payments Report' },
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
            const response = await axios({
                method: endpoint.method,
                url: `${API_BASE_URL}${endpoint.url}`,
                headers
            });
            console.log('✅ Success:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error('❌ Failed:', error.response?.status, error.response?.data || error.message);
        }
    }
}

// Test Assistant Endpoints
async function testAssistantEndpoints() {
    console.log('\n=== TESTING ASSISTANT ENDPOINTS ===\n');
    
    const token = await login(assistant);
    if (!token) {
        console.error('Assistant login failed');
        return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test endpoints
    const endpoints = [
        { method: 'GET', url: '/assistant/dashboard', name: 'Dashboard' },
        { method: 'GET', url: '/assistant/support-tickets', name: 'Support Tickets' },
        { method: 'GET', url: '/assistant/appointments', name: 'Appointments' },
        { method: 'GET', url: '/assistant/waiting-list', name: 'Waiting List' },
        { method: 'GET', url: '/assistant/therapists/availability', name: 'Therapist Availability' },
        { method: 'GET', url: '/assistant/clients/search?q=test', name: 'Search Clients' },
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
            const response = await axios({
                method: endpoint.method,
                url: `${API_BASE_URL}${endpoint.url}`,
                headers
            });
            console.log('✅ Success:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error('❌ Failed:', error.response?.status, error.response?.data || error.message);
        }
    }
    
    // Test creating a support ticket
    try {
        console.log('\nTesting: Create Support Ticket');
        const response = await axios.post(
            `${API_BASE_URL}/assistant/support-tickets`,
            {
                title: 'Test Support Ticket',
                description: 'Testing from frontend integration',
                priority: 'medium',
                category: 'technical'
            },
            { headers }
        );
        console.log('✅ Success:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Failed:', error.response?.status, error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    await testBookkeeperEndpoints();
    await testAssistantEndpoints();
}

runTests().catch(console.error);