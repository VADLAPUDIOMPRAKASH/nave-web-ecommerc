# Admin Management System Guide

## Overview
This system implements a role-based admin management system with the following hierarchy:

1. **Master Admin** - Full access to all admin functions
2. **Sub Admin** - Limited admin access (cannot create/delete other admins)
3. **Delivery Boy** - Access to delivery-related functions
4. **User** - Regular customer access

## System Architecture

### Role Hierarchy
```
Master Admin (Level 4)
├── Can create/delete Sub Admins
├── Can create/delete Delivery Boys
├── Full access to all functions
└── Access to Admin Management dashboard

Sub Admin (Level 3)
├── Can create/delete Delivery Boys
├── Can manage products and orders
├── Cannot create/delete other admins
└── Access to Admin Management dashboard

Delivery Boy (Level 2)
├── Can view assigned orders
├── Can update delivery status
├── Access to Delivery Dashboard (order management & tracking)
├── Access to Inventory (order data and product statistics)
├── Access to Orders (process and update order status)
└── Cannot access admin features (products, users, analytics, settings)

User (Level 1)
├── Can place orders
├── Can view own orders
└── Regular customer functions
```

## Features Implemented

### 1. Admin Management Dashboard
- **Location**: `/dashboard` → Admin Management tab
- **Access**: Master Admin and Sub Admin only
- **Features**:
  - Overview with statistics
  - Admin management (create/delete/manage)
  - Delivery boy management
  - Role-based access control

### 2. Role-Based Route Protection
- **File**: `src/App.jsx`
- **Function**: `ProtectedRouteForRole`
- **Usage**: Protects routes based on user roles

### 3. User Role Management
- **File**: `src/utils/roleUtils.js`
- **Functions**:
  - `getCurrentUserRole()` - Get current user's role
  - `hasRole()` - Check if user has specific role
  - `isAdmin()` - Check if user is admin
  - `canCreateAdmins()` - Check admin creation permissions

### 4. Database Structure

#### Admins Collection (`admins`)
```javascript
{
  uid: "firebase_auth_uid",
  name: "Admin Name",
  email: "admin@example.com",
  role: "sub_admin", // or "master_admin"
  permissions: {
    canCreateSubAdmin: false,
    canDeleteSubAdmin: false,
    canCreateDeliveryBoy: true,
    canManageProducts: true,
    canManageOrders: true,
    canViewAnalytics: true
  },
  createdAt: Timestamp,
  createdBy: "creator_email",
  isActive: true,
  lastLogin: Timestamp
}
```

#### Delivery Boys Collection (`delivery_boys`)
```javascript
{
  uid: "firebase_auth_uid",
  name: "Delivery Boy Name",
  email: "delivery@example.com",
  phone: "+1234567890",
  address: "Delivery address",
  vehicleNumber: "ABC123",
  licenseNumber: "LIC123",
  workingArea: "Area name",
  shiftTiming: "full_time", // or "part_time", "morning", "evening"
  createdAt: Timestamp,
  createdBy: "creator_email",
  isActive: true,
  isOnline: false,
  totalDeliveries: 0,
  rating: 0
}
```

## Usage Instructions

### For Master Admin

1. **Creating Sub Admins**:
   - Navigate to Dashboard → Admin Management → Admins tab
   - Click "Add Admin" button
   - Fill in admin details
   - Sub admins will have limited permissions

2. **Creating Delivery Boys**:
   - Navigate to Dashboard → Admin Management → Delivery tab
   - Click "Add Delivery Boy" button
   - Fill in delivery boy details including vehicle info

3. **Managing Users**:
   - View all admins and delivery boys
   - Activate/deactivate accounts
   - Delete accounts (except other master admins)

### For Sub Admin

1. **Creating Delivery Boys**:
   - Same as master admin
   - Cannot create other admins

2. **Managing Products & Orders**:
   - Full access to product management
   - Can process orders
   - View analytics

### For Delivery Boy

1. **Accessing Delivery Dashboard**:
   - Navigate to Dashboard → Delivery Dashboard tab (default)
   - View today's orders, area-wise orders, and customer-wise orders
   - Access quick actions and delivery statistics

2. **Using Inventory**:
   - View order data structure and product statistics
   - Filter by categories (vegetables, leafy vegetables)
   - Download/print reports for delivery reference

3. **Managing Orders**:
   - Update order status (placed → harvested → out for delivery → delivered)
   - View order analytics and trends
   - Process orders by date, area, or customer

4. **Restrictions**:
   - Cannot access admin features (products, users, analytics, settings)
   - Cannot create or delete other users
   - Cannot modify product catalog or prices

### Authentication Flow

1. User logs in through AuthModal
2. System checks user role in Firestore
3. Role is stored in localStorage as `userRole`
4. UI components adapt based on user role
5. Route protection prevents unauthorized access

## Security Features

- **Role-based route protection**
- **Function-level permission checks**
- **Database-level role validation**
- **Secure admin creation process**
- **Automatic role cleanup on logout**

## Integration Points

### Components Updated:
- `src/App.jsx` - Route protection
- `src/components/navbar/Navbar.jsx` - Admin navigation
- `src/pages/admin/dashboard/Dashboard.jsx` - Admin dashboard
- `src/components/auth/AuthModal.jsx` - Role initialization

### New Components:
- `src/components/AdminManagement.jsx` - Main admin interface
- `src/utils/roleUtils.js` - Role management utilities
- `src/utils/setupMasterAdmin.js` - Initial setup utilities

## Setup Instructions

1. **Initialize Master Admin**:
   ```javascript
   import { initializeRoleSystem } from './src/utils/setupMasterAdmin';
   await initializeRoleSystem();
   ```

2. **Login as Master Admin**:
   - Email: `omprakash16003@gmail.com`
   - The system will automatically recognize this as master admin

3. **Create Sub Admins**:
   - Use the Admin Management interface
   - Sub admins will be created with limited permissions

4. **Create Delivery Boys**:
   - Both master and sub admins can create delivery boys
   - Include all required delivery information

## Error Handling

- **Permission Denied**: Shows appropriate error messages
- **Invalid Role**: Redirects to home page
- **Database Errors**: Graceful error handling with toast notifications
- **Authentication Errors**: Proper error messages for users

## Future Enhancements

1. **Dynamic Permissions**: Allow customizable permission sets
2. **Role Templates**: Pre-defined permission templates
3. **Audit Logs**: Track admin actions
4. **Bulk Operations**: Manage multiple users at once
5. **Advanced Analytics**: Role-based usage statistics

## Troubleshooting

### Common Issues:

1. **Admin not showing in dashboard**:
   - Check user role in localStorage
   - Verify database permissions
   - Ensure proper login flow

2. **Permission denied errors**:
   - Verify user role matches required permissions
   - Check route protection settings
   - Confirm database role assignment

3. **Role not updating**:
   - Clear localStorage and re-login
   - Check database connectivity
   - Verify role initialization function

## Support

For issues or questions about the admin system:
1. Check the console for error messages
2. Verify database permissions
3. Ensure proper role assignment
4. Test with different user roles

This system provides a robust foundation for managing different levels of administrative access while maintaining security and user experience. 