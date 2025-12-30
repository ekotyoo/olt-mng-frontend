FROM freeradius/freeradius-server:latest

# Install Postgres client libs
USER root
RUN apt-get update && apt-get install -y postgresql-client

# Enable SQL module (Postgres)
# 1. Symlink sql module
RUN ln -s /etc/raddb/mods-available/sql /etc/raddb/mods-enabled/sql

# 2. Configure SQL driver to postgresql
RUN sed -i 's/driver = ".*"/driver = "rlm_sql_postgresql"/g' /etc/raddb/mods-available/sql
RUN sed -i 's/dialect = ".*"/dialect = "postgresql"/g' /etc/raddb/mods-available/sql

# 3. Configure Connection settings (Hardcoded for stability)
# Match optional comment (#) and whitespace, then the key, then ensure we uncomment it by replacing with just the key.
RUN sed -i 's/^[[:space:]]*#\?[[:space:]]*server[[:space:]]*=[[:space:]]*".*"/    server = "postgres"/g' /etc/raddb/mods-available/sql
RUN sed -i 's/^[[:space:]]*#\?[[:space:]]*port[[:space:]]*=[[:space:]]*3306/    port = 5432/g' /etc/raddb/mods-available/sql
RUN sed -i 's/^[[:space:]]*#\?[[:space:]]*login[[:space:]]*=[[:space:]]*"radius"/    login = "postgres"/g' /etc/raddb/mods-available/sql
RUN sed -i 's/^[[:space:]]*#\?[[:space:]]*password[[:space:]]*=[[:space:]]*"radpass"/    password = "postgres"/g' /etc/raddb/mods-available/sql
RUN sed -i 's/^[[:space:]]*#\?[[:space:]]*radius_db[[:space:]]*=[[:space:]]*"radius"/    radius_db = "olt_mng"/g' /etc/raddb/mods-available/sql

# 4. Copy our default site config which enables SQL
# 4. Copy config files
COPY default-site /etc/raddb/sites-available/default
COPY clients.conf /etc/raddb/clients.conf

# 5. Fix permissions (FreeRADIUS is picky about security)
RUN chown -R freerad:freerad /etc/raddb && chmod 640 /etc/raddb/clients.conf
