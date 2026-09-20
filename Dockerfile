FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

# Produção (Imagem Leve e Segura)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia manifestos e instala APENAS dependências de produção
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev && npx prisma generate

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /app/dist ./dist

# Roda com usuário não-root (boa prática de segurança)
USER node

EXPOSE 3000

CMD ["node", "dist/src/index.js"]