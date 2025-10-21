# Messaging System Migration Guide

## Overview
The messaging system has been completely rewritten with:
- ✅ Universal API endpoints (`/api/messages`)
- ✅ Role-based access control
- ✅ Conversation threading
- ✅ Unified frontend API service

## Migration Steps

### 1. Update Imports

**Before:**
```typescript
import { realApiService } from '@/services/realApi';
```

**After:**
```typescript
import messageApi from '@/services/messageApi';
```

---

### 2. Update API Calls

#### Get Messages

**Before:**
```typescript
const response = await realApiService.client.getMessages();
```

**After:**
```typescript
const result = await messageApi.getMessages({
  folder: 'inbox', // or 'sent' or 'all'
  page: 1,
  limit: 50,
  unreadOnly: false
});

if (result.success) {
  const messages = result.data?.messages || [];
  const unreadCount = result.data?.unreadCount || 0;
}
```

#### Send Message

**Before:**
```typescript
const response = await realApiService.client.sendMessage({
  recipient_id: therapistId,
  subject: 'Hello',
  content: 'Message content',
  priority_level: 'normal'
});
```

**After:**
```typescript
const result = await messageApi.sendMessage({
  recipientId: therapistId, // Note: camelCase
  subject: 'Hello',
  content: 'Message content',
  priority: 'normal' // Note: no '_level' suffix
});

if (result.success) {
  console.log('Message sent:', result.data?.id);
}
```

#### Get Conversations

**New Feature:**
```typescript
const result = await messageApi.getConversations();

if (result.success) {
  const conversations = result.data?.conversations || [];
  // Each conversation has: participant info, last message, unread count
}
```

#### Get Conversation with User

**New Feature:**
```typescript
const result = await messageApi.getConversation(userId);

if (result.success) {
  const messages = result.data?.messages || [];
  // Messages are automatically marked as read
}
```

#### Get Available Contacts

**New Feature:**
```typescript
const result = await messageApi.getAvailableContacts();

if (result.success) {
  const contacts = result.data?.contacts || [];
  // Returns only users current user can message
}
```

---

### 3. Update Data Structures

#### Message Interface

**Before:**
```typescript
interface Message {
  id: string;
  sender_name: string; // String concatenation
  recipient_name: string; // String concatenation
  // ...
}
```

**After:**
```typescript
import { Message } from '@/services/messageApi';

// Message interface includes:
// - sender_first_name, sender_last_name (separate fields)
// - recipient_first_name, recipient_last_name
// - sender_role, recipient_role
// - is_read, created_at, conversation_id
```

---

### 4. Files to Update

#### Client Messages
**File:** `/src/pages/roles/client/messages/ClientMessages.tsx`

**Changes Needed:**
1. Import `messageApi` instead of `realApiService`
2. Update `loadMessagesData()` to use new API
3. Use `getConversations()` for conversation list
4. Use `getConversation(userId)` for message thread
5. Use `getAvailableContacts()` for contact selection

#### Therapist Messages
**File:** `/src/pages/roles/therapist/messages/TherapistMessages.tsx`

**Changes Needed:**
1. Same as client messages
2. Note: Therapists can message clients + admin + other staff

#### Admin Messages
**File:** Admin messaging component (if exists)

**Changes Needed:**
1. Same API service
2. Note: Admin can message everyone (no restrictions)

#### Assistant Messages
**File:** `/src/pages/roles/assistant/messages/AssistantMessages.tsx`

**Changes Needed:**
1. Same as admin

---

### 5. Example Complete Component

```typescript
import React, { useState, useEffect } from 'react';
import messageApi, { Conversation, Message, Contact } from '@/services/messageApi';

const MessagingComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadContacts();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const result = await messageApi.getConversations();
    if (result.success) {
      setConversations(result.data?.conversations || []);
    }
    setLoading(false);
  };

  const loadContacts = async () => {
    const result = await messageApi.getAvailableContacts();
    if (result.success) {
      setContacts(result.data?.contacts || []);
    }
  };

  const loadConversation = async (userId: string) => {
    const result = await messageApi.getConversation(userId);
    if (result.success) {
      setMessages(result.data?.messages || []);
      setSelectedConversation(userId);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    const result = await messageApi.sendMessage({
      recipientId,
      content,
      subject: 'Message',
      priority: 'normal'
    });

    if (result.success) {
      // Reload conversation
      await loadConversation(recipientId);
      // Reload conversations list
      await loadConversations();
    }
  };

  // ... rest of component
};
```

---

### 6. Access Control Testing

#### Client
```typescript
// ✅ Can message therapist
await messageApi.sendMessage({ recipientId: therapistId, content: 'Hi' });

// ❌ Cannot message admin (will return 403)
await messageApi.sendMessage({ recipientId: adminId, content: 'Hi' });
```

#### Therapist
```typescript
// ✅ Can message client (if assigned)
await messageApi.sendMessage({ recipientId: clientId, content: 'Hi' });

// ✅ Can message admin
await messageApi.sendMessage({ recipientId: adminId, content: 'Hi' });

// ❌ Cannot message unassigned client (will return 403)
```

#### Admin
```typescript
// ✅ Can message anyone
await messageApi.sendMessage({ recipientId: anyUserId, content: 'Hi' });
```

---

### 7. Error Handling

All API methods return a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string; // Error message if success=false
  data?: T; // Response data if success=true
}
```

**Example:**
```typescript
const result = await messageApi.sendMessage({ ... });

if (!result.success) {
  // Show error to user
  console.error(result.message);
  showNotification(result.message || 'Failed to send message', 'error');
  return;
}

// Success - use result.data
console.log('Message sent:', result.data?.id);
```

---

### 8. Testing Checklist

- [ ] Client can send message to therapist
- [ ] Client CANNOT send message to admin
- [ ] Therapist can send message to assigned client
- [ ] Therapist can send message to admin
- [ ] Therapist CANNOT message unassigned client
- [ ] Admin can message everyone
- [ ] Conversations load correctly
- [ ] Messages marked as read when viewing
- [ ] Unread count updates correctly
- [ ] Available contacts filtered by role
- [ ] Send message updates conversation list

---

### 9. Common Issues

#### "You can only message your assigned therapist"
**Cause:** Client trying to message non-assigned user
**Fix:** Use `getAvailableContacts()` to show only allowed recipients

#### "You can only message your assigned clients"
**Cause:** Therapist trying to message unassigned client
**Fix:** Ensure client is assigned via admin dashboard first

#### Messages not showing
**Cause:** Using old API endpoints
**Fix:** Ensure using `/api/messages` (not `/api/client/messages`)

#### Conversation ID missing
**Cause:** First message in conversation
**Fix:** System automatically creates conversation_id on first message

---

## Quick Reference

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Send message | `/api/messages/send` | POST |
| Get messages | `/api/messages` | GET |
| Get conversations | `/api/messages/conversations` | GET |
| Get conversation | `/api/messages/conversation/:userId` | GET |
| Mark as read | `/api/messages/:id/read` | PUT |
| Archive | `/api/messages/:id` | DELETE |
| Get contacts | `/api/messages/available-contacts` | GET |

---

**Migration Deadline:** Complete before next major release
**Support:** See `/Users/mukelakatungu/praktijk-epd-backend/MESSAGING_SYSTEM.md` for full API documentation
