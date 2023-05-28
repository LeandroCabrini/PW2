const express = require('express');
const routes = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateTokenAdmin = require('./middleware/authAdmin');
const authenticateTokenResponsible = require('./middleware/authResponsible');
const jwt = require('jsonwebtoken');


const prisma = new PrismaClient();

routes.get('/token/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário existe no banco de dados
    const user = await prisma.user.findUnique({
      where: { IdUser: Number(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar o token de autenticação
    const token = jwt.sign({ id: user.IdUser }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//REQUISITO 1
routes.post('/cadastrarPessoa', authenticateTokenAdmin, async (req, res) => {
  const { NameUser, Age, CPF, email, type } = req.body;

  // Validando o tipo de usuário
  if (type !== 2 && type !== 3) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' });
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        NameUser,
        Age,
        CPF,
        email,
        type,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 2
routes.put('/editaPessoa/:id', authenticateTokenAdmin, async (req, res) => {
  const { id } = req.params;
  const { NameUser, Age, CPF, email, type } = req.body;

  // Validando o tipo de usuário
  if (type !== 2 && type !== 3) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { IdUser: Number(id) },
      data: {
        NameUser,
        Age,
        CPF,
        email,
        type,
      },
    });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




//REQUISITO 3
routes.delete('/deletarPessoa/:id', authenticateTokenAdmin, async (req, res) => {
  const { id } = req.params;

  // Validando o tipo de usuário
  try {
    const user = await prisma.user.findUnique({
      where: { IdUser: Number(id) },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.type !== 2 && user.type !== 3) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    await prisma.user.delete({ where: { IdUser: Number(id) } });

    return res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 4
routes.get('/candidatos', authenticateTokenAdmin, async (req, res) => {
  // Validando o tipo de usuário
  try {

    const candidatos = await prisma.user.findMany({ where: { OR: [{ type: 2 }, { type: 3 }] } });

    return res.status(200).json({ candidatos });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 5
routes.post('/cadastrarProjeto', authenticateTokenResponsible, async (req, res) => {
  const { ProjectName, ProjectDescription, YearStart, YearEnd, IdUserResponsible } =
    req.body;

  // Validando se o usuário é responsável
  try {
    const user = await prisma.user.findUnique({
      where: { IdUser: Number(IdUserResponsible) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.type !== 2) {
      return res.status(400).json({ error: 'Usuário não é do tipo responsável' });
    }

    const projeto = await prisma.project.create({
      data: {
        ProjectName,
        ProjectDescription,
        YearStart,
        YearEnd,
        user: { connect: { IdUser: Number(IdUserResponsible) } },
      },
    });

    return res.status(201).json({ projeto });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 6
routes.put('/editarProjeto/:id', authenticateTokenResponsible, async (req, res) => {
  const id = Number(req.params.id);
  const { ProjectName, ProjectDescription, YearStart, YearEnd, IdUserResponsible } =
    req.body;

  // Validando se o projeto existe e se pertence ao usuário responsável
  try {
    const projeto = await prisma.project.findUnique({
      where: { IdProject: id },
      include: { user: true },
    });

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (projeto.user.IdUser !== Number(IdUserResponsible)) {
      return res.status(403).json({ error: 'Usuário não é responsável pelo projeto' });
    }

    const projetoAtualizado = await prisma.project.update({
      where: { IdProject: id },
      data: {
        ProjectName,
        ProjectDescription,
        YearStart,
        YearEnd,
      },
    });

    return res.status(200).json({ projeto: projetoAtualizado });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 7
routes.delete('/deletarProjeto/:id', authenticateTokenResponsible, async (req, res) => {
  const id = Number(req.params.id);

  // Verificando se o projeto existe
  try {
    const projeto = await prisma.project.findUnique({ where: { IdProject: id } });

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificando se o usuário é responsável pelo projeto
    //if (projeto.IdUserResponsible !== req.user.id) {
    // return res
    //  .status(403)
    //  .json({ error: 'Você não tem permissão para deletar este projeto' });
    // }

    // Verificando se o projeto possui alguma candidatura
    const candidaturas = await prisma.application.findMany({
      where: { IdProject: id },
    });

    if (candidaturas.length > 0) {
      return res
        .status(403)
        .json({ error: 'Não é possível excluir projetos com candidaturas' });
    }

    // Excluindo o projeto
    const projetoDeletado = await prisma.project.delete({ where: { IdProject: id } });

    return res.status(200).json({ projeto: projetoDeletado });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 8
routes.get('/projetos', async (req, res) => {
  try {
    // Listando todos os projetos do banco de dados
    const projetos = await prisma.project.findMany({
      select: {
        IdProject: true,
        ProjectName: true,
        ProjectDescription: true,
        YearStart: true,
        YearEnd: true,
        IdUserResponsible: true,
        // Contando o número de candidaturas para cada projeto
        _count: { select: { applications: true } }
      },
    });

    // Mapeando os projetos para incluir sua popularidade
    const projetosComPopularidade = projetos.map((projeto) => ({
      ...projeto,
      popularidade: projeto._count.applications,
    }));

    return res.status(200).json({ projetos: projetosComPopularidade });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



//REQUISITO 9
routes.get('/candidatosInteressados', authenticateTokenResponsible, async (req, res) => {
  try {
    const {IdUser} = req.user; // obtém o ID do usuário responsável a partir do token de autenticação

    const candidaturas = await prisma.project.findMany(
     {
      where:{
        IdUserResponsible: IdUser,
        
      },
      select:{
        applications:true,
      }
     }
    )

    return res.status(200).json( candidaturas );
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


//REQUISITO 10
routes.post('/candidatar', async (req, res) => {
  try {
    const { idProjeto } = req.body; // obtém o ID do projeto a partir do corpo da requisição
    const { idCandidato } = req.body; // obtém o ID do usuário a partir do corpo da requisição

    // verifica se o projeto existe
    const projetoExistente = await prisma.project.findUnique({
      where: { IdProject: idProjeto },
    });
    if (!projetoExistente) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // verifica se o usuário candidato já se candidatou a esse projeto
    const candidaturaExistente = await prisma.application.findUnique({
      where: {
        IdUser_IdProject: {
          IdUser: idCandidato,
          IdProject: idProjeto,
        }
      },
    });
    if (candidaturaExistente) {
      return res.status(400).json({ error: 'Usuário já se candidatou a esse projeto' });
    }

    // cria a nova candidatura no banco de dados
    const novaCandidatura = await prisma.application.create({
      data: {

        IdProject: idProjeto,
        IdUser: idCandidato,
        Stats: 1,
      },
    });

    return res.status(201).json({ candidatura: novaCandidatura });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


//REQUISITO 11
routes.post('/selecionarCandidato', authenticateTokenResponsible, async (req, res) => {
  try {
    const { idCandidato, idProjeto } = req.body;
    const currentUser = req.user;

    // Buscar o projeto com base no IdProject fornecido
    const projeto = await prisma.project.findUnique({
      where: {
        IdProject: idProjeto,
      },
    });

    // Verificar se currentUser é igual a IdUserResponsible do projeto
    if (projeto && projeto.IdUserResponsible === currentUser.IdUser) {
      // Atualize o status da candidatura para "Aprovado/Selecionado"
      const candidatura = await prisma.application.update({
        where: {
          IdUser_IdProject: {
            IdUser: idCandidato,
            IdProject: idProjeto,
          },
        },
        data: {
          Stats: 2,
        },
      });

      res.json({ message: 'Candidato selecionado com sucesso' });
    } else {
      res.status(401).json({ error: 'Usuário sem permissão para selecionar o candidato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao selecionar o candidato' });
  }
});




//REQUISITO 12
// Defina o endpoint para listar os candidatos selecionados
routes.get('/candidatosSelecionados/:idProjeto', async (req, res) => {
  try {
    const { idProjeto } = req.params;

    // Consulte as candidaturas selecionadas para o projeto específico
    const candidatosSelecionados = await prisma.application.findMany({
      where: {
        IdProject: parseInt(idProjeto),
        Stats: 2,
      },
      include: {
        user: true,
      },
    });

    res.json(candidatosSelecionados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao listar os candidatos selecionados' });
  }
});

// Rota para a documentação do Swagger
routes.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'routeslication/json');
  res.send(swaggerSpec);
});


module.exports = routes;