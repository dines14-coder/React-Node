const bcrypt = require('bcryptjs');
const User = require('./User');

class Auth {
  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async seedUsers() {
    const users = [
      { name: 'Super Admin', email: 'sa@admin.com', username: 'SA', password: 'password', role: 'super_admin' },
      { name: 'Admin 1', email: 'admin1@admin.com', username: 'admin1', password: 'password', role: 'admin' },
      { name: 'Admin 2', email: 'admin2@admin.com', username: 'admin2', password: 'password', role: 'admin' },
      { name: 'Admin 3', email: 'admin3@admin.com', username: 'admin3', password: 'password', role: 'admin' }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });
      }
    }
  }
}

module.exports = Auth;