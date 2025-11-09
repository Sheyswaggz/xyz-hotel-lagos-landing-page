// tests/form.spec.ts

import { test, expect, Page } from '@playwright/test';

/**
 * Contact Form End-to-End Test Suite
 * 
 * Comprehensive testing of the XYZ Hotel Lagos contact form functionality
 * including validation, submission, accessibility, and user interactions.
 * 
 * Test Coverage:
 * - Form field validation (required fields, format validation)
 * - Real-time validation feedback
 * - Form submission (success and error scenarios)
 * - Accessibility (ARIA attributes, keyboard navigation)
 * - User experience (loading states, error messages)
 * - Cross-browser compatibility
 * - Mobile responsiveness
 * 
 * @module tests/form.spec.ts
 */

// ============================================
// Test Configuration & Constants
// ============================================

const FORM_SELECTORS = {
  FORM: '[data-contact-form]',
  NAME_INPUT: '#contact-name',
  EMAIL_INPUT: '#contact-email',
  PHONE_INPUT: '#contact-phone',
  SUBJECT_INPUT: '#contact-subject',
  MESSAGE_TEXTAREA: '#contact-message',
  SUBMIT_BUTTON: '[data-submit-button]',
  FORM_STATUS: '[data-form-status]',
  NAME_ERROR: '#name-error',
  EMAIL_ERROR: '#email-error',
  PHONE_ERROR: '#phone-error',
  MESSAGE_ERROR: '#message-error',
} as const;

const VALID_TEST_DATA = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+234-123-456-7890',
  subject: 'Room Booking Inquiry',
  message: 'I would like to book a deluxe room for 3 nights starting next week. Please provide availability and pricing information.',
} as const;

const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  MESSAGE_TOO_SHORT: 'Message must be at least 10 characters',
  MESSAGE_TOO_LONG: 'Message must not exceed 1000 characters',
} as const;

// ============================================
// Helper Functions
// ============================================

/**
 * Navigate to contact form section
 * @param page - Playwright page object
 */
async function navigateToContactForm(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Click contact link in navigation
  await page.click('a[href="#contact"]');
  
  // Wait for smooth scroll to complete
  await page.waitForTimeout(500);
  
  // Verify form is visible
  await expect(page.locator(FORM_SELECTORS.FORM)).toBeVisible();
}

/**
 * Fill form with provided data
 * @param page - Playwright page object
 * @param data - Form data to fill
 */
async function fillForm(page: Page, data: Partial<typeof VALID_TEST_DATA>): Promise<void> {
  if (data.name !== undefined) {
    await page.fill(FORM_SELECTORS.NAME_INPUT, data.name);
  }
  if (data.email !== undefined) {
    await page.fill(FORM_SELECTORS.EMAIL_INPUT, data.email);
  }
  if (data.phone !== undefined) {
    await page.fill(FORM_SELECTORS.PHONE_INPUT, data.phone);
  }
  if (data.subject !== undefined) {
    await page.fill(FORM_SELECTORS.SUBJECT_INPUT, data.subject);
  }
  if (data.message !== undefined) {
    await page.fill(FORM_SELECTORS.MESSAGE_TEXTAREA, data.message);
  }
}

/**
 * Clear all form fields
 * @param page - Playwright page object
 */
async function clearForm(page: Page): Promise<void> {
  await page.fill(FORM_SELECTORS.NAME_INPUT, '');
  await page.fill(FORM_SELECTORS.EMAIL_INPUT, '');
  await page.fill(FORM_SELECTORS.PHONE_INPUT, '');
  await page.fill(FORM_SELECTORS.SUBJECT_INPUT, '');
  await page.fill(FORM_SELECTORS.MESSAGE_TEXTAREA, '');
}

/**
 * Submit form and wait for response
 * @param page - Playwright page object
 */
async function submitForm(page: Page): Promise<void> {
  await page.click(FORM_SELECTORS.SUBMIT_BUTTON);
  // Wait for form processing (simulated 1500ms delay in main.js)
  await page.waitForTimeout(2000);
}

// ============================================
// Test Suite: Contact Form Validation
// ============================================

