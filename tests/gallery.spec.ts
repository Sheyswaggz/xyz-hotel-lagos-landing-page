import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Image Gallery Lightbox E2E Test Suite
 * 
 * Comprehensive end-to-end testing for the XYZ Hotel Lagos image gallery lightbox feature.
 * Tests cover user interactions, keyboard navigation, accessibility, and edge cases.
 * 
 * Test Categories:
 * - Basic Functionality: Opening, closing, and navigation
 * - Keyboard Navigation: Arrow keys, Escape, Enter, Space
 * - Accessibility: ARIA attributes, focus management, screen reader support
 * - Edge Cases: First/last image navigation, rapid interactions
 * - Performance: Image loading, animation smoothness
 * - Responsive Design: Mobile and desktop viewports
 * 
 * @module gallery.spec
 * @requires @playwright/test
 */

// ============================================
// Test Configuration & Constants
// ============================================

const GALLERY_CONFIG = {
  SELECTORS: {
    GALLERY_SECTION: '#gallery',
    GALLERY_GRID: '[data-gallery]',
    GALLERY_ITEMS: '[data-gallery] .gallery-item',
    GALLERY_IMAGES: '[data-gallery] .gallery-item img',
    LIGHTBOX: '.lightbox',
    LIGHTBOX_IMAGE: '.lightbox-image',
    LIGHTBOX_CAPTION: '.lightbox-caption',
    LIGHTBOX_CLOSE: '.lightbox-close',
    LIGHTBOX_PREV: '.lightbox-prev',
    LIGHTBOX_NEXT: '.lightbox-next',
    LIGHTBOX_OVERLAY: '.lightbox-overlay',
  },
  TIMEOUTS: {
    ANIMATION: 500,
    IMAGE_LOAD: 3000,
    NAVIGATION: 1000,
  },
  CLASSES: {
    ACTIVE: 'active',
    VISIBLE: 'visible',
  },
  ARIA: {
    HIDDEN: 'aria-hidden',
    MODAL: 'aria-modal',
    LABEL: 'aria-label',
  },
} as const;

// ============================================
// Test Helpers & Utilities
// ============================================

/**
 * Page Object Model for Gallery Lightbox
 * Encapsulates all lightbox interactions and assertions
 */
