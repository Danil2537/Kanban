FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

ENV DATABASE_URL="file:./dev.db"

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD npx prisma generate && node dist/main