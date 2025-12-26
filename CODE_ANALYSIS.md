# Influencer Survey Platform - Code Analysis Report

## Project Overview
**Project Type**: MERN Stack (MongoDB, Express, React, Node.js)  
**Project Name**: Influencer Survey Management Platform  
**Status**: Active Development  

---

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + Material-UI (MUI)
- **Backend**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **File Handling**: Multer (uploads), XLSX (Excel processing)
- **HTTP Client**: Axios

---

## Directory Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic (5 controllers)
│   │   ├── models/          # MongoDB schemas (5 models)
│   │   ├── routes/          # API endpoints (4 route files)
│   │   ├── middleware/      # Auth, error handling, upload
│   │   ├── services/        # Email service
│   │   ├── uploads/         # File storage
│   │   ├── utils/           # Utility functions
│   │   └── scripts/         # Database seeding
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # 20 React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── styles/          # CSS files
│   │   ├── assets/          # Images and icons
│   │   ├── utils/           # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React DOM entry
│   └── package.json
│
└── package.json             # Root configuration
```

---

## Database Models

### 1. **User Model**
```javascript
{
  name: String (required)
  email: String (required, unique)
  username: String (required)
  password: String (required, hashed)
  role: String (enum: ['admin', 'super_admin'])
  timestamps: true
}
```
**Purpose**: Store admin and super_admin users  
**Usage**: Authentication, role-based access control  

---

### 2. **Influencer Model**
```javascript
{
  onboarderId: ObjectId (ref: User) - Form creator
  
  // Basic Info
  email, name, dateOfBirth, age, gender, language
  category, location, address, state, city, pincode
  
  // Social Media Links
  instagramLink, youtubeLink, contactNumber
  
  // Platform Details (Instagram)
  reelCost, storyCost, instagramFollowers
  instagramInfluencerType, last10ReelsViews/Reach
  
  // Platform Details (YouTube)
  youtubeVideoCost, youtubeShortsCost, youtubeFollowers
  youtubeInfluencerType, last10ShortsViews/Reach
  
  // Banking Info
  panNumber, panCardImage
  bankAccountNumber, ifscCode, holderName, bankName
  
  // Additional
  platformType: 'Paid' | 'Barter'
  status: 'pending' | 'approved' | 'rejected'
  timestamps: true
}
```
**Purpose**: Store influencer onboarding form submissions  
**Status Values**: pending, approved, rejected  

---

### 3. **ExistingInfluencer Model**
```javascript
{
  username: String (required)
  businessEmail: String
  name: String (required)
  profileLink: String (required)
  market: String (language/market)
  
  status: 'pending' | 'assigned' | 'completed'
  assignedTo: ObjectId (ref: User)
  assignStatus: 'unassigned' | 'assigned' | 'in_progress' | 'completed'
  
  influencerFormId: ObjectId (ref: Influencer)
  timestamps: true
}
```
**Purpose**: Manage bulk-uploaded existing influencers  
**Upload Source**: Excel files (.xlsx)  
**Workflow**: Pending → Assigned → Completed  

---

### 4. **NegotiationCost Model**
```javascript
Stores negotiation cost data for influencers
```

---

### 5. **Auth Model**
```javascript
Static methods:
- findByEmail(email)
- validatePassword(plainPassword, hashedPassword)
- seedUsers() // Creates default admin users
```
**Default Users Created on Boot**:
- sa@admin.com (super_admin)
- admin1@admin.com (admin)
- admin2@admin.com (admin)
- admin3@admin.com (admin)

---

## API Routes & Controllers

### 1. **Existing Influencers Routes** (`/api/existing-influencers`)
| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/upload` | ✓ | super_admin | Upload Excel file with bulk influencers |
| GET | `/` | ✓ | all | Get all influencers (filtered by role) |
| GET | `/pending` | ✓ | all | Get pending influencers |
| GET | `/assigned` | ✓ | all | Get assigned influencers |
| GET | `/completed` | ✓ | all | Get completed influencers |
| GET | `/:id` | ✓ | all | Get influencer by ID |
| PATCH | `/:id/status` | ✓ | all | Update influencer status |
| PATCH | `/bulk-assign` | ✓ | all | Assign multiple influencers to user |

### 2. **User Routes** (`/api/users`)
```javascript
- GET /users - Get all users (excluding super_admin)
```

