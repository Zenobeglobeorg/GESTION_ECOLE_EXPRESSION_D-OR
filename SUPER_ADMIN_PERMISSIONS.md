# Permissions du Super-Administrateur

## Vue d'ensemble

Le **Super-Administrateur** a un accès complet au système avec les permissions suivantes :

### 🔐 Accès Complet

1. **Toutes les fonctionnalités d'Administration** :
   - ✅ Dashboard Admin (`/admin`)
   - ✅ Inscription d'élèves (`/admin/students/new`)
   - ✅ Toutes les fonctionnalités administratives

2. **Fonctionnalités Super-Admin exclusives** :
   - ✅ Dashboard Super-Admin (`/superadmin`)
   - ✅ Gestion des utilisateurs (`/superadmin/users`)
   - ✅ Gestion des comptes administration (`/superadmin/admins`)
   - ✅ Rôles et permissions (`/superadmin/roles`)
   - ✅ Vue globale du système (`/superadmin/overview`)
   - ✅ Inscription d'élèves via super-admin (`/superadmin/students/new`)

3. **Accès en lecture seule aux fonctionnalités Enseignant** :
   - ✅ Dashboard Enseignant (`/teacher`) - Consultation
   - ✅ Vue des classes et emploi du temps
   - ✅ Consultation des notes et présences

### 📋 Implémentation Technique

Le système utilise `ProtectedRoute` qui permet automatiquement au `SUPER_ADMIN` d'accéder à toutes les routes protégées, même si le rôle n'est pas explicitement listé dans `allowedRoles`.

```typescript
// Dans ProtectedRoute.tsx
if (allowedRoles && user) {
  // Le SUPER_ADMIN peut accéder à toutes les routes
  const hasAccess = allowedRoles.includes(user.role) || user.role === 'SUPER_ADMIN';
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
}
```

### 🎯 Navigation

Le Super-Admin peut accéder à :
- Dashboard Super-Admin via la sidebar
- Dashboard Admin via la sidebar (nouvelle entrée)
- Vue Enseignant via la sidebar (nouvelle entrée)
- Toutes les fonctionnalités via les actions rapides du dashboard

### ⚠️ Notes importantes

1. **Erreur de connexion API** : Assurez-vous que le serveur backend est démarré sur le port 3000
   ```bash
   cd server
   npm run dev
   ```

2. **Erreur WebSocket Vite** : Les erreurs WebSocket sont normales en développement et n'affectent pas le fonctionnement de l'application.

3. **Route `/superadmin/overview`** : Si la route ne s'affiche pas, vérifiez que :
   - Le serveur backend est démarré
   - Vous êtes bien connecté en tant que SUPER_ADMIN
   - Le fichier `OverviewPage.tsx` est bien exporté

