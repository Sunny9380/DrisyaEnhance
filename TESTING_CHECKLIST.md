# Drisya Application - Testing Checklist
## Systematic Testing Following QA Documentation

### Testing Session: [Date/Time]
### Tester: [Your Name]
### Environment: Development/Production

---

## ✅ Phase 1: Pre-Testing Setup Verification

### Environment Requirements Check
- [ ] **XAMPP Status**: Apache and MySQL running
- [ ] **Database**: `drisya` database exists and accessible
- [ ] **Server**: Node.js server running on port 5000
- [ ] **Python Service**: AI service running on port 5001 (if applicable)
- [ ] **Browser**: Latest Chrome/Firefox/Safari available

### Quick Environment Test
```bash
# Test database connection
mysql -u root -p -e "USE drisya; SHOW TABLES;"

# Test server response
curl http://localhost:5000/api/health

# Check server logs
npm run dev
```

### Test Data Preparation
- [ ] **Test Images Ready**: 
  - Small image (< 1MB): `test-small.jpg`
  - Medium image (1-5MB): `test-medium.png` 
  - Large image (5-10MB): `test-large.jpeg`
- [ ] **Test User Accounts**:
  - Regular user: `testuser@example.com`
  - Admin user: `admin@example.com`
  - Premium user: `premium@example.com`

**Status**: ⏳ In Progress | ✅ Complete | ❌ Failed

---

## ✅ Phase 2: Core Feature Testing

### Test Case 2.1: Single Image Upload
**Priority**: Critical | **Time**: 5 minutes

**Steps**:
1. Navigate to Upload page (`/upload`)
2. Drag and drop `test-small.jpg`
3. Verify image preview appears
4. Check file information display
5. Click "Upload Images"

**Expected Results**:
- [ ] Image uploads successfully
- [ ] Preview shows correct image
- [ ] File size and format displayed correctly
- [ ] Upload progress indicator works
- [ ] No console errors

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 2.2: Multiple Image Upload
**Priority**: High | **Time**: 5 minutes

**Steps**:
1. Select multiple images (3-5 files)
2. Upload all at once
3. Verify each image preview
4. Check batch processing options

**Expected Results**:
- [ ] All images upload successfully
- [ ] Individual previews for each image
- [ ] Batch processing options available
- [ ] Total file count displayed

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 2.3: Template Selection & Application
**Priority**: Critical | **Time**: 10 minutes

**Steps**:
1. Navigate to Templates page (`/templates`)
2. Browse available templates
3. Select "Velvet Luxury" template
4. Apply to uploaded images
5. Start processing
6. Monitor progress

**Expected Results**:
- [ ] 20+ templates displayed
- [ ] Template preview loads correctly
- [ ] Template selection saves
- [ ] Processing starts immediately
- [ ] Progress updates in real-time
- [ ] Processing completes within 5-8 seconds per image

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

## ✅ Phase 3: User Management Testing

### Test Case 3.1: User Registration
**Priority**: Critical | **Time**: 5 minutes

**Steps**:
1. Navigate to Register page (`/register`)
2. Fill registration form:
   - Email: `newuser@test.com`
   - Password: `TestPass123!`
   - Name: `Test User`
3. Submit form
4. Check for confirmation

**Expected Results**:
- [ ] Account created successfully
- [ ] Default free tier assigned
- [ ] 50 coins initial balance
- [ ] Redirected to dashboard
- [ ] Welcome message displayed

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 3.2: User Login
**Priority**: Critical | **Time**: 3 minutes

**Steps**:
1. Navigate to Login page (`/login`)
2. Enter credentials:
   - Email: `newuser@test.com`
   - Password: `TestPass123!`
3. Click "Login"
4. Test "Remember Me" option

**Expected Results**:
- [ ] Login successful
- [ ] Redirected to Dashboard
- [ ] User data loads properly
- [ ] Session persists correctly

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

## ✅ Phase 4: Coin Package & Payment Testing

### Test Case 4.1: View Coin Packages
**Priority**: High | **Time**: 3 minutes

**Steps**:
1. Navigate to Wallet/Store (`/wallet`)
2. Browse available coin packages
3. Check package details
4. Verify pricing display

**Expected Results**:
- [ ] Multiple packages displayed
- [ ] Pricing in INR shown correctly
- [ ] Package descriptions visible
- [ ] "Buy Now" buttons functional

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 4.2: Coin Usage During Processing
**Priority**: Critical | **Time**: 5 minutes

**Steps**:
1. Check current coin balance
2. Process 1 image (note cost)
3. Verify balance after processing
4. Check transaction history

**Expected Results**:
- [ ] Coins deducted correctly
- [ ] Balance updated in real-time
- [ ] Transaction recorded
- [ ] Processing completes successfully

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

## ✅ Phase 5: Admin Panel Testing

### Test Case 5.1: Admin Login & Dashboard
**Priority**: High | **Time**: 5 minutes

**Steps**:
1. Login as admin user
2. Navigate to Admin panel (`/admin`)
3. Review dashboard statistics
4. Check user management access

**Expected Results**:
- [ ] Admin panel accessible
- [ ] Dashboard shows statistics
- [ ] User list visible
- [ ] Admin-only features available

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 5.2: Create Coin Package (Admin)
**Priority**: High | **Time**: 10 minutes

