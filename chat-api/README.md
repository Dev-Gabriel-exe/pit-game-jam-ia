# API de chat PIT Game Jam IA

API independente no Vercel com Postgres Neon.

Váriáveis privadas na Vercel: `DATABASE_URL` e `PIT_TEACHER_PIN`.

Rotas: `GET /api/chat?action=health|threads|messages`, `POST /api/chat?action=join|teacher-login|send|read`.

Aluno: código de sala e token de 32 bytes, guardado no navegador. Professor: PIN armazenado apenas na sessão do navegador. API verifica tokens e PIN antes de leitura/escrita.

**Não publicar credenciais ou URLs de conexão neste repositório.** O GitHub Pages continua sendo o frontend estático.
