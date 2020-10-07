FROM skewled/bulwark-base:6.0.0

# Stage the setup to launch Bulwark
RUN mkdir -p /bulwark
COPY . /bulwark
WORKDIR "bulwark"

# Permissions for Bulwark
RUN chown -R bulwark:bulwark /bulwark

# DB Wait MySQL Status Up, requires mysql-client
RUN apk add --no-cache mysql-client

# Runas User
USER bulwark

# Bulwark Specific Startup
RUN npm install \
    && cd frontend \
    && npm install \
    && cd .. \
    && npm run build

# Cleanup NPM to save some space
RUN rm -rf /bulwark/.npm

# Running Port
EXPOSE 5000

# Launch Bulwark
CMD ["npm", "start"]
