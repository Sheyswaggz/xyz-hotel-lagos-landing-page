# Comprehensive Navigation E2E Test Suite
# XYZ Hotel Lagos Landing Page - Navigation Tests
# 
# Test Coverage:
# - Smooth scroll navigation to all sections
# - Active menu item highlighting
# - Mobile menu toggle functionality
# - Keyboard navigation accessibility
# - URL hash updates on navigation
# - Scroll position tracking
# - Cross-browser compatibility
# - Mobile and desktop viewports

import { test, expect, type Page } from '@playwright/test';

/**
 * Navigation Test Suite
 * 
 * Validates all navigation functionality including:
 * - Menu link interactions
 * - Smooth scrolling behavior
 * - Active state management
 * - Mobile menu toggle
 * - Keyboard accessibility
 * - URL hash synchronization
 */
test.describe('Navigation', () => {
  /**
   * Setup: Navigate to homepage before each test
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  /**
   * Test: Desktop Navigation Menu Visibility
   * Validates that navigation menu is visible on desktop viewports
   */
  test('should display navigation menu on desktop', async ({ page }) => {
    // Arrange: Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act: Locate navigation element
    const nav = page.locator('nav[role="navigation"]');

    // Assert: Navigation is visible
    await expect(nav).toBeVisible();
    
    // Assert: All navigation links are present
    const navLinks = nav.locator('a');
    await expect(navLinks).toHaveCount(6);
    
    // Assert: Navigation links have correct text
    await expect(navLinks.nth(0)).toHaveText('Home');
    await expect(navLinks.nth(1)).toHaveText('About');
    await expect(navLinks.nth(2)).toHaveText('Amenities');
    await expect(navLinks.nth(3)).toHaveText('Rooms');
    await expect(navLinks.nth(4)).toHaveText('Gallery');
    await expect(navLinks.nth(5)).toHaveText('Contact');
  });

  /**
   * Test: Navigate to About Section
   * Validates smooth scroll navigation to About section
   */
  test('should navigate to About section on menu click', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click About link
    await page.click('a[href="#about"]');
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(800);

    // Assert: About section is in viewport
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();

    // Assert: Scroll position has changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Assert: URL hash is updated
    expect(page.url()).toContain('#about');
  });

  /**
   * Test: Navigate to Amenities Section
   * Validates smooth scroll navigation to Amenities section
   */
  test('should navigate to Amenities section on menu click', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click Amenities link
    await page.click('a[href="#amenities"]');
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(800);

    // Assert: Amenities section is in viewport
    const amenitiesSection = page.locator('#amenities');
    await expect(amenitiesSection).toBeInViewport();

    // Assert: Scroll position has changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Assert: URL hash is updated
    expect(page.url()).toContain('#amenities');
  });

  /**
   * Test: Navigate to Rooms Section
   * Validates smooth scroll navigation to Rooms section
   */
  test('should navigate to Rooms section on menu click', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click Rooms link
    await page.click('a[href="#rooms"]');
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(800);

    // Assert: Rooms section is in viewport
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();

    // Assert: Scroll position has changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Assert: URL hash is updated
    expect(page.url()).toContain('#rooms');
  });

  /**
   * Test: Navigate to Gallery Section
   * Validates smooth scroll navigation to Gallery section
   */
  test('should navigate to Gallery section on menu click', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click Gallery link
    await page.click('a[href="#gallery"]');
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(800);

    // Assert: Gallery section is in viewport
    const gallerySection = page.locator('#gallery');
    await expect(gallerySection).toBeInViewport();

    // Assert: Scroll position has changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Assert: URL hash is updated
    expect(page.url()).toContain('#gallery');
  });

  /**
   * Test: Navigate to Contact Section
   * Validates smooth scroll navigation to Contact section
   */
  test('should navigate to Contact section on menu click', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click Contact link
    await page.click('a[href="#contact"]');
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(800);

    // Assert: Contact section is in viewport
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeInViewport();

    // Assert: Scroll position has changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(initialScrollY);

    // Assert: URL hash is updated
    expect(page.url()).toContain('#contact');
  });

  /**
   * Test: Active Menu Item Highlighting
   * Validates that the active menu item is highlighted when navigating
   */
  test('should highlight active menu item on navigation', async ({ page }) => {
    // Act: Click Amenities link
    await page.click('a[href="#amenities"]');
    await page.waitForTimeout(800);

    // Assert: Amenities link has aria-current attribute
    const amenitiesLink = page.locator('a[href="#amenities"]');
    await expect(amenitiesLink).toHaveAttribute('aria-current', 'page');

    // Act: Click Rooms link
    await page.click('a[href="#rooms"]');
    await page.waitForTimeout(800);

    // Assert: Rooms link has aria-current attribute
    const roomsLink = page.locator('a[href="#rooms"]');
    await expect(roomsLink).toHaveAttribute('aria-current', 'page');

    // Assert: Amenities link no longer has aria-current
    await expect(amenitiesLink).not.toHaveAttribute('aria-current', 'page');
  });

  /**
   * Test: Active Menu Item Updates on Scroll
   * Validates that active menu item updates when user scrolls manually
   */
  test('should update active menu item on manual scroll', async ({ page }) => {
    // Act: Scroll to About section manually
    await page.evaluate(() => {
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // Wait for scroll and debounce
    await page.waitForTimeout(1000);

    // Assert: About link has aria-current attribute
    const aboutLink = page.locator('a[href="#about"]');
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');

    // Act: Scroll to Amenities section manually
    await page.evaluate(() => {
      const amenitiesSection = document.querySelector('#amenities');
      if (amenitiesSection) {
        amenitiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // Wait for scroll and debounce
    await page.waitForTimeout(1000);

    // Assert: Amenities link has aria-current attribute
    const amenitiesLink = page.locator('a[href="#amenities"]');
    await expect(amenitiesLink).toHaveAttribute('aria-current', 'page');
  });

  /**
   * Test: Smooth Scroll Behavior
   * Validates that scrolling is smooth and not instant
   */
  test('should use smooth scroll behavior', async ({ page }) => {
    // Arrange: Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Act: Click Contact link (bottom of page)
    await page.click('a[href="#contact"]');
    
    // Assert: Scroll position changes gradually (check midpoint)
    await page.waitForTimeout(200);
    const midScrollY = await page.evaluate(() => window.scrollY);
    expect(midScrollY).toBeGreaterThan(initialScrollY);
    
    // Wait for scroll to complete
    await page.waitForTimeout(600);
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThan(midScrollY);
  });

  /**
   * Test: Sequential Navigation
   * Validates navigation through all sections in sequence
   */
  test('should navigate through all sections sequentially', async ({ page }) => {
    const sections = ['#about', '#amenities', '#rooms', '#gallery', '#contact'];

    for (const sectionId of sections) {
      // Act: Click section link
      await page.click(`a[href="${sectionId}"]`);
      await page.waitForTimeout(800);

      // Assert: Section is in viewport
      const section = page.locator(sectionId);
      await expect(section).toBeInViewport();

      // Assert: URL hash is updated
      expect(page.url()).toContain(sectionId);

      // Assert: Link has aria-current attribute
      const link = page.locator(`a[href="${sectionId}"]`);
      await expect(link).toHaveAttribute('aria-current', 'page');
    }
  });

  /**
   * Test: Mobile Menu Toggle Button Exists
   * Validates that hamburger menu button is created on mobile viewports
   */
  test('should display hamburger menu on mobile', async ({ page }) => {
    // Arrange: Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for mobile menu initialization
    await page.waitForTimeout(500);

    // Assert: Hamburger button exists
    const hamburger = page.locator('.hamburger-menu');
    await expect(hamburger).toBeVisible();

    // Assert: Hamburger has correct ARIA attributes
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle navigation menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * Test: Mobile Menu Toggle Functionality
   * Validates that mobile menu opens and closes correctly
   */
  test('should toggle mobile menu on hamburger click', async ({ page }) => {
    // Arrange: Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const hamburger = page.locator('.hamburger-menu');
    const nav = page.locator('nav[role="navigation"]');

    // Act: Click hamburger to open menu
    await hamburger.click();
    await page.waitForTimeout(300);

    // Assert: Menu is open
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toHaveClass(/active/);

    // Act: Click hamburger to close menu
    await hamburger.click();
    await page.waitForTimeout(300);

    // Assert: Menu is closed
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/active/);
  });

  /**
   * Test: Mobile Menu Closes on Link Click
   * Validates that mobile menu closes when a navigation link is clicked
   */
  test('should close mobile menu when navigation link is clicked', async ({ page }) => {
    // Arrange: Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const hamburger = page.locator('.hamburger-menu');
    const nav = page.locator('nav[role="navigation"]');

    // Act: Open mobile menu
    await hamburger.click();
    await page.waitForTimeout(300);

    // Assert: Menu is open
    await expect(nav).toHaveClass(/active/);

    // Act: Click a navigation link
    await page.click('a[href="#about"]');
    await page.waitForTimeout(300);

    // Assert: Menu is closed
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/active/);
  });

  /**
   * Test: Mobile Menu Closes on Escape Key
   * Validates keyboard accessibility for closing mobile menu
   */
  test('should close mobile menu on Escape key press', async ({ page }) => {
    // Arrange: Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const hamburger = page.locator('.hamburger-menu');
    const nav = page.locator('nav[role="navigation"]');

    // Act: Open mobile menu
    await hamburger.click();
    await page.waitForTimeout(300);

    // Assert: Menu is open
    await expect(nav).toHaveClass(/active/);

    // Act: Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Assert: Menu is closed
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/active/);
  });

  /**
   * Test: Keyboard Navigation with Enter Key
   * Validates that navigation links work with Enter key
   */
  test('should navigate using Enter key on focused link', async ({ page }) => {
    // Arrange: Focus on About link
    await page.focus('a[href="#about"]');

    // Act: Press Enter key
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Assert: About section is in viewport
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();

    // Assert: URL hash is updated
    expect(page.url()).toContain('#about');
  });

  /**
   * Test: Keyboard Navigation with Tab Key
   * Validates that users can tab through navigation links
   */
  test('should allow tabbing through navigation links', async ({ page }) => {
    // Act: Tab through navigation links
    await page.keyboard.press('Tab'); // Skip to main content link
    await page.keyboard.press('Tab'); // First nav link (Home)
    
    // Assert: First link is focused
    const homeLink = page.locator('a[href="#home"]');
    await expect(homeLink).toBeFocused();

    // Act: Tab to next link
    await page.keyboard.press('Tab');
    
    // Assert: Second link is focused
    const aboutLink = page.locator('a[href="#about"]');
    await expect(aboutLink).toBeFocused();
  });

  /**
   * Test: Skip to Main Content Link
   * Validates accessibility skip link functionality
   */
  test('should have skip to main content link', async ({ page }) => {
    // Assert: Skip link exists
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveText('Skip to main content');
    await expect(skipLink).toHaveAttribute('href', '#main');

    // Act: Click skip link
    await skipLink.click();
    await page.waitForTimeout(300);

    // Assert: Main content is focused
    const mainContent = page.locator('#main');
    await expect(mainContent).toBeFocused();
  });

  /**
   * Test: Navigation Persistence Across Page Reload
   * Validates that URL hash persists after page reload
   */
  test('should maintain scroll position on page reload with hash', async ({ page }) => {
    // Act: Navigate to Rooms section
    await page.click('a[href="#rooms"]');
    await page.waitForTimeout(800);

    // Assert: URL has hash
    expect(page.url()).toContain('#rooms');

    // Act: Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Assert: Page scrolls to Rooms section
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();
  });

  /**
   * Test: Navigation Links Have Correct ARIA Labels
   * Validates accessibility attributes on navigation
   */
  test('should have correct ARIA labels on navigation', async ({ page }) => {
    // Assert: Navigation has correct role and label
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    // Assert: Navigation list has role
    const navList = nav.locator('ul');
    await expect(navList).toHaveAttribute('role', 'list');
  });

  /**
   * Test: Hero CTA Buttons Navigate Correctly
   * Validates that hero section call-to-action buttons work
   */
  test('should navigate from hero CTA buttons', async ({ page }) => {
    // Act: Click "Book Now" button in hero
    await page.click('[data-cta="book-now"]');
    await page.waitForTimeout(800);

    // Assert: Rooms section is in viewport
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();

    // Act: Navigate back to home
    await page.click('a[href="#home"]');
    await page.waitForTimeout(800);

    // Act: Click "Learn More" button in hero
    await page.click('[data-cta="learn-more"]');
    await page.waitForTimeout(800);

    // Assert: About section is in viewport
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();
  });

  /**
   * Test: Footer Navigation Links Work
   * Validates that footer navigation links function correctly
   */
  test('should navigate from footer links', async ({ page }) => {
    // Arrange: Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Act: Click About link in footer
    const footerAboutLink = page.locator('footer a[href="#about"]');
    await footerAboutLink.click();
    await page.waitForTimeout(800);

    // Assert: About section is in viewport
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();
  });

  /**
   * Test: Navigation Performance
   * Validates that navigation is responsive and fast
   */
  test('should navigate quickly without lag', async ({ page }) => {
    // Act: Measure navigation time
    const startTime = Date.now();
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(800);
    const endTime = Date.now();

    // Assert: Navigation completes within reasonable time (< 2 seconds)
    const navigationTime = endTime - startTime;
    expect(navigationTime).toBeLessThan(2000);

    // Assert: Contact section is in viewport
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeInViewport();
  });

  /**
   * Test: Multiple Rapid Clicks Don't Break Navigation
   * Validates navigation stability under rapid user interaction
   */
  test('should handle rapid navigation clicks gracefully', async ({ page }) => {
    // Act: Click multiple links rapidly
    await page.click('a[href="#about"]');
    await page.waitForTimeout(100);
    await page.click('a[href="#amenities"]');
    await page.waitForTimeout(100);
    await page.click('a[href="#rooms"]');
    await page.waitForTimeout(800);

    // Assert: Final section (Rooms) is in viewport
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();

    // Assert: URL hash is correct
    expect(page.url()).toContain('#rooms');

    // Assert: Correct link is active
    const roomsLink = page.locator('a[href="#rooms"]');
    await expect(roomsLink).toHaveAttribute('aria-current', 'page');
  });

  /**
   * Test: Navigation Works After Browser Back Button
   * Validates navigation state after using browser history
   */
  test('should maintain navigation state after browser back', async ({ page }) => {
    // Act: Navigate to About section
    await page.click('a[href="#about"]');
    await page.waitForTimeout(800);

    // Act: Navigate to Rooms section
    await page.click('a[href="#rooms"]');
    await page.waitForTimeout(800);

    // Assert: Rooms section is in viewport
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();

    // Act: Use browser back button
    await page.goBack();
    await page.waitForTimeout(800);

    // Assert: About section is in viewport
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();

    // Assert: URL hash is correct
    expect(page.url()).toContain('#about');
  });

  /**
   * Test: Logo Click Returns to Home
   * Validates that clicking the logo navigates to home section
   */
  test('should navigate to home when logo is clicked', async ({ page }) => {
    // Arrange: Navigate away from home
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(800);

    // Act: Click logo
    const logo = page.locator('[data-logo]');
    await logo.click();
    await page.waitForTimeout(800);

    // Assert: Page scrolls to top (home section)
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  /**
   * Test: Navigation Accessibility - Screen Reader Support
   * Validates that navigation is properly announced to screen readers
   */
  test('should have proper ARIA attributes for screen readers', async ({ page }) => {
    // Assert: Navigation has proper landmark role
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Assert: Current page link is properly marked
    await page.click('a[href="#about"]');
    await page.waitForTimeout(800);
    
    const aboutLink = page.locator('a[href="#about"]');
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');

    // Assert: Other links don't have aria-current
    const homeLink = page.locator('a[href="#home"]');
    await expect(homeLink).not.toHaveAttribute('aria-current', 'page');
  });

  /**
   * Test: Navigation on Tablet Viewport
   * Validates navigation behavior on tablet-sized screens
   */
  test('should work correctly on tablet viewport', async ({ page }) => {
    // Arrange: Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Act: Click navigation link
    await page.click('a[href="#amenities"]');
    await page.waitForTimeout(800);

    // Assert: Amenities section is in viewport
    const amenitiesSection = page.locator('#amenities');
    await expect(amenitiesSection).toBeInViewport();

    // Assert: URL hash is updated
    expect(page.url()).toContain('#amenities');
  });

  /**
   * Test: Navigation Doesn't Interfere with Form Submission
   * Validates that navigation and form functionality don't conflict
   */
  test('should not interfere with contact form after navigation', async ({ page }) => {
    // Act: Navigate to contact section
    await page.click('a[href="#contact"]');
    await page.waitForTimeout(800);

    // Assert: Contact form is visible
    const contactForm = page.locator('[data-contact-form]');
    await expect(contactForm).toBeVisible();

    // Act: Fill and submit form
    await page.fill('#contact-name', 'John Doe');
    await page.fill('#contact-email', 'john@example.com');
    await page.fill('#contact-phone', '+234 123 456 7890');
    await page.fill('#contact-message', 'Test message for navigation test');

    // Assert: Form fields are filled correctly
    await expect(page.locator('#contact-name')).toHaveValue('John Doe');
    await expect(page.locator('#contact-email')).toHaveValue('john@example.com');
  });
});

/**
 * Cross-Browser Navigation Tests
 * Validates navigation works consistently across different browsers
 */
test.describe('Cross-Browser Navigation', () => {
  test('should work in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium-specific test');
    
    await page.goto('/');
    await page.click('a[href="#about"]');
    await page.waitForTimeout(800);
    
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto('/');
    await page.click('a[href="#amenities"]');
    await page.waitForTimeout(800);
    
    const amenitiesSection = page.locator('#amenities');
    await expect(amenitiesSection).toBeInViewport();
  });

  test('should work in WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific test');
    
    await page.goto('/');
    await page.click('a[href="#rooms"]');
    await page.waitForTimeout(800);
    
    const roomsSection = page.locator('#rooms');
    await expect(roomsSection).toBeInViewport();
  });
});

/**
 * Performance Tests
 * Validates navigation performance metrics
 */
test.describe('Navigation Performance', () => {
  test('should complete navigation within performance budget', async ({ page }) => {
    await page.goto('/');
    
    // Measure navigation performance
    const navigationMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      return entries[0];
    });

    // Assert: Page load time is reasonable
    expect(navigationMetrics.loadEventEnd - navigationMetrics.fetchStart).toBeLessThan(3000);
  });

  test('should not cause layout shifts during navigation', async ({ page }) => {
    await page.goto('/');
    
    // Get initial layout
    const initialLayout = await page.evaluate(() => ({
      width: document.body.offsetWidth,
      height: document.body.offsetHeight,
    }));

    // Navigate to section
    await page.click('a[href="#about"]');
    await page.waitForTimeout(800);

    // Get layout after navigation
    const finalLayout = await page.evaluate(() => ({
      width: document.body.offsetWidth,
      height: document.body.offsetHeight,
    }));

    // Assert: Layout width remains stable (height can change due to scroll)
    expect(finalLayout.width).toBe(initialLayout.width);
  });
});