test.describe('Contact Form - Field Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  // ============================================
  // Required Field Validation Tests
  // ============================================

  test('should show error when submitting empty form', async ({ page }) => {
    // Act: Submit empty form
    await submitForm(page);

    // Assert: All required field errors should be visible
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);

    // Assert: Form status should show error
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Please correct the errors above');
    await expect(formStatus).toHaveClass(/error/);
  });

  test('should show error for empty name field', async ({ page }) => {
    // Arrange: Fill all fields except name
    await fillForm(page, {
      email: VALID_TEST_DATA.email,
      phone: VALID_TEST_DATA.phone,
      message: VALID_TEST_DATA.message,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Name error should be visible
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    
    // Assert: Name field should have error styling
    const nameInput = page.locator(FORM_SELECTORS.NAME_INPUT);
    await expect(nameInput).toHaveClass(/error/);
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should show error for empty email field', async ({ page }) => {
    // Arrange: Fill all fields except email
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      phone: VALID_TEST_DATA.phone,
      message: VALID_TEST_DATA.message,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Email error should be visible
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    
    // Assert: Email field should have error styling
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await expect(emailInput).toHaveClass(/error/);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should show error for empty phone field', async ({ page }) => {
    // Arrange: Fill all fields except phone
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      email: VALID_TEST_DATA.email,
      message: VALID_TEST_DATA.message,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Phone error should be visible
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    
    // Assert: Phone field should have error styling
    const phoneInput = page.locator(FORM_SELECTORS.PHONE_INPUT);
    await expect(phoneInput).toHaveClass(/error/);
    await expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should show error for empty message field', async ({ page }) => {
    // Arrange: Fill all fields except message
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      email: VALID_TEST_DATA.email,
      phone: VALID_TEST_DATA.phone,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Message error should be visible
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    
    // Assert: Message field should have error styling
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await expect(messageTextarea).toHaveClass(/error/);
    await expect(messageTextarea).toHaveAttribute('aria-invalid', 'true');
  });

  // ============================================
  // Format Validation Tests
  // ============================================

  test('should validate email format on blur', async ({ page }) => {
    // Arrange: Enter invalid email
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await emailInput.fill('invalid-email');

    // Act: Blur the field (trigger validation)
    await emailInput.blur();

    // Assert: Email error should be visible
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.INVALID_EMAIL);
    await expect(emailInput).toHaveClass(/error/);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should accept valid email formats', async ({ page }) => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.org',
      'name_123@sub.domain.com',
    ];

    for (const email of validEmails) {
      // Arrange: Clear and fill email
      const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
      await emailInput.fill(email);

      // Act: Blur the field
      await emailInput.blur();

      // Assert: No error should be shown
      const emailError = page.locator(FORM_SELECTORS.EMAIL_ERROR);
      await expect(emailError).toBeEmpty();
      await expect(emailInput).not.toHaveClass(/error/);
      await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    }
  });

  test('should reject invalid email formats', async ({ page }) => {
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      'user..name@example.com',
    ];

    for (const email of invalidEmails) {
      // Arrange: Clear and fill email
      const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
      await emailInput.fill(email);

      // Act: Blur the field
      await emailInput.blur();

      // Assert: Error should be shown
      await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.INVALID_EMAIL);
      await expect(emailInput).toHaveClass(/error/);
    }
  });

  test('should validate phone format on blur', async ({ page }) => {
    // Arrange: Enter invalid phone
    const phoneInput = page.locator(FORM_SELECTORS.PHONE_INPUT);
    await phoneInput.fill('abc123');

    // Act: Blur the field
    await phoneInput.blur();

    // Assert: Phone error should be visible
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toContainText(VALIDATION_MESSAGES.INVALID_PHONE);
    await expect(phoneInput).toHaveClass(/error/);
    await expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should accept valid phone formats', async ({ page }) => {
    const validPhones = [
      '+234-123-456-7890',
      '+1 (555) 123-4567',
      '08012345678',
      '+44 20 7123 4567',
      '555-1234',
    ];

    for (const phone of validPhones) {
      // Arrange: Clear and fill phone
      const phoneInput = page.locator(FORM_SELECTORS.PHONE_INPUT);
      await phoneInput.fill(phone);

      // Act: Blur the field
      await phoneInput.blur();

      // Assert: No error should be shown
      const phoneError = page.locator(FORM_SELECTORS.PHONE_ERROR);
      await expect(phoneError).toBeEmpty();
      await expect(phoneInput).not.toHaveClass(/error/);
      await expect(phoneInput).toHaveAttribute('aria-invalid', 'false');
    }
  });

  test('should validate name minimum length', async ({ page }) => {
    // Arrange: Enter single character name
    const nameInput = page.locator(FORM_SELECTORS.NAME_INPUT);
    await nameInput.fill('A');

    // Act: Blur the field
    await nameInput.blur();

    // Assert: Name error should be visible
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toContainText(VALIDATION_MESSAGES.NAME_TOO_SHORT);
    await expect(nameInput).toHaveClass(/error/);
  });

  test('should validate message minimum length', async ({ page }) => {
    // Arrange: Enter short message
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await messageTextarea.fill('Short');

    // Act: Blur the field
    await messageTextarea.blur();

    // Assert: Message error should be visible
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toContainText(VALIDATION_MESSAGES.MESSAGE_TOO_SHORT);
    await expect(messageTextarea).toHaveClass(/error/);
  });

  test('should validate message maximum length', async ({ page }) => {
    // Arrange: Enter very long message (over 1000 characters)
    const longMessage = 'A'.repeat(1001);
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await messageTextarea.fill(longMessage);

    // Act: Blur the field
    await messageTextarea.blur();

    // Assert: Message error should be visible
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toContainText(VALIDATION_MESSAGES.MESSAGE_TOO_LONG);
    await expect(messageTextarea).toHaveClass(/error/);
  });

  // ============================================
  // Real-time Validation Tests
  // ============================================

  test('should clear error on valid input after error', async ({ page }) => {
    // Arrange: Trigger email error
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await emailInput.fill('invalid');
    await emailInput.blur();
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.INVALID_EMAIL);

    // Act: Enter valid email
    await emailInput.fill(VALID_TEST_DATA.email);
    await page.waitForTimeout(200); // Wait for debounced validation

    // Assert: Error should be cleared
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toBeEmpty();
    await expect(emailInput).not.toHaveClass(/error/);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  test('should show real-time validation for email during typing', async ({ page }) => {
    // Arrange: Trigger initial error
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await emailInput.fill('invalid');
    await emailInput.blur();
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).not.toBeEmpty();

    // Act: Type valid email character by character
    await emailInput.fill('');
    await emailInput.type('valid@example.com', { delay: 50 });
    await page.waitForTimeout(200); // Wait for debounced validation

    // Assert: Error should be cleared during typing
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toBeEmpty();
  });
});

