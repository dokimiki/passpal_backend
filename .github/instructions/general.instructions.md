---
applyTo: '**'
---

# instructions.md

## 1. Project Purpose

This backend provides the API and DB for **PassPal**, an app for Chukyo University students to improve usability of the university's official portals.
It manages users, courses, classes, assignments, attendance logs, device tokens, notifications, and ratings.

**Authentication:**

- **ALL ENDPOINTS ARE PROTECTED BY DEFAULT** - Firebase Authentication is enforced globally via `FirebaseAuthGuard`.
- Only `/signup` endpoint is public (marked with `@Public()` decorator).
- All other endpoints require a valid Firebase JWT Bearer Token in the Authorization header.
- The system automatically validates tokens, checks user status (banned/active), and injects user data into requests.

---

## 2. Domain Model & Key Tables

### 2.1 Courses (Course Master)

- **courses:** University-wide master for course titles and main instructor.
  - (e.g., "Intro to Computer Science", lead: "Yamada Taro")

- **course_ratings:** User reviews (star 1-5 + comment) for courses.

**Rules:**

- `title` + `lead_instructor` is unique.
- Each user can rate a course only once.

---

### 2.2 Users

- **users:** Application users, keyed by `firebase_uid`.
  - Supports "banned" flag and reason.

- **user_devices:** Each device (FCM token + OS) registered by a user.
  - Supports multiple devices per user.

---

### 2.3 Classes

- **classes:** A _class_ is an instance of a course in a specific term and with a MaNaBo class ID.
  - (e.g., "2025_Spring", MaNaBoID: "CS101", linked to a `course`)

- **class_notifiers:** Users who want notifications for a class.

---

### 2.4 Assignments

- **assignments:** Each assignment belongs to a class and has a unique MaNaBo directory/assignment ID.
  - `status` is 'opened' or 'deleted'.
  - `open_at` and `due_at` can be null (optional).
  - Uniqueness: (class_id, manabo_directory_id, manabo_assignment_id)

---

### 2.5 Attendance

- **attendance_logs:** User-submitted attendance logs for a given term, date, weekday, period.
  - `status` is one of \['present', 'absent', 'late']

---

### 2.6 Notification Reports

- **notification_reports:** Users report assignment notifications (appeared/changed/disappeared) for backend tracking.
  - Used for shared notifications among users.

---

## 3. Enumerations

- assignment_status_enum: 'opened', 'deleted'
- report_type_enum: 'appeared', 'changed', 'disappeared'
- attendance_status_enum: 'present', 'absent', 'late'
- weekday_enum: 'monday'...'sunday'
- device_os_enum: 'ios', 'android', 'web'

---

## 4. API Conventions

- **Pagination:** Most list endpoints support `page`, `per_page` params and return `meta`.
- **Error Handling:** All endpoints return standard error objects (`code`, `message`) for unauthorized, forbidden, not found, etc.
- **Security:** Except `/signup`, all endpoints require a valid Firebase ID token as Bearer.

---

## 5. Typical Feature Flows

### 5.1 Class Registration & Notification

1. When a student registers a class, link or create course master if needed.
2. To receive assignment notifications for a class, register with `/classes/{classId}/notifications`.

### 5.2 Assignment Management

- Each assignment links to a class, is uniquely identified within that class.
- New/updated assignments can be reported via `/notification-reports` for cross-user notification.

### 5.3 Attendance Logs

- Users can submit, update, delete attendance logs per term and period.
- Attendance logs are not linked to a specific class, but to (date, period, weekday, term, user).

### 5.4 Course Ratings

- Users can submit one rating per course; update or delete allowed.
- Ratings include star (1-5) and optional comment.

---

## 6. Special/Attention Points

- **MaNaBo IDs:** All class and assignment relationships are mapped via external MaNaBo IDs (class/dir/assignment).
- **Unique Constraints:** Follow the composite unique constraints as defined in the schema to prevent duplicates.
- **Device Management:** Multiple devices per user are supported; deleting device tokens removes only that device's FCM token.

---

## 7. Naming & Conventions

- Use **snake_case** for DB columns, **camelCase** for API/DTO fields (e.g., `lead_instructor` → `leadInstructor`).
- All UUIDs use `uuid_generate_v7()`.