**Steps**:
1. Navigate to Admin > Coin Packages
2. Click "Create New Package"
3. Fill package details:
   - Name: "Test Package"
   - Coins: 50
   - Price: ₹199
   - Description: "Testing package"
4. Save package
5. Verify it appears in user store

**Expected Results**:
- [ ] Package creation form works
- [ ] Package saves successfully
- [ ] Package appears in user store
- [ ] Pricing calculations correct

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 5.3: User Management (Admin)
**Priority**: High | **Time**: 10 minutes

**Steps**:
1. Navigate to Admin > Users
2. Search for test user
3. Edit user profile
4. Change user tier (Free → Premium)
5. Add coins to user balance

**Expected Results**:
- [ ] User search works
- [ ] User details editable
- [ ] Tier changes apply
- [ ] Coin balance updates
- [ ] Changes reflect immediately

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

## ✅ Phase 6: Performance & Browser Testing

### Test Case 6.1: Large File Upload
**Priority**: Medium | **Time**: 10 minutes

**Steps**:
1. Upload large image (5-10MB)
2. Monitor upload progress
3. Process the large image
4. Check processing time
5. Verify output quality

**Expected Results**:
- [ ] Large file uploads successfully
- [ ] Progress indicator works
- [ ] Processing completes without errors
- [ ] Output quality maintained
- [ ] No memory issues

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 6.2: Browser Compatibility
**Priority**: Medium | **Time**: 15 minutes

**Test Browsers**:
- [ ] **Chrome**: Latest version
- [ ] **Firefox**: Latest version  
- [ ] **Safari**: Latest version (if on Mac)
- [ ] **Edge**: Latest version

**Features to Test in Each Browser**:
- [ ] File upload (drag & drop)
- [ ] Image previews
- [ ] Template selection
- [ ] Processing workflow
- [ ] Payment interface

**Results by Browser**:
```
Chrome: [Pass/Fail - Notes]
Firefox: [Pass/Fail - Notes]
Safari: [Pass/Fail - Notes]
Edge: [Pass/Fail - Notes]
```

---

## ✅ Phase 7: Security Testing

### Test Case 7.1: File Upload Security
**Priority**: High | **Time**: 10 minutes

**Steps**:
1. Try uploading non-image file (.txt, .exe)
2. Try uploading oversized file (>10MB)
3. Test with corrupted image file
4. Verify error handling

**Expected Results**:
- [ ] Non-image files rejected
- [ ] Oversized files rejected
- [ ] Corrupted files handled gracefully
- [ ] Appropriate error messages shown

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

### Test Case 7.2: Authentication Security
**Priority**: High | **Time**: 10 minutes

**Steps**:
1. Test login with wrong password
2. Test SQL injection in login form
3. Test session timeout
4. Test unauthorized admin access

**Expected Results**:
- [ ] Wrong password rejected
- [ ] SQL injection blocked
- [ ] Session timeout works
- [ ] Admin areas protected

**Actual Results**: 
```
[Record your observations here]
```

**Status**: ⏳ Pending | ✅ Pass | ❌ Fail

---

## ✅ Phase 8: Mobile Responsiveness

### Test Case 8.1: Mobile Interface
**Priority**: Medium | **Time**: 15 minutes

**Test Devices/Sizes**:
- [ ] **Mobile Portrait**: 375x667px
- [ ] **Mobile Landscape**: 667x375px
- [ ] **Tablet Portrait**: 768x1024px
- [ ] **Tablet Landscape**: 1024x768px

**Features to Test**:
- [ ] Navigation menu
- [ ] File upload interface
- [ ] Image previews
- [ ] Template gallery
- [ ] Processing workflow

**Results**:
```
Mobile Portrait: [Pass/Fail - Notes]
Mobile Landscape: [Pass/Fail - Notes]
Tablet Portrait: [Pass/Fail - Notes]
Tablet Landscape: [Pass/Fail - Notes]
```

---

## 🐛 Bug Report Template

### Bug ID: BUG-2024-10-18-001
**Date Found**: [Date]
**Tester**: [Your Name]
**Browser/Device**: [Browser and Version]

**Summary**: [Brief description of the bug]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]

**Severity**: Critical/High/Medium/Low
**Priority**: P1/P2/P3/P4

**Screenshots**: [Attach if needed]
**Console Errors**: [Any browser console errors]

---

## 📊 Testing Summary

### Overall Test Results
```
Total Test Cases: 16
├── Passed: __ / 16
├── Failed: __ / 16
├── Blocked: __ / 16
└── Not Tested: __ / 16

Pass Rate: __%
```

### Critical Issues Found
1. [Issue 1 - Description]
2. [Issue 2 - Description]
3. [Issue 3 - Description]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

### Sign-off
**Tester**: _________________ **Date**: _________
**Status**: Ready for Production / Needs Fixes / Major Issues Found

---

## 📞 Support During Testing

If you encounter issues during testing:
- **Check Console**: Browser Developer Tools > Console
- **Check Network**: Developer Tools > Network tab
- **Server Logs**: Check terminal where `npm run dev` is running
- **Database**: Check MySQL for data consistency

**Need Help?** Document any issues and we'll troubleshoot together!
