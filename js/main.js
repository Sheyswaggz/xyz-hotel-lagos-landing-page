/**
 * XYZ Hotel Lagos - Main JavaScript Module
 * Interactive functionality for landing page
 * 
 * Features:
 * - Mobile menu toggle with ARIA support
 * - Smooth scroll navigation
 * - Image gallery lightbox with keyboard navigation
 * - Contact form validation with real-time feedback
 * - Lazy loading for images
 * - Scroll animations using Intersection Observer
 * 
 * @module main
 * @version 1.0.0
 */

// ============================================
// Configuration & Constants
// ============================================

const CONFIG = Object.freeze({
  ANIMATION: {
    SCROLL_BEHAVIOR: 'smooth',
    DEBOUNCE_DELAY: 150,
    INTERSECTION_THRESHOLD: 0.1,
    INTERSECTION_ROOT_MARGIN: '50px',
  },
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[\+]?[0-9\s\-()]+$/,
    NAME_MIN_LENGTH: 2,
    MESSAGE_MIN_LENGTH: 10,
    MESSAGE_MAX_LENGTH: 1000,
  },
  SELECTORS: {
    NAV: 'nav',
    NAV_LINKS: 'nav a[href^="#"]',
    GALLERY_ITEMS: '[data-gallery] .gallery-item img',
    CONTACT_FORM: '[data-contact-form]',
    FORM_STATUS: '[data-form-status]',
    SUBMIT_BUTTON: '[data-submit-button]',
    LAZY_IMAGES: 'img[loading="lazy"]',
    ANIMATED_SECTIONS: 'section',
  },
  CLASSES: {
    ACTIVE: 'active',
    VISIBLE: 'visible',
    ERROR: 'error',
    SUCCESS: 'success',
    LOADING: 'loading',
  },
  ARIA: {
    EXPANDED: 'aria-expanded',
    INVALID: 'aria-invalid',
    BUSY: 'aria-busy',
    HIDDEN: 'aria-hidden',
  },
});

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} Sanitized input string
 */
const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => CONFIG.VALIDATION.EMAIL_PATTERN.test(email);

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const isValidPhone = (phone) => CONFIG.VALIDATION.PHONE_PATTERN.test(phone);

/**
 * Show error message for form field
 * @param {HTMLElement} field - Input field element
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showFieldError = (field, message) => {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.textContent = message;
    field.setAttribute(CONFIG.ARIA.INVALID, 'true');
    field.classList.add(CONFIG.CLASSES.ERROR);
  }
};

/**
 * Clear error message for form field
 * @param {HTMLElement} field - Input field element
 * @returns {void}
 */
const clearFieldError = (field) => {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.textContent = '';
    field.setAttribute(CONFIG.ARIA.INVALID, 'false');
    field.classList.remove(CONFIG.CLASSES.ERROR);
  }
};

// ============================================
// Mobile Menu Toggle
// ============================================

/**
 * Initialize mobile menu functionality
 * @returns {void}
 */
const initMobileMenu = () => {
  const nav = document.querySelector(CONFIG.SELECTORS.NAV);
  if (!nav) return;

  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-menu';
  hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  hamburger.setAttribute(CONFIG.ARIA.EXPANDED, 'false');
  hamburger.innerHTML = `
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
  `;

  // Insert hamburger before nav
  nav.parentElement.insertBefore(hamburger, nav);

  // Toggle menu on click
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute(CONFIG.ARIA.EXPANDED) === 'true';
    hamburger.setAttribute(CONFIG.ARIA.EXPANDED, String(!isExpanded));
    nav.classList.toggle(CONFIG.CLASSES.ACTIVE);
  });

  // Close menu when clicking nav links
  const navLinks = nav.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.setAttribute(CONFIG.ARIA.EXPANDED, 'false');
      nav.classList.remove(CONFIG.CLASSES.ACTIVE);
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains(CONFIG.CLASSES.ACTIVE)) {
      hamburger.setAttribute(CONFIG.ARIA.EXPANDED, 'false');
      nav.classList.remove(CONFIG.CLASSES.ACTIVE);
    }
  });
};

// ============================================
// Smooth Scroll Navigation
// ============================================