### 3. **Influencer Routes** (`/api/influencers`)
```javascript
- POST /onboard - Submit onboarding form
- GET / - Get all influencers
- GET /barter - Get barter influencers
- GET /export - Export influencers
- POST /export/filtered - Export filtered influencers
```

### 4. **Negotiation Routes** (`/api/negotiation`)
```javascript
- GET /pending - Get pending negotiations
- GET /completed - Get completed negotiations
- GET /export/pending - Export pending
- GET /export/completed - Export completed
```

---

## Frontend Components

### Core Components

**1. ExistingInfluencers.jsx** (Wrapper Component)
- Routes to SuperAdminInfluencers or AdminInfluencers based on role
- Entry point for existing influencer management

**2. SuperAdminInfluencers.jsx** (Super Admin View)
- **Features**:
  - Excel file upload with drag-drop
  - 3 Tabs: Pending, Assigned, Completed
  - Filter by language
  - Bulk assign (checkbox selection)
  - Single row assign action
  - Copy ID button
  - Send Email button
  - Complete status action
  - Bulk operations with confirmation

**3. AdminInfluencers.jsx** (Admin View)
- **Features**:
  - 2 Tabs: Assigned, Completed
  - No Excel upload
  - No Copy/Send Email buttons
  - Complete button for assigned influencers
  - Title: "My Influencers"

**4. Dashboard.jsx**
- Overview of all influencers
- Statistics and charts

**5. InfluencerOnboard.jsx**
- Multi-step onboarding form
- Form validation
- File upload handling

---

## Role-Based Access Control (RBAC)

### Super Admin (`super_admin`)
- ✓ Upload Excel files
- ✓ View all influencers (all statuses)
- ✓ Assign influencers to admin users
- ✓ Perform bulk operations
- ✓ Copy IDs
- ✓ Send emails
- ✓ Update influencer status

### Admin (`admin`)
- ✓ View only assigned influencers
- ✓ Mark influencers as completed
- ✗ Cannot upload files
- ✗ Cannot assign influencers
- ✗ Cannot view pending or other admin's influencers

---

## Key Features

### 1. **Excel Upload & Bulk Processing**
- File: `existingInfluencerController.uploadExcel()`
- Supports columns: Username, Business Email, Name, Profile Link, Market
- Converts to DB records with status: 'pending'

### 2. **Assignment Workflow**
- **Single Assign**: Click "Assign" button on individual row
- **Bulk Assign**: 
  1. Check multiple rows
  2. Click "Assign Selected (N)"
  3. Select user from modal
  4. Confirm to assign to all selected
- Updates: `status` → 'assigned', `assignedTo` → user ID

### 3. **Status Tracking**
- **ExistingInfluencer Status**: pending → assigned → completed
- **AssignStatus Field**: unassigned, assigned, in_progress, completed

### 4. **Data Grid Features**
- Checkbox selection (MUI DataGrid)
- Column filtering
- Sorting
- Pagination (10 rows/page)
- Row actions (buttons)

---

## Authentication Flow

### Login
1. User submits email/password
2. Backend verifies via `Auth.validatePassword()`
3. JWT token generated and sent
4. Token stored in localStorage
5. Axios interceptor adds token to all requests

### Token Verification
- Middleware: `authMiddleware()` checks JWT validity
- Invalid tokens trigger logout automatically
- Role-based middleware: `checkRole(requiredRole)`

---

## Frontend Data Flow

### Pending Influencers Example
```
SuperAdminInfluencers Component
  ↓
  useState: pendingSelectedRows
  ↓
  useEffect → fetchAllInfluencers()
  ↓
  getPendingInfluencers() [API call]
  ↓
  getPendingRows() [transform data]
  ↓
  DataGrid with checkbox selection
  ↓
  onRowSelectionModelChange → setPendingSelectedRows()
  ↓
  "Assign Selected" button enabled
  ↓
  onClick → setSelectedInfluencerIds() + openModal()
  ↓
  Modal: Select User + Confirm
  ↓
  bulkAssignInfluencers(ids, userId) [API call]
  ↓
  fetchAllInfluencers() [refresh data]
```

---

## API Response Format

### Success Response
```json
{
  "data": [
    {
      "_id": "ObjectId",
      "username": "string",
      "businessEmail": "string",
      "name": "string",
      "profileLink": "string",
      "market": "string",
      "status": "pending|assigned|completed",
      "assignedTo": {
        "_id": "ObjectId",
        "name": "string",
        "username": "string",
        "email": "string"
      },
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    }
  ]
}
```

