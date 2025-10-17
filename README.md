# Spotify Challenge

Objetivo: criar uma aplicação integrada à **API do Spotify**, permitindo autenticação do usuário e visualização dos seus artistas e álbuns favoritos.

---

## Tecnologias Utilizadas

### Front-end
- [Next.js 15](https://nextjs.org/) — Framework React moderno
- [React Query (TanStack)](https://tanstack.com/query) — Gerenciamento de cache e requisições
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática e segurança de código
- [CSS Modules](https://nextjs.org/docs/basic-features/built-in-css-support) — Estilização isolada por componente
- [Vitest](https://vitest.dev/) e [Testing Library](https://testing-library.com/) — Testes unitários
- [ESLint](https://eslint.org/) — Padronização e lint de código

### Back-end
- [Node.js 20](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [JWT](https://jwt.io/) — Autenticação segura via token
- [CORS & Cookie Parser](https://www.npmjs.com/package/cors)

### Infra
- [Render.com](https://render.com/) — Deploy contínuo (API + Web)
- [Docker Compose](https://docs.docker.com/compose/) — Ambiente de desenvolvimento local
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) — Integração OAuth

---

## Arquitetura

Monorepo com **PNPM Workspaces**, dividido em duas aplicações independentes, mas interligadas:

```
spotify-challenge/
├── apps/
│   ├── api/         # Back-end (Express + TS)
│   └── web/         # Front-end (Next.js + React Query)
└── pnpm-workspace.yaml
```

### Organização da API
- `/services` → Regras de negócio separadas (`AuthService`, `SpotifyService`)
- `/routes` → Definição das rotas REST (`/auth`, `/api`)

### Organização do Front-end
- `/app` → Estrutura de rotas Next.js (SSR)
- `/components` → Componentes reutilizáveis (`Sidebar`, `Modal`)
- `/hooks` → Hooks customizados (`useAuth`, `useRequireAuth`, `useOnlineStatus`)
- `/providers` → Providers globais (`ReactQueryProvider`)
- `/styles` → CSS Modules

---

## Padrões Arquiteturais

- **Single Responsibility Principle** — cada camada possui uma responsabilidade única
- **Hooks reutilizáveis** — abstraem lógicas de autenticação, modal e status de rede
- **Service Layer Pattern** — separação entre lógica de negócio e rotas Express

---

## Testes

- **Backend:** `vitest run` + `supertest`
- **Frontend:** `@testing-library/react` + `vitest`
- **Abrangência:** `Modal`, `Sidebar`, `useAuth`, `useRequireAuth`, `useModal`, `AuthService`, `SpotifyService`

```bash
pnpm test
```

---

## Executando o Projeto Localmente

### Pré-requisitos

- Node 20
- PNPM (`corepack enable && corepack prepare pnpm@latest --activate`)
- Conta Spotify Developer com app configurado

### Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/MarceloAugustoMonteiro/spotify-challenge.git
cd spotify-challenge

# 2. Instale as dependências
pnpm install

# 3. Configure o ambiente
cp .env.example .env
# Preencha com suas chaves do Spotify:
# SPOTIFY_CLIENT_ID
# SPOTIFY_CLIENT_SECRET
# SPOTIFY_REDIRECT_URI
```

### Iniciando a Aplicação

**Opção 1: Com Docker (recomendado)**
```bash
docker-compose up --build
```

**Opção 2: Manualmente**
```bash
pnpm --filter api dev
pnpm --filter web dev
```

### Acessar a Aplicação

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## Deploy

Hospedado gratuitamente no Render.com

| Serviço | URL |
|---------|-----|
| Frontend (Next.js) | https://spotify-challenge-web.onrender.com |
| Backend (API Express) | https://spotify-challenge-api.onrender.com |

---

## Requisitos

- [✓] Segmentação de commits
- [✓] Lint
- [✓] Autenticação via Spotify
- [✓] Listar artistas
- [✓] Listar álbuns
- [✓] Paginação (scroll infinito)
- [✓] Testes unitários
- [✓] Deploy completo
- [ ] Funcionamento offline 

### Bônus

- [✓] Responsividade
- [ ] Testes E2E
- [ ] CI/CD
- [ ] SonarQube
- [ ] PWA
- [ ] Sentry

---

## Decisões Técnicas

**Next.js 15 + React Query:** Combinação ideal para SSR + cache inteligente.

**Service Layer na API:** Isolou lógica de autenticação e consumo do Spotify, facilitando manutenção e testes.

**React Hooks customizados:** Melhor legibilidade e reuso de lógica entre componentes.

**TypeScript end-to-end:** Segurança de tipos entre API e Web, reduzindo bugs em tempo de compilação.

**Vitest + Testing Library:** Rápido, moderno e sem dependências extras desnecessárias.

**Render.com + Docker:** Fácil CI/CD e builds consistentes entre ambientes.
