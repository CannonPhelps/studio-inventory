# Studio Inventory - Onboarding Process

## Overview

The Studio Inventory system includes an automatic onboarding process that creates the first admin user when the system is first set up. This ensures that new installations have a proper admin account to manage the system.

## How It Works

### Automatic Detection
- The system automatically detects if any users exist in the database
- If no users are found, all routes (except `/login` and `/onboarding`) redirect to `/onboarding`
- If users already exist, the `/onboarding` route redirects to `/login`

### First-Time Setup Flow
1. **Initial Access**: When you first access the application, you'll be automatically redirected to `/onboarding`
2. **Admin Creation**: Fill out the form to create your first admin account
3. **Validation**: The system validates email format, password strength, and required fields
4. **Account Creation**: Creates an admin user with full system access
5. **Redirect**: Automatically redirects to the login page after successful creation

## Onboarding Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | Yes | The admin's full name |
| Email Address | Yes | Must be a valid email format |
| Password | Yes | Minimum 8 characters |
| Confirm Password | Yes | Must match the password |
| Department | No | Optional department information |
| Phone Number | No | Optional contact information |

## Security Features

### Validation
- **Email Format**: Validates proper email structure
- **Password Strength**: Requires minimum 8 characters
- **Password Confirmation**: Ensures passwords match
- **Unique Email**: Prevents duplicate email addresses

### Access Control
- **Single Use**: Onboarding can only be used when no users exist
- **Admin Role**: First user is automatically assigned admin role
- **Session Security**: Uses bcrypt for password hashing

## Testing the Onboarding Process

### Check Current Status
```bash
node scripts/test-onboarding.js
```

This script will:
- Check if any users exist in the database
- Display current user count
- List existing users if any
- Provide guidance on next steps

### Manual Testing
1. **Fresh Installation**: 
   - Start with an empty database
   - Visit any page → should redirect to `/onboarding`
   
2. **Existing Users**:
   - Visit `/onboarding` → should redirect to `/login`

## Database Schema

The onboarding process uses the existing `User` and `UserKey` models:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String
  role         String   @default("user")
  department   String?
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  // ... other fields
}

model UserKey {
  id             String  @id
  userId         String
  hashedPassword String?
  user           User    @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### POST /api/auth/onboarding
Creates the first admin user.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword",
  "name": "Admin User",
  "department": "IT",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "department": "IT",
    "phone": "+1234567890"
  },
  "message": "Admin account created successfully"
}
```

## Error Handling

### Common Errors
- `400`: Missing required fields or validation failures
- `403`: Admin account already exists
- `500`: Internal server error

### Error Messages
- "Email, password, and name are required"
- "Invalid email format"
- "Password must be at least 8 characters long"
- "Passwords do not match"
- "User with this email already exists"
- "Admin account already exists"

## Next Steps After Onboarding

1. **Login**: Use your new admin credentials to log in
2. **System Configuration**: Access admin settings to configure the system
3. **User Management**: Create additional users as needed
4. **Data Import**: Import your existing inventory data
5. **Categories Setup**: Configure asset categories

## Troubleshooting

### Onboarding Not Accessible
- Check if users already exist in the database
- Verify database connection
- Check application logs for errors

### Form Validation Errors
- Ensure all required fields are filled
- Check email format is valid
- Verify password meets minimum requirements
- Ensure passwords match

### Database Issues
- Run `npx prisma db push` to ensure schema is up to date
- Check database connection string
- Verify database permissions

## Security Considerations

1. **Single Use**: Onboarding is only available when no users exist
2. **Strong Passwords**: Enforce minimum password requirements
3. **Email Validation**: Ensure proper email format
4. **Password Hashing**: Uses bcrypt with salt rounds
5. **Session Management**: Proper session handling after creation

## Development Notes

- The onboarding process is integrated into the main layout server
- Automatic redirects prevent unauthorized access
- Form validation happens both client-side and server-side
- Error handling provides clear feedback to users 