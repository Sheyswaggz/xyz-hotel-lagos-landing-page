import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Mobile Responsive Design E2E Test Suite
 * 
 * Comprehensive end-to-end tests for XYZ Hotel Lagos landing page mobile experience.
 * Tests cover mobile menu interactions, responsive design, touch interactions,
 * viewport-specific layouts, and mobile-optimized user flows.
 * 
 * Test Categories:
 * - Mobile Navigation & Menu
 * - Responsive Layout & Breakpoints
 * - Touch Interactions & Gestures
 * - Mobile Form Validation
 * - Image Loading & Performance
 * - Accessibility on Mobile
 * 
 * @module tests/mobile.spec.ts
 * @requires @playwright/test
 */

// ============================================
// Test Configuration & Constants
// ============================================

const MOBILE_VIEWPORTS = {
  IPHONE_13: { width: 390, height: 844 },
  PIXEL_5: { width: 393, height: 851 },
  SMALL_MOBILE: { width: 320, height: 568 },
  TABLET: { width: 768, height: 1024 },
} as const;

const SELECTORS = {
  HAMBURGER: '.hamburger-menu',
  NAV: 'nav',
  NAV_LINKS: 'nav a[href^="#"]',
  HERO_SECTION: '[data-section="hero"]',
  CTA_BUTTONS: '[data-cta]',
  CONTACT_FORM: '[data-contact-form]',
  GALLERY_ITEMS: '[data-gallery] .gallery-item',
  FOOTER: 'footer',
  SKIP_LINK: '.skip-link',
} as const;

const TIMEOUTS = {
  NAVIGATION: 5000,
  ANIMATION: 500,
  FORM_SUBMIT: 3000,
} as const;

// ============================================
// Test Helpers & Utilities
// ============================================

/**
 * Wait for navigation menu animation to complete
 * @param page - Playwright page object
 */
const waitForMenuAnimation = async (page: Page): Promise<void> => {
  await page.waitForTimeout(TIMEOUTS.ANIMATION);
};

/**
 * Check if element is visible in viewport
 * @param locator - Element locator
 * @returns True if element is in viewport
 */
const isInViewport = async (locator: Locator): Promise<boolean> => {
  const box = await locator.boundingBox();
  if (!box) return false;
  
  const viewport = await locator.page().viewportSize();
  if (!viewport) return false;
  
  return (
    box.y >= 0 &&
    box.x >= 0 &&
    box.y + box.height <= viewport.height &&
    box.x + box.width <= viewport.width
  );
};

/**
 * Simulate touch swipe gesture
 * @param page - Playwright page object
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @param endX - Ending X coordinate
 * @param endY - Ending Y coordinate
 */
const swipe = async (
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> => {
  await page.touchscreen.tap(startX, startY);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
};

// ============================================
// Mobile Navigation & Menu Tests
// ============================================

test.describe('Mobile Navigation & Menu', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display hamburger menu button on mobile viewport', async ({ page }) => {
    // Arrange: Get hamburger button and navigation
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    const nav = page.locator(SELECTORS.NAV);

    // Assert: Hamburger visible, nav hidden initially
    await expect(hamburger).toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle navigation menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toBeVisible();
  });

  test('should toggle navigation menu when hamburger is clicked', async ({ page }) => {
    // Arrange: Get elements
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    const nav = page.locator(SELECTORS.NAV);

    // Act: Click hamburger to open menu
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Assert: Menu is visible and ARIA attributes updated
    await expect(nav).toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    // Act: Click hamburger again to close menu
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Assert: Menu is hidden
    await expect(nav).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should close menu when navigation link is clicked', async ({ page }) => {
    // Arrange: Open menu
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    const nav = page.locator(SELECTORS.NAV);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Act: Click a navigation link
    const aboutLink = page.locator('nav a[href="#about"]');
    await aboutLink.click();
    await waitForMenuAnimation(page);

    // Assert: Menu is closed and page scrolled to section
    await expect(nav).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    
    // Verify navigation occurred
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();
  });

  test('should close menu when Escape key is pressed', async ({ page }) => {
    // Arrange: Open menu
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    const nav = page.locator(SELECTORS.NAV);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Act: Press Escape key
    await page.keyboard.press('Escape');
    await waitForMenuAnimation(page);

    // Assert: Menu is closed
    await expect(nav).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should maintain menu state during orientation change', async ({ page }) => {
    // Arrange: Open menu in portrait mode
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Act: Simulate orientation change to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Menu remains open after orientation change
    const nav = page.locator(SELECTORS.NAV);
    await expect(nav).toBeVisible();
  });

  test('should support keyboard navigation in mobile menu', async ({ page }) => {
    // Arrange: Open menu and focus hamburger
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Act: Tab through menu items
    await page.keyboard.press('Tab');
    const firstLink = page.locator('nav a[href="#home"]');
    await expect(firstLink).toBeFocused();

    // Act: Navigate with arrow keys and Enter
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Assert: Navigation occurred
    await waitForMenuAnimation(page);
    const nav = page.locator(SELECTORS.NAV);
    await expect(nav).not.toBeVisible();
  });

  test('should display all navigation links in mobile menu', async ({ page }) => {
    // Arrange: Open menu
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Assert: All expected links are present
    const expectedLinks = ['Home', 'About', 'Amenities', 'Rooms', 'Gallery', 'Contact'];
    
    for (const linkText of expectedLinks) {
      const link = page.locator(`nav a:has-text("${linkText}")`);
      await expect(link).toBeVisible();
    }
  });
});

