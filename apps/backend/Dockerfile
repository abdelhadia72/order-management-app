FROM node:20

WORKDIR /app

COPY . .

RUN pnpm install

RUN pnpm build

CMD ["pnpm", "start"]