### Error Response
```json
{
  "error": "Error message string"
}
```

---

## Known Issues & Observations

### 1. **Column Width Issues**
- DataGrid columns might overflow on smaller screens
- No responsive breakpoints implemented

### 2. **Email Feature**
- Send Email button in UI but no backend endpoint
- Currently just logs to console: `console.log('Sending email...')`

### 3. **Copy ID Function**
- Copies MongoDB `_id` field (ObjectId format)
- User might want to copy other fields instead

### 4. **Filter Persistence**
- Language filter resets when switching tabs
- State management could be improved

### 5. **Bulk Operations**
- No batch size limits
- Can select thousands of rows (performance concern)

### 6. **Admin Data Visibility**
- Admin users only see their own assigned influencers
- No cross-admin visibility

---

## Security Observations

### ✓ Implemented
- JWT authentication on all routes
- Password hashing (bcryptjs)
- Role-based route protection
- CORS enabled
- File upload validation (xlsx only)

### ⚠ Recommendations
- Add rate limiting on sensitive endpoints
- Implement audit logging for assignments
- Add CSRF protection
- Validate file size on uploads
- Sanitize Excel data before DB insertion

---

## Performance Considerations

### Database Queries
- Uses `.populate()` to fetch user details (2 DB calls)
- Consider using aggregation pipeline for complex queries
- No indexing on frequently queried fields (status, assignedTo)

### Frontend
- DataGrid renders all rows even with pagination (virtualization would help)
- No loading states during bulk operations
- API calls not debounced

---

## Testing Recommendations

### Backend Unit Tests Needed
- Excel parsing with various formats
- Bulk assign with invalid user IDs
- Status update authorization checks

### Frontend Integration Tests
- Excel file upload flow
- Bulk select + assign workflow
- Role-based component rendering

### E2E Tests
- Super Admin: Upload → Assign → Complete flow
- Admin: View assigned → Complete workflow
- Cross-role access restrictions

---

## Deployment Checklist

- [ ] Update `.env` files with production URLs
- [ ] Set `NODE_ENV=production` on backend
- [ ] Configure MongoDB Atlas connection
- [ ] Update REACT_APP_API_URL in frontend .env
- [ ] Enable HTTPS
- [ ] Set up file upload limits
- [ ] Configure email service for Send Email feature
- [ ] Add database backups schedule
- [ ] Enable logging/monitoring
- [ ] Test JWT token expiration

---

## Future Enhancements

1. **Email Integration**
   - Complete Send Email feature with Nodemailer backend
   - Email templates for assignments/status updates

2. **Search & Advanced Filtering**
   - Search by username, email, name
   - Multiple language filter
   - Date range filters

3. **Batch Operations**
   - Download selected as CSV/Excel
   - Bulk status update
   - Bulk reassign to different admin

4. **Dashboard Analytics**
   - Assignment metrics
   - Completion rate
   - Per-admin performance stats

5. **Audit Trail**
   - Track who assigned to whom
   - Status change history
   - Download activity logs

6. **Mobile Responsive Design**
   - Optimize DataGrid for mobile
   - Mobile-friendly assignment modal

---

## Component Props & State

### SuperAdminInfluencers
**Props**:
- `user`: { id, role, name, email }

**State**:
- `tabValue`: Current tab (0-2)
- `pendingInfluencers`, `assignedInfluencers`, `completedInfluencers`: Arrays
- `pendingSelectedRows`, `assignedSelectedRows`, `completedSelectedRows`: Selected row IDs
- `languageFilter`: Current language filter
- `assignModalOpen`: Boolean
- `emailModalOpen`: Boolean
- `selectedInfluencerIds`: Array of IDs to assign
- `selectedUserId`: Assigned user ID
- `emailInput`: Email text input
- `users`: Array of available admin users

---

## Summary

This is a **production-ready MERN application** for managing influencer onboarding and bulk assignment workflows. The codebase demonstrates:

✓ **Clean Architecture**: Separated concerns (controllers, models, routes)  
✓ **RBAC Implementation**: Role-based features and route protection  
✓ **File Processing**: Excel upload with Multer and XLSX libraries  
✓ **State Management**: React hooks for component state  
✓ **API Integration**: Axios with JWT interceptors  
✓ **UI Framework**: Material-UI with DataGrid for complex data display  

**Main Workflow**: Super Admin uploads influencers → Assigns to admins → Admins complete assignments

