export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password, minLength = 6) => {
  if (!password || !password.trim()) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return '';
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

export const validateProjectId = (projectId) => {
  if (!projectId || !projectId.trim()) {
    return 'Project ID is required';
  }
  const projectIdRegex = /^[A-Z]{3}-[0-9]{3}$/;
  if (!projectIdRegex.test(projectId.trim().toUpperCase())) {
    return 'Project ID must be in format: XXX-000 (e.g., PJT-001)';
  }
  return '';
};

export const validateEmployeeId = (employeeId) => {
  if (!employeeId || !employeeId.trim()) {
    return 'Employee ID is required';
  }
  if (employeeId.trim().length < 3) {
    return 'Employee ID must be at least 3 characters';
  }
  return '';
};

export const validateProgress = (progress) => {
  const num = parseInt(progress);
  if (isNaN(num)) {
    return 'Progress must be a number';
  }
  if (num < 0 || num > 100) {
    return 'Progress must be between 0 and 100';
  }
  return '';
};