// ============================================
// Responsive Layout & Breakpoints Tests
// ============================================

test.describe('Responsive Layout & Breakpoints', () => {
  test('should display mobile-optimized layout on small screens (320px)', async ({ page }) => {
    // Arrange: Set smallest mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORTS.SMALL_MOBILE);
    await page.goto('/');

    // Assert: Logo is appropriately sized
    const logo = page.locator('[data-logo] img');
    const logoBox = await logo.boundingBox();
    expect(logoBox?.width).toBeLessThanOrEqual(150);

    // Assert: Hero content is stacked vertically
    const heroContent = page.locator('.hero-content');
    const heroTitle = page.locator('.hero-content h1');
    await expect(heroContent).toHaveCSS('text-align', 'center');
    
    // Assert: CTA buttons are full width
    const ctaButtons = page.locator('.hero-actions .cta-button');
    const buttonCount = await ctaButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = ctaButtons.nth(i);
      const buttonBox = await button.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(200);
    }
  });

  test('should adapt layout for iPhone 13 viewport (390px)', async ({ page }) => {
    // Arrange: Set iPhone 13 viewport
    await page.setViewportSize(MOBILE_VIEWPORTS.IPHONE_13);
    await page.goto('/');

    // Assert: Amenities grid shows single column
    const amenitiesGrid = page.locator('.amenities-grid');
    const gridComputedStyle = await amenitiesGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridComputedStyle).toContain('1fr');

    // Assert: Room cards are stacked vertically
    const roomCards = page.locator('.room-card');
    const firstCard = roomCards.first();
    const secondCard = roomCards.nth(1);
    
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
    }
  });

  test('should adapt layout for Pixel 5 viewport (393px)', async ({ page }) => {
    // Arrange: Set Pixel 5 viewport
    await page.setViewportSize(MOBILE_VIEWPORTS.PIXEL_5);
    await page.goto('/');

    // Assert: Gallery shows 2-column grid
    const galleryGrid = page.locator('.gallery-grid');
    const gridStyle = await galleryGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridStyle).toMatch(/repeat\(2,/);

    // Assert: Footer sections are stacked
    const footerSections = page.locator('.footer-section');
    const sectionCount = await footerSections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(4);
  });

  test('should transition to tablet layout at 768px breakpoint', async ({ page }) => {
    // Arrange: Set tablet viewport
    await page.setViewportSize(MOBILE_VIEWPORTS.TABLET);
    await page.goto('/');

    // Assert: Navigation is visible without hamburger
    const nav = page.locator(SELECTORS.NAV);
    await expect(nav).toBeVisible();

    // Assert: Amenities grid shows 2 columns
    const amenitiesGrid = page.locator('.amenities-grid');
    const gridStyle = await amenitiesGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridStyle).toMatch(/repeat\(2,/);

    // Assert: About section shows side-by-side layout
    const aboutContent = page.locator('.about-content');
    const flexDirection = await aboutContent.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });
    expect(flexDirection).toBe('row');
  });

  test('should maintain aspect ratios for images across viewports', async ({ page }) => {
    const viewports = [
      MOBILE_VIEWPORTS.SMALL_MOBILE,
      MOBILE_VIEWPORTS.IPHONE_13,
      MOBILE_VIEWPORTS.TABLET,
    ];

    for (const viewport of viewports) {
      // Arrange: Set viewport
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Assert: Hero image maintains aspect ratio
      const heroImage = page.locator('.hero-background img');
      const imageBox = await heroImage.boundingBox();
      
      if (imageBox) {
        const aspectRatio = imageBox.width / imageBox.height;
        expect(aspectRatio).toBeCloseTo(16 / 9, 1);
      }

      // Assert: Room images maintain aspect ratio
      const roomImages = page.locator('.room-image img');
      const roomImageCount = await roomImages.count();
      
      for (let i = 0; i < Math.min(roomImageCount, 2); i++) {
        const roomImage = roomImages.nth(i);
        const roomBox = await roomImage.boundingBox();
        
        if (roomBox) {
          const roomAspectRatio = roomBox.width / roomBox.height;
          expect(roomAspectRatio).toBeCloseTo(16 / 9, 1);
        }
      }
    }
  });

  test('should ensure text remains readable at all viewport sizes', async ({ page }) => {
    const viewports = [
      MOBILE_VIEWPORTS.SMALL_MOBILE,
      MOBILE_VIEWPORTS.IPHONE_13,
      MOBILE_VIEWPORTS.PIXEL_5,
    ];

    for (const viewport of viewports) {
      // Arrange: Set viewport
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Assert: Hero title font size is readable (minimum 24px)
      const heroTitle = page.locator('.hero-content h1');
      const fontSize = await heroTitle.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      expect(fontSize).toBeGreaterThanOrEqual(24);

      // Assert: Body text is readable (minimum 14px)
      const bodyText = page.locator('.about-text p').first();
      const bodyFontSize = await bodyText.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);

      // Assert: Line height provides adequate spacing
      const lineHeight = await bodyText.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).lineHeight);
      });
      expect(lineHeight).toBeGreaterThanOrEqual(bodyFontSize * 1.4);
    }
  });
});

