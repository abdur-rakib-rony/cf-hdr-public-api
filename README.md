# HDR API - Testing Guide

This README provides comprehensive documentation for testing all API endpoints in the Ramadan Rest Period Management system. Follow the instructions below to test each feature.

## Table of Contents

- [Setup](#setup)
- [Official Business Endpoints](#official-business-endpoints)
- [Ramadan Rest Period Endpoints](#ramadan-rest-period-endpoints)
- [Eligibility Settings Endpoints](#eligibility-settings-endpoints)
- [Department Head Endpoints](#department-head-endpoints)
- [Reports and Statistics Endpoints](#reports-and-statistics-endpoints)
- [Testing Flow Examples](#testing-flow-examples)

## Setup

### Base URL

```
http://localhost:4000
```

### Starting the Server

```bash
npm install
npm start
```

## Official Business Endpoints

These endpoints manage the official business declarations.

### 1. Get All Official Business Declarations

- **Method**: GET
- **URL**: `/api/official-business`
- **Filters** (query parameters):
  - `applicationReferenceNo`: Filter by reference number
  - `branchUnit`: Filter by branch unit
  - `typeOfBusiness`: Filter by business type
  - `employeeNumber`: Filter by employee number
  - `identityCardNo`: Filter by identity card
  - `positionGrade`: Filter by position grade
  - `status`: Filter by record status
  - `startDateFrom`: Filter by start date (from) - format: YYYY-MM-DD
  - `startDateTo`: Filter by start date (to) - format: YYYY-MM-DD
- **Example**:

```
GET http://localhost:4000/api/official-business?employeeNumber=EMP123&status=Active
```

### 2. Get Single Official Business Declaration

- **Method**: GET
- **URL**: `/api/official-business/:id`
- **Example**:

```
GET http://localhost:4000/api/official-business/60d21b4667d0d8992e28e111
```

### 3. Create Official Business Declaration

- **Method**: POST
- **URL**: `/api/official-business`
- **Request Body** (JSON):

```json
{
  "applicationReferenceNo": "OB-2025-001",
  "agencyDivision": "Finance",
  "branchUnit": "Accounting",
  "employeeNumber": "EMP123",
  "employeeName": "John Doe",
  "identityCardNo": "IC123456",
  "positionGrade": "F45",
  "startDateTime": "2025-04-21T09:00:00.000Z",
  "expirationDateTime": "2025-04-21T17:00:00.000Z",
  "typeOfBusiness": "Meeting",
  "businessName": "Budget Planning",
  "information": "Annual budget planning meeting",
  "location": "Headquarters"
}
```

### 4. Update Official Business Declaration

- **Method**: PUT
- **URL**: `/api/official-business/:id`
- **Request Body** (JSON):

```json
{
  "typeOfBusiness": "Conference",
  "businessName": "Annual Finance Conference",
  "information": "Updated information about the conference",
  "location": "Convention Center"
}
```

### 5. Delete Official Business Declaration

- **Method**: DELETE
- **URL**: `/api/official-business/:id`
- **Example**:

```
DELETE http://localhost:4000/api/official-business/60d21b4667d0d8992e28e111
```

### 6. Upload Supporting Document for Official Business

- **Method**: POST
- **URL**: `/api/official-business/:id/documents`
- **Form Data**:
  - `document`: File to upload (must be less than 5MB)
- **Example using cURL**:

```bash
curl -X POST http://localhost:4000/api/official-business/60d21b4667d0d8992e28e111/documents \
  -F "document=@/path/to/document.pdf"
```

## Ramadan Rest Period Endpoints

These endpoints manage the Ramadan rest period applications.

### 1. Get All Ramadan Rest Period Applications

- **Method**: GET
- **URL**: `/api/ramadan-rest-periods`
- **Filters** (query parameters):
  - `applicationReferenceNo`: Filter by reference number
  - `employeeNumber`: Filter by employee number
  - `identityCardNo`: Filter by identity card
  - `ministry`: Filter by ministry
  - `division`: Filter by division
  - `branchUnit`: Filter by branch unit
  - `positionGrade`: Filter by position grade
  - `applicationStatus`: Filter by status (New, Approved, Not Approved, Cancelled)
  - `startDateFrom`: Filter by start date (from) - format: YYYY-MM-DD
  - `startDateTo`: Filter by start date (to) - format: YYYY-MM-DD
  - `applicationDateFrom`: Filter by application date (from) - format: YYYY-MM-DD
  - `applicationDateTo`: Filter by application date (to) - format: YYYY-MM-DD
  - `page`: Page number for pagination (default: 1)
  - `limit`: Number of records per page (default: 10)
- **Example**:

```
GET http://localhost:4000/api/ramadan-rest-periods?ministry=Finance&applicationStatus=New&page=1&limit=10
```

### 2. Get Single Ramadan Rest Period Application

- **Method**: GET
- **URL**: `/api/ramadan-rest-periods/:id`
- **Example**:

```
GET http://localhost:4000/api/ramadan-rest-periods/60d21b4667d0d8992e28e111
```

### 3. Create New Ramadan Rest Period Application

- **Method**: POST
- **URL**: `/api/ramadan-rest-periods`
- **Request Body** (JSON):

```json
{
  "employeeNumber": "EMP-12345",
  "employeeName": "John Doe",
  "identityCardNo": "IC-987654",
  "ministry": "Ministry of Finance",
  "division": "Accounting Division",
  "branchUnit": "Payroll Unit",
  "positionGrade": "F45",
  "startDate": "2025-03-01T00:00:00.000Z",
  "expirationDate": "2025-04-01T00:00:00.000Z",
  "breakTimeOption": "Ramadan Month WBF"
}
```

### 4. Cancel Application (by employee)

- **Method**: PUT
- **URL**: `/api/ramadan-rest-periods/:id/cancel`
- **Example**:

```
PUT http://localhost:4000/api/ramadan-rest-periods/60d21b4667d0d8992e28e111/cancel
```

### 5. Process Application (approve/reject)

- **Method**: PUT
- **URL**: `/api/ramadan-rest-periods/:id/process`
- **Request Body** (JSON):

```json
{
  "applicationStatus": "Approved",
  "notes": "Application approved for the Ramadan period.",
  "approvedBy": {
    "name": "Jane Smith",
    "identityCardNo": "IC-123456"
  }
}
```

### 6. Batch Process Applications

- **Method**: POST
- **URL**: `/api/ramadan-rest-periods/batch-process`
- **Request Body** (JSON):

```json
{
  "applicationIds": ["60d21b4667d0d8992e28e111", "60d21b4667d0d8992e28e222"],
  "applicationStatus": "Approved",
  "notes": "Batch approval for the Ramadan period.",
  "approvedBy": {
    "name": "Jane Smith",
    "identityCardNo": "IC-123456"
  }
}
```

### 7. Admin Cancel Approved Application

- **Method**: PUT
- **URL**: `/api/ramadan-rest-periods/:id/admin-cancel`
- **Request Body** (JSON):

```json
{
  "notes": "Cancelled due to operational requirements."
}
```

### 8. Upload Supporting Document

- **Method**: POST
- **URL**: `/api/ramadan-rest-periods/:id/documents`
- **Form Data**:
  - `document`: File to upload (must be less than 5MB)
- **Example using cURL**:

```bash
curl -X POST http://localhost:4000/api/ramadan-rest-periods/60d21b4667d0d8992e28e111/documents \
  -F "document=@/path/to/document.pdf"
```

## Eligibility Settings Endpoints

These endpoints manage the eligibility settings for Ramadan rest periods.

### 1. Get All Eligibility Settings

- **Method**: GET
- **URL**: `/api/eligibility-settings`
- **Example**:

```
GET http://localhost:4000/api/eligibility-settings
```

### 2. Update Eligibility Setting

- **Method**: PUT
- **URL**: `/api/eligibility-settings/:id`
- **Request Body** (JSON):

```json
{
  "isActive": true,
  "description": "Only Competency Owners who use Flexible Working Hours (WBF) are allowed to apply for a break period for the month of Ramadan."
}
```

## Department Head Endpoints

These endpoints manage department heads who approve Ramadan rest period applications.

### 1. Get All Department Heads

- **Method**: GET
- **URL**: `/api/department-heads`
- **Example**:

```
GET http://localhost:4000/api/department-heads
```

### 2. Create New Department Head

- **Method**: POST
- **URL**: `/api/department-heads`
- **Request Body** (JSON):

```json
{
  "name": "Jane Smith",
  "identityCardNo": "IC-123456",
  "ministry": "Ministry of Finance",
  "division": "Accounting Division"
}
```

### 3. Update Department Head

- **Method**: PUT
- **URL**: `/api/department-heads/:id`
- **Request Body** (JSON):

```json
{
  "name": "Jane Smith",
  "ministry": "Ministry of Finance",
  "division": "Taxation Division",
  "isActive": true
}
```

## Reports and Statistics Endpoints

These endpoints provide reporting and statistics functionality.

### 1. Get Dashboard Statistics

- **Method**: GET
- **URL**: `/api/statistics`
- **Example**:

```
GET http://localhost:4000/api/statistics
```

### 2. Get Department Report

- **Method**: GET
- **URL**: `/api/reports/by-department`
- **Example**:

```
GET http://localhost:4000/api/reports/by-department
```

## Testing Flow Examples

Follow these examples to test the complete workflow of the system.

### Official Business Declaration Flow

1. Create a new official business declaration
2. Get the declaration to verify details
3. Update the declaration with new information
4. Upload supporting documents
5. Get all declarations to view the updated one
6. Delete the declaration (if needed)

### Ramadan Rest Period Application Flow

1. Get eligibility settings to check what's active
2. Create a new department head for approvals
3. Create a new rest period application
4. View the application details
5. Process the application as a department head
6. Upload supporting documents
7. View all applications to check status
8. Cancel the application (if needed)

### Batch Processing Flow

1. Create multiple rest period applications
2. Use batch process endpoint to approve/reject all at once
3. Check the status of all applications

### Testing Tips

- Use valid MongoDB ObjectIds for ID parameters
- Ensure that eligibility settings are properly configured before testing applications
- For document uploads, use files less than 5MB
- When testing filtering, try different combinations of parameters
- For date ranges, use the format YYYY-MM-DD

### Sample cURL Commands

#### Create a Ramadan Rest Period Application

```bash
curl -X POST http://localhost:4000/api/ramadan-rest-periods \
  -H "Content-Type: application/json" \
  -d '{
    "employeeNumber": "EMP-12345",
    "employeeName": "John Doe",
    "identityCardNo": "IC-987654",
    "ministry": "Ministry of Finance",
    "division": "Accounting Division",
    "branchUnit": "Payroll Unit",
    "positionGrade": "F45",
    "startDate": "2025-03-01T00:00:00.000Z",
    "expirationDate": "2025-04-01T00:00:00.000Z",
    "breakTimeOption": "Ramadan Month WBF"
  }'
```

#### Approve an Application

```bash
curl -X PUT http://localhost:4000/api/ramadan-rest-periods/60d21b4667d0d8992e28e111/process \
  -H "Content-Type: application/json" \
  -d '{
    "applicationStatus": "Approved",
    "notes": "Application approved for the Ramadan period.",
    "approvedBy": {
      "name": "Jane Smith",
      "identityCardNo": "IC-123456"
    }
  }'
```

#### Create a Department Head

```bash
curl -X POST http://localhost:4000/api/department-heads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "identityCardNo": "IC-123456",
    "ministry": "Ministry of Finance",
    "division": "Accounting Division"
  }'
```

#### Get Statistics

```bash
curl -X GET http://localhost:4000/api/statistics
```
