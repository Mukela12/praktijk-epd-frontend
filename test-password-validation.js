// Test script to manually validate password "Test123!" based on backend logic
const DEFAULT_PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPasswords: [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'admin', 'user', 'test', 'praktijk', 'epd'
  ]
};

function validatePassword(password, requirements = DEFAULT_PASSWORD_REQUIREMENTS) {
  const errors = [];
  const met = [];
  let score = 0;

  console.log('🔍 Validating password:', password);
  console.log('📋 Requirements:', requirements);

  // Check minimum length
  if (password.length >= requirements.minLength) {
    met.push(`At least ${requirements.minLength} characters`);
    score += 20;
    console.log('✅ Length check passed:', password.length, 'characters');
  } else {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
    console.log('❌ Length check failed:', password.length, 'characters');
  }

  // Check uppercase letters
  if (requirements.requireUppercase) {
    if (/[A-Z]/.test(password)) {
      met.push('Contains uppercase letters');
      score += 15;
      console.log('✅ Uppercase check passed');
    } else {
      errors.push('Password must contain at least one uppercase letter');
      console.log('❌ Uppercase check failed');
    }
  }

  // Check lowercase letters
  if (requirements.requireLowercase) {
    if (/[a-z]/.test(password)) {
      met.push('Contains lowercase letters');
      score += 15;
      console.log('✅ Lowercase check passed');
    } else {
      errors.push('Password must contain at least one lowercase letter');
      console.log('❌ Lowercase check failed');
    }
  }

  // Check numbers
  if (requirements.requireNumbers) {
    if (/\d/.test(password)) {
      met.push('Contains numbers');
      score += 15;
      console.log('✅ Numbers check passed');
    } else {
      errors.push('Password must contain at least one number');
      console.log('❌ Numbers check failed');
    }
  }

  // Check special characters
  if (requirements.requireSpecialChars) {
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (specialCharsRegex.test(password)) {
      met.push('Contains special characters');
      score += 15;
      console.log('✅ Special characters check passed');
    } else {
      errors.push('Password must contain at least one special character');
      console.log('❌ Special characters check failed');
    }
  }

  // Check against forbidden passwords
  const lowercasePassword = password.toLowerCase();
  const forbiddenFound = requirements.forbiddenPasswords.some(forbidden => 
    lowercasePassword.includes(forbidden.toLowerCase())
  );

  if (forbiddenFound) {
    errors.push('Password contains common or forbidden words');
    score -= 20;
    console.log('❌ Forbidden words check failed');
  } else {
    score += 10;
    console.log('✅ Forbidden words check passed');
  }

  // Bonus points for length and complexity
  if (password.length >= 12) {
    score += 10;
    console.log('✅ Length bonus (12+): +10 points');
  }
  if (password.length >= 16) {
    score += 10;
    console.log('✅ Length bonus (16+): +10 points');
  }
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 5; // Multiple special chars
    console.log('✅ Multiple special chars bonus: +5 points');
  }
  if (/\d.*\d.*\d/.test(password)) {
    score += 5; // Multiple numbers
    console.log('✅ Multiple numbers bonus: +5 points');
  }

  // Ensure score doesn't exceed 100
  score = Math.min(score, 100);

  const result = {
    valid: errors.length === 0 && score >= 60,
    score: Math.max(score, 0),
    requirements: met,
    errors
  };

  console.log('\n📊 Final Results:');
  console.log('Score:', result.score);
  console.log('Valid:', result.valid);
  console.log('Requirements met:', result.requirements);
  console.log('Errors:', result.errors);
  console.log('Minimum score required: 60');

  return result;
}

// Test the password "Test123!"
const testPassword = "Test123!";
const result = validatePassword(testPassword);

console.log('\n🎯 Summary for password "' + testPassword + '":');
console.log('Valid:', result.valid);
console.log('Score:', result.score + '/100');
if (!result.valid) {
  console.log('Validation failed because:');
  result.errors.forEach(error => console.log('  - ' + error));
}