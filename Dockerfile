# Etapa 1: Build da aplicação
# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# # Etapa 2: Imagem para produção
# FROM node:20-alpine

# WORKDIR /app

# # Apenas as dependências de produção
# COPY package.json package-lock.json ./
# RUN npm ci --omit=dev

# # Copia o build da etapa anterior
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

# EXPOSE 3000

# ENV NODE_ENV=production

# CMD ["npm", "start"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
