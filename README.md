# Portal Agregador de Sistemas

Catálogo interno de sistemas com visual vitrine (glassmorphism), tema claro/escuro, favoritos por usuário e área administrativa protegida.

## Arquitetura escolhida

- `React + TypeScript + Vite`
- `Supabase` para Auth, Postgres e RLS
- `React Router` para rotas públicas e admin
- CSS global modular por classes utilitárias/componentes

## Estrutura principal

- `src/pages/CatalogPage.tsx`: vitrine de sistemas
- `src/pages/AdminLoginPage.tsx`: login do administrador
- `src/pages/AdminDashboardPage.tsx`: CRUD de links e avisos
- `src/components/LinkCard.tsx`: card do sistema
- `src/components/AnnouncementModal.tsx`: popup de anúncio
- `src/hooks/useAuth.ts`: sessão e checagem de role admin
- `src/lib/supabase.ts`: cliente Supabase
- `supabase/migrations/*`: migrations versionadas

## Modelagem de tabelas

Implementadas via migrations em `supabase/migrations`:

- `user_roles`
- `catalog_links`
- `user_favorites`
- `announcements`
- `user_popup_views`
- `system_settings`

Com função `is_admin()` e políticas RLS para separar permissões de usuário comum e administrador.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Como rodar localmente

```bash
npm install
npm run dev
```

## Configuração do Supabase

1. Crie projeto no Supabase.
2. Com o repositório já linkado no Supabase CLI, aplique as migrations:

```bash
supabase db push
```

As migrations já configuram:
- schema base
- policies RLS corrigidas
- trigger que cria todo novo usuário como `admin`
- sincronização retroativa dos usuários já existentes em `auth.users`

## Deploy na Vercel

1. Suba o projeto em um repositório Git.
2. Importe no painel da Vercel.
3. Configure as variáveis:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
4. Deploy padrão (`npm run build`).

## Acesso admin

- Botão discreto no topo direito da home.
- URL direta: `/admin/login`
- Após login com usuário que tenha role `admin`, acesso em `/admin`.

## Teste manual recomendado

1. Admin cria 2-3 sistemas no painel.
2. Verificar cards e navegação de links na home.
3. Fazer login de usuário comum e favoritar/desfavoritar.
4. Confirmar favoritos no topo da listagem.
5. Alternar tema claro/escuro e recarregar página (persistência).
6. Criar aviso no admin e validar popup na home.
7. Validar restrição: usuário comum não acessa `/admin`.
