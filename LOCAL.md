# Rodar o TR Beauty Studio Suite localmente

## 1. Requisitos

- Node.js 20+ (ou Bun)
- Conta no projeto Supabase já configurado (as chaves estão no `.env`)

## 2. Instalar e subir

```bash
cd tr-beauty-studio-suite-main
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173` ou similar).

## 3. Criar a primeira conta (Admin)

1. No app, vá em **Entrar → Criar conta**.
2. Preencha nome, e-mail, WhatsApp e senha (mín. 8 caracteres).
3. **A primeira conta criada no banco vira automaticamente ADMIN.**
4. As próximas contas viram **CLIENTE**.

### Se a conta não for criada / não conseguir entrar

O motivo mais comum é a **confirmação de e-mail** estar ligada no Supabase.

#### Opção A – Desligar confirmação de e-mail (recomendado em desenvolvimento)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard).
2. Abra o projeto `ecatovwrhdcejykyjuvl`.
3. Vá em **Authentication → Providers → Email**.
4. Desative **“Confirm email”**.
5. Salve.
6. Crie a conta de novo no app.

#### Opção B – Confirmar o e-mail

1. Crie a conta no app.
2. Abra o e-mail que o Supabase enviou (e a pasta de spam).
3. Clique no link de confirmação.
4. Volte no app e faça login.

#### Opção C – Promover manualmente a admin (se a conta já existir como client)

No SQL Editor do Supabase:

```sql
-- Troque o e-mail pelo da conta que deve ser admin
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'
);
```

## 4. Como funciona a regra de Admin / Cliente

No banco existe um trigger `handle_new_user`:

- Se **ainda não existe nenhum admin** → a nova conta recebe `role = admin`.
- Se **já existe admin** → a nova conta recebe `role = client`.

Depois do login:

- Admin é redirecionada para `/admin`
- Cliente é redirecionada para `/meus-horarios`

## 5. Variáveis de ambiente

O arquivo `.env` já vem com as chaves do projeto Lovable/Supabase:

```
VITE_SUPABASE_URL=https://ecatovwrhdcejykyjuvl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Para produção própria, troque por um projeto Supabase seu e rode as migrations da pasta `supabase/migrations/`.

## 6. Problemas comuns

| Problema | Solução |
|----------|---------|
| “Não foi possível criar a conta” genérico | Abra o console do navegador (F12) e veja o erro real do Supabase |
| Conta criada mas não entra | Confirmação de e-mail ligada → desligue (Opção A) ou confirme o e-mail |
| Entra mas não vê o painel admin | A conta não é a primeira ou o role não foi gravado → use o SQL da Opção C |
| Erro de env / Missing Supabase | Confirme que o `.env` está na raiz do projeto e reinicie o `npm run dev` |
| Google login não funciona | OAuth do Google depende da configuração do Lovable; use e-mail/senha localmente |

## 7. Scripts úteis

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualizar o build
```
