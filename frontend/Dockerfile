# Stage 1: build
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend files
COPY . .

# Build the app (Vite build outputs to /dist by default)
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine

WORKDIR /app

# Install a simple static server
RUN npm i -g serve

# Copy the built files from the build stage
COPY --from=build /app/dist ./dist

# Expose port for container
ENV PORT=3000
EXPOSE 3000

# Start serving the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
