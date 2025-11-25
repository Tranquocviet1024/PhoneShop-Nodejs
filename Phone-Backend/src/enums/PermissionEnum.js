/**
 * Permission Enumeration
 * Defines all available permissions in the system
 */
const PermissionEnum = {
  // Product permissions
  READ_PRODUCTS: 'read_products',
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',

  // Order permissions
  CREATE_ORDER: 'create_order',
  VIEW_ORDERS: 'view_orders',
  UPDATE_ORDER: 'update_order',
  CANCEL_ORDER: 'cancel_order',
  DELETE_ORDER: 'delete_order',

  // User permissions
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // Payment permissions
  CONFIRM_PAYMENT: 'confirm_payment',
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_PAYMENTS: 'manage_payments',
  CREATE_PAYMENT: 'create_payment',
  UPDATE_PAYMENT: 'update_payment',

  // Review permissions
  CREATE_REVIEW: 'create_review',
  UPDATE_REVIEW: 'update_review',
  DELETE_REVIEW: 'delete_review',
  MANAGE_REVIEWS: 'manage_reviews',
  VIEW_REVIEWS: 'view_reviews',

  // Category permissions
  MANAGE_CATEGORIES: 'manage_categories',
  CREATE_CATEGORY: 'create_category',
  UPDATE_CATEGORY: 'update_category',
  DELETE_CATEGORY: 'delete_category',
  VIEW_CATEGORIES: 'view_categories',

  // Cart permissions
  MANAGE_CART: 'manage_cart',
  VIEW_CART: 'view_cart',

  // Role & Permission management
  MANAGE_ROLES: 'manage_roles',
  VIEW_ROLES: 'view_roles',
  CREATE_ROLE: 'create_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',
  ASSIGN_ROLE: 'assign_role',
  GRANT_PERMISSION: 'grant_permission',
  REVOKE_PERMISSION: 'revoke_permission',

  // Audit & Logging
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_STATISTICS: 'view_statistics',

  // Upload permissions
  UPLOAD_IMAGE: 'upload_image',
  DELETE_IMAGE: 'delete_image',

  // Admin Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ADMIN_STATS: 'view_admin_stats',
};

// Make it also usable as array for validation
PermissionEnum.values = Object.values(PermissionEnum);

// Check if a permission is valid
PermissionEnum.isValid = (permission) => {
  return PermissionEnum.values.includes(permission);
};

// Default permissions for each role
const userPermissions = [
  // Product
  PermissionEnum.READ_PRODUCTS,
  PermissionEnum.VIEW_CATEGORIES,
  
  // Order
  PermissionEnum.CREATE_ORDER,
  PermissionEnum.VIEW_ORDERS,
  
  // Profile
  PermissionEnum.VIEW_PROFILE,
  PermissionEnum.UPDATE_PROFILE,
  
  // Review
  PermissionEnum.CREATE_REVIEW,
  PermissionEnum.UPDATE_REVIEW,
  PermissionEnum.VIEW_REVIEWS,
  
  // Cart
  PermissionEnum.MANAGE_CART,
  PermissionEnum.VIEW_CART,
];

PermissionEnum.defaultByRole = {
  user: userPermissions,
  
  moderator: [
    // All USER permissions
    ...userPermissions,
    
    // Additional moderator permissions
    PermissionEnum.MANAGE_REVIEWS,
    PermissionEnum.DELETE_REVIEW,
    PermissionEnum.VIEW_USERS,
    PermissionEnum.UPDATE_PRODUCT,
    PermissionEnum.VIEW_PAYMENTS,
    PermissionEnum.VIEW_AUDIT_LOGS,
  ],
  
  staff: [
    // Product
    PermissionEnum.READ_PRODUCTS,
    PermissionEnum.CREATE_PRODUCT,
    PermissionEnum.UPDATE_PRODUCT,
    PermissionEnum.VIEW_CATEGORIES,
    
    // Order
    PermissionEnum.VIEW_ORDERS,
    PermissionEnum.UPDATE_ORDER,
    
    // Category
    PermissionEnum.CREATE_CATEGORY,
    PermissionEnum.UPDATE_CATEGORY,
    PermissionEnum.VIEW_CATEGORIES,
    
    // Upload
    PermissionEnum.UPLOAD_IMAGE,
    
    // View
    PermissionEnum.VIEW_USERS,
    PermissionEnum.VIEW_DASHBOARD,
  ],
  
  admin: [
    // Admin has all permissions
    ...PermissionEnum.values,
  ],
};

module.exports = PermissionEnum;
