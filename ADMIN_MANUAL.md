# Drisya - Administrator Manual
## Platform Management & Operations Guide

### Version 1.0 | Last Updated: October 2024

---

## Table of Contents

1. [Admin Overview](#admin-overview)
2. [User Management](#user-management)
3. [Coin Package Management](#coin-package-management)
4. [Payment Processing](#payment-processing)
5. [Template Management](#template-management)
6. [System Monitoring](#system-monitoring)
7. [Analytics & Reporting](#analytics--reporting)
8. [Support Management](#support-management)
9. [System Maintenance](#system-maintenance)
10. [Security & Compliance](#security--compliance)

---

## Admin Overview

### Admin Panel Access

#### Login Requirements
- **Admin Account**: Must have `role: 'admin'` in database
- **URL**: `https://your-domain.com/admin`
- **Credentials**: Use your admin email and password
- **Two-Factor**: Recommended for security

#### Admin Dashboard Features
- 📊 **Real-time Statistics**: Users, processing, revenue
- 👥 **User Management**: View, edit, promote users
- 💰 **Financial Overview**: Revenue, transactions, packages
- 🎨 **Template Control**: Manage available templates
- 🔧 **System Health**: Server status, performance metrics
- 📧 **Support Queue**: Pending tickets and issues

### Admin Roles & Permissions

#### Super Admin
- ✅ Full system access
- ✅ User role management
- ✅ Financial controls
- ✅ System configuration
- ✅ Database access

#### Admin
- ✅ User management
- ✅ Payment processing
- ✅ Template management
- ✅ Support tickets
- ❌ System configuration

#### Support Admin
- ✅ View user accounts
- ✅ Process support tickets
- ✅ Manual transactions
- ❌ User role changes
- ❌ System settings

---

## User Management

### User Overview Dashboard

#### User Statistics
```
Total Users: 1,247
├── Free Tier: 892 (71.5%)
├── Premium: 298 (23.9%)
└── Enterprise: 57 (4.6%)

New Registrations (30 days): 156
Active Users (30 days): 743
Churn Rate: 5.2%
```

#### User List Management

**Access**: Admin Panel > Users

**Available Actions**:
- 👀 **View Details**: Complete user profile
- ✏️ **Edit Profile**: Name, email, phone
- 🔄 **Change Role**: User ↔ Admin
- ⬆️ **Upgrade Tier**: Free → Premium → Enterprise
- 💰 **Adjust Coins**: Add/remove coin balance
- 🚫 **Suspend Account**: Temporary disable
- ❌ **Delete Account**: Permanent removal

### User Account Operations

#### Promoting User to Admin

**Steps**:
1. Navigate to **Admin > Users**
2. Search for user by email
3. Click **"Edit User"**
4. Change **Role** to "Admin"
5. Set **Tier** to "Enterprise"
6. Add **10,000 coins** (optional)
7. Click **"Save Changes"**

**Verification**:
```sql
-- Check user role in database
SELECT email, role, user_tier, coin_balance 
FROM users 
WHERE email = 'user@example.com';
```

#### Managing User Tiers

**Tier Upgrade Process**:
1. **Identify User**: Search by email or ID
2. **Current Usage**: Review monthly processing
3. **Upgrade Justification**: Payment or manual upgrade
4. **Apply Changes**: Update tier and quotas
5. **Notify User**: Send upgrade confirmation

**Tier Benefits**:
```
Free Tier (Default):
- Monthly Quota: 50 images
- Template Access: Basic only
- Support: Community

Premium Tier:
- Monthly Quota: 200 images  
- Template Access: All templates
- Support: Email priority

Enterprise Tier:
- Monthly Quota: Unlimited
- Template Access: All + Custom
- Support: Dedicated manager
```

#### Coin Balance Management

**Add Coins (Manual Credit)**:
1. **Reason Required**: Payment, refund, bonus
2. **Amount**: Specify coin quantity
3. **Transaction Record**: Auto-created
4. **User Notification**: Email sent automatically

**Remove Coins (Adjustment)**:
1. **Justification**: Refund, correction, penalty
2. **Amount**: Specify deduction
3. **Minimum Balance**: Cannot go below 0
4. **Audit Trail**: All changes logged

### Bulk User Operations

#### CSV Export
```csv
email,name,role,tier,coin_balance,created_at,last_login
user1@example.com,John Doe,user,free,45,2024-01-15,2024-10-17
user2@example.com,Jane Smith,user,premium,156,2024-02-20,2024-10-16
```

#### Bulk Updates
- **Tier Migrations**: Upgrade multiple users
- **Coin Bonuses**: Holiday or promotional credits
- **Account Cleanup**: Remove inactive accounts
- **Communication**: Send bulk notifications

---

## Coin Package Management

### Package Configuration

#### Creating New Coin Package

**Access**: Admin Panel > Coin Packages > Create New

**Required Fields**:
- **Package Name**: "Starter Pack", "Professional Pack"
- **Coin Amount**: Number of coins included
- **Price (INR)**: Cost in Indian Rupees
- **Description**: Marketing description
- **Discount %**: Optional promotional discount
- **Display Order**: Sort position in store

**Example Configuration**:
```json
{
  "name": "Holiday Special Pack",
  "coinAmount": 500,
  "priceInINR": 1299,
  "discount": 25,
  "description": "Limited time offer - 25% extra coins!",
  "displayOrder": 1,
  "isActive": true
}
```

#### Package Pricing Strategy

**Recommended Pricing Tiers**:
```
Starter Pack: ₹299 → 100 coins (₹2.99/coin)
Professional: ₹999 → 400 coins (₹2.50/coin) [20% bonus]
Business: ₹2,499 → 1,200 coins (₹2.08/coin) [40% bonus]  
Enterprise: ₹4,999 → 3,000 coins (₹1.67/coin) [50% bonus]
```

**Pricing Considerations**:
- 💰 **Cost Per Processing**: ₹1.50 - ₹2.00
- 📈 **Profit Margin**: 40-60%
- 🎯 **Market Positioning**: Premium but accessible
- 🏆 **Competitive Analysis**: Monitor competitor pricing

### Package Analytics

#### Sales Performance
```
Package Performance (30 days):
├── Starter Pack: 89 sales (₹26,611)
├── Professional: 45 sales (₹44,955)  
├── Business Pack: 12 sales (₹29,988)
└── Enterprise: 3 sales (₹14,997)

Total Revenue: ₹1,16,551
Average Order Value: ₹781
Conversion Rate: 12.3%
```

#### Popular Packages Dashboard
- 📊 **Sales Volume**: Units sold per package
- 💵 **Revenue Contribution**: Percentage of total revenue
- 👥 **Customer Segments**: Who buys what
- 📈 **Trends**: Monthly growth patterns

---

## Payment Processing

### Manual Transaction Management

#### WhatsApp/UPI Payment Processing

**Workflow**:
1. **User Submission**: Customer sends payment proof
2. **Admin Review**: Verify transaction details
3. **Validation**: Confirm payment with bank/UPI
4. **Approval**: Credit coins to user account
5. **Notification**: Send confirmation to user

**Access**: Admin Panel > Manual Transactions

#### Processing Manual Payments

**Step-by-Step Process**:

1. **Review Pending Transactions**
   ```
   Pending Transactions (5):
   ├── User: john@example.com | Amount: ₹999 | UPI Ref: 123456789
   ├── User: jane@example.com | Amount: ₹299 | WhatsApp: Screenshot
   └── ...
   ```

2. **Verify Payment Details**
   - ✅ **Amount Matches**: Package price correct
   - ✅ **Payment Proof**: Screenshot or reference number
   - ✅ **User Identity**: Email matches payment
   - ✅ **Duplicate Check**: Not already processed

3. **Approve Transaction**
   - Click **"Approve"** button
   - Add **Admin Notes** (optional)
   - System automatically:
     - Credits coins to user
     - Creates transaction record
     - Sends confirmation email
     - Updates user balance

4. **Reject Transaction** (if invalid)
   - Click **"Reject"** button
   - **Required**: Rejection reason
   - User receives rejection email
   - Transaction marked as rejected

#### Payment Verification Checklist

**Before Approving**:
- [ ] Payment amount matches package price
- [ ] Valid payment proof provided
- [ ] User email matches payment details
- [ ] No duplicate processing
- [ ] Payment method is legitimate
- [ ] Transaction is within 7 days

**Red Flags** (Reject):
- ❌ Suspicious payment screenshots
- ❌ Amount doesn't match any package
- ❌ Multiple submissions for same payment
- ❌ Unverifiable payment method
- ❌ User account seems fraudulent

### Automated Payment Monitoring

#### Payment Gateway Integration
- **Razorpay**: Primary payment processor
- **Webhook Handling**: Automatic payment confirmation
- **Failure Handling**: Retry logic and notifications
- **Reconciliation**: Daily payment matching

#### Transaction Monitoring
```sql
-- Daily payment summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount) as total_amount,
  payment_method
FROM transactions 
WHERE created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY DATE(created_at), payment_method;
```

---

## Template Management

### Template Library Administration

#### Adding New Templates

**Access**: Admin Panel > Templates > Add New

**Template Configuration**:
```json
{
  "name": "Autumn Elegance",
  "category": "seasonal",
  "backgroundStyle": "gradient",
  "lightingPreset": "soft-glow",
  "description": "Warm autumn colors with elegant styling",
  "thumbnailUrl": "/templates/autumn-elegance-thumb.jpg",
  "isPremium": false,
  "coinCost": 1,
  "isActive": true,
  "settings": {
    "backgroundColors": ["#8B4513", "#CD853F", "#DEB887"],
    "shadowIntensity": 0.3,
    "vignetteStrength": 0.2
  }
}
```

**Template Categories**:
- 💎 **Jewelry**: Luxury backgrounds for jewelry
- 👗 **Fashion**: Clothing and accessories
- 🎉 **Seasonal**: Holiday and special occasions
- 🏢 **Corporate**: Professional business backgrounds
- 🎨 **Artistic**: Creative and unique styles

#### Template Performance Analytics

**Usage Statistics**:
```
Top Templates (30 days):
1. Velvet Luxury: 1,247 uses (18.3%)
2. Marble Elegance: 892 uses (13.1%)
3. Gradient Modern: 743 uses (10.9%)
4. Studio Professional: 634 uses (9.3%)
5. Crystal Clear: 521 uses (7.6%)
```

**Performance Metrics**:
- 📊 **Usage Count**: How often template is selected
- ⭐ **User Rating**: Average satisfaction score
- 💰 **Revenue Impact**: Coins generated per template
- 🔄 **Reprocess Rate**: How often users try different templates

### Template Quality Control

#### Template Approval Process
1. **Design Creation**: AI/Design team creates template
2. **Technical Testing**: Verify template works correctly
3. **Quality Review**: Check visual quality and consistency
4. **A/B Testing**: Test with sample user group
5. **Admin Approval**: Final approval for public release
6. **Monitoring**: Track performance post-launch

#### Template Maintenance
- 🔄 **Regular Updates**: Refresh popular templates
- 🐛 **Bug Fixes**: Address processing issues
- 📊 **Performance Optimization**: Improve processing speed
- 🗑️ **Deprecation**: Remove underperforming templates

---

## System Monitoring

### Server Health Dashboard

#### Real-time Metrics
```
System Status: ✅ OPERATIONAL

Server Performance:
├── CPU Usage: 23% (Normal)
├── Memory: 4.2GB / 8GB (52%)
├── Disk Space: 142GB / 500GB (28%)
└── Network: 45 Mbps up/down

Application Metrics:
├── Active Users: 47
├── Processing Queue: 3 jobs
├── Average Response Time: 245ms
└── Error Rate: 0.12%
```

#### Database Performance
```sql
-- Monitor database performance
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;

-- Check table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'drisya'
ORDER BY (data_length + index_length) DESC;
```

### Processing Queue Management

#### Job Queue Monitoring
**Access**: Admin Panel > System > Processing Queue

**Queue Status**:
```
Processing Queue (Real-time):
├── Queued Jobs: 12
├── Processing: 3
├── Completed (1h): 156
├── Failed (1h): 2
└── Average Processing Time: 6.2s
```

**Failed Job Investigation**:
1. **Error Analysis**: Check error logs
2. **Image Issues**: Corrupted or unsupported files
3. **System Issues**: Server overload or AI service down
4. **User Notification**: Inform user and refund coins
5. **Resolution**: Fix underlying issue

### Alert System

#### Automated Alerts
- 🚨 **High CPU Usage**: > 80% for 5 minutes
- 💾 **Low Disk Space**: < 10GB remaining
- 🐛 **High Error Rate**: > 5% in 10 minutes
- 👥 **User Spike**: > 100 concurrent users
- 💰 **Payment Failures**: > 10 failed payments/hour

#### Alert Channels
- 📧 **Email**: admin@drisya.app
- 📱 **SMS**: Emergency alerts only
- 💬 **Slack**: #alerts channel
- 📊 **Dashboard**: Real-time status page

---

## Analytics & Reporting

### Business Intelligence Dashboard

#### Key Performance Indicators (KPIs)
```
Monthly Performance:
├── Revenue: ₹2,45,670 (+12.3% MoM)
├── New Users: 234 (+8.7% MoM)
├── Images Processed: 12,456 (+15.2% MoM)
├── Customer Satisfaction: 4.7/5 (+0.2 MoM)
└── Churn Rate: 4.8% (-0.5% MoM)
```

#### Revenue Analytics
- 💰 **Monthly Recurring Revenue (MRR)**: Subscription revenue
- 💳 **Average Revenue Per User (ARPU)**: Revenue per customer
- 📈 **Growth Rate**: Month-over-month growth
- 🔄 **Customer Lifetime Value (CLV)**: Projected user value

### User Behavior Analytics

#### Usage Patterns
```sql
-- Most popular processing times
SELECT 
  HOUR(created_at) as hour,
  COUNT(*) as jobs,
  AVG(coins_used) as avg_coins
FROM processing_jobs 
WHERE created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY HOUR(created_at)
ORDER BY jobs DESC;
```

#### Template Performance
```sql
-- Template usage and revenue
SELECT 
  t.name,
  COUNT(pj.id) as usage_count,
  SUM(pj.coins_used) as total_coins,
  AVG(pj.coins_used) as avg_coins_per_job
FROM templates t
JOIN processing_jobs pj ON t.id = pj.template_id
WHERE pj.created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY t.id, t.name
ORDER BY usage_count DESC;
```

### Financial Reporting

#### Monthly Financial Report
```
October 2024 Financial Summary:

Revenue Breakdown:
├── Coin Packages: ₹1,89,450 (77.1%)
├── Manual Payments: ₹42,320 (17.2%)
└── Refunds: -₹3,100 (-1.3%)

Expenses:
├── Server Costs: ₹15,600
├── AI Processing: ₹28,900
├── Payment Gateway: ₹4,890
└── Support & Operations: ₹12,400

Net Profit: ₹1,83,580 (74.7% margin)
```

#### Export Options
- 📊 **Excel Reports**: Detailed financial data
- 📈 **PDF Summaries**: Executive summaries
- 📧 **Automated Reports**: Monthly email reports
- 🔗 **API Access**: Real-time data integration

---

## Support Management

### Support Ticket System

#### Ticket Categories
- 🔧 **Technical Issues**: Processing failures, bugs
- 💰 **Payment Problems**: Failed transactions, refunds
- 👤 **Account Issues**: Login, password, profile
- 📚 **How-to Questions**: Usage guidance
- 💡 **Feature Requests**: New functionality suggestions

#### Ticket Priority Levels
```
P1 - Critical (2h response):
├── System down
├── Payment processing broken
└── Data loss issues

P2 - High (4h response):
├── Individual processing failures
├── Account access issues
└── Payment disputes

P3 - Medium (24h response):
├── Feature questions
├── Minor bugs
└── General inquiries

P4 - Low (72h response):
├── Feature requests
├── Documentation updates
└── Enhancement suggestions
```

### Support Workflow

#### Ticket Processing Steps
1. **Ticket Creation**: Auto-generated from email/chat
2. **Initial Triage**: Categorize and prioritize
3. **Assignment**: Route to appropriate team member
4. **Investigation**: Analyze issue and gather information
5. **Resolution**: Implement solution or provide guidance
6. **Follow-up**: Ensure customer satisfaction
7. **Closure**: Mark ticket as resolved

#### Standard Responses

**Payment Issue Template**:
```
Dear [Customer Name],

Thank you for contacting Drisya support regarding your payment issue.

I've reviewed your account and found:
- Transaction ID: [ID]
- Amount: ₹[Amount]
- Status: [Status]

[Specific resolution steps]

Your coin balance has been updated and you should see [X] coins in your account within 5 minutes.

If you have any further questions, please don't hesitate to reach out.

Best regards,
[Support Agent Name]
Drisya Support Team
```

### Customer Communication

#### Communication Channels
- 📧 **Email**: Primary support channel
- 💬 **Live Chat**: Real-time assistance
- 📱 **WhatsApp**: Payment and urgent issues
- 📞 **Phone**: Enterprise customers only

#### Response Time Targets
- **Live Chat**: < 2 minutes
- **Email**: < 4 hours (business hours)
- **WhatsApp**: < 1 hour (business hours)
- **Phone**: Immediate (scheduled calls)

---

## System Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
- [ ] **System Health Check**: Review dashboard alerts
- [ ] **Payment Processing**: Approve manual transactions
- [ ] **Support Queue**: Process high-priority tickets
- [ ] **Backup Verification**: Ensure backups completed
- [ ] **Performance Review**: Check processing times

#### Weekly Tasks
- [ ] **Database Cleanup**: Remove old temporary files
- [ ] **User Analytics**: Review user growth and churn
- [ ] **Financial Review**: Reconcile payments and revenue
- [ ] **Template Performance**: Analyze usage patterns
- [ ] **Security Audit**: Review access logs

#### Monthly Tasks
- [ ] **Full System Backup**: Complete database backup
- [ ] **Performance Optimization**: Database indexing
- [ ] **Security Updates**: Apply system patches
- [ ] **Financial Reporting**: Generate monthly reports
- [ ] **User Feedback Analysis**: Review satisfaction surveys

### Database Management

#### Backup Strategy
```bash
# Daily automated backup
mysqldump -u root -p drisya > backup_$(date +%Y%m%d).sql

# Weekly full backup with compression
mysqldump -u root -p drisya | gzip > weekly_backup_$(date +%Y%m%d).sql.gz

# Monthly archive backup
tar -czf monthly_backup_$(date +%Y%m).tar.gz /path/to/backups/
```

#### Database Optimization
```sql
-- Optimize tables monthly
OPTIMIZE TABLE users, processing_jobs, images, transactions;

-- Update table statistics
ANALYZE TABLE users, processing_jobs, images, transactions;

-- Check for fragmentation
SELECT 
  table_name,
  ROUND(data_free/1024/1024) AS data_free_mb
FROM information_schema.tables 
WHERE table_schema = 'drisya' AND data_free > 0;
```

### Performance Optimization

#### Server Optimization
- 🚀 **CDN Configuration**: Optimize image delivery
- 💾 **Caching Strategy**: Redis for session and data caching
- 🔄 **Load Balancing**: Distribute traffic across servers
- 📊 **Monitoring**: Real-time performance tracking

#### Database Optimization
- 📇 **Indexing Strategy**: Optimize query performance
- 🗂️ **Partitioning**: Split large tables by date
- 🧹 **Cleanup Jobs**: Remove old data automatically
- 📈 **Query Optimization**: Improve slow queries

---

## Security & Compliance

### Security Monitoring

#### Security Checklist
- [ ] **SSL Certificates**: Valid and up-to-date
- [ ] **Database Security**: Encrypted connections
- [ ] **User Authentication**: Strong password policies
- [ ] **Admin Access**: Two-factor authentication
- [ ] **API Security**: Rate limiting and validation
- [ ] **File Upload Security**: Malware scanning

#### Access Control
```
Admin Access Levels:
├── Super Admin: Full system access
├── Admin: User and content management
├── Support: Customer service only
└── Read-only: Analytics and reporting

Security Measures:
├── Two-factor authentication required
├── IP whitelist for admin access
├── Session timeout: 2 hours
└── Failed login lockout: 5 attempts
```

### Data Protection

#### Privacy Compliance
- 🔒 **Data Encryption**: All sensitive data encrypted
- 🗑️ **Data Retention**: 30-day automatic cleanup
- 👤 **User Rights**: Data export and deletion
- 📋 **Privacy Policy**: Clear data usage terms

#### Backup & Recovery
- 💾 **Daily Backups**: Automated database backups
- 🔄 **Replication**: Real-time database replication
- 🏢 **Offsite Storage**: Cloud backup storage
- 🚨 **Disaster Recovery**: 4-hour recovery time objective

### Audit & Compliance

#### Audit Logging
```sql
-- Review admin actions
SELECT 
  al.action,
  al.user_id,
  u.email,
  al.ip_address,
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.created_at >= CURDATE() - INTERVAL 7 DAY
ORDER BY al.created_at DESC;
```

#### Compliance Requirements
- 🇮🇳 **Indian IT Act**: Data protection compliance
- 💳 **PCI DSS**: Payment card security standards
- 🔐 **ISO 27001**: Information security management
- 📊 **SOC 2**: Security and availability controls

---

## Emergency Procedures

### System Outage Response

#### Incident Response Plan
1. **Detection**: Automated alerts or user reports
2. **Assessment**: Determine scope and impact
3. **Communication**: Notify stakeholders
4. **Resolution**: Implement fix or workaround
5. **Recovery**: Restore full functionality
6. **Post-mortem**: Analyze and improve

#### Communication Templates

**Status Page Update**:
```
🚨 Service Disruption - Image Processing

We're currently experiencing issues with our image processing service. 
New uploads may be delayed by 10-15 minutes.

Our team is actively working on a resolution.

Last updated: [Timestamp]
Next update: [Timestamp + 30 minutes]
```

**User Notification Email**:
```
Subject: Service Update - Drisya Processing Restored

Dear Drisya Users,

We've resolved the processing delays that occurred earlier today between 
2:00 PM - 2:45 PM IST. All services are now operating normally.

If your images were affected:
- Processing will complete automatically
- No additional coins will be charged
- Contact support if you need assistance

We apologize for any inconvenience.

The Drisya Team
```

### Data Recovery Procedures

#### Recovery Steps
1. **Assess Damage**: Determine what data is affected
2. **Stop Operations**: Prevent further data loss
3. **Restore from Backup**: Use most recent clean backup
4. **Verify Integrity**: Ensure data consistency
5. **Resume Operations**: Gradually restore services
6. **Monitor**: Watch for any issues post-recovery

---

## Contact Information

### Admin Team Contacts

**Technical Team**:
- **CTO**: tech-lead@drisya.app
- **DevOps**: devops@drisya.app
- **Database Admin**: dba@drisya.app

**Business Team**:
- **CEO**: ceo@drisya.app
- **Operations**: ops@drisya.app
- **Finance**: finance@drisya.app

**Support Team**:
- **Support Lead**: support-lead@drisya.app
- **Customer Success**: success@drisya.app

### Emergency Contacts

**24/7 Emergency Hotline**: +91-XXXXX-XXXXX
**Emergency Email**: emergency@drisya.app
**Slack Channel**: #emergency-response

---

**© 2024 Drisya. All rights reserved.**

**Version**: 1.0  
**Last Updated**: October 2024  
**Next Review**: January 2025

**Classification**: Internal Use Only  
**Access Level**: Admin Team Only
