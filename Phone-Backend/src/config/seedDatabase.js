const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');

/**
 * Database Seeding - Initialize default admin user
 * Similar to Java ApplicationInitConfig
 */
const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });

    if (adminExists) {
      console.log('✅ Admin user already exists');
      
      // Update admin permissions to ensure all new permissions are included
      const allPermissions = PermissionEnum.defaultByRole[RoleEnum.ADMIN];
      const currentPermissions = typeof adminExists.permissions === 'string' 
        ? JSON.parse(adminExists.permissions) 
        : adminExists.permissions || [];
      
      // Check if permissions need to be updated (e.g., new permissions added)
      if (JSON.stringify(currentPermissions) !== JSON.stringify(allPermissions)) {
        await adminExists.update({ permissions: allPermissions });
        console.log('✅ Admin permissions updated with new permissions');
      }

      // IMPORTANT: Ensure admin has UserRole assignment for RBAC system
      const adminRole = await Role.findOne({ where: { name: RoleEnum.ADMIN } });
      if (adminRole) {
        const userRoleExists = await UserRole.findOne({
          where: { userId: adminExists.id, roleId: adminRole.id }
        });
        
        if (!userRoleExists) {
          await UserRole.create({
            userId: adminExists.id,
            roleId: adminRole.id,
            additionalPermissions: [],
            deniedPermissions: []
          });
          console.log('✅ Admin UserRole assignment created');
        }
      }
      
      return;
    }

    // Create admin user with ADMIN role and all permissions
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@admin.com',
      passwordHash: 'admin', // Will be hashed by User.beforeCreate hook
      fullName: 'Admin User',
      role: RoleEnum.ADMIN,
      permissions: PermissionEnum.defaultByRole[RoleEnum.ADMIN],
      isActive: true,
    });

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
