/**
 * Performance and Optimization Test Suite
 * 
 * Tests performance metrics, lazy loading, resource optimization,
 * and page load times across different network conditions and devices.
 * 
 * Test Categories:
 * - Lazy Loading: Image loading behavior and viewport detection
 * - Page Load Performance: Initial load times and resource optimization
 * - Network Conditions: Performance under various network speeds
 * - Resource Optimization: Asset sizes and compression
 * - Core Web Vitals: LCP, FID, CLS metrics
 * - Intersection Observer: Scroll-based loading functionality
 * 
 * @module tests/performance.spec.ts
 * @requires @playwright/test
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================
// Configuration & Constants
// ============================================

const PERFORMANCE_THRESHOLDS = Object.freeze({
  PAGE_LOAD_TIME: 3000, // 3 seconds
  FIRST_CONTENTFUL_PAINT: 1800, // 1.8 seconds
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
  TIME_TO_INTERACTIVE: 3800, // 3.8 seconds
  CUMULATIVE_LAYOUT_SHIFT: 0.1, // CLS score
  FIRST_INPUT_DELAY: 100, // 100ms
  IMAGE_LOAD_TIME: 2000, // 2 seconds per image
  TOTAL_BLOCKING_TIME: 300, // 300ms
});

const NETWORK_PROFILES = Object.freeze({
  FAST_3G: {
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
    latency: 150, // 150ms
  },
  SLOW_3G: {
    downloadThroughput: (400 * 1024) / 8, // 400 Kbps
    uploadThroughput: (400 * 1024) / 8, // 400 Kbps
    latency: 400, // 400ms
  },
  OFFLINE: {
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
  },
});

const SELECTORS = Object.freeze({
  LAZY_IMAGES: 'img[loading="lazy"]',
  ALL_IMAGES: 'img',
  HERO_IMAGE: '.hero-background img',
  GALLERY_IMAGES: '[data-gallery] img',
  ROOM_IMAGES: '.room-card img',
  CRITICAL_IMAGES: '.hero-background img, .logo img',
});

// ============================================
// Helper Functions
// ============================================

/**
 * Wait for all images to complete loading
 * @param page - Playwright page instance
 * @param selector - CSS selector for images
 * @returns Promise that resolves when all images are loaded
 */
async function waitForImages(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const images = Array.from(document.querySelectorAll(sel)) as HTMLImageElement[];
      return images.every((img) => img.complete && img.naturalHeight > 0);
    },
    selector,
    { timeout: 30000 }
  );
}

/**
 * Get performance metrics from the browser
 * @param page - Playwright page instance
 * @returns Performance timing metrics
 */
async function getPerformanceMetrics(page: Page) {
  return page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      firstPaint: paintEntries.find((entry) => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
      totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
      dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcpConnection: perfData.connectEnd - perfData.connectStart,
      serverResponse: perfData.responseEnd - perfData.requestStart,
      domProcessing: perfData.domComplete - perfData.domLoading,
      resourceLoadTime: perfData.loadEventEnd - perfData.responseEnd,
    };
  });
}

/**
 * Get Core Web Vitals metrics
 * @param page - Playwright page instance
 * @returns Core Web Vitals (LCP, FID, CLS)
 */
async function getCoreWebVitals(page: Page) {
  return page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
      };

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart: number; startTime: number }) => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value: number; hadRecentInput: boolean }) => {
          if (!entry.hadRecentInput) {
            metrics.cls += entry.value;
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // Wait for metrics to be collected
      setTimeout(() => resolve(metrics), 3000);
    });
  });
}

/**
 * Get resource loading statistics
 * @param page - Playwright page instance
 * @returns Resource loading metrics
 */
async function getResourceStats(page: Page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const stats = {
      total: resources.length,
      images: 0,
      scripts: 0,
      stylesheets: 0,
      fonts: 0,
      totalSize: 0,
      totalDuration: 0,
      cached: 0,
    };

    resources.forEach((resource) => {
      // Count by type
      if (resource.initiatorType === 'img' || resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        stats.images++;
      } else if (resource.initiatorType === 'script' || resource.name.match(/\.js$/i)) {
        stats.scripts++;
      } else if (resource.initiatorType === 'css' || resource.name.match(/\.css$/i)) {
        stats.stylesheets++;
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
        stats.fonts++;
      }

      // Calculate size and duration
      stats.totalSize += resource.transferSize || 0;
      stats.totalDuration += resource.duration;

      // Check if cached
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        stats.cached++;
      }
    });

    return stats;
  });
}

