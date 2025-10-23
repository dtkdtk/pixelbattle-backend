FROM alpine:3 AS base

RUN apk add --no-cache libstdc++ libgcc

FROM base AS bun

RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash

FROM base AS install

COPY --from=bun /root/.bun /root/.bun
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build

COPY --from=bun /root/.bun /root/.bun
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY . .

COPY --from=install /app/node_modules node_modules

RUN bun run build

FROM base

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY --from=install /app/node_modules node_modules

COPY --from=build /app/dist dist

CMD ["bun", "run", "./dist/index.js"]