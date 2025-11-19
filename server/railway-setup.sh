#!/bin/bash

# Script pour configurer et déployer sur Railway
# Usage: ./railway-setup.sh

echo "🚀 Configuration Railway pour Expression d'Or"
echo "=============================================="

# Vérifier si Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "📦 Installation de Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Connexion à Railway..."
railway login

echo "🔗 Liaison du projet..."
railway link

echo "📊 Génération du client Prisma..."
npm run db:generate

echo "🗄️  Exécution des migrations..."
railway run npx prisma migrate deploy

echo "✅ Configuration terminée !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Configurez les variables d'environnement dans Railway"
echo "2. Déployez votre application"
echo "3. Testez l'endpoint /health"