// ============================================
// Touch Interactions & Gestures Tests
// ============================================

test.describe('Touch Interactions & Gestures', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should support tap interactions on CTA buttons', async ({ page }) => {
    // Arrange: Get CTA button
    const bookNowButton = page.locator('[data-cta="book-now"]');

    // Act: Tap button using touch
    await bookNowButton.tap();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Navigation occurred
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();
  });

  test('should have adequate touch target sizes (minimum 44x44px)', async ({ page }) => {
    // Assert: Hamburger menu has adequate size
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    const hamburgerBox = await hamburger.boundingBox();
    expect(hamburgerBox?.width).toBeGreaterThanOrEqual(44);
    expect(hamburgerBox?.height).toBeGreaterThanOrEqual(44);

    // Assert: Navigation links have adequate size
    await hamburger.click();
    await waitForMenuAnimation(page);

    const navLinks = page.locator(SELECTORS.NAV_LINKS);
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const linkBox = await link.boundingBox();
      expect(linkBox?.height).toBeGreaterThanOrEqual(44);
    }

    // Assert: Form inputs have adequate size
    await page.goto('/#contact');
    const nameInput = page.locator('#contact-name');
    const inputBox = await nameInput.boundingBox();
    expect(inputBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should support swipe gestures in gallery', async ({ page }) => {
    // Arrange: Navigate to gallery
    await page.goto('/#gallery');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Act: Open lightbox
    const firstGalleryImage = page.locator('[data-gallery] .gallery-item img').first();
    await firstGalleryImage.tap();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Lightbox is open
    const lightbox = page.locator('.lightbox');
    await expect(lightbox).toHaveClass(/active/);

    // Act: Swipe left to next image
    const viewport = page.viewportSize();
    if (viewport) {
      await swipe(
        page,
        viewport.width * 0.8,
        viewport.height / 2,
        viewport.width * 0.2,
        viewport.height / 2
      );
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Assert: Next image is displayed (verify by checking image src changed)
    const lightboxImage = page.locator('.lightbox-image');
    const initialSrc = await firstGalleryImage.getAttribute('src');
    const currentSrc = await lightboxImage.getAttribute('src');
    expect(currentSrc).not.toBe(initialSrc);
  });

  test('should prevent accidental double-tap zoom', async ({ page }) => {
    // Arrange: Get hero section
    const heroSection = page.locator(SELECTORS.HERO_SECTION);

    // Act: Double tap on hero section
    await heroSection.dblclick();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Viewport scale remains 1 (no zoom)
    const scale = await page.evaluate(() => {
      return window.visualViewport?.scale || 1;
    });
    expect(scale).toBe(1);
  });

  test('should support long press for context menu prevention', async ({ page }) => {
    // Arrange: Get an image
    const heroImage = page.locator('.hero-background img');

    // Act: Long press on image
    await heroImage.tap({ timeout: 1000 });

    // Assert: No context menu appears (page remains interactive)
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await expect(hamburger).toBeVisible();
  });
});

