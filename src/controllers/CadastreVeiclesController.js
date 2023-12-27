const CadastreVeicles = require('../models/CadastreVeicles')
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');


module.exports = {
  async index(req, res) {
    const veicle = await CadastreVeicles.findAll();
    return res.json(veicle)
  },
  async Satusindex(req, res) {
    const { id } = req.params
    const status = await CadastreVeicles.findByPk(id);
    return res.json(status)
  },
  async update(req, res) {
    const { id } = req.params;
    const { metroplan, daer, tacografo, prefeitura } = req.body;

    try {
      const [updatedRowsCount, updatedRows] = await CadastreVeicles.update(
        {
          metroplan: metroplan,
          daer: daer,
          tacografo: tacografo,
          prefeitura: prefeitura,
          status: 'OK' // Adicionando a atualização para a coluna STATUS
        },
        {
          where: {
            id: id
          },
          returning: true,
          plain: true
        }
      );

      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.json(updatedRows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
  async Statusupdate(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const [updatedRowsCount, updatedRows] = await CadastreVeicles.update(
        {
          status: status,
        },
        {
          where: {
            id: id
          },
          returning: true,
          plain: true
        }
      );

      if (updatedRowsCount === 0) {
        return res.status(404)
      }

      return res.json(updatedRows);
    } catch (error) {
      console.error(error);
      return res.status(500)
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    const deletsveicle = await CadastreVeicles.destroy({
      where: {
        id: id,

      }
    })
    return res.json(deletsveicle)

  },
  async temp(req, res) {
    let dataFormat;
    let LimtDays;

    try {
      const dataAtual = new Date();
      const dataFormatada = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${dataAtual.getDate().toString().padStart(2, '0')}`;
      dataFormat = new Date(dataFormatada);
      LimtDays = 20;
      let emailEnviado = false;
    
      const dadosDoBanco = await CadastreVeicles.findAll({
        where: {
          [Op.or]: [
            { metroplan: { [Op.not]: null } },
            { daer: { [Op.not]: null } },
            { tacografo: { [Op.not]: null } },
            { prefeitura: { [Op.not]: null } },
          ],
        },
        attributes: ['id', 'prefixo', 'metroplan', 'daer', 'tacografo', 'prefeitura', 'status', 'filial'],
      });
    
      if (!dadosDoBanco || dadosDoBanco.length === 0) {
        return res.status(404).json({ mensagem: 'Não foram encontrados dados no banco.' });
      }
    
      const datasDentroDoLimite = dadosDoBanco.filter((item) => {
        const datas = ['metroplan', 'daer', 'tacografo', 'prefeitura'];
        return datas.some((data) => {
          const dbData = new Date(item[data]);
          const diferencaEmDias = (dbData.getTime() - dataFormat.getTime()) / (1000 * 60 * 60 * 24);
          return diferencaEmDias <= LimtDays;
        });
      });
    
      if (datasDentroDoLimite.length > 0 && !emailEnviado) {
        const transporter = nodemailer.createTransport({
          service: 'outlook',
          port: 587,
          auth: {
            user: 'ti1@vimsa.com.br',
            pass: '',
          },
        });
    
        // Filtra os dados por filial
        const dadosPorFilial = {};
        datasDentroDoLimite.forEach((item) => {
          const destinatario = item.filial === 'Montenegro' ? 'ti1@vimsa.com.br' : 'ti1@vimsa.com.br';
    
          if (!dadosPorFilial[destinatario]) {
            dadosPorFilial[destinatario] = [];
          }
    
          dadosPorFilial[destinatario].push(item);
        });
    
        // Envia um e-mail para cada destinatário/filial
        for (const destinatario in dadosPorFilial) {
          const corpoEmail = construirTabelaEmail(dadosPorFilial[destinatario]);
    
          const infoEmail = await transporter.sendMail({
            from: 'ti1@vimsa.com.br',
            to: destinatario,
            subject: `Veículos para fazer vistoria`,
            html: corpoEmail,
          });
        }
    
        // Atualize o status na tabela para "PROCESSANDO"
        await Promise.all(datasDentroDoLimite.map(async (item) => {
          await CadastreVeicles.update({ status: 'PROCESSANDO' }, { where: { id: item.id } });
        }));
    
        emailEnviado = true;
    
        return res.status(200).json({ mensagem: 'E-mails enviados com sucesso. Status atualizado para PROCESSANDO.' });
      } else {
        return res.status(200).json({ mensagem: `Nenhum veículo dentro do prazo de 20 dias na tabela.` });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
    
    // Função para construir a tabela no corpo do e-mail
    function construirTabelaEmail(dados) {
      return `
        <p>Lista de veículos dentro do prazo de 20 dias para realizar processo de vistorias</p>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
    
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
    
          th {
            background-color: #f2f2f2;
          }
        </style>
        <table>
          <thead>
            <tr>
              <th>PREFIXO</th>
              <th>METROPLAN</th>
              <th>TACOGRAFO</th>
              <th>PREFEITURA</th>
              <th>DAER</th>
            </tr>
          </thead>
          <tbody>
            ${dados.map((item) => `
              <tr>
                <td>${item.prefixo}</td>
                <td>${item.metroplan && dentroDoPrazo(item.metroplan) ? item.metroplan : ' '}</td>
                <td>${item.tacografo && dentroDoPrazo(item.tacografo) ? item.tacografo : ' '}</td>
                <td>${item.prefeitura && dentroDoPrazo(item.prefeitura) ? item.prefeitura : ' '}</td>
                <td>${item.daer && dentroDoPrazo(item.daer) ? item.daer : ' '}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <p>Data no formato americano ano-mes-dia (yyy/mm/dd)</p>
      `;
    }
    
 function dentroDoPrazo(data) {
  const dbData = new Date(data);
  const diferencaEmDias = Math.abs((Date.parse(data) - Date.now()) / (1000 * 60 * 60 * 24));

  // Verifica se a data é menor ou igual a 0001-01-02 e retorna um sinal de subtração
  if (diferencaEmDias <= 0) {
    return ' ';
  }

  return diferencaEmDias <= LimtDays;
}
  },
  async store(req, res) {
    const { status, placa, prefixo, modelo, metroplan, daer, tacografo, prefeitura, empresa, filial } = req.body;

    // Verifica se já existe um veículo com a mesma placa ou prefixo
    const veiculoExistente = await CadastreVeicles.findOne({
      where: {
        [Op.or]: [{ placa: placa }, { prefixo: prefixo }],
      },
    });

    if (veiculoExistente) {
      return res.status(400).json({ error: 'Já existe um veículo com a mesma placa ou prefixo.' });
    }

    // Se não existir, cria o novo veículo
    const veiculo = await CadastreVeicles.create({
      status: 'OK',
      placa,
      prefixo,
      modelo,
      metroplan,
      daer,
      tacografo,
      prefeitura,
      empresa,
      filial
    });

    return res.json(veiculo);
  }
};

