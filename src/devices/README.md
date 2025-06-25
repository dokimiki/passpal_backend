# Devices Module Documentation

## Overview
The Devices module handles user device token registration and management for Firebase Cloud Messaging (FCM) push notifications.

## Endpoints

### POST /devices
**Description**: Register a device token for the authenticated user
**Authentication**: Required (Firebase Auth)
**Request Body**:
```json
{
  "fcmToken": "string",
  "deviceOs": "ios" | "android" | "web"
}
```
**Response (201)**:
```json
{
  "id": "uuid"
}
```

### DELETE /devices/{deviceId}
**Description**: Delete a device token for the authenticated user
**Authentication**: Required (Firebase Auth)
**Parameters**:
- `deviceId` (path): UUID of the device to delete
**Response**: 204 No Content

## Database Schema
The module uses the `user_devices` table with the following structure:
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `fcm_token`: FCM device token
- `device_os`: Enum (ios, android, web)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Key Features
1. **User Authentication**: All endpoints require Firebase authentication
2. **Ban Check**: Banned users cannot register or delete devices
3. **Upsert Logic**: Device registration updates existing tokens or creates new ones
4. **Ownership Validation**: Users can only delete their own devices
5. **Multiple Devices**: Users can have multiple devices registered

## Error Handling
- **401 Unauthorized**: Invalid/missing Firebase token
- **403 Forbidden**: User is banned
- **404 Not Found**: Device not found or doesn't belong to user

## Testing
Comprehensive unit tests are included for both controller and service layers, covering:
- Successful device registration and deletion
- Ban status validation
- Error conditions
- User ownership verification