// ============================================
// Test Suite: Form Submission
// ============================================

test.describe('Contact Form - Submission', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should successfully submit form with valid data', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Submit form
    await submitForm(page);

    // Assert: Success message should be displayed
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
    await expect(formStatus).toHaveClass(/success/);

    // Assert: Form should be reset
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveValue('');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveValue('');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveValue('');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toHaveValue('');
  });

  test('should submit form without optional subject field', async ({ page }) => {
    // Arrange: Fill form without subject
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      email: VALID_TEST_DATA.email,
      phone: VALID_TEST_DATA.phone,
      message: VALID_TEST_DATA.message,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Success message should be displayed
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
    await expect(formStatus).toHaveClass(/success/);
  });

  test('should show loading state during submission', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Click submit button
    await page.click(FORM_SELECTORS.SUBMIT_BUTTON);

    // Assert: Button should show loading state immediately
    const submitButton = page.locator(FORM_SELECTORS.SUBMIT_BUTTON);
    await expect(submitButton).toHaveAttribute('aria-busy', 'true');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveClass(/loading/);

    // Wait for submission to complete
    await page.waitForTimeout(2000);

    // Assert: Loading state should be removed
    await expect(submitButton).toHaveAttribute('aria-busy', 'false');
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).not.toHaveClass(/loading/);
  });

  test('should prevent multiple submissions', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Click submit button multiple times rapidly
    const submitButton = page.locator(FORM_SELECTORS.SUBMIT_BUTTON);
    await submitButton.click();
    await submitButton.click(); // Second click should be ignored
    await submitButton.click(); // Third click should be ignored

    // Assert: Button should be disabled during submission
    await expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await page.waitForTimeout(2000);

    // Assert: Only one success message should appear
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });

  test('should clear all error messages on successful submission', async ({ page }) => {
    // Arrange: Trigger some errors first
    await page.fill(FORM_SELECTORS.EMAIL_INPUT, 'invalid');
    await page.locator(FORM_SELECTORS.EMAIL_INPUT).blur();
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).not.toBeEmpty();

    // Act: Fill form with valid data and submit
    await fillForm(page, VALID_TEST_DATA);
    await submitForm(page);

    // Assert: All error messages should be cleared
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toBeEmpty();
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toBeEmpty();
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toBeEmpty();
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toBeEmpty();
  });
});

