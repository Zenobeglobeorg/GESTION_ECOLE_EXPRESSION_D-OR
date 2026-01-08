# Guide : Template EmailJS pour les Rappels de Paiement

## 📋 Variables Disponibles

Le service `emailjsService.sendPaymentReminderEmail()` envoie les variables suivantes au template EmailJS :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{toName}}` | Prénom du parent | "Marie" |
| `{{studentName}}` | Nom complet de l'élève | "Ibrahima Diallo" |
| `{{amount}}` | Montant de l'échéance (formaté) | "25 000" |
| `{{dueDate}}` | Date limite formatée | "05 octobre 2024" |
| `{{totalRemaining}}` | Montant total restant (formaté) | "75 000" |
| `{{daysUntilFinal}}` | Jours jusqu'à la date limite (5 mars) | "45" (vide si > 7 jours) |

## 🎨 Template HTML Recommandé

### Template pour Rappel Normal (plus de 7 jours)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #fbbf24 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      background: #f9fafb;
    }
    .info-box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .info-box strong {
      color: #2563eb;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: white;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Rappel de Paiement</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>{{toName}}</strong>,</p>
      
      <p>Nous vous rappelons qu'une échéance de paiement est en attente pour <strong>{{studentName}}</strong>.</p>
      
      <div class="info-box">
        <p><strong>📅 Date limite :</strong> {{dueDate}}</p>
        <p><strong>💰 Montant de cette échéance :</strong></p>
        <div class="amount">{{amount}} FCFA</div>
        <p><strong>📊 Montant total restant :</strong> {{totalRemaining}} FCFA</p>
      </div>
      
      <p>Merci de régulariser votre situation au plus vite.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Expression d'Or</strong></p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      <p>Expression d'Or - Système de gestion scolaire</p>
    </div>
  </div>
</body>
</html>
```

