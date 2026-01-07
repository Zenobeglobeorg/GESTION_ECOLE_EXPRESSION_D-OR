# 🔐 Guide d'Utilisation du Système de Permissions

## 📋 Vue d'ensemble

Le système de permissions permet de contrôler l'accès des administrateurs aux différentes fonctionnalités de l'application. Chaque administrateur peut avoir des permissions spécifiques qui déterminent ce qu'il peut voir et modifier.

## 🎯 Fonctionnalités

1. **Permissions directes** : Les permissions peuvent être assignées directement aux utilisateurs
2. **Permissions via rôles** : Les permissions peuvent être assignées via des rôles personnalisés (customRole)
3. **Super-Admin** : A toujours toutes les permissions
4. **Protection des routes** : Les pages sont protégées selon les permissions
5. **Protection du contenu** : Les éléments UI peuvent être masqués selon les permissions

## 🔧 Utilisation

### 1. Protéger une route complète

```tsx
import { ProtectedRoute } from '../../components/permissions/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute permission="users.read">
            <UsersPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### 2. Protéger du contenu dans une page

```tsx
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import { usePermissions } from '../../hooks/usePermissions';

function UsersPage() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Utilisateurs</h1>
      
      {/* Afficher le bouton seulement si l'utilisateur peut créer */}
      <ProtectedContent permission="users.create">
        <Button onClick={handleCreate}>Créer un utilisateur</Button>
      </ProtectedContent>

      {/* Ou utiliser le hook directement */}
      {hasPermission('users.update') && (
        <Button onClick={handleEdit}>Modifier</Button>
      )}
    </div>
  );
}
```

### 3. Vérifier les permissions dans le code

```tsx
import { usePermissions } from '../../hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Vérifier une permission
  if (hasPermission('users.create')) {
    // Faire quelque chose
  }

  // Vérifier au moins une permission
  if (hasAnyPermission(['users.create', 'users.update'])) {
    // Faire quelque chose
  }

  // Vérifier toutes les permissions
  if (hasAllPermissions(['users.read', 'users.create'])) {
    // Faire quelque chose
  }
}
```

## 📝 Mapping des Permissions

Les permissions sont mappées aux pages dans `client/src/utils/permissionMapping.ts` :

- `users.read` : Lire la liste des utilisateurs
- `users.create` : Créer des utilisateurs
- `users.update` : Modifier les utilisateurs
- `users.delete` : Supprimer des utilisateurs
- `students.read` : Consulter les dossiers élèves
- `students.create` : Créer des dossiers élèves
- `students.update` : Modifier les dossiers élèves
- `students.delete` : Archiver des dossiers élèves
- `classes.manage` : Gérer les classes
- `classes.create` : Créer des classes
- `grades.validate` : Valider les notes
- `grades.modify` : Modifier les notes
- `reports.generate` : Générer les bulletins
- `attendance.manage` : Gérer les présences
- `fees.manage` : Gérer les frais
- `schedule.manage` : Gérer les emplois du temps
- `announcements.create` : Créer des annonces
- `system.settings` : Accéder aux paramètres système

## 🛠️ Backend

### Routes disponibles

- `GET /api/users/:id/permissions` : Récupère les permissions d'un utilisateur
- `PUT /api/users/:id/permissions` : Met à jour les permissions d'un utilisateur

### Middleware

Le middleware `requirePermission` vérifie automatiquement les permissions :

```javascript
router.get('/users', requirePermission('users.read'), userController.listUsers);
router.post('/users', requirePermission('users.create'), userController.createUser);
```

## 📊 Gestion des Permissions

La page `/admin/users/permissions` permet de :
1. Sélectionner un utilisateur
2. Voir ses permissions actuelles
3. Modifier ses permissions en cochant/décochant les cases
4. Enregistrer les modifications

## ⚠️ Notes importantes

1. **Super-Admin** : A toujours toutes les permissions et ne peut pas avoir ses permissions modifiées
2. **Permissions combinées** : Un utilisateur peut avoir des permissions via son customRole ET des permissions directes
3. **Par défaut** : Les nouveaux administrateurs n'ont aucune permission (sauf Super-Admin)
4. **Migration** : Après avoir ajouté la table `UserToPermission`, exécutez `npx prisma migrate dev`