/**
 * Initialize smooth scroll for navigation links
 * @returns {void}
 */
const initSmoothScroll = () => {
  const navLinks = document.querySelectorAll(CONFIG.SELECTORS.NAV_LINKS);

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: CONFIG.ANIMATION.SCROLL_BEHAVIOR,
          block: 'start',
        });

        // Update active nav item
        navLinks.forEach((l) => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');

        // Update URL without triggering scroll
        history.pushState(null, '', targetId);
      }
    });
  });

  // Update active nav on scroll
  const updateActiveNav = debounce(() => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }, CONFIG.ANIMATION.DEBOUNCE_DELAY);

  window.addEventListener('scroll', updateActiveNav);
};

// ============================================
// Image Gallery Lightbox
// ============================================

/**
 * Initialize image gallery lightbox functionality
 * @returns {void}
 */
const initGalleryLightbox = () => {
  const galleryImages = document.querySelectorAll(CONFIG.SELECTORS.GALLERY_ITEMS);
  if (galleryImages.length === 0) return;

  let currentIndex = 0;
  const imageArray = Array.from(galleryImages);

  // Create lightbox modal
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image gallery lightbox');
  lightbox.setAttribute(CONFIG.ARIA.HIDDEN, 'true');
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox-prev" aria-label="Previous image">&lsaquo;</button>
      <img src="" alt="" class="lightbox-image">
      <button class="lightbox-next" aria-label="Next image">&rsaquo;</button>
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const overlay = lightbox.querySelector('.lightbox-overlay');

  /**
   * Show lightbox with specific image
   * @param {number} index - Index of image to display
   * @returns {void}
   */
  const showLightbox = (index) => {
    currentIndex = index;
    const img = imageArray[index];
    const figure = img.closest('figure');
    const caption = figure ? figure.querySelector('figcaption') : null;

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : img.alt;

    lightbox.classList.add(CONFIG.CLASSES.ACTIVE);
    lightbox.setAttribute(CONFIG.ARIA.HIDDEN, 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    closeBtn.focus();
  };

  /**
   * Close lightbox
   * @returns {void}
   */
  const closeLightbox = () => {
    lightbox.classList.remove(CONFIG.CLASSES.ACTIVE);
    lightbox.setAttribute(CONFIG.ARIA.HIDDEN, 'true');
    document.body.style.overflow = '';
  };

  /**
   * Show next image
   * @returns {void}
   */
  const showNext = () => {
    currentIndex = (currentIndex + 1) % imageArray.length;
    showLightbox(currentIndex);
  };

  /**
   * Show previous image
   * @returns {void}
   */
  const showPrev = () => {
    currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
    showLightbox(currentIndex);
  };

  // Add click handlers to gallery images
  galleryImages.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    
    img.addEventListener('click', () => showLightbox(index));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showLightbox(index);
      }
    });
  });

  // Lightbox controls
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains(CONFIG.CLASSES.ACTIVE)) {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          showPrev();
          break;
        case 'ArrowRight':
          showNext();
          break;
      }
    }
  });
};

// ============================================
// Contact Form Validation
// ============================================

/**
 * Validate form field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} True if field is valid
 */
