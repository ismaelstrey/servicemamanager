# syntax=docker/dockerfile:1

# Etapa de build (prepara node_modules e Prisma Client)
FROM node:20-slim AS build
WORKDIR /app

# Dependências necessárias para build
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl curl \
  && rm -rf /var/lib/apt/lists/*

# Garantir instalação de devDependencies na etapa de build
ENV NODE_ENV=development

# Instala dependências usando npm
COPY package.json package-lock.json ./
RUN npm install

# Garante presença explícita do dotenv (c12 requer)
RUN npm install dotenv@16.4.5

# Copia Prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

# Copia artefatos já compilados do host
COPY dist ./dist

# Etapa de runtime
FROM node:20-slim AS runtime
WORKDIR /app

# Dependências necessárias para Prisma e healthcheck
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4002

# Instala dependências de produção na etapa de runtime
COPY package.json ./
RUN npm install --omit=dev
# Corrige c12 exigindo dotenv na geração do Prisma
RUN npm install dotenv@16.4.5

# Copia artefatos do build
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Gera Prisma Client com envs disponíveis no runtime
RUN npx prisma generate

EXPOSE 4002

# Aplica migrações e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]