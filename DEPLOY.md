# Dashboard NIE - Deploy na Vercel

## ✅ Configuração Automática

### 1. Deploy na Vercel (Clique no botão)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vbarros-coder/dashlu)

### 2. Configurar Variáveis de Ambiente

Na tela de configuração da Vercel, adicione estas variáveis:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_3Vr1mIBUphAv@ep-young-hall-ac6iwsli-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `SESSION_SECRET` | `nie-dashboard-2024-secure-key-32-chars-long` |
| `ADMIN_SECRET` | `admin-migrate-secret-2024` |

### 3. Rodar Migrações

Após o deploy, acesse no navegador:
```
https://SEU-SITE.vercel.app/api/admin/migrate?secret=admin-migrate-secret-2024
```

Você verá: `{"success":true,"message":"Migrações executadas com sucesso"}`

### 4. Popular Dados Iniciais

Na Vercel:
1. Vá em **Deployments**
2. Clique nos **três pontos** do deploy mais recente
3. Clique em **"Open Build Logs"**
4. Clique em **"Shell"**
5. Execute:
```bash
npx prisma db seed
```

---

## 🔐 Credenciais de Acesso

Após o setup, use estas credenciais para login:

| Email | Senha |
|-------|-------|
| `wfernandez@addvaloraglobal.com` | `NIE@2026` |
| `lhey@addvaloraglobal.com` | `NIE@2026` |

---

## 📁 Estrutura do Banco

- **User**: Usuários autorizados
- **Session**: Sessões de login
- **TimeSheet**: Time sheets importados
- **TimeSheetItem**: Itens individuais
- **TimeSheetResumo**: Resumos por operação
- **Log**: Logs de auditoria (LGPD)

---

## 🆘 Troubleshooting

### Erro "Database connection failed"
Verifique se a `DATABASE_URL` está correta nas variáveis de ambiente.

### Erro "Migrações pendentes"
Execute o endpoint de migração novamente.

### Erro "DOMMatrix is not defined"
O build está usando a versão correta. Limpe o cache e redeploy.

---

## 📞 Suporte

Em caso de problemas, verifique os logs na Vercel:
**Deployments** → **Functions** → `/api/timesheet/parse`