class GalleryLightboxPage {
  readonly page: Page;
  readonly gallerySection: Locator;
  readonly galleryImages: Locator;
  readonly lightbox: Locator;
  readonly lightboxImage: Locator;
  readonly lightboxCaption: Locator;
  readonly closeButton: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly overlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gallerySection = page.locator(GALLERY_CONFIG.SELECTORS.GALLERY_SECTION);
    this.galleryImages = page.locator(GALLERY_CONFIG.SELECTORS.GALLERY_IMAGES);
    this.lightbox = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX);
    this.lightboxImage = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_IMAGE);
    this.lightboxCaption = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_CAPTION);
    this.closeButton = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_CLOSE);
    this.prevButton = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_PREV);
    this.nextButton = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_NEXT);
    this.overlay = page.locator(GALLERY_CONFIG.SELECTORS.LIGHTBOX_OVERLAY);
  }

  /**
   * Navigate to gallery section
   */
  async navigateToGallery(): Promise<void> {
    await this.page.goto('/');
    await this.page.click('a[href="#gallery"]');
    await this.gallerySection.waitFor({ state: 'visible' });
  }

  /**
   * Open lightbox by clicking gallery image at index
   */
  async openLightboxByIndex(index: number): Promise<void> {
    await this.galleryImages.nth(index).click();
    await this.lightbox.waitFor({ state: 'visible' });
  }

  /**
   * Get current lightbox image source
   */
  async getCurrentImageSrc(): Promise<string | null> {
    return this.lightboxImage.getAttribute('src');
  }

  /**
   * Get current lightbox image alt text
   */
  async getCurrentImageAlt(): Promise<string | null> {
    return this.lightboxImage.getAttribute('alt');
  }

  /**
   * Get current lightbox caption text
   */
  async getCurrentCaption(): Promise<string> {
    return this.lightboxCaption.textContent() || '';
  }

  /**
   * Check if lightbox is visible
   */
  async isLightboxVisible(): Promise<boolean> {
    return this.lightbox.isVisible();
  }

  /**
   * Check if lightbox has active class
   */
  async hasActiveClass(): Promise<boolean> {
    const className = await this.lightbox.getAttribute('class');
    return className?.includes(GALLERY_CONFIG.CLASSES.ACTIVE) || false;
  }

  /**
   * Get total number of gallery images
   */
  async getGalleryImageCount(): Promise<number> {
    return this.galleryImages.count();
  }

  /**
   * Close lightbox using close button
   */
  async closeWithButton(): Promise<void> {
    await this.closeButton.click();
    await this.lightbox.waitFor({ state: 'hidden' });
  }

  /**
   * Close lightbox using overlay click
   */
  async closeWithOverlay(): Promise<void> {
    await this.overlay.click();
    await this.lightbox.waitFor({ state: 'hidden' });
  }

  /**
   * Close lightbox using Escape key
   */
  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.lightbox.waitFor({ state: 'hidden' });
  }

  /**
   * Navigate to next image
   */
  async navigateNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(GALLERY_CONFIG.TIMEOUTS.ANIMATION);
  }

  /**
   * Navigate to previous image
   */
  async navigatePrev(): Promise<void> {
    await this.prevButton.click();
    await this.page.waitForTimeout(GALLERY_CONFIG.TIMEOUTS.ANIMATION);
  }

  /**
   * Navigate using arrow keys
   */
  async navigateWithArrowKey(direction: 'left' | 'right'): Promise<void> {
    const key = direction === 'left' ? 'ArrowLeft' : 'ArrowRight';
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(GALLERY_CONFIG.TIMEOUTS.ANIMATION);
  }

  /**
   * Check if body overflow is hidden (lightbox open)
   */
  async isBodyOverflowHidden(): Promise<boolean> {
    const overflow = await this.page.evaluate(() => document.body.style.overflow);
    return overflow === 'hidden';
  }

  /**
   * Get focused element selector
   */
  async getFocusedElementSelector(): Promise<string | null> {
    return this.page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;
      
      // Build selector from element
      if (focused.id) return `#${focused.id}`;
      if (focused.className) return `.${focused.className.split(' ')[0]}`;
      return focused.tagName.toLowerCase();
    });
  }
}

// ============================================
// Test Suite: Image Gallery Lightbox
// ============================================

