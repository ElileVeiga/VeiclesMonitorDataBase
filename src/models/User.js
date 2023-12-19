const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');


class Users extends Model {
    static init(sequelize) {
        super.init({
            name: DataTypes.STRING,
            password: DataTypes.STRING,
            setor:DataTypes.STRING
        },{
            sequelize
        })
        // Users.beforeCreate(async (user) => {
        //     const saltRounds = 10;
        //     const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        //     user.password = hashedPassword;
        //   });
        
          return Users;
        }
    }

module.exports = Users;