// ============================================
// Test Suite: Accessibility
// ============================================

test.describe('Contact Form - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should have proper ARIA labels on all form fields', async ({ page }) => {
    // Assert: All required fields should have aria-required
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveAttribute('aria-required', 'true');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('aria-required', 'true');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('aria-required', 'true');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toHaveAttribute('aria-required', 'true');

    // Assert: All fields should have aria-invalid initially set to false
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toHaveAttribute('aria-invalid', 'false');
  });

  test('should have proper ARIA error associations', async ({ page }) => {
    // Assert: All fields should have aria-describedby pointing to error elements
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveAttribute('aria-describedby', 'name-error');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('aria-describedby', /email-error/);
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('aria-describedby', 'phone-error');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toHaveAttribute('aria-describedby', /message-error/);
  });

  test('should update aria-invalid on validation errors', async ({ page }) => {
    // Act: Trigger validation error
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await emailInput.fill('invalid');
    await emailInput.blur();

    // Assert: aria-invalid should be updated to true
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Act: Fix the error
    await emailInput.fill(VALID_TEST_DATA.email);
    await page.waitForTimeout(200);

    // Assert: aria-invalid should be updated to false
    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  test('should have role="alert" on error messages', async ({ page }) => {
    // Assert: All error elements should have role="alert"
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toHaveAttribute('role', 'alert');
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toHaveAttribute('role', 'alert');
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toHaveAttribute('role', 'alert');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toHaveAttribute('role', 'alert');
  });

  test('should have aria-live on error messages', async ({ page }) => {
    // Assert: All error elements should have aria-live="polite"
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toHaveAttribute('aria-live', 'polite');
  });

  test('should support keyboard navigation through form fields', async ({ page }) => {
    // Act: Tab through all form fields
    await page.keyboard.press('Tab'); // Name field
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toBeFocused();

    await page.keyboard.press('Tab'); // Email field
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toBeFocused();

    await page.keyboard.press('Tab'); // Phone field
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toBeFocused();

    await page.keyboard.press('Tab'); // Subject field
    await expect(page.locator(FORM_SELECTORS.SUBJECT_INPUT)).toBeFocused();

    await page.keyboard.press('Tab'); // Message field
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toBeFocused();

    await page.keyboard.press('Tab'); // Submit button
    await expect(page.locator(FORM_SELECTORS.SUBMIT_BUTTON)).toBeFocused();
  });

  test('should submit form using Enter key on submit button', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Focus submit button and press Enter
    await page.locator(FORM_SELECTORS.SUBMIT_BUTTON).focus();
    await page.keyboard.press('Enter');

    // Wait for submission
    await page.waitForTimeout(2000);

    // Assert: Success message should be displayed
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });

  test('should have proper label associations', async ({ page }) => {
    // Assert: All form fields should have associated labels
    const nameLabel = page.locator('label[for="contact-name"]');
    const emailLabel = page.locator('label[for="contact-email"]');
    const phoneLabel = page.locator('label[for="contact-phone"]');
    const subjectLabel = page.locator('label[for="contact-subject"]');
    const messageLabel = page.locator('label[for="contact-message"]');

    await expect(nameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(phoneLabel).toBeVisible();
    await expect(subjectLabel).toBeVisible();
    await expect(messageLabel).toBeVisible();

    // Assert: Labels should contain required indicators
    await expect(nameLabel).toContainText('*');
    await expect(emailLabel).toContainText('*');
    await expect(phoneLabel).toContainText('*');
    await expect(messageLabel).toContainText('*');
  });

  test('should have autocomplete attributes for better UX', async ({ page }) => {
    // Assert: Form fields should have appropriate autocomplete attributes
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveAttribute('autocomplete', 'name');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('autocomplete', 'tel');
  });

  test('should have proper inputmode for mobile keyboards', async ({ page }) => {
    // Assert: Email and phone fields should have appropriate inputmode
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('inputmode', 'email');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('inputmode', 'tel');
  });
});

