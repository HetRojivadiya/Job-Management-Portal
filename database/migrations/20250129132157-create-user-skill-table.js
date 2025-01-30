'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User_Skill', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4, // Automatically generate UUID
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // Reference to the 'User' table
          key: 'id',     // The column in 'User' table
        },
        onDelete: 'CASCADE', // Delete User_Skill when the related User is deleted
      },
      skills_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Skills', // Reference to the 'Skills' table
          key: 'id',       // The column in 'Skills' table
        },
        onDelete: 'CASCADE', // Delete User_Skill when the related Skill is deleted
      },
      proficiency_level: {
        type: Sequelize.BIGINT,
        allowNull: false,  // Assuming proficiency_level is a required field
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User_Skill');
  }
};