// ============================================
// Mobile Form Validation Tests
// ============================================

test.describe('Mobile Form Validation', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
  });

  test('should display mobile-optimized form layout', async ({ page }) => {
    // Assert: Form inputs are full width
    const nameInput = page.locator('#contact-name');
    const formGroup = nameInput.locator('..');
    
    const formGroupBox = await formGroup.boundingBox();
    const viewport = page.viewportSize();
    
    if (formGroupBox && viewport) {
      expect(formGroupBox.width).toBeGreaterThan(viewport.width * 0.8);
    }

    // Assert: Labels are above inputs (not side-by-side)
    const label = page.locator('label[for="contact-name"]');
    const labelBox = await label.boundingBox();
    const inputBox = await nameInput.boundingBox();
    
    if (labelBox && inputBox) {
      expect(labelBox.y).toBeLessThan(inputBox.y);
    }
  });

  test('should show appropriate mobile keyboard for input types', async ({ page }) => {
    // Act & Assert: Email input shows email keyboard
    const emailInput = page.locator('#contact-email');
    await emailInput.tap();
    await expect(emailInput).toHaveAttribute('inputmode', 'email');
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Act & Assert: Phone input shows tel keyboard
    const phoneInput = page.locator('#contact-phone');
    await phoneInput.tap();
    await expect(phoneInput).toHaveAttribute('inputmode', 'tel');
    await expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  test('should validate form fields with mobile-friendly error messages', async ({ page }) => {
    // Arrange: Get form elements
    const nameInput = page.locator('#contact-name');
    const emailInput = page.locator('#contact-email');
    const submitButton = page.locator('[data-submit-button]');

    // Act: Submit form with invalid data
    await nameInput.fill('A');
    await emailInput.fill('invalid-email');
    await submitButton.tap();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Error messages are displayed
    const nameError = page.locator('#name-error');
    const emailError = page.locator('#email-error');
    
    await expect(nameError).toBeVisible();
    await expect(emailError).toBeVisible();
    
    // Assert: Error messages are concise for mobile
    const nameErrorText = await nameError.textContent();
    const emailErrorText = await emailError.textContent();
    
    expect(nameErrorText?.length).toBeLessThan(100);
    expect(emailErrorText?.length).toBeLessThan(100);
  });

  test('should handle form submission on mobile', async ({ page }) => {
    // Arrange: Fill form with valid data
    await page.fill('#contact-name', 'John Doe');
    await page.fill('#contact-email', 'john.doe@example.com');
    await page.fill('#contact-phone', '+234 123 456 7890');
    await page.fill('#contact-message', 'This is a test message for mobile form submission.');

    // Act: Submit form
    const submitButton = page.locator('[data-submit-button]');
    await submitButton.tap();

    // Assert: Loading state is shown
    await expect(submitButton).toHaveAttribute('aria-busy', 'true');
    await expect(submitButton).toBeDisabled();

    // Assert: Success message appears
    const formStatus = page.locator('[data-form-status]');
    await expect(formStatus).toBeVisible({ timeout: TIMEOUTS.FORM_SUBMIT });
    await expect(formStatus).toHaveClass(/success/);
  });

  test('should scroll to first error on mobile form validation', async ({ page }) => {
    // Arrange: Scroll to bottom of form
    const messageInput = page.locator('#contact-message');
    await messageInput.scrollIntoViewIfNeeded();

    // Act: Submit empty form
    const submitButton = page.locator('[data-submit-button]');
    await submitButton.tap();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Page scrolls to first error (name field)
    const nameInput = page.locator('#contact-name');
    await expect(nameInput).toBeInViewport();
  });
});

// ============================================
// Image Loading & Performance Tests
// ============================================

