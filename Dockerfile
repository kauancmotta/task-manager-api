# =============================================================================
# Stage 1 — build
# Install all deps and build the project
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN npx tsc -p tsconfig.build.json && npx tsc-alias -p tsconfig.build.json
RUN cp -r src/common/mail/templates dist/common/mail/templates

# =============================================================================
# Stage 2 — runner
# Lean final image with only what's needed to run
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules and built output from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist

# Copy package.json (used by Swagger to read the version dynamically)
COPY --from=build /app/package.json ./package.json

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && mkdir -p /app/uploads \
    && chown -R appuser:appgroup /app/uploads

USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]