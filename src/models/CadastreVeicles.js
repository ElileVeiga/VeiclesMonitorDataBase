const { Model, DataTypes } = require('sequelize');

class Cadastre_veicles extends Model {
    static init(sequelize) {
        super.init({
            status: DataTypes.STRING,
            placa: DataTypes.STRING,
            prefixo: DataTypes.INTEGER,
            modelo: DataTypes.STRING,
            metroplan: DataTypes.DATEONLY,
            daer:DataTypes.DATEONLY,
            tacografo:DataTypes.DATEONLY,
            prefeitura:DataTypes.DATEONLY,
            empresa:DataTypes.STRING,
            filial:DataTypes.STRING
        },{
            sequelize
        })
    }
}

module.exports = Cadastre_veicles;