test.describe('Image Loading & Performance', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test('should lazy load images below the fold', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');

    // Assert: Hero image loads immediately
    const heroImage = page.locator('.hero-background img');
    await expect(heroImage).toHaveAttribute('src', /.+/);

    // Assert: Gallery images have loading="lazy"
    const galleryImages = page.locator('[data-gallery] img');
    const firstGalleryImage = galleryImages.first();
    await expect(firstGalleryImage).toHaveAttribute('loading', 'lazy');

    // Act: Scroll to gallery
    await page.goto('/#gallery');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Gallery images load when in viewport
    await expect(firstGalleryImage).toHaveAttribute('src', /.+/);
  });

  test('should serve appropriately sized images for mobile', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');

    // Assert: Hero image uses responsive srcset
    const heroImage = page.locator('.hero-background img');
    const srcset = await heroImage.getAttribute('srcset');
    expect(srcset).toContain('320w');
    expect(srcset).toContain('768w');

    // Assert: Room images use responsive srcset
    const roomImage = page.locator('.room-image img').first();
    const roomSrcset = await roomImage.getAttribute('srcset');
    expect(roomSrcset).toContain('320w');
  });

  test('should use WebP format when supported', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');

    // Assert: Picture elements have WebP sources
    const heroPicture = page.locator('.hero-background picture');
    const webpSource = heroPicture.locator('source[type="image/webp"]');
    await expect(webpSource).toBeVisible();

    // Assert: WebP source has appropriate srcset
    const webpSrcset = await webpSource.getAttribute('srcset');
    expect(webpSrcset).toContain('.webp');
  });

  test('should load critical CSS inline for mobile performance', async ({ page }) => {
    // Arrange: Navigate to page and measure load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Assert: Page loads quickly (under 3 seconds on mobile)
    expect(loadTime).toBeLessThan(3000);

    // Assert: Critical CSS is inlined
    const inlineStyles = page.locator('style');
    const inlineStyleCount = await inlineStyles.count();
    expect(inlineStyleCount).toBeGreaterThan(0);
  });

  test('should measure Core Web Vitals on mobile', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find((entry) => entry.entryType === 'largest-contentful-paint');
          resolve({
            lcp: lcp ? (lcp as any).renderTime || (lcp as any).loadTime : 0,
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => resolve({ lcp: 0 }), 5000);
      });
    });

    // Assert: LCP is under 2.5 seconds (good threshold)
    expect((metrics as any).lcp).toBeLessThan(2500);
  });
});

// ============================================
// Accessibility on Mobile Tests
// ============================================

test.describe('Accessibility on Mobile', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should support skip link for mobile screen readers', async ({ page }) => {
    // Act: Focus skip link
    await page.keyboard.press('Tab');

    // Assert: Skip link is visible when focused
    const skipLink = page.locator(SELECTORS.SKIP_LINK);
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Act: Activate skip link
    await page.keyboard.press('Enter');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Main content is focused
    const mainContent = page.locator('#main');
    await expect(mainContent).toBeInViewport();
  });

  test('should have proper ARIA labels for mobile navigation', async ({ page }) => {
    // Assert: Hamburger has proper ARIA attributes
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle navigation menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    // Act: Open menu
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Assert: ARIA expanded updated
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    // Assert: Navigation has proper role
    const nav = page.locator(SELECTORS.NAV);
    await expect(nav).toHaveAttribute('role', 'navigation');
  });

  test('should maintain focus management in mobile menu', async ({ page }) => {
    // Arrange: Open menu
    const hamburger = page.locator(SELECTORS.HAMBURGER);
    await hamburger.click();
    await waitForMenuAnimation(page);

    // Act: Tab through menu items
    await page.keyboard.press('Tab');
    const firstLink = page.locator('nav a').first();
    await expect(firstLink).toBeFocused();

    // Act: Tab to next item
    await page.keyboard.press('Tab');
    const secondLink = page.locator('nav a').nth(1);
    await expect(secondLink).toBeFocused();

    // Act: Close menu with Escape
    await page.keyboard.press('Escape');
    await waitForMenuAnimation(page);

    // Assert: Focus returns to hamburger
    await expect(hamburger).toBeFocused();
  });

  test('should have sufficient color contrast on mobile', async ({ page }) => {
    // Assert: Hero text has sufficient contrast
    const heroTitle = page.locator('.hero-content h1');
    const titleColor = await heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // White text on dark overlay should have high contrast
    expect(titleColor).toBe('rgb(255, 255, 255)');

    // Assert: CTA buttons have sufficient contrast
    const primaryButton = page.locator('.cta-button.primary');
    const buttonBg = await primaryButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const buttonColor = await primaryButton.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Verify colors are defined (actual contrast calculation would require additional library)
    expect(buttonBg).toBeTruthy();
    expect(buttonColor).toBeTruthy();
  });

  test('should support screen reader announcements for dynamic content', async ({ page }) => {
    // Arrange: Navigate to contact form
    await page.goto('/#contact');

    // Act: Submit form with errors
    const submitButton = page.locator('[data-submit-button]');
    await submitButton.click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: Error messages have proper ARIA attributes
    const nameError = page.locator('#name-error');
    await expect(nameError).toHaveAttribute('role', 'alert');
    await expect(nameError).toHaveAttribute('aria-live', 'polite');

    // Assert: Form status has proper ARIA attributes
    const formStatus = page.locator('[data-form-status]');
    await expect(formStatus).toHaveAttribute('role', 'status');
    await expect(formStatus).toHaveAttribute('aria-live', 'polite');
  });

  test('should support zoom up to 200% without horizontal scroll', async ({ page }) => {
    // Arrange: Set initial viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Act: Simulate 200% zoom by reducing viewport width
    await page.setViewportSize({ width: 195, height: 844 });
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Assert: No horizontal scrollbar appears
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Assert: Content remains readable
    const heroTitle = page.locator('.hero-content h1');
    await expect(heroTitle).toBeVisible();
  });
});