const validateField = (field) => {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = '';

  switch (fieldName) {
    case 'name':
      if (value.length < CONFIG.VALIDATION.NAME_MIN_LENGTH) {
        isValid = false;
        errorMessage = `Name must be at least ${CONFIG.VALIDATION.NAME_MIN_LENGTH} characters`;
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
      break;

    case 'phone':
      if (!isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
      break;

    case 'message':
      if (value.length < CONFIG.VALIDATION.MESSAGE_MIN_LENGTH) {
        isValid = false;
        errorMessage = `Message must be at least ${CONFIG.VALIDATION.MESSAGE_MIN_LENGTH} characters`;
      } else if (value.length > CONFIG.VALIDATION.MESSAGE_MAX_LENGTH) {
        isValid = false;
        errorMessage = `Message must not exceed ${CONFIG.VALIDATION.MESSAGE_MAX_LENGTH} characters`;
      }
      break;
  }

  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }

  if (isValid) {
    clearFieldError(field);
  } else {
    showFieldError(field, errorMessage);
  }

  return isValid;
};

/**
 * Initialize contact form validation
 * @returns {void}
 */
const initFormValidation = () => {
  const form = document.querySelector(CONFIG.SELECTORS.CONTACT_FORM);
  if (!form) return;

  const formStatus = document.querySelector(CONFIG.SELECTORS.FORM_STATUS);
  const submitButton = form.querySelector(CONFIG.SELECTORS.SUBMIT_BUTTON);
  const fields = form.querySelectorAll('input[required], textarea[required]');

  // Real-time validation on input
  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', debounce(() => {
      if (field.classList.contains(CONFIG.CLASSES.ERROR)) {
        validateField(field);
      }
    }, CONFIG.ANIMATION.DEBOUNCE_DELAY));
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isFormValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      formStatus.textContent = 'Please correct the errors above';
      formStatus.className = `form-status ${CONFIG.CLASSES.ERROR}`;
      return;
    }

    // Sanitize form data
    const formData = new FormData(form);
    const sanitizedData = {};
    formData.forEach((value, key) => {
      sanitizedData[key] = sanitizeInput(value);
    });

    // Show loading state
    submitButton.setAttribute(CONFIG.ARIA.BUSY, 'true');
    submitButton.disabled = true;
    submitButton.classList.add(CONFIG.CLASSES.LOADING);

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      formStatus.textContent = 'Thank you! Your message has been sent successfully.';
      formStatus.className = `form-status ${CONFIG.CLASSES.SUCCESS}`;
      form.reset();
      fields.forEach((field) => clearFieldError(field));
    } catch (error) {
      // Error handling
      formStatus.textContent = 'Sorry, there was an error sending your message. Please try again.';
      formStatus.className = `form-status ${CONFIG.CLASSES.ERROR}`;
    } finally {
      // Reset button state
      submitButton.setAttribute(CONFIG.ARIA.BUSY, 'false');
      submitButton.disabled = false;
      submitButton.classList.remove(CONFIG.CLASSES.LOADING);
    }
  });
};

// ============================================
// Lazy Loading Images
// ============================================

/**
 * Initializes lazy loading for images using Intersection Observer
 * @returns {void}
 */
const initLazyLoading = () => {
  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const lazyImages = document.querySelectorAll(CONFIG.SELECTORS.LAZY_IMAGES);

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }

          img.classList.add(CONFIG.CLASSES.VISIBLE);
          imageObserver.unobserve(img);
        }
      });
    },
    {
      rootMargin: CONFIG.ANIMATION.INTERSECTION_ROOT_MARGIN,
      threshold: CONFIG.ANIMATION.INTERSECTION_THRESHOLD,
    }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
};

// ============================================
// Scroll Animations
// ============================================

/**
 * Initializes scroll animations for sections
 * @returns {void}
 */
const initScrollAnimations = () => {
  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all sections immediately
    const sections = document.querySelectorAll(CONFIG.SELECTORS.ANIMATED_SECTIONS);
    sections.forEach((section) => section.classList.add(CONFIG.CLASSES.VISIBLE));
    return;
  }

  const sections = document.querySelectorAll(CONFIG.SELECTORS.ANIMATED_SECTIONS);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(CONFIG.CLASSES.VISIBLE);
          // Continue observing for animations that should repeat
        }
      });
    },
    {
      rootMargin: CONFIG.ANIMATION.INTERSECTION_ROOT_MARGIN,
      threshold: CONFIG.ANIMATION.INTERSECTION_THRESHOLD,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
};

// ============================================
// Initialization
// ============================================

/**
 * Initialize all interactive features
 * @returns {void}
 */
const init = () => {
  try {
    initMobileMenu();
    initSmoothScroll();
    initGalleryLightbox();
    initFormValidation();
    initLazyLoading();
    initScrollAnimations();
  } catch (error) {
    // Fail gracefully - log error but don't break the page
    if (typeof console !== 'undefined' && console.error) {
      console.error('Error initializing interactive features:', error);
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('unload', () => {
  // Remove event listeners to prevent memory leaks
  const nav = document.querySelector(CONFIG.SELECTORS.NAV);
  if (nav) {
    nav.classList.remove(CONFIG.CLASSES.ACTIVE);
  }
});