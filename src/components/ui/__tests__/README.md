# MobileTemplateSelector Test Suite

This directory contains comprehensive tests for the MobileTemplateSelector component, covering visual regression, accessibility, and touch interaction testing as specified in task 8 of the mobile-journal-templates spec.

## Test Files Overview

### 1. Visual Regression Tests (`MobileTemplateSelector.visual.test.tsx`)
- **Purpose**: Screenshot tests for mobile collapsed and expanded states
- **Coverage**:
  - Mobile viewport testing (320px, 375px, 414px)
  - Collapsed and expanded state screenshots
  - Animation and transition captures
  - Error state visual verification
  - Focus and hover state screenshots

### 2. Accessibility Tests (`MobileTemplateSelector.accessibility.test.tsx`)
- **Purpose**: Comprehensive accessibility and ARIA implementation testing
- **Coverage**:
  - ARIA attributes validation
  - Keyboard navigation testing
  - Focus management verification
  - Screen reader compatibility
  - Axe accessibility violations detection
  - Color contrast and visual accessibility

### 3. Touch Interaction Tests (`MobileTemplateSelector.touch.test.tsx`)
- **Purpose**: Touch behavior verification on various mobile screen sizes
- **Coverage**:
  - Touch target size validation (minimum 44px)
  - Touch event handling
  - Thumb-friendly positioning
  - Touch gesture support
  - Performance testing
  - Orientation change handling

### 4. Comprehensive Integration Tests (`MobileTemplateSelector.comprehensive.test.tsx`)
- **Purpose**: End-to-end integration testing combining all aspects
- **Coverage**:
  - Complete user journey testing
  - Error recovery scenarios
  - Performance and memory testing
  - Cross-browser compatibility
  - Form system integration

## Running the Tests

### Individual Test Suites

```bash
# Run accessibility tests only
npm run test:accessibility

# Run touch interaction tests only
npm run test:touch

# Run comprehensive integration tests only
npm run test:comprehensive

# Run visual regression tests only
npm run test:visual
```

### Complete Test Suite

```bash
# Run all MobileTemplateSelector tests
npm run test:mobile-template-selector
```

### Development Testing

```bash
# Run tests in watch mode for development
npm run test:watch

# Run tests with UI for interactive debugging
npm run test:ui
```

## Test Requirements Mapping

This test suite addresses the following requirements from the mobile-journal-templates spec:

### Requirement 1.1 (Mobile Interface Cleanliness)
- **Visual Tests**: Screenshot verification of collapsed state showing only selected template
- **Touch Tests**: Touch target validation for clean mobile interface
- **Accessibility Tests**: Screen reader compatibility for clean interface

### Requirement 2.1 (Template Access)
- **Visual Tests**: Expanded state screenshots showing all templates
- **Touch Tests**: Touch interaction validation for dropdown functionality
- **Accessibility Tests**: Keyboard navigation for template access

### Requirement 4.1 (Responsive Behavior)
- **Visual Tests**: Multiple viewport size screenshots (320px, 375px, 414px)
- **Touch Tests**: Touch target validation across different screen sizes
- **Comprehensive Tests**: Responsive behavior integration testing

## Test Environment Setup

### Prerequisites

The following packages are required and should be installed:

```bash
npm install --save-dev @playwright/test playwright jest-axe @axe-core/playwright
```

### Configuration Files

- `playwright.config.ts`: Playwright configuration for visual regression tests
- `vite.config.ts`: Vitest configuration with jsdom environment
- `src/test/setup.ts`: Test setup with mocks and utilities

### Mock Data

All tests use consistent mock template data:
- Cash Sale
- Credit Sale  
- Cash Purchase
- Credit Purchase

## Visual Regression Testing

### Screenshot Naming Convention

Screenshots are automatically generated with descriptive names:
- `mobile-template-selector-collapsed-{viewport}px.png`
- `mobile-template-selector-expanded-{viewport}px.png`
- `mobile-template-selector-{state}-{condition}.png`

### Updating Screenshots

To update baseline screenshots:

```bash
# Update all visual regression baselines
npx playwright test --update-snapshots

# Update specific test screenshots
npx playwright test MobileTemplateSelector.visual.test.tsx --update-snapshots
```

## Accessibility Testing

### Axe Rules

Tests use the axe-core accessibility engine to detect:
- ARIA implementation issues
- Color contrast problems
- Keyboard navigation issues
- Focus management problems
- Screen reader compatibility issues

### Manual Testing Recommendations

While automated tests cover most accessibility concerns, manual testing is recommended for:
- Screen reader announcement quality
- Voice control compatibility
- Switch control navigation
- High contrast mode appearance

## Touch Testing

### Device Simulation

Touch tests simulate various mobile devices:
- iPhone SE (320px × 568px)
- iPhone 12 (375px × 812px)
- iPhone 12 Pro Max (414px × 896px)
- iPad (768px × 1024px)

### Touch Target Validation

All interactive elements are validated to meet the minimum 44px touch target size as per Apple and Google accessibility guidelines.

## Performance Considerations

### Test Performance

- Visual regression tests may take longer due to screenshot generation
- Touch tests include performance timing validations
- Comprehensive tests include memory leak detection

### CI/CD Integration

Tests are configured for CI environments:
- Retry logic for flaky visual tests
- Parallel execution where possible
- Artifact collection for failed tests

## Troubleshooting

### Common Issues

1. **Visual Test Failures**: Usually due to font rendering differences between environments
   - Solution: Update screenshots or use more flexible matching

2. **Touch Test Failures**: May occur due to timing issues in test environment
   - Solution: Increase wait times or use more robust selectors

3. **Accessibility Test Failures**: Often due to missing ARIA attributes
   - Solution: Check component implementation against ARIA best practices

### Debug Mode

Run tests in debug mode for troubleshooting:

```bash
# Debug visual tests
npx playwright test --debug

# Debug unit tests with UI
npm run test:ui
```

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Include appropriate requirement mappings in comments
3. Add comprehensive error scenarios
4. Update this README with new test descriptions
5. Ensure tests are deterministic and not flaky

## Requirements Verification

This test suite verifies all sub-tasks from task 8:

- ✅ Create screenshot tests for mobile collapsed and expanded states
- ✅ Add keyboard navigation tests for dropdown functionality  
- ✅ Test screen reader compatibility with ARIA implementations
- ✅ Verify touch interaction behavior on various mobile screen sizes

All tests map to requirements 1.1, 2.1, and 4.1 as specified in the task details.