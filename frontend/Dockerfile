# ─────────────────────────────────────────────────────────────────────────────
# CommitScope Frontend — Development Dockerfile
#
# Uses Node 20 LTS on Alpine for a minimal image.
# node_modules is declared as an anonymous volume in docker-compose so that
# the host bind-mount of ./frontend:/app does not overwrite the container's
# installed packages.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies before copying source.
# This layer is cached unless package.json or package-lock.json changes.
COPY package*.json ./
RUN npm install

# Copy source. In development, docker-compose bind-mounts ./frontend:/app,
# overriding this with live source for hot module replacement.
COPY . .

EXPOSE 5173

# Bind to 0.0.0.0 so Vite is accessible from outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
