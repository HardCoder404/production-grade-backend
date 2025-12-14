# --------------------
# Build stage
# --------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all deps (including dev for tsc)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript -> dist/
RUN npm run build


# --------------------
# Production stage
# --------------------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only package files
COPY package*.json ./

# Install ONLY production deps
RUN npm install --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