test.describe('Image Gallery Lightbox', () => {
  let galleryPage: GalleryLightboxPage;

  // ============================================
  // Setup & Teardown
  // ============================================

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    galleryPage = new GalleryLightboxPage(page);
    
    // Navigate to gallery section
    await galleryPage.navigateToGallery();
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
  });

  // ============================================
  // Basic Functionality Tests
  // ============================================

  test.describe('Basic Functionality', () => {
    test('should display gallery section with images', async () => {
      // Verify gallery section is visible
      await expect(galleryPage.gallerySection).toBeVisible();
      
      // Verify gallery has images
      const imageCount = await galleryPage.getGalleryImageCount();
      expect(imageCount).toBeGreaterThan(0);
      
      // Verify all images are visible
      const images = galleryPage.galleryImages;
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        await expect(images.nth(i)).toBeVisible();
      }
    });

    test('should open lightbox when clicking gallery image', async () => {
      // Click first gallery image
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox is visible
      await expect(galleryPage.lightbox).toBeVisible();
      
      // Verify lightbox has active class
      const hasActive = await galleryPage.hasActiveClass();
      expect(hasActive).toBe(true);
      
      // Verify lightbox image is displayed
      await expect(galleryPage.lightboxImage).toBeVisible();
    });

    test('should display correct image in lightbox', async ({ page }) => {
      // Get first gallery image source
      const galleryImageSrc = await galleryPage.galleryImages.nth(0).getAttribute('src');
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox displays same image
      const lightboxImageSrc = await galleryPage.getCurrentImageSrc();
      expect(lightboxImageSrc).toBe(galleryImageSrc);
    });

    test('should display image caption in lightbox', async ({ page }) => {
      // Get first gallery image caption
      const galleryItem = page.locator(GALLERY_CONFIG.SELECTORS.GALLERY_ITEMS).nth(0);
      const figcaption = galleryItem.locator('figcaption');
      const expectedCaption = await figcaption.textContent();
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify caption is displayed
      const actualCaption = await galleryPage.getCurrentCaption();
      expect(actualCaption).toBe(expectedCaption);
    });

    test('should display alt text as fallback caption', async ({ page }) => {
      // Get image without figcaption (if exists)
      const imageAlt = await galleryPage.galleryImages.nth(0).getAttribute('alt');
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify alt text is used
      const lightboxAlt = await galleryPage.getCurrentImageAlt();
      expect(lightboxAlt).toBe(imageAlt);
    });
  });

  // ============================================
  // Navigation Tests
  // ============================================

  test.describe('Image Navigation', () => {
    test('should navigate to next image using next button', async () => {
      // Open lightbox with first image
      await galleryPage.openLightboxByIndex(0);
      const firstSrc = await galleryPage.getCurrentImageSrc();
      
      // Click next button
      await galleryPage.navigateNext();
      
      // Verify image changed
      const secondSrc = await galleryPage.getCurrentImageSrc();
      expect(secondSrc).not.toBe(firstSrc);
    });

    test('should navigate to previous image using prev button', async () => {
      // Open lightbox with second image
      await galleryPage.openLightboxByIndex(1);
      const secondSrc = await galleryPage.getCurrentImageSrc();
      
      // Click previous button
      await galleryPage.navigatePrev();
      
      // Verify image changed
      const firstSrc = await galleryPage.getCurrentImageSrc();
      expect(firstSrc).not.toBe(secondSrc);
    });

    test('should navigate to next image using right arrow key', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      const firstSrc = await galleryPage.getCurrentImageSrc();
      
      // Press right arrow
      await galleryPage.navigateWithArrowKey('right');
      
      // Verify image changed
      const secondSrc = await galleryPage.getCurrentImageSrc();
      expect(secondSrc).not.toBe(firstSrc);
    });

    test('should navigate to previous image using left arrow key', async () => {
      // Open lightbox with second image
      await galleryPage.openLightboxByIndex(1);
      const secondSrc = await galleryPage.getCurrentImageSrc();
      
      // Press left arrow
      await galleryPage.navigateWithArrowKey('left');
      
      // Verify image changed
      const firstSrc = await galleryPage.getCurrentImageSrc();
      expect(firstSrc).not.toBe(secondSrc);
    });

    test('should wrap to first image when navigating next from last image', async ({ page }) => {
      // Get total image count
      const imageCount = await galleryPage.getGalleryImageCount();
      
      // Open lightbox with last image
      await galleryPage.openLightboxByIndex(imageCount - 1);
      
      // Get first gallery image source for comparison
      const firstGalleryImageSrc = await galleryPage.galleryImages.nth(0).getAttribute('src');
      
      // Navigate next (should wrap to first)
      await galleryPage.navigateNext();
      
      // Verify wrapped to first image
      const currentSrc = await galleryPage.getCurrentImageSrc();
      expect(currentSrc).toBe(firstGalleryImageSrc);
    });

    test('should wrap to last image when navigating prev from first image', async ({ page }) => {
      // Get total image count
      const imageCount = await galleryPage.getGalleryImageCount();
      
      // Open lightbox with first image
      await galleryPage.openLightboxByIndex(0);
      
      // Get last gallery image source for comparison
      const lastGalleryImageSrc = await galleryPage.galleryImages.nth(imageCount - 1).getAttribute('src');
      
      // Navigate previous (should wrap to last)
      await galleryPage.navigatePrev();
      
      // Verify wrapped to last image
      const currentSrc = await galleryPage.getCurrentImageSrc();
      expect(currentSrc).toBe(lastGalleryImageSrc);
    });

    test('should navigate through multiple images sequentially', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Navigate through 3 images
      const sources: (string | null)[] = [];
      sources.push(await galleryPage.getCurrentImageSrc());
      
      await galleryPage.navigateNext();
      sources.push(await galleryPage.getCurrentImageSrc());
      
      await galleryPage.navigateNext();
      sources.push(await galleryPage.getCurrentImageSrc());
      
      // Verify all sources are different
      expect(sources[0]).not.toBe(sources[1]);
      expect(sources[1]).not.toBe(sources[2]);
      expect(sources[0]).not.toBe(sources[2]);
    });
  });

  // ============================================
  // Closing Lightbox Tests
  // ============================================

  test.describe('Closing Lightbox', () => {
    test('should close lightbox when clicking close button', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      await expect(galleryPage.lightbox).toBeVisible();
      
      // Close using button
      await galleryPage.closeWithButton();
      
      // Verify lightbox is hidden
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should close lightbox when clicking overlay', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      await expect(galleryPage.lightbox).toBeVisible();
      
      // Close using overlay
      await galleryPage.closeWithOverlay();
      
      // Verify lightbox is hidden
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should close lightbox when pressing Escape key', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      await expect(galleryPage.lightbox).toBeVisible();
      
      // Close using Escape
      await galleryPage.closeWithEscape();
      
      // Verify lightbox is hidden
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should restore body overflow when closing lightbox', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify body overflow is hidden
      const overflowHidden = await galleryPage.isBodyOverflowHidden();
      expect(overflowHidden).toBe(true);
      
      // Close lightbox
      await galleryPage.closeWithButton();
      
      // Verify body overflow is restored
      const overflowRestored = await galleryPage.isBodyOverflowHidden();
      expect(overflowRestored).toBe(false);
    });

    test('should remove active class when closing lightbox', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify active class exists
      let hasActive = await galleryPage.hasActiveClass();
      expect(hasActive).toBe(true);
      
      // Close lightbox
      await galleryPage.closeWithButton();
      
      // Verify active class removed
      hasActive = await galleryPage.hasActiveClass();
      expect(hasActive).toBe(false);
    });
  });

  // ============================================
  // Keyboard Navigation Tests
  // ============================================

  test.describe('Keyboard Navigation', () => {
    test('should open lightbox when pressing Enter on gallery image', async ({ page }) => {
      // Focus first gallery image
      const firstImage = galleryPage.galleryImages.nth(0);
      await firstImage.focus();
      
      // Press Enter
      await page.keyboard.press('Enter');
      
      // Verify lightbox opened
      await expect(galleryPage.lightbox).toBeVisible();
    });

    test('should open lightbox when pressing Space on gallery image', async ({ page }) => {
      // Focus first gallery image
      const firstImage = galleryPage.galleryImages.nth(0);
      await firstImage.focus();
      
      // Press Space
      await page.keyboard.press('Space');
      
      // Verify lightbox opened
      await expect(galleryPage.lightbox).toBeVisible();
    });

    test('should not respond to arrow keys when lightbox is closed', async ({ page }) => {
      // Ensure lightbox is closed
      await expect(galleryPage.lightbox).not.toBeVisible();
      
      // Press arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      
      // Verify lightbox remains closed
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should not respond to Escape when lightbox is closed', async ({ page }) => {
      // Ensure lightbox is closed
      await expect(galleryPage.lightbox).not.toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Verify no errors and lightbox remains closed
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should handle rapid keyboard navigation', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Rapidly press arrow keys
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowRight');
      }
      
      // Wait for animations
      await page.waitForTimeout(GALLERY_CONFIG.TIMEOUTS.ANIMATION);
      
      // Verify lightbox still functional
      await expect(galleryPage.lightbox).toBeVisible();
      await expect(galleryPage.lightboxImage).toBeVisible();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on lightbox', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify role="dialog"
      const role = await galleryPage.lightbox.getAttribute('role');
      expect(role).toBe('dialog');
      
      // Verify aria-modal="true"
      const ariaModal = await galleryPage.lightbox.getAttribute(GALLERY_CONFIG.ARIA.MODAL);
      expect(ariaModal).toBe('true');
      
      // Verify aria-label exists
      const ariaLabel = await galleryPage.lightbox.getAttribute(GALLERY_CONFIG.ARIA.LABEL);
      expect(ariaLabel).toBeTruthy();
    });

    test('should set aria-hidden="false" when lightbox is open', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify aria-hidden is false
      const ariaHidden = await galleryPage.lightbox.getAttribute(GALLERY_CONFIG.ARIA.HIDDEN);
      expect(ariaHidden).toBe('false');
    });

    test('should set aria-hidden="true" when lightbox is closed', async () => {
      // Open and close lightbox
      await galleryPage.openLightboxByIndex(0);
      await galleryPage.closeWithButton();
      
      // Verify aria-hidden is true
      const ariaHidden = await galleryPage.lightbox.getAttribute(GALLERY_CONFIG.ARIA.HIDDEN);
      expect(ariaHidden).toBe('true');
    });

    test('should focus close button when lightbox opens', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Wait for focus
      await galleryPage.page.waitForTimeout(100);
      
      // Verify close button is focused
      const focusedElement = await galleryPage.getFocusedElementSelector();
      expect(focusedElement).toContain('close');
    });

    test('should have aria-label on navigation buttons', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify close button aria-label
      const closeLabel = await galleryPage.closeButton.getAttribute(GALLERY_CONFIG.ARIA.LABEL);
      expect(closeLabel).toBeTruthy();
      expect(closeLabel?.toLowerCase()).toContain('close');
      
      // Verify prev button aria-label
      const prevLabel = await galleryPage.prevButton.getAttribute(GALLERY_CONFIG.ARIA.LABEL);
      expect(prevLabel).toBeTruthy();
      expect(prevLabel?.toLowerCase()).toContain('previous');
      
      // Verify next button aria-label
      const nextLabel = await galleryPage.nextButton.getAttribute(GALLERY_CONFIG.ARIA.LABEL);
      expect(nextLabel).toBeTruthy();
      expect(nextLabel?.toLowerCase()).toContain('next');
    });

    test('should have proper alt text on lightbox image', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify alt text exists and is not empty
      const altText = await galleryPage.getCurrentImageAlt();
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    });

    test('should have tabindex on gallery images', async () => {
      // Check first gallery image
      const tabindex = await galleryPage.galleryImages.nth(0).getAttribute('tabindex');
      expect(tabindex).toBe('0');
    });

    test('should have role="button" on gallery images', async () => {
      // Check first gallery image
      const role = await galleryPage.galleryImages.nth(0).getAttribute('role');
      expect(role).toBe('button');
    });
  });

  // ============================================
  // Edge Cases & Error Handling
  // ============================================

  test.describe('Edge Cases', () => {
    test('should handle clicking same image multiple times', async () => {
      // Click first image multiple times
      await galleryPage.openLightboxByIndex(0);
      await galleryPage.closeWithButton();
      
      await galleryPage.openLightboxByIndex(0);
      await galleryPage.closeWithButton();
      
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox still works
      await expect(galleryPage.lightbox).toBeVisible();
    });

    test('should handle rapid open/close operations', async () => {
      // Rapidly open and close lightbox
      for (let i = 0; i < 3; i++) {
        await galleryPage.openLightboxByIndex(0);
        await galleryPage.closeWithButton();
      }
      
      // Verify final state is closed
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should handle clicking overlay during navigation', async () => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Start navigation
      await galleryPage.nextButton.click();
      
      // Immediately click overlay
      await galleryPage.overlay.click({ force: true });
      
      // Verify lightbox closes
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should handle pressing Escape during navigation', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Start navigation
      await galleryPage.nextButton.click();
      
      // Immediately press Escape
      await page.keyboard.press('Escape');
      
      // Verify lightbox closes
      await expect(galleryPage.lightbox).not.toBeVisible();
    });

    test('should handle missing image sources gracefully', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify image element exists even if source fails
      await expect(galleryPage.lightboxImage).toBeAttached();
    });

    test('should maintain state after window resize', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      const srcBefore = await galleryPage.getCurrentImageSrc();
      
      // Resize window
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(300);
      
      // Verify lightbox still shows same image
      const srcAfter = await galleryPage.getCurrentImageSrc();
      expect(srcAfter).toBe(srcBefore);
      await expect(galleryPage.lightbox).toBeVisible();
    });
  });

  // ============================================
  // Performance Tests
  // ============================================

  test.describe('Performance', () => {
    test('should open lightbox within acceptable time', async ({ page }) => {
      // Measure time to open lightbox
      const startTime = Date.now();
      await galleryPage.openLightboxByIndex(0);
      const endTime = Date.now();
      
      // Verify opens within 500ms
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500);
    });

    test('should navigate between images smoothly', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Measure navigation time
      const startTime = Date.now();
      await galleryPage.navigateNext();
      const endTime = Date.now();
      
      // Verify navigation within 300ms
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(300);
    });

    test('should close lightbox quickly', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Measure close time
      const startTime = Date.now();
      await galleryPage.closeWithButton();
      const endTime = Date.now();
      
      // Verify closes within 300ms
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(300);
    });

    test('should load images efficiently', async ({ page }) => {
      // Monitor network requests
      const imageRequests: string[] = [];
      page.on('request', (request) => {
        if (request.resourceType() === 'image') {
          imageRequests.push(request.url());
        }
      });
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Wait for image load
      await page.waitForTimeout(1000);
      
      // Verify reasonable number of image requests
      expect(imageRequests.length).toBeLessThan(10);
    });
  });

  // ============================================
  // Responsive Design Tests
  // ============================================

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to gallery
      await galleryPage.navigateToGallery();
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox works
      await expect(galleryPage.lightbox).toBeVisible();
      await expect(galleryPage.lightboxImage).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigate to gallery
      await galleryPage.navigateToGallery();
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox works
      await expect(galleryPage.lightbox).toBeVisible();
      await expect(galleryPage.lightboxImage).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to gallery
      await galleryPage.navigateToGallery();
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox works
      await expect(galleryPage.lightbox).toBeVisible();
      await expect(galleryPage.lightboxImage).toBeVisible();
    });

    test('should adapt navigation buttons on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to gallery and open lightbox
      await galleryPage.navigateToGallery();
      await galleryPage.openLightboxByIndex(0);
      
      // Verify navigation buttons are visible and clickable
      await expect(galleryPage.prevButton).toBeVisible();
      await expect(galleryPage.nextButton).toBeVisible();
      
      // Test navigation
      await galleryPage.navigateNext();
      await expect(galleryPage.lightboxImage).toBeVisible();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  test.describe('Integration with Page', () => {
    test('should not interfere with page navigation', async ({ page }) => {
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Close lightbox
      await galleryPage.closeWithButton();
      
      // Navigate to another section
      await page.click('a[href="#contact"]');
      
      // Verify navigation worked
      const contactSection = page.locator('#contact');
      await expect(contactSection).toBeInViewport();
    });

    test('should work after navigating away and back', async ({ page }) => {
      // Navigate to another section
      await page.click('a[href="#about"]');
      await page.waitForTimeout(500);
      
      // Navigate back to gallery
      await page.click('a[href="#gallery"]');
      await page.waitForTimeout(500);
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox works
      await expect(galleryPage.lightbox).toBeVisible();
    });

    test('should maintain functionality after page scroll', async ({ page }) => {
      // Scroll page
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(300);
      
      // Open lightbox
      await galleryPage.openLightboxByIndex(0);
      
      // Verify lightbox works
      await expect(galleryPage.lightbox).toBeVisible();
    });
  });
});