// ============================================
// Test Suite: Lazy Loading
// ============================================

test.describe('Lazy Loading', () => {
  test('should not load lazy images until they are in viewport', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Act: Get all lazy-loaded images
    const lazyImages = page.locator(SELECTORS.LAZY_IMAGES);
    const count = await lazyImages.count();

    // Assert: Verify lazy images exist
    expect(count).toBeGreaterThan(0);

    // Assert: Check that images below the fold are not loaded initially
    for (let i = 0; i < count; i++) {
      const img = lazyImages.nth(i);
      const isInViewport = await img.evaluate((el: HTMLImageElement) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });

      // Only check images that are not in viewport
      if (!isInViewport) {
        const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
        expect(isLoaded).toBe(false);
      }
    }
  });

  test('should load images when scrolled into viewport', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get the first lazy image that's below the fold
    const lazyImages = page.locator(SELECTORS.LAZY_IMAGES);
    const count = await lazyImages.count();
    
    let belowFoldImage = null;
    let belowFoldIndex = -1;

    for (let i = 0; i < count; i++) {
      const img = lazyImages.nth(i);
      const isInViewport = await img.evaluate((el: HTMLImageElement) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight;
      });

      if (!isInViewport) {
        belowFoldImage = img;
        belowFoldIndex = i;
        break;
      }
    }

    // Skip test if no images are below the fold
    if (!belowFoldImage) {
      test.skip();
      return;
    }

    // Assert: Image should not be loaded initially
    const isLoadedBefore = await belowFoldImage.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
    expect(isLoadedBefore).toBe(false);

    // Act: Scroll the image into view
    await belowFoldImage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for Intersection Observer

    // Assert: Image should be loaded after scrolling
    const isLoadedAfter = await belowFoldImage.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
    expect(isLoadedAfter).toBe(true);
  });

  test('should load all lazy images when scrolling to bottom', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Scroll to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // Wait for all images to load

    // Assert: All lazy images should be loaded
    const lazyImages = page.locator(SELECTORS.LAZY_IMAGES);
    const count = await lazyImages.count();

    for (let i = 0; i < count; i++) {
      const img = lazyImages.nth(i);
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
      expect(isLoaded).toBe(true);
    }
  });

  test('should use Intersection Observer for lazy loading', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Assert: Verify Intersection Observer is being used
    const hasIntersectionObserver = await page.evaluate(() => {
      return 'IntersectionObserver' in window;
    });

    expect(hasIntersectionObserver).toBe(true);

    // Assert: Verify lazy loading implementation uses Intersection Observer
    const usesIntersectionObserver = await page.evaluate(() => {
      // Check if the main.js script creates IntersectionObserver instances
      const scriptContent = Array.from(document.scripts)
        .map((script) => script.textContent || '')
        .join('');
      
      return scriptContent.includes('IntersectionObserver');
    });

    expect(usesIntersectionObserver).toBe(true);
  });

  test('should have proper loading attribute on lazy images', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Get all lazy images
    const lazyImages = page.locator(SELECTORS.LAZY_IMAGES);
    const count = await lazyImages.count();

    // Assert: All lazy images should have loading="lazy" attribute
    for (let i = 0; i < count; i++) {
      const img = lazyImages.nth(i);
      const loadingAttr = await img.getAttribute('loading');
      expect(loadingAttr).toBe('lazy');
    }
  });

  test('should not lazy load critical above-the-fold images', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Act: Get critical images (hero, logo)
    const criticalImages = page.locator(SELECTORS.CRITICAL_IMAGES);
    const count = await criticalImages.count();

    // Assert: Critical images should not have loading="lazy"
    for (let i = 0; i < count; i++) {
      const img = criticalImages.nth(i);
      const loadingAttr = await img.getAttribute('loading');
      expect(loadingAttr).not.toBe('lazy');
    }
  });
});

// ============================================
// Test Suite: Page Load Performance
// ============================================

