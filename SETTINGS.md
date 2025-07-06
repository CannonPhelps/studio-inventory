# Settings System

This document describes the settings functionality implemented in the Studio Inventory application.

## Overview

The settings system allows users to manage their account information and change their passwords directly within the application. There are two types of settings pages:

1. **User Settings** (`/settings`) - Available to all users
2. **Admin Settings** (`/admin/settings`) - Available only to admin users with additional system configuration options

## Features

### User Settings (`/settings`)
- **Profile Management**: Update name, email, department, and phone number
- **Password Change**: Change password with current password verification
- **Account Information**: View user ID, role, and account dates
- **Security**: Session invalidation after password changes

### Admin Settings (`/admin/settings`)
- **All User Settings Features**: Everything from user settings
- **System Configuration**: Manage system-wide settings
- **Checkout Settings**: Configure default checkout duration and limits
- **Notification Settings**: Enable/disable email notifications
- **Approval Settings**: Configure checkout approval requirements

## User Flow

### Regular Users
1. **Access Settings**: User navigates to `/settings` from the main navigation
2. **View Profile**: User can see and edit their profile information
3. **Change Password**: User can change their password by providing current password
4. **Security**: After password change, user is logged out and must log in again

### Admin Users
1. **Access Admin Settings**: Admin navigates to `/admin/settings` from the admin navigation
2. **System Configuration**: Admin can configure system-wide settings
3. **Profile Management**: Admin can manage their own profile (same as user settings)
4. **Password Management**: Admin can change their password (same as user settings)

## API Endpoints

### User Settings APIs

#### PUT `/api/auth/update-profile`
Update user profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "phone": "+1234567890"
  }
}
```

#### POST `/api/auth/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully. Please log in again."
}
```

### Admin Settings APIs

#### GET `/api/admin/settings`
Get system settings (admin only).

**Response:**
```json
{
  "systemName": "Studio Inventory",
  "defaultCheckoutDuration": 7,
  "enableEmailNotifications": false,
  "requireApprovalForCheckouts": false,
  "maxCheckoutsPerUser": 5
}
```

#### PUT `/api/admin/settings`
Update system settings (admin only).

**Request Body:**
```json
{
  "systemName": "Studio Inventory Pro",
  "defaultCheckoutDuration": 14,
  "enableEmailNotifications": true,
  "requireApprovalForCheckouts": true,
  "maxCheckoutsPerUser": 10
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "systemName": "Studio Inventory Pro",
    "defaultCheckoutDuration": 14,
    "enableEmailNotifications": true,
    "requireApprovalForCheckouts": true,
    "maxCheckoutsPerUser": 10
  }
}
```

## Frontend Pages

### `/settings` (User Settings)
- **Profile Information Section**: Form to update name, email, department, phone
- **Password Change Section**: Collapsible form to change password
- **Account Information Section**: Display user ID, role, creation date, last update
- **Responsive Design**: Works on desktop and mobile devices

### `/admin/settings` (Admin Settings)
- **System Settings Section**: Configure system-wide settings
- **Profile Information Section**: Same as user settings
- **Password Change Section**: Same as user settings
- **Account Information Section**: Same as user settings
- **Admin-specific Features**: System configuration options

## Security Features

1. **Current Password Verification**: Users must provide their current password to change it
2. **Session Invalidation**: All sessions are invalidated after password change
3. **Email Uniqueness**: Prevents duplicate email addresses
4. **Password Requirements**: Minimum 8 characters required
5. **Authentication Required**: Settings page requires valid session

## Navigation

- **User Settings**: Accessible from the main navigation menu with a gear icon (⚙️)
- **Admin Settings**: Accessible from the admin navigation menu with a gear icon (⚙️)

## User Experience

- **Clean Interface**: Modern, responsive design with Tailwind CSS
- **Form Validation**: Client-side and server-side validation
- **Success/Error Messages**: Clear feedback for all actions
- **Loading States**: Visual feedback during API calls
- **Auto-redirect**: Automatic redirect to login after password change

## Error Handling

- **Invalid Current Password**: Shows error if current password is incorrect
- **Email Already Exists**: Prevents duplicate email addresses
- **Session Expired**: Redirects to login if session is invalid
- **Network Errors**: Graceful handling of connection issues

## Usage Examples

### Changing Password
1. Navigate to Settings
2. Click "Change Password" button
3. Enter current password
4. Enter new password (8+ characters)
5. Confirm new password
6. Click "Update Password"
7. User is automatically logged out and redirected to login

### Updating Profile
1. Navigate to Settings
2. Edit profile information in the form
3. Click "Update Profile"
4. Success message is displayed
5. Profile information is updated immediately

## Technical Implementation

- **Frontend**: Svelte with TypeScript
- **Backend**: SvelteKit API routes
- **Database**: Prisma with PostgreSQL
- **Authentication**: Session-based with cookies
- **Styling**: Tailwind CSS
- **Validation**: Client-side and server-side validation 