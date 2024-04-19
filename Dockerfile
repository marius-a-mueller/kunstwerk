# syntax=docker/dockerfile:1.7.0

# Aufruf:   docker build --tag team1/packstation:2024.04.0-bookworm .
#               ggf. --progress=plain
#               ggf. --no-cache
#           Get-Content Dockerfile | docker run --rm --interactive hadolint/hadolint:2.12.1-beta-debian
#               Linux:   cat Dockerfile | docker run --rm --interactive hadolint/hadolint:2.12.1-beta-debian
#           docker network ls

ARG NODE_VERSION=21.7.1

# ---------------------------------------------------------------------------------------
# S t a g e   d i s t
# ---------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS dist
# FROM node:${NODE_VERSION}-bookworm AS dist

RUN <<EOF
# https://explainshell.com/explain?cmd=set+-eux
set -eux
apt-get update
apt-get upgrade --yes

# Debian Bookworm bietet nur Packages fuer Python 3.11; Ubuntu Jammy LTS nur fuer Python 3.10
# Python 3.12: Uebersetzung des Python-Quellcodes erforderlich
# https://itnixpro.com/how-to-install-python-3-12-on-debian-12debian-11
apt-get install --no-install-recommends --yes python3.11=3.11.2-6 python3.11-dev=3.11.2-6 build-essential=12.9
ln -s /usr/bin/python3.11 /usr/bin/python3
ln -s /usr/bin/python3.11 /usr/bin/python

npm i -g --no-audit --no-fund npm
EOF

USER node

WORKDIR /home/node

# COPY statt --mount=type=bound wegen Rechte-Problemen
COPY --chown=node:node src ./src
COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json
COPY --chown=node:node nest-cli.json nest-cli.json
COPY --chown=node:node tsconfig.json tsconfig.json
COPY --chown=node:node tsconfig.build.json tsconfig.build.json
RUN echo $(ls -la)
RUN --mount=type=cache,target=/root/.npm

RUN <<EOF
set -eux
# ci (= clean install) mit package-lock.json
npm ci --no-audit --no-fund
npm run build
EOF

# ------------------------------------------------------------------------------
# S t a g e   d e p e n d e n c i e s
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS dependencies

RUN <<EOF
set -eux
apt-get update
apt-get upgrade --yes
apt-get install --no-install-recommends --yes python3.11-minimal=3.11.2-6 python3.11-dev=3.11.2-6 build-essential=12.9
ln -s /usr/bin/python3.11 /usr/bin/python3
ln -s /usr/bin/python3.11 /usr/bin/python
npm i -g --no-audit --no-fund npm
EOF

USER node

WORKDIR /home/node

COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json
RUN --mount=type=cache,target=/root/.npm


RUN <<EOF
set -eux
# ci (= clean install) mit package-lock.json
# --omit=dev: ohne devDependencies
npm ci --no-audit --no-fund --omit=dev --omit=peer
EOF

# ------------------------------------------------------------------------------
# S t a g e   f i n a l
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS final

LABEL org.opencontainers.image.title="packstation" \
    org.opencontainers.image.description="Appserver packstation mit Basis-Image Debian Bookworm" \
    org.opencontainers.image.version="2024.04.0-bookworm" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    org.opencontainers.image.authors="Juergen.Zimmermann@h-ka.de"

RUN <<EOF
set -eux
apt-get update
# https://github.com/Yelp/dumb-init
# https://packages.debian.org/bookworm/dumb-init
apt-get install --no-install-recommends --yes dumb-init=1.2.5-2

apt-get autoremove --yes
apt-get clean --yes
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
EOF

WORKDIR /opt/app

USER node

COPY --chown=node:node package.json .env ./
COPY --from=dependencies --chown=node:node /home/node/node_modules ./node_modules
COPY --from=dist --chown=node:node /home/node/dist ./dist
COPY --chown=node:node src/config/resources ./dist/config/resources

EXPOSE 3000

# Bei CMD statt ENTRYPOINT kann das Kommando bei "docker run ..." ueberschrieben werden
ENTRYPOINT ["dumb-init", "/usr/local/bin/node", "dist/main.js"]
