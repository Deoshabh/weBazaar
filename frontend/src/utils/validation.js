/**
 * Form Validation Utilities
 * Client-side validation helpers for forms
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return false;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone)) return "Phone must be exactly 10 digits";
  return null;
};

/**
 * Validate name (2-50 characters)
 */
export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name must not exceed 50 characters";
  return null;
};

/**
 * Validate pincode (6 digits)
 */
export const validatePincode = (pincode) => {
  const pincodeRegex = /^[0-9]{6}$/;
  if (!pincode) return "Pincode is required";
  if (!pincodeRegex.test(pincode)) return "Pincode must be exactly 6 digits";
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName = "Field") => {
  if (!value || value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName = "Field") => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max, fieldName = "Value") => {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must not exceed ${max}`;
  return null;
};

/**
 * Validate address form
 */
export const validateAddress = (address) => {
  const errors = {};

  const nameError = validateName(address.fullName);
  if (nameError) errors.fullName = nameError;

  const phoneError = validatePhone(address.phone);
  if (phoneError) errors.phone = phoneError;

  const addressError = validateMinLength(
    address.addressLine1,
    5,
    "Address Line 1",
  );
  if (addressError) errors.addressLine1 = addressError;

  const cityError = validateMinLength(address.city, 2, "City");
  if (cityError) errors.city = cityError;

  const stateError = validateMinLength(address.state, 2, "State");
  if (stateError) errors.state = stateError;

  const pincodeError = validatePincode(address.pincode);
  if (pincodeError) errors.pincode = pincodeError;

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Invalid email format";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (!validatePassword(password)) {
    errors.password = "Invalid password";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate register form
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Invalid email format";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(formData.password)) {
    errors.password =
      "Password must be at least 8 characters with uppercase, lowercase, and number";
  }

  if (
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (formData.phone) {
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return input;
  // Remove script tags and their content
  let cleaned = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  // Remove all other HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  return cleaned.trim();
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map((err) => err.message).join(", ");
  }
  if (typeof errors === "object") {
    return Object.values(errors).join(", ");
  }
  return errors;
};