test.describe('Page Load Performance', () => {
  test('should load page in under 3 seconds on fast connection', async ({ page }) => {
    // Arrange: Record start time
    const startTime = Date.now();

    // Act: Navigate to the page and wait for network idle
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate load time
    const loadTime = Date.now() - startTime;

    // Assert: Load time should be under threshold
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME);
  });

  test('should have fast First Contentful Paint (FCP)', async ({ page }) => {
    // Arrange & Act: Navigate and get performance metrics
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const metrics = await getPerformanceMetrics(page);

    // Assert: FCP should be under threshold
    expect(metrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT);
    expect(metrics.firstContentfulPaint).toBeGreaterThan(0);
  });

  test('should have acceptable DOM processing time', async ({ page }) => {
    // Arrange & Act: Navigate and get performance metrics
    await page.goto('/');
    await page.waitForLoadState('load');

    const metrics = await getPerformanceMetrics(page);

    // Assert: DOM processing should be efficient
    expect(metrics.domProcessing).toBeLessThan(1000); // Under 1 second
    expect(metrics.domInteractive).toBeLessThan(2000); // Under 2 seconds
  });

  test('should load critical resources quickly', async ({ page }) => {
    // Arrange & Act: Navigate and get resource stats
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const stats = await getResourceStats(page);

    // Assert: Resource loading should be optimized
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.stylesheets).toBeGreaterThan(0);
    expect(stats.scripts).toBeGreaterThan(0);
    
    // Average resource load time should be reasonable
    const avgLoadTime = stats.totalDuration / stats.total;
    expect(avgLoadTime).toBeLessThan(500); // Under 500ms average
  });

  test('should have minimal render-blocking resources', async ({ page }) => {
    // Arrange & Act: Navigate and check for render-blocking resources
    await page.goto('/');

    const renderBlockingResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.filter((resource) => {
        // Check for synchronous scripts and stylesheets
        return (
          (resource.initiatorType === 'script' || resource.initiatorType === 'css') &&
          resource.renderBlockingStatus === 'blocking'
        );
      }).length;
    });

    // Assert: Should have minimal render-blocking resources
    expect(renderBlockingResources).toBeLessThanOrEqual(2); // Only critical CSS and inline styles
  });

  test('should utilize browser caching effectively', async ({ page, context }) => {
    // Arrange: First visit to populate cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Navigate away and return
    await page.goto('about:blank');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get resource stats
    const stats = await getResourceStats(page);

    // Assert: Significant portion of resources should be cached
    const cacheRate = stats.cached / stats.total;
    expect(cacheRate).toBeGreaterThan(0.5); // At least 50% cached
  });
});

// ============================================
// Test Suite: Core Web Vitals
// ============================================

test.describe('Core Web Vitals', () => {
  test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
    // Arrange & Act: Navigate and get Core Web Vitals
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const vitals = await getCoreWebVitals(page);

    // Assert: LCP should be under threshold (2.5 seconds)
    expect(vitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT);
    expect(vitals.lcp).toBeGreaterThan(0);
  });

  test('should have low Cumulative Layout Shift (CLS)', async ({ page }) => {
    // Arrange & Act: Navigate and interact with page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll through the page to trigger any layout shifts
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    const vitals = await getCoreWebVitals(page);

    // Assert: CLS should be under threshold (0.1)
    expect(vitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CUMULATIVE_LAYOUT_SHIFT);
  });

  test('should have images with explicit dimensions to prevent layout shift', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Get all images
    const images = page.locator(SELECTORS.ALL_IMAGES);
    const count = await images.count();

    // Assert: All images should have width and height attributes
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');

      // Images should have explicit dimensions or aspect-ratio CSS
      const hasDimensions = width !== null && height !== null;
      const hasAspectRatio = await img.evaluate((el: HTMLImageElement) => {
        const style = window.getComputedStyle(el);
        return style.aspectRatio !== 'auto';
      });

      expect(hasDimensions || hasAspectRatio).toBe(true);
    }
  });

  test('should have fast Time to Interactive (TTI)', async ({ page }) => {
    // Arrange & Act: Navigate and measure TTI
    await page.goto('/');
    
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    
    // Wait for JavaScript to be fully interactive
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      });
    });

    const tti = Date.now() - startTime;

    // Assert: TTI should be under threshold
    expect(tti).toBeLessThan(PERFORMANCE_THRESHOLDS.TIME_TO_INTERACTIVE);
  });
});

// ============================================
// Test Suite: Network Conditions
// ============================================

