const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcryptjs = require('bcryptjs');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM(RoleEnum.ADMIN, RoleEnum.USER, RoleEnum.STAFF, RoleEnum.MODERATOR),
    defaultValue: RoleEnum.USER,
    set(value) {
      // Convert to lowercase for consistency
      this.setDataValue('role', value ? value.toLowerCase() : RoleEnum.USER);
    }
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: () => PermissionEnum.defaultByRole[RoleEnum.USER],
    get() {
      const value = this.getDataValue('permissions');
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value) {
      this.setDataValue('permissions', typeof value === 'string' ? value : JSON.stringify(value));
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcryptjs.genSalt(10);
  user.passwordHash = await bcryptjs.hash(user.passwordHash, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('passwordHash')) {
    const salt = await bcryptjs.genSalt(10);
    user.passwordHash = await bcryptjs.hash(user.passwordHash, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.passwordHash);
};

// Hide sensitive data in JSON
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

module.exports = User;
