---
sidebar_position: 4
---

# Organization Management

CueHire provides comprehensive organization management features to help companies structure their hiring process.

## Overview

The organization management system allows you to:
- Create and manage company profiles
- Set up department structures
- Manage team members and roles
- Configure organization-wide settings
- Track hiring metrics

## Organization Structure

### Company Profile
- Basic company information
- Logo and branding
- Contact details
- Industry and size
- Location information

### Departments
- Department hierarchy
- Department heads
- Team structures
- Hiring needs per department

### Team Members
- Role assignments
- Permission management
- Activity tracking
- Performance metrics

## Features

### Organization Setup

1. **Company Profile Creation**
   ```json
   POST /api/organization
   {
     "name": "Company Name",
     "industry": "Technology",
     "size": "100-500",
     "location": "City, Country",
     "website": "https://company.com"
   }
   ```

2. **Department Management**
   ```json
   POST /api/organization/departments
   {
     "name": "Engineering",
     "description": "Software Development",
     "head": "user-id",
     "parentDepartment": "department-id"
   }
   ```

3. **Team Member Management**
   ```json
   POST /api/organization/members
   {
     "userId": "user-id",
     "departmentId": "department-id",
     "role": "recruiter",
     "permissions": ["create_job", "view_candidates"]
   }
   ```

### Organization Settings

1. **Hiring Workflow**
   - Custom interview stages
   - Approval processes
   - Notification settings
   - Email templates

2. **Access Control**
   - Role-based permissions
   - Department-level access
   - Feature toggles
   - Security settings

3. **Integration Settings**
   - Calendar integration
   - Email provider settings
   - ATS integration
   - Analytics configuration

## API Endpoints

### Organization Endpoints

```typescript
// Organization Management
GET /api/organization
PUT /api/organization
GET /api/organization/settings
PUT /api/organization/settings

// Department Management
GET /api/organization/departments
POST /api/organization/departments
PUT /api/organization/departments/:id
DELETE /api/organization/departments/:id

// Team Member Management
GET /api/organization/members
POST /api/organization/members
PUT /api/organization/members/:id
DELETE /api/organization/members/:id
```

## Implementation Details

### Backend (NestJS)

The organization management system uses:
- Organization module for core functionality
- Department service for hierarchy management
- Member service for team management
- Settings service for configuration

### Frontend (React)

The frontend implementation includes:
- Organization dashboard
- Department management interface
- Team member management
- Settings configuration panel
- Role and permission management

## Best Practices

1. **Organization Structure**
   - Clear department hierarchy
   - Well-defined roles and responsibilities
   - Regular structure reviews
   - Scalable team management

2. **Permission Management**
   - Principle of least privilege
   - Regular permission audits
   - Clear permission documentation
   - Role-based access control

3. **Data Management**
   - Regular data backups
   - Data retention policies
   - Privacy compliance
   - Audit logging

## Common Issues

### Department Management
- Circular department references
- Orphaned departments
- Permission inheritance
- Department restructuring

### Team Member Management
- Role conflicts
- Permission overlaps
- Access revocation
- Team member transitions

## Next Steps

After setting up your organization, you can:
1. Start [Managing Jobs](./jobs)
2. Set up [Interviews](./interviews)
3. Configure [Analytics](./analytics) 