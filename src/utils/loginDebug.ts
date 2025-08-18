// Login debugging utility
export const loginDebug = {
  // Log the login response
  logLoginResponse: (response: any) => {
    console.log('=== Login Response Debug ===');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Success:', response.data?.success);
    console.log('Access token:', response.data?.accessToken);
    console.log('User:', response.data?.user);
    console.log('Requires 2FA:', response.data?.requiresTwoFactor);
    console.log('===========================');
  },

  // Check what's in localStorage after login
  checkStorageAfterLogin: () => {
    console.log('=== Storage After Login ===');
    console.log('Access Token:', localStorage.getItem('accessToken'));
    console.log('User:', localStorage.getItem('user'));
    console.log('Temp Token:', localStorage.getItem('tempToken'));
    console.log('Pending Login:', localStorage.getItem('pendingLogin'));
    console.log('Auth Store:', localStorage.getItem('praktijk-epd-auth'));
    console.log('==========================');
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).loginDebug = loginDebug;
}