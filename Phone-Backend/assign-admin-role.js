/**
 * Script to assign ADMIN role to existing admin user
 * Run this once after seeding roles
 */

const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const UserRole = require('./src/models/UserRole');
const permissionService = require('./src/services/permissionService');

const assignAdminRole = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find admin user
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run seed script first.');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.username} (ID: ${adminUser.id})`);

    // Find ADMIN role
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      console.error('❌ ADMIN role not found. Please run seed-roles.js first.');
      process.exit(1);
    }
    console.log(`✅ Found ADMIN role (ID: ${adminRole.id})`);

    // Check if already assigned
    const existingAssignment = await UserRole.findOne({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    if (existingAssignment) {
      console.log('ℹ️  Admin user already has ADMIN role assigned');
    } else {
      // Assign ADMIN role using permissionService
      await permissionService.assignRoleToUser(adminUser.id, adminRole.id);
      console.log('✅ Successfully assigned ADMIN role to admin user');
    }

    console.log('\n✨ Done! Admin user now has ADMIN role.');
    console.log('🔄 Please restart backend server and refresh frontend.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

assignAdminRole();
