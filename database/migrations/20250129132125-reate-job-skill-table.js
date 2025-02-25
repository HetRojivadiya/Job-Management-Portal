'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Job_skill', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4, // or generate UUID in your logic
      },
      Job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Jobs', // Table reference
          key: 'id',    // Column reference in Job table
        },
        onDelete: 'CASCADE', // When a job is deleted, its associated skills will be removed
      },
      skills_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Skills', // Table reference
          key: 'id',       // Column reference in Skills table
        },
        onDelete: 'CASCADE', // When a skill is deleted, its associations with jobs will be removed
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
    await queryInterface.dropTable('Job_skill');
  }
};
