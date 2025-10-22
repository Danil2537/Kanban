# Stage 1: build
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy only package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all backend files
COPY . .

# Build NestJS project
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Copy package.json & package-lock.json
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --production

# Start the app
CMD ["node", "dist/main.js"]