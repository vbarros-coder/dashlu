#!/bin/bash
# Script para configurar variáveis de ambiente na Vercel
# Uso: ./setup-vercel.sh

echo "🚀 Configurando Dashboard NIE na Vercel..."
echo ""

# Verificar se está logado na Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Você precisa estar logado na Vercel CLI"
    echo "Execute: npx vercel login"
    exit 1
fi

# Adicionar variáveis de ambiente
echo "📋 Adicionando variáveis de ambiente..."

npx vercel env add DATABASE_URL production << 'EOF'
postgresql://neondb_owner:npg_3Vr1mIBUphAv@ep-young-hall-ac6iwsli-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
EOF

npx vercel env add SESSION_SECRET production << 'EOF'
nie-dashboard-2024-secure-key-32-chars-long
EOF

npx vercel env add ADMIN_SECRET production << 'EOF'
admin-migrate-secret-2024
EOF

echo ""
echo "✅ Variáveis configuradas!"
echo ""
echo "🔄 Fazendo deploy..."
npx vercel --prod

echo ""
echo "📊 Após o deploy, execute as migrações:"
echo "   curl https://SEU-SITE.vercel.app/api/admin/migrate?secret=admin-migrate-secret-2024"
echo ""
echo "🌱 E popule os dados iniciais:"
echo "   npx prisma db seed"
