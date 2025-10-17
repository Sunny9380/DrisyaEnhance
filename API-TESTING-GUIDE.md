# 🧪 API Testing & Problem Fixing Guide

## Quick Start

### 🚀 One-Command Fix Everything
```bash
npm run fix:all
```
This will:
1. ✅ Set up the database
2. ✅ Build the application  
3. ✅ Test all API endpoints
4. ✅ Report any issues found

## Individual Testing Commands

### 🗄️ Database Setup & Testing
```bash
# Setup database manually (bypasses Drizzle issues)
npm run db:setup

# Test database environment
npm run db:test

# Try Drizzle push (if you want to test it)
npm run db:push
```

### 🌐 API Testing
```bash
# Test all API endpoints
npm run test:api

# Run complete test suite
npm run test:all
```

## What Gets Tested

### 🔐 Authentication APIs
- ✅ **POST /api/auth/register** - User registration
- ✅ **POST /api/auth/login** - User login  
- ✅ **GET /api/auth/me** - Get current user profile

### 📁 Media & Gallery APIs
- ✅ **GET /api/media** - Media gallery endpoint
- ✅ **GET /api/media-library** - Media library endpoint
- ✅ **POST /api/gallery/upload-images** - Image upload to gallery

### 🎨 Template APIs
- ✅ **GET /api/templates** - Get all templates
- ✅ **GET /api/templates/:id** - Get specific template

### 👑 Admin APIs
- ✅ **GET /api/admin/stats** - Admin statistics (protected)
- ✅ **GET /api/admin/users** - User management (protected)

### 🔧 System Tests
- ✅ **Database Connection** - Verify MySQL connectivity
- ✅ **Session Management** - Test authentication persistence
- ✅ **Error Handling** - Verify proper JSON responses

## Expected Results

### ✅ Success Indicators
```
🎉 All tests passed! API is working correctly.
✅ Passed: 8
❌ Failed: 0  
📈 Success Rate: 100%
```

### ⚠️ Common Issues & Fixes

#### Database Issues
```
❌ Database connection issue detected
```
**Fix:**
```bash
# 1. Check XAMPP MySQL is running
# 2. Run database setup
npm run db:setup
```

#### Authentication Issues  
```
❌ Not authenticated - session issue
```
**Fix:**
```bash
# Check session store configuration
# Verify MySQL session table exists
npm run db:setup
```

#### Media Library Issues
```
❌ Table 'drisya.media_library' doesn't exist
```
**Fix:**
```bash
# Run database setup to create all tables
npm run db:setup
```

## Manual Testing

### 🌐 Browser Testing
After running the tests, verify in browser:

1. **Start Server**: `npm run dev`
2. **Open**: http://localhost:5000
3. **Test Login**: admin@drisya.app / admin123
4. **Check Pages**:
   - ✅ Dashboard loads
   - ✅ Gallery loads without errors
   - ✅ Upload page works
   - ✅ Templates display

### 🔍 API Testing with curl
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drisya.app","password":"admin123"}'

# Test media endpoint  
curl http://localhost:5000/api/media

# Test templates
curl http://localhost:5000/api/templates
```

## Troubleshooting

### 🔧 If Tests Fail

1. **Check XAMPP Status**
   - ✅ Apache running
   - ✅ MySQL running  
   - ✅ Port 3306 accessible

2. **Verify Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Check database "drisya" exists
   - Verify tables are created

3. **Check Server Logs**
   ```bash
   npm run dev
   # Look for error messages in console
   ```

4. **Manual Database Creation**
   ```bash
   # If automated setup fails
   mysql -u root -p
   source manual-database-setup.sql
   ```

### 🚨 Emergency Reset
If everything is broken:
```bash
# 1. Stop all servers
# 2. Reset database
DROP DATABASE drisya;

# 3. Run full setup
npm run fix:all
```

## Test Results Interpretation

### 📊 Success Metrics
- **100% Pass Rate**: Everything working perfectly
- **80-99% Pass Rate**: Minor issues, mostly functional  
- **60-79% Pass Rate**: Significant issues, needs attention
- **<60% Pass Rate**: Major problems, requires debugging

### 🎯 Priority Fixes
1. **High Priority**: Authentication, Database connection
2. **Medium Priority**: Media endpoints, Templates
3. **Low Priority**: Admin endpoints, Advanced features

## Next Steps After Testing

### ✅ If All Tests Pass
1. **Deploy**: Application is ready for use
2. **Monitor**: Check logs for any runtime issues
3. **Scale**: Add more templates, users, etc.

### ❌ If Tests Fail  
1. **Fix Issues**: Follow the recommended fixes above
2. **Re-test**: Run `npm run test:api` again
3. **Iterate**: Repeat until all tests pass

---

## 🎉 Success!
When all tests pass, your Drisya platform is fully operational with:
- ✅ Working authentication system
- ✅ Functional image upload & gallery
- ✅ Template management system  
- ✅ Admin panel access
- ✅ Stable database connection
