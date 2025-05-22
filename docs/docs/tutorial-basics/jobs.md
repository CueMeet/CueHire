---
sidebar_position: 5
---

# Job Management

CueHire provides a comprehensive job management system to streamline the hiring process from job posting to candidate selection.

## Overview

The job management system enables you to:
- Create and publish job postings
- Manage job applications
- Track candidate progress
- Analyze job performance
- Manage hiring pipelines

## Features

### Job Posting

1. **Create Job**
   ```json
   POST /api/jobs
   {
     "title": "Senior Software Engineer",
     "department": "Engineering",
     "location": "Remote",
     "type": "Full-time",
     "description": "Job description...",
     "requirements": ["5+ years experience", "React", "Node.js"],
     "salary": {
       "min": 100000,
       "max": 150000,
       "currency": "USD"
     },
     "status": "draft"
   }
   ```

2. **Job Categories**
   - Department assignment
   - Job type (Full-time, Part-time, Contract)
   - Experience level
   - Location type (Remote, On-site, Hybrid)
   - Salary range

3. **Job Status**
   - Draft
   - Published
   - Closed
   - Archived

### Application Management

1. **Application Process**
   - Application form customization
   - Required documents
   - Screening questions
   - Application deadlines

2. **Candidate Pipeline**
   - Application review
   - Screening
   - Interview stages
   - Offer management
   - Onboarding

## API Endpoints

### Job Management Endpoints

```typescript
// Job Postings
GET /api/jobs
POST /api/jobs
GET /api/jobs/:id
PUT /api/jobs/:id
DELETE /api/jobs/:id

// Job Applications
GET /api/jobs/:id/applications
POST /api/jobs/:id/applications
GET /api/jobs/:id/applications/:applicationId
PUT /api/jobs/:id/applications/:applicationId

// Job Analytics
GET /api/jobs/:id/analytics
GET /api/jobs/analytics/dashboard
```

## Implementation Details

### Backend (NestJS)

The job management system uses:
- Job module for posting management
- Application service for candidate tracking
- Analytics service for job metrics
- Notification service for updates

### Frontend (React)

The frontend implementation includes:
- Job posting interface
- Application management dashboard
- Candidate pipeline view
- Analytics dashboard
- Job search and filtering

## Job Workflow

1. **Job Creation**
   - Draft job posting
   - Internal review
   - Approval process
   - Publication

2. **Application Processing**
   - Application receipt
   - Initial screening
   - Interview scheduling
   - Candidate evaluation
   - Offer management

3. **Hiring Pipeline**
   - Application review
   - Technical screening
   - Interviews
   - Reference checks
   - Offer and acceptance
   - Onboarding

## Best Practices

1. **Job Postings**
   - Clear job descriptions
   - Accurate requirements
   - Competitive compensation
   - Inclusive language
   - Regular updates

2. **Application Management**
   - Efficient screening process
   - Clear communication
   - Timely responses
   - Candidate experience
   - Data privacy

3. **Pipeline Management**
   - Defined stages
   - Clear criteria
   - Regular updates
   - Performance metrics
   - Continuous improvement

## Common Issues

### Job Posting
- Incomplete information
- Unclear requirements
- Outdated postings
- Duplicate listings

### Application Management
- Application backlog
- Communication delays
- Candidate drop-off
- Process bottlenecks

## Analytics and Reporting

1. **Job Metrics**
   - Application volume
   - Time to hire
   - Source effectiveness
   - Candidate quality
   - Cost per hire

2. **Pipeline Analytics**
   - Stage conversion rates
   - Time in stage
   - Drop-off points
   - Interview feedback
   - Offer acceptance rate

## Next Steps

After setting up job management, you can:
1. Set up [Interviews](./interviews)
2. Configure [Analytics](./analytics)
3. Implement [Automation](./automation) 