---

## 8. Sample Data Relationships

- A **user** can rate many **courses**, attend many **classes**, submit many **attendance_logs** and **notification_reports**.
- A **class** is for one term+MaNaBoClassID, belongs to a **course**, has many **assignments**, many **notifiers** (users).
- An **assignment** belongs to one class, identified by MaNaBo Directory/Assignment IDs.

---

## 9. Migration & Auditing

- All tables have `created_at`, `updated_at` (automatically set on update).
- Use triggers for `updated_at`.

---

## 10. For LLM/Copilot

- Always reflect business rules and unique constraints from the DB in your service logic and tests.
- When in doubt about relationships, **refer to the comments in the SQL schema.**
- Follow enum values exactly.
- Implement error handling as specified in the OpenAPI for all endpoints.

---

## 11. Authentication Implementation & Usage

### 11.1 Global Authentication System

**ALL ENDPOINTS ARE PROTECTED BY DEFAULT** unless explicitly marked as public.

- `FirebaseAuthGuard` is registered as a global guard in `AppModule`
- Validates Firebase JWT tokens automatically
- Checks user ban status and throws `ForbiddenException` if banned
- Injects `User` and `DecodedIdToken` objects into request context

### 11.2 Making Endpoints Public (No Authentication)

Use the `@Public()` decorator to bypass authentication:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('some-public-resource')
export class PublicController {
  @Get()
  @Public()  // ← This endpoint requires NO authentication
  async getPublicData() {
    return this.someService.getPublicData();
  }
}
```

### 11.3 Using Current User in Protected Endpoints

Use `@CurrentUser()` decorator to get the authenticated user:

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('protected-resource')
export class ProtectedController {
  @Get()
  async getUserData(@CurrentUser() user: User) {
    // user contains the authenticated User from database
    return this.someService.getDataForUser(user.id);
  }

  @Post()
  async createResource(
    @CurrentUser() user: User,
    @Body() createDto: CreateResourceDto,
  ) {
    return this.someService.create({
      ...createDto,
      userId: user.id, // Automatically link to authenticated user
    });
  }
}
```

### 11.4 Using Firebase User Data

Use `@CurrentFirebaseUser()` to access Firebase's DecodedIdToken:

```typescript
import { CurrentFirebaseUser } from '../auth/decorators/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('firebase-data')
export class FirebaseController {
  @Get('profile')
  async getFirebaseProfile(@CurrentFirebaseUser() firebaseUser: DecodedIdToken) {
    // firebaseUser contains Firebase token data (uid, email, etc.)
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.email_verified,
    };
  }
}
```

### 11.5 Authentication Error Handling

The system automatically handles authentication errors:

- **401 Unauthorized**: Invalid/missing token, user not found in database
- **403 Forbidden**: User is banned (includes ban reason in message)

Example error responses:
```json
// Missing token
{
  "code": "UNAUTHORIZED",
  "message": "No token provided"
}

// Banned user
{
  "code": "FORBIDDEN", 
  "message": "User is banned due to policy violation"
}
```

### 11.6 Authentication Setup Requirements

1. **Firebase Admin SDK**: Must be configured with service account credentials
2. **Environment Variables**: Set `GOOGLE_APPLICATION_CREDENTIALS` or Firebase config
3. **User Registration**: Users must be created via `/signup` endpoint before accessing protected routes

### 11.7 Standard Authentication Flow

1. **Frontend**: User authenticates with Firebase Auth, obtains JWT token
2. **API Request**: Include token in `Authorization: Bearer <token>` header
3. **Backend**: `FirebaseAuthGuard` validates token with Firebase Admin SDK
4. **Database Lookup**: Find user by `firebase_uid`, check ban status
5. **Request Context**: Inject user data into request for controller access

### 11.8 Development Guidelines

- **New Controllers**: No need to add authentication guards - they're global by default
- **Public Endpoints**: Always use `@Public()` decorator explicitly
- **User Context**: Always use `@CurrentUser()` instead of extracting user from request manually
- **Error Handling**: Let the global guard handle auth errors - focus on business logic
- **Testing**: Mock authentication in tests using custom guards or bypass mechanisms

---