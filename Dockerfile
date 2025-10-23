FROM alpine:3 AS base

RUN apk add --no-cache libstdc++ libgcc

FROM base AS bun-install

RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash

FROM base AS deps-install

COPY --from=bun-install /root/.bun /root/.bun
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY package.json bun.lock .
RUN bun install --frozen-lockfile

FROM base

COPY --from=bun-install /root/.bun /root/.bun
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY --from=deps-install /app/node_modules node_modules

COPY package.json tsconfig.json bun.lock .env .
COPY src ./src
COPY assets ./assets

CMD ["bun", "run", "./src/core/index.ts"]