'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('cadastre_veicles', { 
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        status:{
          type: Sequelize.STRING,
          allowNull: true,
        },
        placa:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        prefixo:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        modelo:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        metroplan:{
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        daer:{
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        tacografo:{
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        prefeitura:{
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        empresa:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        filial:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
     
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.dropTable('cadastre_veicles');
     
  }
};
