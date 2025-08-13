#!/bin/bash

# Login as therapist
echo "=== Logging in as therapist ==="
THERAPIST_RESP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emma.dejong@example.com","password":"TherapistPass123!"}')

THERAPIST_TOKEN=$(echo "$THERAPIST_RESP" | jq -r '.accessToken')
echo "Therapist authenticated"

# Test challenges
echo -e "\n=== CHALLENGES ==="
CHALLENGES_RESP=$(curl -s -X GET http://localhost:3000/api/challenges \
  -H "Authorization: Bearer $THERAPIST_TOKEN")

echo "Total challenges: $(echo "$CHALLENGES_RESP" | jq -r '.data.challenges | length')"
echo "First challenge:"
echo "$CHALLENGES_RESP" | jq '.data.challenges[0]'

# Test surveys
echo -e "\n=== SURVEYS ==="
SURVEYS_RESP=$(curl -s -X GET http://localhost:3000/api/surveys \
  -H "Authorization: Bearer $THERAPIST_TOKEN")

echo "Total surveys: $(echo "$SURVEYS_RESP" | jq -r '.data.surveys | length')"
echo "First survey:"
echo "$SURVEYS_RESP" | jq '.data.surveys[0]'

# Test creating a challenge
echo -e "\n=== CREATE CHALLENGE TEST ==="
CREATE_CHALLENGE=$(curl -s -X POST http://localhost:3000/api/challenges \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "7-Day Mindfulness Challenge",
    "description": "Practice mindfulness for 10 minutes each day",
    "type": "daily",
    "duration_days": 7,
    "points": 100,
    "status": "active"
  }')

echo "Create challenge response:"
echo "$CREATE_CHALLENGE" | jq '.'

# Test assigning to client
CLIENT_ID="ab5740b4-0b57-4a51-9be7-9ab79de91938"
if [ "$CREATE_CHALLENGE" != "" ]; then
  CHALLENGE_ID=$(echo "$CREATE_CHALLENGE" | jq -r '.data.id')
  if [ "$CHALLENGE_ID" != "null" ]; then
    echo -e "\n=== ASSIGN CHALLENGE ==="
    ASSIGN_RESP=$(curl -s -X POST "http://localhost:3000/api/challenges/$CHALLENGE_ID/assign" \
      -H "Authorization: Bearer $THERAPIST_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"clientId\": \"$CLIENT_ID\"}")
    
    echo "Assign response:"
    echo "$ASSIGN_RESP" | jq '.'
  fi
fi