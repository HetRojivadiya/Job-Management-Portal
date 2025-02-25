'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Job_Applications', 'status', {
      type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    });

    await queryInterface.addColumn('Job_Applications', 'recruiterId', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('Job_Applications', 'rejectionMessage', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Job_Applications', 'status');
    await queryInterface.removeColumn('Job_Applications', 'recruiterId');
    await queryInterface.removeColumn('Job_Applications', 'rejectionMessage');
  }
};
