'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: Sequelize.STRING,
      status: Sequelize.INTEGER,
      avatar_url: Sequelize.STRING,
      date_create: Sequelize.DATE,
      address: Sequelize.STRING,
      phone: {
        type: Sequelize.STRING,
        validate: {
          is: {
            args: /^[0-9]{10,11}$/,
            msg: 'Phone number must be 10 or 11 digits long'
          }
        }
      },
      gender: Sequelize.INTEGER,
      full_name: Sequelize.STRING,
      birthday: Sequelize.DATE,
      coin: Sequelize.INTEGER,
      email_verify_token: Sequelize.STRING,
      verify: Sequelize.INTEGER,
      forgot_password_token: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
