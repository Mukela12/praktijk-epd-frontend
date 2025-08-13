#!/bin/bash

# Login and test all user journeys

echo "=== AUTHENTICATING ALL USERS ==="

# Admin login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@praktijkepd.nl","password":"Admin123!@#"}' | jq -r '.accessToken')
echo "Admin authenticated"

# Client login  
CLIENT_RESP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"ClientPass123!"}')
CLIENT_TOKEN=$(echo "$CLIENT_RESP" | jq -r '.accessToken')
CLIENT_ID=$(echo "$CLIENT_RESP" | jq -r '.user.id')
echo "Client authenticated - ID: $CLIENT_ID"

# Therapist login
THERAPIST_RESP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emma.dejong@example.com","password":"TherapistPass123!"}')
THERAPIST_TOKEN=$(echo "$THERAPIST_RESP" | jq -r '.accessToken')
THERAPIST_ID=$(echo "$THERAPIST_RESP" | jq -r '.user.id')
echo "Therapist authenticated - ID: $THERAPIST_ID"

# Bookkeeper login
BOOKKEEPER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lucas.martin@example.com","password":"BookkeeperPass123!"}' | jq -r '.accessToken')
echo "Bookkeeper authenticated"

echo -e "\n=== CLIENT JOURNEY ==="
echo "1. Dashboard"
curl -s -X GET http://localhost:3000/api/client/dashboard \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data.kpis // "No dashboard data"'

echo -e "\n2. Profile"
curl -s -X GET http://localhost:3000/api/client/profile \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data | {email, first_name, last_name, phone}'

echo -e "\n3. Appointments"
curl -s -X GET http://localhost:3000/api/client/appointments \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data.appointments | length'

echo -e "\n4. Invoices"
curl -s -X GET http://localhost:3000/api/client/invoices \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data.invoices[:2]'

echo -e "\n5. Messages"
curl -s -X GET http://localhost:3000/api/client/messages \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.data.messages | length'

echo -e "\n=== THERAPIST JOURNEY ==="
echo "1. Dashboard"
curl -s -X GET http://localhost:3000/api/therapist/dashboard \
  -H "Authorization: Bearer $THERAPIST_TOKEN" | jq '.data.kpis // "No dashboard data"'

echo -e "\n2. Clients"
curl -s -X GET http://localhost:3000/api/therapist/clients \
  -H "Authorization: Bearer $THERAPIST_TOKEN" | jq '.data.clients | length'

echo -e "\n3. Appointments"
curl -s -X GET http://localhost:3000/api/therapist/appointments \
  -H "Authorization: Bearer $THERAPIST_TOKEN" | jq '.data | length'

echo -e "\n=== ADMIN JOURNEY ==="
echo "1. Dashboard"
curl -s -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.kpis'

echo -e "\n2. Financial Overview"
curl -s -X GET http://localhost:3000/api/admin/financial/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data'

echo -e "\n=== BOOKKEEPER JOURNEY ==="
echo "1. Dashboard"
curl -s -X GET http://localhost:3000/api/bookkeeper/dashboard \
  -H "Authorization: Bearer $BOOKKEEPER_TOKEN" | jq '.data.kpis // "No dashboard data"'

echo -e "\n2. Invoices"
curl -s -X GET http://localhost:3000/api/bookkeeper/invoices \
  -H "Authorization: Bearer $BOOKKEEPER_TOKEN" | jq '.data.invoices | length'