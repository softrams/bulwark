FROM softramsdocker/bulwark-base:6.2.5

# Environment Arguments for Bulwark
ARG MYSQL_USER
ARG MYSQL_ROOT_PASSWORD
ARG MYSQL_DB_CHECK
ARG DB_PASSWORD
ARG DB_URL
ARG DB_USERNAME
ARG DB_PORT
ARG DB_NAME
ARG DB_TYPE
ARG NODE_ENV
ARG DEV_URL
ARG PROD_URL
ARG JWT_KEY
ARG JWT_REFRESH_KEY
ARG CRYPTO_SECRET
ARG CRYPTO_SALT

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
RUN npm install

# Cleanup NPM to save some space
RUN rm -rf /bulwark/.npm

# Running Port
EXPOSE 5000

# Launch Bulwark
CMD ["npm", "run", "start"]
