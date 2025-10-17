# Drisya - Quality Assurance Testing Guide

## Overview
This comprehensive QA guide covers all aspects of testing the Drisya AI-powered image enhancement platform, including functional testing, user acceptance testing, and performance validation.

## Table of Contents
1. [Pre-Testing Setup](#pre-testing-setup)
2. [Core Feature Testing](#core-feature-testing)
3. [User Management Testing](#user-management-testing)
4. [Payment & Coin System Testing](#payment--coin-system-testing)
5. [Admin Panel Testing](#admin-panel-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Browser Compatibility](#browser-compatibility)
9. [Mobile Responsiveness](#mobile-responsiveness)
10. [Bug Reporting Template](#bug-reporting-template)

---

## Pre-Testing Setup

### Environment Requirements
- ✅ XAMPP running (Apache + MySQL)
- ✅ Node.js v18+ installed
- ✅ Database `drisya` created
- ✅ Server running on port 5000
- ✅ Python service running on port 5001

### Test Data Preparation
```sql
-- Create test users with different roles
INSERT INTO users (email, password, name, role, user_tier, coin_balance) VALUES
('admin@test.com', '$2b$10$hashedpassword', 'Test Admin', 'admin', 'enterprise', 10000),
('user@test.com', '$2b$10$hashedpassword', 'Test User', 'user', 'free', 100),
('premium@test.com', '$2b$10$hashedpassword', 'Premium User', 'user', 'premium', 500);
```

### Test Images
Prepare test images in different formats:
- ✅ Small image (< 1MB): `test-small.jpg`
- ✅ Medium image (1-5MB): `test-medium.png`
- ✅ Large image (5-10MB): `test-large.jpeg`
- ✅ ZIP file with multiple images: `test-batch.zip`

---

## Core Feature Testing

### 1. Image Upload & Processing

#### Test Case 1.1: Single Image Upload
**Steps:**
1. Navigate to Upload page
2. Drag and drop a single image
3. Verify image preview appears
4. Click "Upload Images"

**Expected Results:**
- ✅ Image uploads successfully
- ✅ Preview shows correct image
- ✅ File size and format displayed
- ✅ Upload progress indicator works

#### Test Case 1.2: Multiple Image Upload
**Steps:**
1. Select multiple images (3-5 files)
2. Upload all at once
3. Verify each image preview

**Expected Results:**
- ✅ All images upload successfully
- ✅ Individual previews for each image
- ✅ Batch processing options available

#### Test Case 1.3: ZIP File Upload
**Steps:**
1. Upload a ZIP file containing images
2. Verify extraction and preview

**Expected Results:**
- ✅ ZIP extracts automatically
- ✅ Individual images shown
- ✅ Batch processing enabled

### 2. Template Selection & Application

#### Test Case 2.1: Template Gallery
**Steps:**
1. Navigate to Templates page
2. Browse available templates
3. Use search and filter functions

**Expected Results:**
- ✅ 20+ templates displayed
- ✅ Categories work (jewelry, fashion, etc.)
- ✅ Search functionality works
- ✅ Template previews load correctly

#### Test Case 2.2: Template Application
**Steps:**
1. Select a template (e.g., "Velvet Luxury")
2. Upload test images
3. Start processing
4. Monitor job progress

**Expected Results:**
- ✅ Template selection saves
- ✅ Processing starts immediately
- ✅ Progress updates in real-time
- ✅ Processing completes within 5-8 seconds per image

### 3. Background Removal & Enhancement

#### Test Case 3.1: AI Background Removal
**Steps:**
1. Upload product images with complex backgrounds
2. Apply any template
3. Verify background removal quality

**Expected Results:**
- ✅ Clean background removal
- ✅ Product edges preserved
- ✅ No artifacts or rough edges
- ✅ Transparent background created

#### Test Case 3.2: Professional Effects
**Steps:**
1. Process images with different lighting presets
2. Test various background styles
3. Verify enhancement effects

**Expected Results:**
- ✅ Lighting effects applied correctly
- ✅ Shadows and vignette added
- ✅ Color grading enhances appearance
- ✅ Output is 1080x1080px PNG format

---

## User Management Testing

### 4. Authentication System

#### Test Case 4.1: User Registration
**Steps:**
1. Navigate to Register page
2. Fill registration form
3. Submit and verify email

**Expected Results:**
- ✅ Account created successfully
- ✅ Default free tier assigned
- ✅ 50 coins initial balance
- ✅ Email validation works

#### Test Case 4.2: User Login
**Steps:**
1. Navigate to Login page
2. Enter valid credentials
3. Test "Remember Me" option

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to Dashboard
- ✅ Session persists correctly
- ✅ User data loads properly

#### Test Case 4.3: Password Security
**Steps:**
1. Test weak password rejection
2. Test password reset flow
3. Verify password hashing

**Expected Results:**
- ✅ Strong password requirements enforced
- ✅ Password reset email sent
- ✅ Passwords stored as hashed values
- ✅ No plain text passwords in database

### 5. User Roles & Permissions

#### Test Case 5.1: Free Tier Limitations
**Steps:**
1. Login as free user
2. Try to exceed monthly quota (50 images)
3. Test premium template access

**Expected Results:**
- ✅ Quota enforcement works
- ✅ Premium templates locked
- ✅ Upgrade prompts shown
- ✅ Usage tracking accurate

#### Test Case 5.2: Admin Access
**Steps:**
1. Login as admin user
2. Access admin panel
3. Test user management functions

**Expected Results:**
- ✅ Admin panel accessible
- ✅ User list and management works
- ✅ System statistics displayed
- ✅ Admin-only features available

---

## Payment & Coin System Testing

### 6. Coin Package Management

#### Test Case 6.1: Create Coin Package (Admin)
**Steps:**
1. Login as admin
2. Navigate to Admin > Coin Packages
3. Create new package with details:
   - Name: "Starter Pack"
   - Coins: 100
   - Price: ₹299
   - Description: "Perfect for beginners"

**Expected Results:**
- ✅ Package created successfully
- ✅ Details saved correctly
- ✅ Package appears in user store
- ✅ Pricing calculations accurate

#### Test Case 6.2: Coin Package Purchase Flow
**Steps:**
1. Login as regular user
2. Navigate to Wallet/Store
3. Select a coin package
4. Complete purchase process

**Expected Results:**
- ✅ Package details display correctly
- ✅ Purchase flow smooth
- ✅ Payment integration works
- ✅ Coins added to user balance

#### Test Case 6.3: Manual Transaction Processing
**Steps:**
1. User submits manual payment (WhatsApp/UPI)
2. Admin reviews transaction
3. Admin approves/rejects payment

**Expected Results:**
- ✅ Manual transaction recorded
- ✅ Admin notification sent
- ✅ Approval process works
- ✅ Coins credited on approval

### 7. Coin Usage & Deduction

#### Test Case 7.1: Coin Deduction on Processing
**Steps:**
1. Check user coin balance
2. Process images (note coin cost)
3. Verify balance after processing

**Expected Results:**
- ✅ Coins deducted correctly
- ✅ Transaction recorded
- ✅ Balance updated in real-time
- ✅ Insufficient coins handled gracefully

#### Test Case 7.2: Refund Processing
**Steps:**
1. Process fails due to system error
2. Verify automatic refund
3. Check transaction history

**Expected Results:**
- ✅ Failed jobs trigger refunds
- ✅ Coins restored to balance
- ✅ Refund transaction recorded
- ✅ User notified of refund

---

## Admin Panel Testing

### 8. User Management

#### Test Case 8.1: User List & Search
**Steps:**
1. Access Admin > Users
2. Browse user list
3. Use search and filters

**Expected Results:**
- ✅ All users displayed with details
- ✅ Search by email/name works
- ✅ Filter by role/tier works
- ✅ Pagination functions correctly

#### Test Case 8.2: User Role Management
**Steps:**
1. Select a user
2. Change role (user ↔ admin)
3. Update user tier
4. Modify coin balance

**Expected Results:**
- ✅ Role changes apply immediately
- ✅ Permissions update correctly
- ✅ Tier changes affect quotas
- ✅ Coin balance updates accurately

### 9. System Analytics

#### Test Case 9.1: Dashboard Statistics
**Steps:**
1. Access Admin Dashboard
2. Review key metrics
3. Check data accuracy

**Expected Results:**
- ✅ User count accurate
- ✅ Processing statistics correct
- ✅ Revenue metrics displayed
- ✅ Charts and graphs functional

#### Test Case 9.2: Transaction Monitoring
**Steps:**
1. Access Admin > Transactions
2. Review payment history
3. Filter by date/type/user

**Expected Results:**
- ✅ All transactions listed
- ✅ Filtering works correctly
- ✅ Transaction details complete
- ✅ Export functionality works

---

## Performance Testing

### 10. Load Testing

#### Test Case 10.1: Concurrent Users
**Steps:**
1. Simulate 10+ concurrent users
2. Upload images simultaneously
3. Monitor system performance

**Expected Results:**
- ✅ System handles concurrent load
- ✅ No significant slowdown
- ✅ All uploads process successfully
- ✅ Database remains responsive

#### Test Case 10.2: Large File Handling
**Steps:**
1. Upload maximum size images (10MB+)
2. Process large batches (20+ images)
3. Monitor memory usage

**Expected Results:**
- ✅ Large files upload successfully
- ✅ Processing completes without errors
- ✅ Memory usage remains stable
- ✅ No server crashes or timeouts

### 11. Database Performance

#### Test Case 11.1: Query Optimization
**Steps:**
1. Monitor database queries during heavy usage
2. Check for slow queries
3. Verify indexing effectiveness

**Expected Results:**
- ✅ Queries execute under 100ms
- ✅ No N+1 query problems
- ✅ Indexes used effectively
- ✅ Connection pooling works

---

## Security Testing

### 12. Authentication Security

#### Test Case 12.1: SQL Injection Protection
**Steps:**
1. Attempt SQL injection in login forms
2. Test parameter manipulation
3. Verify input sanitization

**Expected Results:**
- ✅ SQL injection attempts blocked
- ✅ Parameters properly sanitized
- ✅ Error messages don't reveal system info
- ✅ Database queries use prepared statements

#### Test Case 12.2: Session Security
**Steps:**
1. Test session hijacking attempts
2. Verify session timeout
3. Check secure cookie settings

**Expected Results:**
- ✅ Sessions properly secured
- ✅ Timeout enforced correctly
- ✅ Cookies marked secure/httpOnly
- ✅ CSRF protection active

### 13. File Upload Security

#### Test Case 13.1: Malicious File Protection
**Steps:**
1. Attempt to upload executable files
2. Test oversized files
3. Try unsupported formats

**Expected Results:**
- ✅ Executable files rejected
- ✅ File size limits enforced
- ✅ Only image formats accepted
- ✅ File content validation works

---

## Browser Compatibility

### 14. Cross-Browser Testing

#### Test Case 14.1: Modern Browsers
**Test on:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Features to verify:**
- ✅ File upload (drag & drop)
- ✅ Image previews
- ✅ Real-time updates
- ✅ Payment processing

#### Test Case 14.2: Older Browser Support
**Test on:**
- ✅ Chrome (2 versions back)
- ✅ Firefox (2 versions back)
- ✅ Safari (iOS 14+)

**Expected Results:**
- ✅ Core functionality works
- ✅ Graceful degradation for unsupported features
- ✅ Clear browser compatibility messages

---

## Mobile Responsiveness

### 15. Mobile Device Testing

#### Test Case 15.1: Smartphone Testing
**Test on:**
- ✅ iPhone (iOS 14+)
- ✅ Android (Android 10+)
- ✅ Various screen sizes

**Features to verify:**
- ✅ Touch-friendly interface
- ✅ Mobile file upload
- ✅ Responsive layout
- ✅ Performance on mobile networks

#### Test Case 15.2: Tablet Testing
**Test on:**
- ✅ iPad
- ✅ Android tablets

**Expected Results:**
- ✅ Optimized tablet layout
- ✅ Touch gestures work
- ✅ All features accessible

---

## Bug Reporting Template

### Bug Report Format

```markdown
**Bug ID:** BUG-YYYY-MM-DD-XXX
**Date:** [Date Found]
**Tester:** [Your Name]
**Environment:** [Browser/OS/Device]

**Summary:** [Brief description of the bug]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]

**Severity:** [Critical/High/Medium/Low]
**Priority:** [P1/P2/P3/P4]

**Screenshots:** [Attach if applicable]
**Console Errors:** [Any browser console errors]
**Additional Notes:** [Any other relevant information]
```

### Severity Levels

- **Critical:** System crash, data loss, security vulnerability
- **High:** Major feature broken, blocking user workflow
- **Medium:** Feature partially working, workaround available
- **Low:** Minor UI issue, cosmetic problem

### Priority Levels

- **P1:** Fix immediately (Critical bugs)
- **P2:** Fix in current sprint (High severity)
- **P3:** Fix in next release (Medium severity)
- **P4:** Fix when time permits (Low severity)

---

## Test Completion Checklist

### Pre-Release Checklist
- [ ] All core features tested and working
- [ ] User authentication secure and functional
- [ ] Payment system tested with real transactions
- [ ] Admin panel fully functional
- [ ] Performance meets requirements
- [ ] Security vulnerabilities addressed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Database backup and recovery tested
- [ ] Error handling and logging working
- [ ] User documentation updated
- [ ] Admin training materials prepared

### Sign-off
**QA Lead:** _________________ **Date:** _________
**Product Owner:** _____________ **Date:** _________
**Technical Lead:** ____________ **Date:** _________

---

## Contact Information

**QA Team:** qa@drisya.app
**Bug Reports:** bugs@drisya.app
**Feature Requests:** features@drisya.app

**Emergency Contact:** +91-XXXXX-XXXXX
