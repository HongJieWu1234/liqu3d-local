ARG NODE_IMAGE=node:22-bookworm-slim
ARG OPENSCAD_IMAGE=openscad/openscad:dev

FROM ${NODE_IMAGE} AS node_base

FROM node_base AS app
LABEL org.opencontainers.image.title="Liqu3D" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.licenses="LicenseRef-Proprietary"
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates fontconfig \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --chown=node:node package.json package-lock.json /app/
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . /app
RUN mkdir -p /app/cache/fontconfig /app/data /app/fonts/custom /app/bambu-profiles/BBL \
  && chown -R node:node /app/cache /app/data /app/fonts /app/bambu-profiles
ENV HOST=0.0.0.0 \
    PORT=4173 \
    NODE_ENV=production \
    HOME=/tmp
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=8s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4173/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
STOPSIGNAL SIGTERM
CMD ["node", "server.mjs"]

FROM ${OPENSCAD_IMAGE} AS worker
USER root
COPY --from=node_base /usr/local/ /usr/local/
RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig imagemagick xvfb xauth coreutils util-linux \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --uid 10000 --no-create-home --shell /usr/sbin/nologin pmm \
  && mkdir -p /runtime /fonts/custom /job \
  && chown 10000:10000 /job
COPY renderer-worker.mjs /runtime/
COPY lib/renderer-runtime.mjs lib/instant-assets.mjs lib/instant-archive.mjs lib/worker-cpu-affinity.mjs /runtime/lib/
COPY fonts /fonts
RUN /usr/local/bin/node --input-type=module -e "import fs from 'node:fs/promises'; import { capabilities } from '/runtime/lib/renderer-runtime.mjs'; const info = await capabilities({ probe: true }); if (!info.ready) throw new Error(info.error); await fs.writeFile('/runtime/renderer-capabilities.json', JSON.stringify(info)); await fs.chmod('/runtime/renderer-capabilities.json', 0o444);"
LABEL io.pmm.disposable-worker="1"
ENV HOME=/tmp OPENSCAD_BIN=openscad CUSTOM_FONT_DIR=/fonts
WORKDIR /job
USER 10000:10000
HEALTHCHECK NONE
ENTRYPOINT ["/usr/bin/timeout", "--signal=KILL", "610s", "/usr/local/bin/node", "/runtime/renderer-worker.mjs"]

FROM docker:29-cli AS docker_cli
FROM node_base AS renderer
USER root
COPY --from=docker_cli /usr/local/bin/docker /usr/local/bin/docker
WORKDIR /app
COPY renderer-service.mjs /app/
COPY lib/renderer-containers.mjs lib/renderer-output.mjs lib/render-scheduler.mjs lib/instant-assets.mjs lib/instant-archive.mjs /app/lib/
ENV HOST=0.0.0.0 PORT=4180 NODE_ENV=production HOME=/tmp
# Trusted orchestration only. Access to the daemon is never passed to workers.
USER node
EXPOSE 4180
HEALTHCHECK --interval=30s --timeout=12s --start-period=45s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4180/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
STOPSIGNAL SIGTERM
CMD ["node", "renderer-service.mjs"]