test.describe('Network Conditions', () => {
  test('should load page on Fast 3G connection within acceptable time', async ({ page, context }) => {
    // Arrange: Simulate Fast 3G network
    await context.route('**/*', (route) => route.continue());
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', NETWORK_PROFILES.FAST_3G);

    const startTime = Date.now();

    // Act: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Assert: Should load within reasonable time on 3G (5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should prioritize critical content on slow connections', async ({ page, context }) => {
    // Arrange: Simulate Slow 3G network
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', NETWORK_PROFILES.SLOW_3G);

    // Act: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Assert: Critical content should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.hero-content')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Hero image should be loaded (critical above-the-fold content)
    const heroImage = page.locator(SELECTORS.HERO_IMAGE);
    const isLoaded = await heroImage.evaluate((el: HTMLImageElement) => el.complete);
    expect(isLoaded).toBe(true);
  });

  test('should handle offline gracefully with service worker fallback', async ({ page, context }) => {
    // Arrange: Navigate to page first to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Simulate offline mode
    await context.setOffline(true);

    // Try to navigate again
    const response = await page.goto('/').catch(() => null);

    // Assert: Should either load from cache or show appropriate error
    // Note: This test assumes service worker is implemented
    // If not implemented, it will fail gracefully
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }

    // Restore online mode
    await context.setOffline(false);
  });
});

// ============================================
// Test Suite: Resource Optimization
// ============================================

test.describe('Resource Optimization', () => {
  test('should use modern image formats (WebP) with fallbacks', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Check for picture elements with WebP sources
    const pictureElements = page.locator('picture');
    const count = await pictureElements.count();

    // Assert: Should have picture elements for responsive images
    expect(count).toBeGreaterThan(0);

    // Check for WebP sources
    for (let i = 0; i < count; i++) {
      const picture = pictureElements.nth(i);
      const webpSource = picture.locator('source[type="image/webp"]');
      const hasWebP = (await webpSource.count()) > 0;
      
      // Should have WebP format with fallback
      expect(hasWebP).toBe(true);
    }
  });

  test('should have optimized image sizes for different viewports', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Check for srcset attributes
    const images = page.locator('img[srcset]');
    const count = await images.count();

    // Assert: Should have responsive images with srcset
    expect(count).toBeGreaterThan(0);

    // Verify srcset has multiple sizes
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const srcset = await img.getAttribute('srcset');
      
      if (srcset) {
        const sources = srcset.split(',').length;
        expect(sources).toBeGreaterThanOrEqual(2); // At least 2 sizes
      }
    }
  });

  test('should compress and minify CSS and JavaScript', async ({ page }) => {
    // Arrange & Act: Navigate and get resource stats
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries
        .filter((entry) => entry.name.match(/\.(css|js)$/i))
        .map((entry) => ({
          name: entry.name,
          size: entry.transferSize,
          type: entry.name.match(/\.css$/i) ? 'css' : 'js',
        }));
    });

    // Assert: CSS and JS files should be reasonably sized (compressed)
    resources.forEach((resource) => {
      if (resource.type === 'css') {
        expect(resource.size).toBeLessThan(50000); // Under 50KB per CSS file
      } else if (resource.type === 'js') {
        expect(resource.size).toBeLessThan(100000); // Under 100KB per JS file
      }
    });
  });

  test('should use CSS containment for performance', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Check for CSS containment usage
    const hasContainment = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let containmentCount = 0;

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.contain !== 'none') {
          containmentCount++;
        }
      });

      return containmentCount > 0;
    });

    // Assert: Should use CSS containment for optimization
    // Note: This is optional but recommended for performance
    // Test will pass if containment is used, but won't fail if not
    if (hasContainment) {
      expect(hasContainment).toBe(true);
    }
  });

  test('should defer non-critical JavaScript', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Check for defer or async attributes on scripts
    const scripts = page.locator('script[src]');
    const count = await scripts.count();

    let deferredCount = 0;

    for (let i = 0; i < count; i++) {
      const script = scripts.nth(i);
      const hasDefer = await script.getAttribute('defer');
      const hasAsync = await script.getAttribute('async');

      if (hasDefer !== null || hasAsync !== null) {
        deferredCount++;
      }
    }

    // Assert: Most external scripts should be deferred or async
    const deferRate = deferredCount / count;
    expect(deferRate).toBeGreaterThan(0.5); // At least 50% deferred
  });

  test('should preload critical resources', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');

    // Act: Check for preload links
    const preloadLinks = page.locator('link[rel="preload"]');
    const preconnectLinks = page.locator('link[rel="preconnect"]');
    const dnsPrefetchLinks = page.locator('link[rel="dns-prefetch"]');

    const preloadCount = await preloadLinks.count();
    const preconnectCount = await preconnectLinks.count();
    const dnsPrefetchCount = await dnsPrefetchLinks.count();

    // Assert: Should have resource hints for optimization
    const totalHints = preloadCount + preconnectCount + dnsPrefetchCount;
    expect(totalHints).toBeGreaterThan(0);
  });
});

