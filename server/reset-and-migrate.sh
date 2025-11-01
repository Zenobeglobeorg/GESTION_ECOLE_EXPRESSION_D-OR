#!/bin/bash
# Script pour réinitialiser la base de données avec le nouveau schéma

echo "🔄 Réinitialisation de la base de données..."

# Supprimer les migrations existantes
echo "📁 Suppression des migrations existantes..."
rm -rf prisma/migrations

# Générer le client Prisma avec le nouveau schéma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Créer une nouvelle migration initiale
echo "📝 Création d'une nouvelle migration..."
npx prisma migrate dev --name init_with_int_id

# Seed la base de données
echo "🌱 Création du super-admin..."
npm run db:seed

echo "✅ Base de données réinitialisée avec succès!"

