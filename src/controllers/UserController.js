const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../models/User');

module.exports= {
    async index( req,res ) {
      const {name} = req.params
      const user = await Users.findOne({where:{name}});
        return res.status(200).json(user)
      
    },

    async store(req,res) {
      const { name, password} = req.body;
      try {
        // Busca o usuário no banco de dados com o nome fornecido
        const user = await Users.findOne({ where: { name, password } });
      
        if (!user) {
          return res.status(401).json({ error: 'Nome de usuário ou senha inválidos' });
        }
      
        // Verifica se a senha fornecida é válida usando bcrypt
        const passwordMatch =  bcrypt.compare(password, user.password);
      
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Nome de usuário ou senha inválidos' });
        }
        // Gera um token JWT
        const token = jwt.sign({ userId: user.id, setor: user.setor },  'process.env.JWT_SECRET', { expiresIn: 120 });
      
        return res.json({ token });
      } catch (error) {
        console.error('Erro ao realizar login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
    },
    async storeCadastre(req,res) {
      const { setor,name, password } = req.body;
    
      const user = await Users.findOne({
        where: {
          name:name,
          password:password,
          setor:setor
        },
      });
    
      if (user) {
        return res.status(400).json({ error: 'Já existe um veículo com a mesma placa ou prefixo.' });
      }
    
      const userCad = await Users.create({
       name,
       password,
       setor,
       
      });
    
      return res.json(userCad);
    }

  }