// ============================================
// Additional Test Suite: Gallery Image Loading
// ============================================

test.describe('Gallery Image Loading', () => {
  test('should lazy load gallery images', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Check for lazy loading attribute
    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    
    // Verify lazy loading is implemented
    expect(count).toBeGreaterThan(0);
  });

  test('should load images as they come into viewport', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Scroll to gallery
    await page.click('a[href="#gallery"]');
    await page.waitForTimeout(500);
    
    // Verify images are loaded
    const galleryImages = page.locator('[data-gallery] img');
    const firstImage = galleryImages.nth(0);
    
    // Check if image has src attribute
    const src = await firstImage.getAttribute('src');
    expect(src).toBeTruthy();
  });
});

// ============================================
// Additional Test Suite: Gallery Categories
// ============================================

test.describe('Gallery Categories', () => {
  test('should have data-category attributes on gallery items', async ({ page }) => {
    // Navigate to gallery
    await page.goto('/');
    await page.click('a[href="#gallery"]');
    
    // Check for category attributes
    const galleryItems = page.locator('[data-gallery] .gallery-item');
    const firstItem = galleryItems.nth(0);
    
    const category = await firstItem.getAttribute('data-category');
    expect(category).toBeTruthy();
  });

  test('should display images from different categories', async ({ page }) => {
    // Navigate to gallery
    await page.goto('/');
    await page.click('a[href="#gallery"]');
    
    // Get all categories
    const categories = await page.locator('[data-gallery] .gallery-item').evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-category'))
    );
    
    // Verify multiple categories exist
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBeGreaterThan(1);
  });
});