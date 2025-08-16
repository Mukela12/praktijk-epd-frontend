import axios from 'axios';

const BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app/api';

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'Mukelathegreat@gmail.com',
      password: 'Milan18$'
    });
    
    console.log('Login successful:', {
      success: response.data.success,
      user: response.data.user,
      hasToken: !!response.data.accessToken || !!response.data.token
    });
    
    return response.data.accessToken || response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetUsers(token) {
  try {
    console.log('\nTesting get users...');
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Get users successful:', {
      success: response.data.success,
      userCount: response.data.data?.users?.length || 0,
      pagination: response.data.data?.pagination
    });
  } catch (error) {
    console.error('Get users failed:', error.response?.data || error.message);
  }
}

async function testGetAppointments(token) {
  try {
    console.log('\nTesting get appointments...');
    const response = await axios.get(`${BASE_URL}/admin/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Get appointments successful:', {
      success: response.data.success,
      appointmentCount: response.data.data?.appointments?.length || 0
    });
  } catch (error) {
    console.error('Get appointments failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  const token = await testLogin();
  
  if (token) {
    await testGetUsers(token);
    await testGetAppointments(token);
  } else {
    console.log('Cannot proceed with tests - login failed');
  }
}

runTests();