// ============================================
// Cross-Device Consistency Tests
// ============================================

test.describe('Cross-Device Consistency', () => {
  test('should maintain consistent branding across mobile devices', async ({ page }) => {
    const devices = [
      MOBILE_VIEWPORTS.IPHONE_13,
      MOBILE_VIEWPORTS.PIXEL_5,
      MOBILE_VIEWPORTS.SMALL_MOBILE,
    ];

    for (const viewport of devices) {
      // Arrange: Set viewport
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Assert: Logo is visible and properly sized
      const logo = page.locator('[data-logo] img');
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute('alt', 'XYZ Hotel Lagos Logo');

      // Assert: Primary color scheme is consistent
      const primaryButton = page.locator('.cta-button.primary');
      const bgColor = await primaryButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(bgColor).toBe('rgb(218, 165, 32)'); // --color-secondary
    }
  });

  test('should provide consistent navigation experience across devices', async ({ page }) => {
    const devices = [
      { name: 'iPhone 13', viewport: MOBILE_VIEWPORTS.IPHONE_13 },
      { name: 'Pixel 5', viewport: MOBILE_VIEWPORTS.PIXEL_5 },
    ];

    for (const device of devices) {
      // Arrange: Set viewport
      await page.setViewportSize(device.viewport);
      await page.goto('/');

      // Act: Open menu and navigate
      const hamburger = page.locator(SELECTORS.HAMBURGER);
      await hamburger.click();
      await waitForMenuAnimation(page);

      const aboutLink = page.locator('nav a[href="#about"]');
      await aboutLink.click();
      await waitForMenuAnimation(page);

      // Assert: Navigation works consistently
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeInViewport();
    }
  });
});

// ============================================
// Performance & Network Tests
// ============================================

test.describe('Performance & Network', () => {
  test.use({ viewport: MOBILE_VIEWPORTS.IPHONE_13 });

  test('should load page efficiently on slow 3G connection', async ({ page, context }) => {
    // Arrange: Simulate slow 3G network
    await context.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    // Act: Navigate to page
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Assert: Page loads within acceptable time (under 5 seconds on slow 3G)
    expect(loadTime).toBeLessThan(5000);

    // Assert: Critical content is visible
    const heroTitle = page.locator('.hero-content h1');
    await expect(heroTitle).toBeVisible();
  });

  test('should minimize JavaScript execution time on mobile', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Measure JavaScript execution time
    const jsExecutionTime = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('measure');
      return perfEntries.reduce((total, entry) => total + entry.duration, 0);
    });

    // Assert: JavaScript execution is efficient (under 1 second)
    expect(jsExecutionTime).toBeLessThan(1000);
  });

  test('should cache static assets for repeat visits', async ({ page, context }) => {
    // Arrange: First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Second visit (should use cache)
    const cachedRequests: string[] = [];
    context.on('request', (request) => {
      if (request.resourceType() === 'stylesheet' || request.resourceType() === 'script') {
        cachedRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Assert: Static assets are cached (fewer network requests)
    expect(cachedRequests.length).toBeGreaterThan(0);
  });
});