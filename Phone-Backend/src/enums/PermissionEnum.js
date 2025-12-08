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

  // Wishlist permissions
  MANAGE_WISHLIST: 'manage_wishlist',
  VIEW_WISHLIST: 'view_wishlist',

  // Coupon permissions
  MANAGE_COUPONS: 'manage_coupons',
  CREATE_COUPON: 'create_coupon',
  UPDATE_COUPON: 'update_coupon',
  DELETE_COUPON: 'delete_coupon',
  VIEW_COUPONS: 'view_coupons',
  APPLY_COUPON: 'apply_coupon',

  // Notification permissions
  SEND_NOTIFICATIONS: 'send_notifications',
  VIEW_NOTIFICATIONS: 'view_notifications',
  MANAGE_NOTIFICATIONS: 'manage_notifications',

  // Search History permissions
  VIEW_SEARCH_HISTORY: 'view_search_history',
  MANAGE_SEARCH_HISTORY: 'manage_search_history',

  // Order Tracking permissions
  VIEW_ORDER_TRACKING: 'view_order_tracking',
  UPDATE_ORDER_TRACKING: 'update_order_tracking',

  // Flash Sale permissions
  VIEW_FLASH_SALES: 'view_flash_sales',
  MANAGE_FLASH_SALES: 'manage_flash_sales',
  CREATE_FLASH_SALE: 'create_flash_sale',
  UPDATE_FLASH_SALE: 'update_flash_sale',
  DELETE_FLASH_SALE: 'delete_flash_sale',

  // Inventory Alert permissions
  VIEW_INVENTORY_ALERTS: 'view_inventory_alerts',
  MANAGE_INVENTORY_ALERTS: 'manage_inventory_alerts',
  RESOLVE_INVENTORY_ALERT: 'resolve_inventory_alert',

  // Report permissions
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Product Image permissions
  MANAGE_PRODUCT_IMAGES: 'manage_product_images',
  
  // Product Variant permissions
  VIEW_PRODUCT_VARIANTS: 'view_product_variants',
  MANAGE_PRODUCT_VARIANTS: 'manage_product_variants',

  // Recently Viewed permissions
  VIEW_RECENTLY_VIEWED: 'view_recently_viewed',

  // Compare permissions
  COMPARE_PRODUCTS: 'compare_products',
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
  PermissionEnum.CANCEL_ORDER, // User can cancel their own orders
  
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

  // Wishlist
  PermissionEnum.MANAGE_WISHLIST,
  PermissionEnum.VIEW_WISHLIST,

  // Coupon
  PermissionEnum.VIEW_COUPONS,
  PermissionEnum.APPLY_COUPON,

  // Notification
  PermissionEnum.VIEW_NOTIFICATIONS,

  // Search History
  PermissionEnum.VIEW_SEARCH_HISTORY,

  // Order Tracking
  PermissionEnum.VIEW_ORDER_TRACKING,

  // Flash Sale (view only for users)
  PermissionEnum.VIEW_FLASH_SALES,

  // Product Variants (view only)
  PermissionEnum.VIEW_PRODUCT_VARIANTS,

  // Recently Viewed
  PermissionEnum.VIEW_RECENTLY_VIEWED,

  // Compare Products
  PermissionEnum.COMPARE_PRODUCTS,
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

    // Order Tracking - Staff can update tracking
    PermissionEnum.VIEW_ORDER_TRACKING,
    PermissionEnum.UPDATE_ORDER_TRACKING,

    // Notifications - Staff can send
    PermissionEnum.SEND_NOTIFICATIONS,
    PermissionEnum.VIEW_NOTIFICATIONS,

    // Flash Sale - Staff can view and manage
    PermissionEnum.VIEW_FLASH_SALES,
    PermissionEnum.MANAGE_FLASH_SALES,
    PermissionEnum.CREATE_FLASH_SALE,
    PermissionEnum.UPDATE_FLASH_SALE,

    // Inventory Alerts - Staff can view and resolve
    PermissionEnum.VIEW_INVENTORY_ALERTS,
    PermissionEnum.RESOLVE_INVENTORY_ALERT,

    // Reports - Staff can view
    PermissionEnum.VIEW_REPORTS,

    // Product Images - Staff can manage
    PermissionEnum.MANAGE_PRODUCT_IMAGES,

    // Product Variants - Staff can manage
    PermissionEnum.VIEW_PRODUCT_VARIANTS,
    PermissionEnum.MANAGE_PRODUCT_VARIANTS,

    // Coupons - Staff can view and manage
    PermissionEnum.VIEW_COUPONS,
    PermissionEnum.MANAGE_COUPONS,
    PermissionEnum.CREATE_COUPON,
    PermissionEnum.UPDATE_COUPON,
  ],
  
  admin: [
    // Admin has all permissions
    ...PermissionEnum.values,
  ],
};

module.exports = PermissionEnum;