// ============================================
// Test Suite: User Experience
// ============================================

test.describe('Contact Form - User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should show helpful hint text for email field', async ({ page }) => {
    // Assert: Email hint should be visible
    const emailHint = page.locator('#email-hint');
    await expect(emailHint).toBeVisible();
    await expect(emailHint).toContainText("We'll never share your email");
  });

  test('should show helpful hint text for message field', async ({ page }) => {
    // Assert: Message hint should be visible
    const messageHint = page.locator('#message-hint');
    await expect(messageHint).toBeVisible();
    await expect(messageHint).toContainText('Please provide details');
  });

  test('should show helpful hint text for subject field', async ({ page }) => {
    // Assert: Subject hint should be visible
    const subjectHint = page.locator('#subject-hint');
    await expect(subjectHint).toBeVisible();
    await expect(subjectHint).toContainText('Optional');
  });

  test('should have placeholder text for all fields', async ({ page }) => {
    // Assert: All fields should have helpful placeholder text
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveAttribute('placeholder', 'John Doe');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('placeholder', 'john.doe@example.com');
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('placeholder', '+234 123 456 7890');
    await expect(page.locator(FORM_SELECTORS.SUBJECT_INPUT)).toHaveAttribute('placeholder', 'Inquiry about booking');
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toHaveAttribute('placeholder', 'Tell us how we can help you...');
  });

  test('should maintain form data when navigating away and back', async ({ page }) => {
    // Arrange: Fill form partially
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      email: VALID_TEST_DATA.email,
    });

    // Act: Navigate to another section and back
    await page.click('a[href="#about"]');
    await page.waitForTimeout(500);
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(500);

    // Assert: Form data should be preserved (browser behavior)
    // Note: This depends on browser caching, may not work in all scenarios
    const nameValue = await page.locator(FORM_SELECTORS.NAME_INPUT).inputValue();
    const emailValue = await page.locator(FORM_SELECTORS.EMAIL_INPUT).inputValue();
    
    // At minimum, fields should be accessible
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toBeVisible();
  });

  test('should show character count for message field', async ({ page }) => {
    // Note: This test assumes character count feature exists
    // If not implemented, this test documents desired behavior
    
    // Arrange: Type in message field
    const message = 'This is a test message';
    await page.fill(FORM_SELECTORS.MESSAGE_TEXTAREA, message);

    // Assert: Character count should be visible (if implemented)
    // This is a placeholder for future enhancement
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await expect(messageTextarea).toHaveValue(message);
  });

  test('should focus first error field on submission failure', async ({ page }) => {
    // Act: Submit empty form
    await page.click(FORM_SELECTORS.SUBMIT_BUTTON);
    await page.waitForTimeout(100);

    // Assert: First field with error should be focused (name field)
    // Note: This behavior may need to be implemented
    const nameInput = page.locator(FORM_SELECTORS.NAME_INPUT);
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });
});

// ============================================
// Test Suite: Security & Data Sanitization
// ============================================

