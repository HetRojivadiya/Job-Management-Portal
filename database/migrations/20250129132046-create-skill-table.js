module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Skills', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4, // or generate the UUID in your backend logic
      },
      skillName: {
        type: Sequelize.STRING,
        allowNull: false,
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

    // Adding any necessary indexes
    await queryInterface.addIndex('Skills', ['skillName']); // optional index on skillName
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Skills');
  }
};
