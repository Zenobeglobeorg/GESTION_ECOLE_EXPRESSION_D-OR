import jwt from 'jsonwebtoken';

/**
 * Middleware pour vérifier l'authentification JWT
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware pour vérifier que l'utilisateur a un rôle spécifique
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé. Rôle insuffisant.' });
    }

    next();
  };
};

// Vérifie qu'un utilisateur possède une permission spécifique
export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Super-Admin a toutes les permissions
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Les admins peuvent être contrôlés via rôles personnalisés
      const { getPrisma } = await import('../utils/prisma.js');
      const prisma = getPrisma();

      // Vérifier si l'utilisateur a la permission via customRole ou permissions directes
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          role: true,
          customRole: {
            select: {
              permissions: {
                where: { key: permissionKey },
                select: { id: true },
              },
            },
          },
          userToPermissions: {
            where: {
              permission: {
                key: permissionKey,
              },
            },
            select: { id: true },
          },
        },
      });

      // Vérifier si l'utilisateur a la permission via customRole ou permissions directes
      const hasPermissionViaRole = Boolean(user?.customRole?.permissions?.length);
      const hasPermissionDirect = Boolean(user?.userToPermissions?.length);
      const hasPermission = hasPermissionViaRole || hasPermissionDirect;

      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission refusée' });
      }

      next();
    } catch (err) {
      console.error('requirePermission error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};