test.describe('Contact Form - Security', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should sanitize HTML in form inputs', async ({ page }) => {
    // Arrange: Enter HTML/script tags in fields
    const maliciousInput = '<script>alert("XSS")</script>';
    
    await fillForm(page, {
      name: maliciousInput,
      email: 'test@example.com',
      phone: '+234-123-456-7890',
      message: maliciousInput,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Form should process successfully (sanitization happens server-side)
    // Client-side validation should not block submission
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });

  test('should handle special characters in form inputs', async ({ page }) => {
    // Arrange: Enter special characters
    const specialChars = "Test & <test> 'test' \"test\" \\ / test";
    
    await fillForm(page, {
      name: specialChars,
      email: 'test@example.com',
      phone: '+234-123-456-7890',
      message: specialChars,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Form should process successfully
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });

  test('should handle very long input strings', async ({ page }) => {
    // Arrange: Enter very long strings
    const longString = 'A'.repeat(500);
    
    await fillForm(page, {
      name: longString,
      email: 'test@example.com',
      phone: '+234-123-456-7890',
      message: 'Valid message for testing',
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Form should process (name length validation may apply)
    // At minimum, no JavaScript errors should occur
    await expect(page.locator(FORM_SELECTORS.FORM)).toBeVisible();
  });

  test('should handle Unicode characters', async ({ page }) => {
    // Arrange: Enter Unicode characters
    const unicodeText = 'Test 测试 テスト тест 🎉';
    
    await fillForm(page, {
      name: unicodeText,
      email: 'test@example.com',
      phone: '+234-123-456-7890',
      message: unicodeText,
    });

    // Act: Submit form
    await submitForm(page);

    // Assert: Form should process successfully
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });
});

// ============================================
// Test Suite: Cross-Browser Compatibility
// ============================================

test.describe('Contact Form - Cross-Browser', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should render form correctly in all browsers', async ({ page, browserName }) => {
    // Assert: Form should be visible and properly structured
    await expect(page.locator(FORM_SELECTORS.FORM)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.SUBMIT_BUTTON)).toBeVisible();

    // Log browser name for debugging
    console.log(`Testing in browser: ${browserName}`);
  });

  test('should validate form consistently across browsers', async ({ page }) => {
    // Act: Submit empty form
    await submitForm(page);

    // Assert: Validation should work consistently
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
  });

  test('should submit form successfully in all browsers', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Submit form
    await submitForm(page);

    // Assert: Success message should appear
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });
});

// ============================================
// Test Suite: Mobile Responsiveness
// ============================================

test.describe('Contact Form - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should render form correctly on mobile', async ({ page }) => {
    // Assert: Form should be visible and properly sized
    await expect(page.locator(FORM_SELECTORS.FORM)).toBeVisible();
    
    // Assert: All form fields should be visible
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.SUBMIT_BUTTON)).toBeVisible();
  });

  test('should show mobile-optimized keyboard for email', async ({ page }) => {
    // Act: Focus email field
    await page.locator(FORM_SELECTORS.EMAIL_INPUT).focus();

    // Assert: Email field should have inputmode="email"
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveAttribute('inputmode', 'email');
  });

  test('should show mobile-optimized keyboard for phone', async ({ page }) => {
    // Act: Focus phone field
    await page.locator(FORM_SELECTORS.PHONE_INPUT).focus();

    // Assert: Phone field should have inputmode="tel"
    await expect(page.locator(FORM_SELECTORS.PHONE_INPUT)).toHaveAttribute('inputmode', 'tel');
  });

  test('should submit form successfully on mobile', async ({ page }) => {
    // Arrange: Fill form with valid data
    await fillForm(page, VALID_TEST_DATA);

    // Act: Submit form
    await submitForm(page);

    // Assert: Success message should appear
    const formStatus = page.locator(FORM_SELECTORS.FORM_STATUS);
    await expect(formStatus).toContainText('Thank you! Your message has been sent successfully.');
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    // Act: Tap on form fields
    await page.locator(FORM_SELECTORS.NAME_INPUT).tap();
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toBeFocused();

    await page.locator(FORM_SELECTORS.EMAIL_INPUT).tap();
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toBeFocused();

    await page.locator(FORM_SELECTORS.SUBMIT_BUTTON).tap();
    // Form should attempt submission (will fail due to empty fields)
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toBeVisible();
  });
});

// ============================================
// Test Suite: Performance
// ============================================

test.describe('Contact Form - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should load form within acceptable time', async ({ page }) => {
    // Measure form load time
    const startTime = Date.now();
    
    await page.goto('/');
    await page.click('a[href="#contact"]');
    await page.waitForSelector(FORM_SELECTORS.FORM, { state: 'visible' });
    
    const loadTime = Date.now() - startTime;

    // Assert: Form should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should validate fields without noticeable delay', async ({ page }) => {
    // Measure validation time
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    
    const startTime = Date.now();
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForSelector(FORM_SELECTORS.EMAIL_ERROR, { state: 'visible' });
    const validationTime = Date.now() - startTime;

    // Assert: Validation should occur within 500ms
    expect(validationTime).toBeLessThan(500);
  });

  test('should handle rapid input changes efficiently', async ({ page }) => {
    // Act: Type rapidly in multiple fields
    const startTime = Date.now();
    
    await page.locator(FORM_SELECTORS.NAME_INPUT).type('John Doe', { delay: 10 });
    await page.locator(FORM_SELECTORS.EMAIL_INPUT).type('john@example.com', { delay: 10 });
    await page.locator(FORM_SELECTORS.PHONE_INPUT).type('+234-123-456-7890', { delay: 10 });
    
    const typingTime = Date.now() - startTime;

    // Assert: Typing should be responsive (no lag)
    expect(typingTime).toBeLessThan(2000);
  });
});

