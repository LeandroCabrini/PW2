const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Falha na autenticação do token' });
    }
    try {
      const currentUser = await prisma.user.findUnique({
        where: { IdUser: user.id},
      });
      
      if (!currentUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (currentUser.type != 1) {
        return res.status(401).json({ error: 'Usuário sem permissão' });
      }

      req.user = currentUser;

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro Token-intderno o servidor' });
    }
  });
}

module.exports = authenticateToken;