### Template pour Rappel Urgent (≤ 7 jours avant la date limite)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      background: #f9fafb;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning strong {
      color: #d97706;
    }
    .info-box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .info-box strong {
      color: #dc2626;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #dc2626;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: white;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ URGENT - Paiement en Retard</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>{{toName}}</strong>,</p>
      
      <div class="warning">
        <p><strong>⚠️ URGENT :</strong> Il ne reste que {{daysUntilFinal}} jour{{#if daysUntilFinal > 1}}s{{/if}} avant la date limite du 5 mars.</p>
      </div>
      
      <p>Une échéance de paiement est en attente pour <strong>{{studentName}}</strong>.</p>
      
      <div class="info-box">
        <p><strong>📅 Date limite :</strong> {{dueDate}}</p>
        <p><strong>💰 Montant de cette échéance :</strong></p>
        <div class="amount">{{amount}} FCFA</div>
        <p><strong>📊 Montant total restant :</strong> {{totalRemaining}} FCFA</p>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ ATTENTION :</strong> Si le paiement n'est pas effectué avant le 5 mars, votre compte sera bloqué.</p>
      </div>
      
      <p>Merci de régulariser votre situation au plus vite.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Expression d'Or</strong></p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      <p>Expression d'Or - Système de gestion scolaire</p>
    </div>
  </div>
</body>
</html>
```

## 📝 Instructions pour Créer le Template dans EmailJS

### Étape 1 : Accéder à EmailJS Dashboard

1. Connectez-vous à [https://dashboard.emailjs.com](https://dashboard.emailjs.com)
2. Allez dans **Email Templates** → **Add New Template**

### Étape 2 : Configurer le Template

1. **Nom du template** : `Rappel de Paiement` ou `Payment Reminder`
2. **Service** : Sélectionnez votre service EmailJS (ou créez-en un nouveau)
3. **From Name** : `Expression d'Or`
4. **From Email** : Utilisez l'email configuré dans votre service EmailJS
5. **Subject** : `Rappel de paiement - {{studentName}}`

### Étape 3 : Ajouter le Contenu HTML

1. Cliquez sur l'onglet **Content**
2. Sélectionnez **Rich (HTML)**
3. Collez le template HTML ci-dessus (version normale ou urgente)
4. Remplacez les variables `{{variableName}}` par les variables EmailJS

**Note importante** : EmailJS utilise la syntaxe `{{variable_name}}` avec des underscores. Assurez-vous que les noms de variables correspondent exactement.

### Étape 4 : Tester le Template

1. Cliquez sur **Test** dans l'éditeur
2. Remplissez les variables de test :
   ```
   toName: Marie
   studentName: Ibrahima Diallo
   amount: 25 000
   dueDate: 05 octobre 2024
   totalRemaining: 75 000
   daysUntilFinal: 45
   ```
3. Cliquez sur **Send Test Email**
4. Vérifiez que l'email arrive correctement formaté

### Étape 5 : Sauvegarder le Template ID

1. Une fois le template créé, copiez le **Template ID** (ex: `template_xxxxxxx`)
2. Ajoutez-le dans vos variables d'environnement Railway :
   ```
   EMAILJS_TEMPLATE_ID_PAYMENT=template_xxxxxxx
   ```

## 🔧 Configuration des Variables d'Environnement

Ajoutez ces variables dans Railway (ou votre fichier `.env`) :

```env
# Compte EmailJS pour les paiements (peut être le même que le compte principal)
EMAILJS_SERVICE_ID_PAYMENT=service_xxxxxxx
EMAILJS_TEMPLATE_ID_PAYMENT=template_xxxxxxx
EMAILJS_PRIVATE_KEY_PAYMENT=xxxxxxx
EMAILJS_PUBLIC_KEY_PAYMENT=xxxxxxx
```

**Note** : Si vous n'ajoutez pas ces variables, le système utilisera le compte EmailJS principal.

## 📧 Version Texte Simple (Alternative)

Si vous préférez un template texte simple, voici un exemple :

```
Rappel de paiement - {{studentName}}

Bonjour {{toName}},

Nous vous rappelons qu'une échéance de paiement est en attente pour {{studentName}}.

📅 Date limite : {{dueDate}}
💰 Montant de cette échéance : {{amount}} FCFA
📊 Montant total restant : {{totalRemaining}} FCFA

Merci de régulariser votre situation au plus vite.

Cordialement,
L'équipe Expression d'Or

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
Expression d'Or - Système de gestion scolaire
```

## ✅ Checklist de Vérification

- [ ] Template créé dans EmailJS Dashboard
- [ ] Toutes les variables `{{variableName}}` sont correctement nommées
- [ ] Template testé avec des données de test
- [ ] Template ID copié et ajouté dans `EMAILJS_TEMPLATE_ID_PAYMENT`
- [ ] Service ID ajouté dans `EMAILJS_SERVICE_ID_PAYMENT`
- [ ] Private Key ajoutée dans `EMAILJS_PRIVATE_KEY_PAYMENT`
- [ ] Public Key ajoutée dans `EMAILJS_PUBLIC_KEY_PAYMENT` (optionnel mais recommandé)
- [ ] Variables d'environnement déployées sur Railway
- [ ] Test d'envoi effectué depuis l'interface admin

## 🎯 Astuce : Template Unique avec Condition

Si vous voulez un seul template qui s'adapte selon l'urgence, vous pouvez utiliser une condition dans le template (si EmailJS le supporte) :

```html
{{#if daysUntilFinal}}
  {{#if daysUntilFinal <= 7}}
    <!-- Contenu urgent -->
  {{else}}
    <!-- Contenu normal -->
  {{/if}}
{{else}}
  <!-- Contenu normal -->
{{/if}}
```

**Note** : Les conditions peuvent ne pas être supportées par tous les services EmailJS. Dans ce cas, créez deux templates séparés et le système choisira automatiquement le bon selon le contexte.

## 🔍 Dépannage

### L'email n'est pas envoyé
- Vérifiez que `EMAILJS_PRIVATE_KEY_PAYMENT` est correcte
- Vérifiez que les appels API non-browser sont activés dans EmailJS → Account → Security
- Vérifiez les logs du serveur pour voir les erreurs

### Les variables ne s'affichent pas
- Vérifiez que les noms de variables dans le template correspondent exactement à ceux envoyés
- Utilisez `{{variable_name}}` avec des underscores, pas de tirets
- Testez le template avec des données de test dans EmailJS Dashboard

### Le formatage est incorrect
- Vérifiez que vous utilisez l'éditeur HTML dans EmailJS
- Testez le template avec des données réelles
- Vérifiez que les styles CSS sont bien inclus dans le `<style>` tag