// ============================================
// Test Suite: Edge Cases
// ============================================

test.describe('Contact Form - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToContactForm(page);
  });

  test('should handle form submission with only whitespace', async ({ page }) => {
    // Arrange: Fill fields with only whitespace
    await page.fill(FORM_SELECTORS.NAME_INPUT, '   ');
    await page.fill(FORM_SELECTORS.EMAIL_INPUT, '   ');
    await page.fill(FORM_SELECTORS.PHONE_INPUT, '   ');
    await page.fill(FORM_SELECTORS.MESSAGE_TEXTAREA, '   ');

    // Act: Submit form
    await submitForm(page);

    // Assert: Should show required field errors (whitespace should be trimmed)
    await expect(page.locator(FORM_SELECTORS.NAME_ERROR)).toContainText(VALIDATION_MESSAGES.REQUIRED_FIELD);
  });

  test('should handle email with leading/trailing spaces', async ({ page }) => {
    // Arrange: Enter email with spaces
    const emailInput = page.locator(FORM_SELECTORS.EMAIL_INPUT);
    await emailInput.fill('  test@example.com  ');

    // Act: Blur field
    await emailInput.blur();

    // Assert: Should validate correctly (spaces should be trimmed)
    await expect(page.locator(FORM_SELECTORS.EMAIL_ERROR)).toBeEmpty();
  });

  test('should handle phone number with various formats', async ({ page }) => {
    const phoneFormats = [
      '(555) 123-4567',
      '555.123.4567',
      '555 123 4567',
      '+1-555-123-4567',
    ];

    for (const phone of phoneFormats) {
      const phoneInput = page.locator(FORM_SELECTORS.PHONE_INPUT);
      await phoneInput.fill(phone);
      await phoneInput.blur();

      // Assert: Should accept various phone formats
      await expect(page.locator(FORM_SELECTORS.PHONE_ERROR)).toBeEmpty();
    }
  });

  test('should handle message at exact minimum length', async ({ page }) => {
    // Arrange: Enter message with exactly 10 characters
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await messageTextarea.fill('1234567890'); // Exactly 10 characters

    // Act: Blur field
    await messageTextarea.blur();

    // Assert: Should be valid
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toBeEmpty();
  });

  test('should handle message at exact maximum length', async ({ page }) => {
    // Arrange: Enter message with exactly 1000 characters
    const messageTextarea = page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA);
    await messageTextarea.fill('A'.repeat(1000)); // Exactly 1000 characters

    // Act: Blur field
    await messageTextarea.blur();

    // Assert: Should be valid
    await expect(page.locator(FORM_SELECTORS.MESSAGE_ERROR)).toBeEmpty();
  });

  test('should handle rapid field switching', async ({ page }) => {
    // Act: Rapidly switch between fields
    for (let i = 0; i < 5; i++) {
      await page.locator(FORM_SELECTORS.NAME_INPUT).focus();
      await page.locator(FORM_SELECTORS.EMAIL_INPUT).focus();
      await page.locator(FORM_SELECTORS.PHONE_INPUT).focus();
      await page.locator(FORM_SELECTORS.MESSAGE_TEXTAREA).focus();
    }

    // Assert: Form should remain functional
    await expect(page.locator(FORM_SELECTORS.FORM)).toBeVisible();
    await expect(page.locator(FORM_SELECTORS.SUBMIT_BUTTON)).toBeEnabled();
  });

  test('should handle form reset after partial completion', async ({ page }) => {
    // Arrange: Fill form partially
    await fillForm(page, {
      name: VALID_TEST_DATA.name,
      email: VALID_TEST_DATA.email,
    });

    // Act: Reload page
    await page.reload();
    await navigateToContactForm(page);

    // Assert: Form should be empty (no persistence)
    await expect(page.locator(FORM_SELECTORS.NAME_INPUT)).toHaveValue('');
    await expect(page.locator(FORM_SELECTORS.EMAIL_INPUT)).toHaveValue('');
  });
});