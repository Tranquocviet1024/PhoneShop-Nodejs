const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const bcrypt = require('bcryptjs');

/**
 * Database Seeding - Initialize default admin user
 * Similar to Java ApplicationInitConfig
 */
const seedDatabase = async () => {
  try {
    console.log('🔄 Starting database seeding...');
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin';
    console.log(`🔑 Default password: ${defaultPassword}`);
    
    // Check if admin user already exists
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });
    console.log(`👤 Admin exists: ${!!adminExists}`);

    if (adminExists) {
      console.log('✅ Admin user already exists');
      console.log(`📋 Admin ID: ${adminExists.id}, Email: ${adminExists.email}, Role: ${adminExists.role}`);
      
      // Update existing admin instead of deleting
      if (adminExists.role !== RoleEnum.ADMIN) {
        console.log(`⚠️  Admin role is "${adminExists.role}", should be "${RoleEnum.ADMIN}"`);
        adminExists.role = RoleEnum.ADMIN;
      }
      
      // Force update password
      adminExists.passwordHash = defaultPassword; // beforeUpdate hook will hash it
      adminExists.isActive = true;
      await adminExists.save();
      
      console.log(`✅ Admin updated - Role: ${RoleEnum.ADMIN}, Password: ${defaultPassword}`);
      return adminExists;
    }

    // Create admin user with ADMIN role and all permissions
    console.log('🔨 Creating new admin user...');
    
    // Pass plain password - User.beforeCreate hook will hash it
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@admin.com',
      passwordHash: defaultPassword, // Hook will hash this
      fullName: 'Admin User',
      role: RoleEnum.ADMIN,
      permissions: PermissionEnum.defaultByRole[RoleEnum.ADMIN],
      isActive: true,
    });
    console.log(`✅ Admin created with password: ${defaultPassword}`);

    // Create UserRole assignment for RBAC system
    const adminRole = await Role.findOne({ where: { name: RoleEnum.ADMIN } });
    if (adminRole) {
      await UserRole.create({
        userId: adminUser.id,
        roleId: adminRole.id,
        additionalPermissions: [],
        deniedPermissions: []
      });
      console.log('✅ Admin UserRole assignment created');
    }

    console.log('⚠️  Admin user created with username: admin and password: admin');
    console.log('🔐 Please change the password after first login!');
    return adminUser;

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  }
};

module.exports = { seedDatabase };
