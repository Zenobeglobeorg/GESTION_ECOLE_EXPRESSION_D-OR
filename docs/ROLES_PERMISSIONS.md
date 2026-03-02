# 🔐 Système de Rôles et Permissions

## 📋 Vue d'ensemble

Le système de rôles et permissions permet au Super-Administrateur de créer et gérer des **rôles personnalisés** pour les membres de l'Administration, avec des **permissions granulaires**.

## 🎯 Structure des Rôles

### Rôles Système (Prédéfinis)
Ces rôles sont fixes et ne peuvent pas être modifiés :

1. **SUPER_ADMIN** (Super-Administrateur)
   - Accès complet au système
   - Peut créer et gérer les comptes Administration
   - Peut définir les rôles et permissions

2. **ADMINISTRATION** (Base)
   - Rôle de base pour les membres de l'administration
   - Directeur
   - Secrétaire  
   - Comptable
   - etc.

3. **TEACHER** (Enseignant)
   - Peut saisir les notes
   - Peut suivre les présences
   - Peut consulter ses classes

4. **PARENT** (Parent)
   - Peut consulter les résultats de ses enfants
   - Peut voir les présences
   - Peut demander des rendez-vous

### Rôles Personnalisés pour l'Administration

Le Super-Admin peut créer des **sous-rôles** pour l'Administration avec des permissions spécifiques :

**Exemples de rôles :**
- **Directeur** : Toutes les permissions administration
- **Secrétaire** : Gestion des élèves, création des classes, mais pas validation des notes
- **Comptable** : Gestion des frais de scolarité uniquement
- **Coordonnateur Pédagogique** : Validation des notes, gestion des évaluations

## 🔑 Système de Permissions

### Permissions Disponibles

#### Gestion des Utilisateurs
- `users.create` : Créer des utilisateurs (Enseignants, Parents)
- `users.read` : Lire la liste des utilisateurs
- `users.update` : Modifier les utilisateurs
- `users.delete` : Supprimer/suspendre des utilisateurs

#### Gestion des Élèves
- `students.create` : Créer des dossiers élèves
- `students.read` : Consulter les dossiers élèves
- `students.update` : Modifier les dossiers élèves
- `students.delete` : Archiver des dossiers élèves

#### Gestion Académique
- `classes.create` : Créer des classes
- `classes.manage` : Gérer les classes et matières
- `grades.create` : Saisir des notes (pour enseignants)
- `grades.validate` : Valider les notes saisies
- `grades.modify` : Modifier les notes après validation
- `reports.generate` : Générer les bulletins

#### Gestion Administrative
- `attendance.manage` : Gérer les présences
- `fees.manage` : Gérer les frais de scolarité
- `schedule.manage` : Gérer les emplois du temps
- `announcements.create` : Créer des annonces

#### Paramètres Système
- `system.settings` : Accéder aux paramètres système
- `system.roles` : Gérer les rôles et permissions (Super-Admin uniquement)

## 📊 Comment ça fonctionne ?

### 1. Création d'un Rôle Personnalisé

```
Super-Admin crée un rôle "Secrétaire" avec :
✅ students.create
✅ students.read
✅ students.update
✅ classes.create
✅ classes.manage
✅ attendance.manage
❌ grades.validate (pas cette permission)
❌ fees.manage (pas cette permission)
```

### 2. Attribution du Rôle

```
Super-Admin crée un compte Administration :
- Email: secretaire@ecole.com
- Rôle système: ADMINISTRATION
- Rôle personnalisé: Secrétaire (avec les permissions ci-dessus)
```

### 3. Vérification des Permissions

Quand la Secrétaire se connecte :
- ✅ Peut créer des élèves
- ✅ Peut créer des classes
- ❌ Ne peut PAS valider des notes (pas la permission `grades.validate`)

## 🗄️ Structure de Base de Données

```prisma
model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique // "Directeur", "Secrétaire", etc.
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  permissions Permission[]
  users       User[]
}

model Permission {
  id          Int      @id @default(autoincrement())
  key         String   @unique // "users.create", "grades.validate", etc.
  name        String   // "Créer des utilisateurs"
  description String?
  category    String   // "users", "students", "grades", etc.
  
  roles       Role[]
}

model User {
  // ... champs existants
  role        UserRole // ADMINISTRATION, TEACHER, PARENT
  customRoleId Int?    // ID du rôle personnalisé (si ADMINISTRATION)
  customRole  Role?    @relation(fields: [customRoleId], references: [id])
}

model _RoleToPermission {
  roleId       Int
  permissionId Int
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  
  @@unique([roleId, permissionId])
}
```

## 💡 Workflow Recommandé

### Scénario : Créer un compte Directeur

1. **Super-Admin crée un rôle "Directeur"**
   - Sélectionne toutes les permissions administration
   - Enregistre le rôle

2. **Super-Admin crée le compte utilisateur**
   - Email: directeur@ecole.com
   - Type: ADMINISTRATION
   - Rôle personnalisé: Directeur
   - Le système attribue automatiquement toutes les permissions du rôle

3. **Le Directeur se connecte**
   - Le backend vérifie ses permissions
   - L'interface affiche uniquement les fonctionnalités autorisées

## 🔒 Middleware de Vérification

```javascript
// Exemple dans le backend
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    
    // Super-Admin a tout
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    // Vérifier si l'utilisateur a la permission
    const hasPermission = await checkUserPermission(user.id, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission refusée' });
    }
    
    next();
  };
};

// Utilisation
router.post('/students', 
  authenticateToken, 
  requirePermission('students.create'),
  createStudent
);
```

## 📝 Prochaines Étapes d'Implémentation

1. ✅ Créer les modèles Prisma (Role, Permission)
2. ✅ Créer l'interface de gestion des rôles
3. ✅ Implémenter les routes backend pour CRUD des rôles
4. ✅ Créer le middleware de vérification des permissions
5. ✅ Mettre à jour les routes pour vérifier les permissions
6. ✅ Adapter l'interface frontend selon les permissions

