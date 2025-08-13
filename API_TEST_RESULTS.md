# API Endpoint Test Results

## Testing Date: 2025-08-12

This document contains the results of testing all backend endpoints with curl commands to verify functionality and data structures.

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Health Check
```bash
curl -s http://localhost:3000/health | jq .
```

### 1.2 Admin Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test-login.json | jq .
```

### 1.3 Client Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test-client-login.json | jq .
```

### 1.4 Therapist Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emma.dejong@example.com","password":"TherapistPass123!"}' | jq .
```

---

## 2. ADMIN ENDPOINTS

### 2.1 Admin Dashboard
```bash
curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer TOKEN" | jq .
```

### 2.2 Get All Clients
```bash
curl -s http://localhost:3000/api/admin/clients \
  -H "Authorization: Bearer TOKEN" | jq .
```

### 2.3 Get All Therapists
```bash
curl -s http://localhost:3000/api/admin/therapists \
  -H "Authorization: Bearer TOKEN" | jq .
```

---

## 3. CLIENT ENDPOINTS

### 3.1 Client Dashboard
```bash
curl -s http://localhost:3000/api/client/dashboard \
  -H "Authorization: Bearer TOKEN" | jq .
```

### 3.2 Client Profile
```bash
curl -s http://localhost:3000/api/client/profile \
  -H "Authorization: Bearer TOKEN" | jq .
```

---

## 4. THERAPIST ENDPOINTS

### 4.1 Therapist Appointments
```bash
curl -s http://localhost:3000/api/therapist/appointments \
  -H "Authorization: Bearer TOKEN" | jq .
```

---

## 5. CRUD OPERATIONS

### 5.1 Create New Client
```bash
curl -s -X POST http://localhost:3000/api/admin/clients \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq .
```

### 5.2 Update Client
```bash
curl -s -X PUT http://localhost:3000/api/admin/clients/CLIENT_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq .
```

### 5.3 Delete Client
```bash
curl -s -X DELETE http://localhost:3000/api/admin/clients/CLIENT_ID \
  -H "Authorization: Bearer TOKEN" | jq .
```

---

## Test Results will be added below...