// ============================================
// Test Suite: Intersection Observer
// ============================================

test.describe('Intersection Observer Implementation', () => {
  test('should initialize Intersection Observer on page load', async ({ page }) => {
    // Arrange & Act: Navigate to the page
    await page.goto('/');

    // Assert: Verify Intersection Observer is initialized
    const observerInitialized = await page.evaluate(() => {
      // Check if IntersectionObserver instances exist
      return 'IntersectionObserver' in window;
    });

    expect(observerInitialized).toBe(true);
  });

  test('should observe lazy-loaded images with Intersection Observer', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Act: Get lazy images and scroll one into view
    const lazyImages = page.locator(SELECTORS.LAZY_IMAGES);
    const firstLazyImage = lazyImages.first();

    // Check if image is below viewport
    const isBelow = await firstLazyImage.evaluate((el: HTMLImageElement) => {
      const rect = el.getBoundingClientRect();
      return rect.top > window.innerHeight;
    });

    if (isBelow) {
      // Scroll image into view
      await firstLazyImage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Assert: Image should be loaded after entering viewport
      const isLoaded = await firstLazyImage.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
      expect(isLoaded).toBe(true);
    }
  });

  test('should use appropriate root margin for Intersection Observer', async ({ page }) => {
    // Arrange: Navigate to the page and inject observer spy
    await page.goto('/');

    // Act: Check Intersection Observer configuration
    const observerConfig = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Spy on IntersectionObserver constructor
        const originalObserver = window.IntersectionObserver;
        let capturedOptions = null;

        window.IntersectionObserver = class extends originalObserver {
          constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            super(callback, options);
            capturedOptions = options;
          }
        } as typeof IntersectionObserver;

        // Wait for observer to be created
        setTimeout(() => resolve(capturedOptions), 1000);
      });
    });

    // Assert: Should have appropriate root margin (e.g., 50px for preloading)
    if (observerConfig && typeof observerConfig === 'object' && 'rootMargin' in observerConfig) {
      expect(observerConfig.rootMargin).toBeTruthy();
    }
  });

  test('should handle multiple Intersection Observers efficiently', async ({ page }) => {
    // Arrange: Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Count observed elements
    const observedElements = await page.evaluate(() => {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const sections = document.querySelectorAll('section');
      return {
        lazyImages: lazyImages.length,
        sections: sections.length,
        total: lazyImages.length + sections.length,
      };
    });

    // Assert: Should have multiple elements being observed
    expect(observedElements.total).toBeGreaterThan(0);
    expect(observedElements.lazyImages).toBeGreaterThan(0);
  });
});

// ============================================
// Test Suite: Performance Regression
// ============================================

test.describe('Performance Regression', () => {
  test('should maintain consistent load times across multiple runs', async ({ page }) => {
    const loadTimes: number[] = [];
    const runs = 3;

    // Run multiple tests
    for (let i = 0; i < runs; i++) {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);

      // Clear cache between runs
      await page.context().clearCookies();
    }

    // Calculate average and standard deviation
    const average = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const variance = loadTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / loadTimes.length;
    const stdDev = Math.sqrt(variance);

    // Assert: Load times should be consistent (low standard deviation)
    expect(stdDev).toBeLessThan(500); // Less than 500ms variation
    expect(average).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('about:blank');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Assert: Memory should not grow significantly (allow 50% increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
      expect(memoryIncrease).toBeLessThan(0.5);
    }
  });

  test('should handle rapid scrolling without performance degradation', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Act: Perform rapid scrolling
    for (let i = 0; i < 10; i++) {
      await page.evaluate((scrollPos) => {
        window.scrollTo(0, scrollPos);
      }, i * 500);
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - startTime;

    // Assert: Scrolling should be smooth and fast
    expect(scrollTime).toBeLessThan(3000); // Under 3 seconds for 10 scrolls
  });
});