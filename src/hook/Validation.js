
// Email Validation
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  if (!email) return "Email is required";
  if (!regex.test(email)) return "Invalid email address";

  return "";
};

// Aadhar Validation
export const validateAadhar = (aadhar) => {
  const regex = /^[0-9]{12}$/;

  if (!aadhar) return "Aadhar number is required";
  if (!regex.test(aadhar)) return "Aadhar must be 12 digits";

  return "";
};

// PAN Validation
export const validatePan = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!pan) return "PAN is required";
  if (!regex.test(pan)) return "Invalid PAN format";

  return "";
};

// Contact Validation
export const validateContact = (contact) => {
  const regex = /^[0-9]{10}$/;

  if (!contact) return "Contact is required";
  if (!regex.test(contact)) return "Invalid contact number";

  return "";
};

// Required Fields Validation
export const validateRequiredFields = (formData, requiredFields) => {
  let errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field]) {
      errors[field] = "This field is required";
    }
  });

  return errors;
};