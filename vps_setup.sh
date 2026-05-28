#!/bin/bash
# VPS Provisioning Script for Snap (Ubuntu 22.04/24.04 with LEMP Stack & PostgreSQL)
# MUST BE RUN AS ROOT or with sudo privileges

set -e

# Configuration Variables
APP_DOMAIN="155.138.214.18" # Change this or replace with IP if testing
APP_DIR="/var/www/snap"
DB_NAME="snap"
DB_USER="snap_user"
# You should change this password!
DB_PASSWORD="PASSWORD"

# 1. Update system
echo ">>> Updating System..."
apt update && apt upgrade -y

# 2. Install essential dependencies
echo ">>> Installing dependencies..."
apt install -y curl wget git unzip supervisor ufw software-properties-common

# 3. Add PHP PPA
echo ">>> Adding PHP PPA..."
add-apt-repository ppa:ondrej/php -y
apt update

# 4. Install Nginx, PostgreSQL, Redis, and PHP 8.4
echo ">>> Installing Nginx, PostgreSQL, Redis, and PHP 8.4..."
apt install -y nginx postgresql postgresql-contrib redis-server \
    php8.4-fpm php8.4-pgsql php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-redis php8.4-cli

# 5. Install Composer
echo ">>> Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# 6. Install Node.js (v20)
echo ">>> Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 7. Configure PostgreSQL Database
echo ">>> Configuring PostgreSQL Database..."
# Create User and DB
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 8. Set up application directory
echo ">>> Setting up Application Directory..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR
# Note: You need to clone the repo into $APP_DIR manually after this script runs!

# 9. Configure Nginx Virtual Host (Subdirectory approach)
echo ">>> Configuring Nginx for /snap subdirectory..."
cat > /etc/nginx/sites-available/snap <<EOF
server {
    listen 80;
    server_name $APP_DOMAIN; 
    
    # We use the default root for domain root, but route /snap to our app
    root /var/www/html;

    location ^~ /snap {
        alias $APP_DIR/public;
        index index.php index.html;
        try_files \$uri \$uri/ @snap;

        location ~ \.php\$ {
            fastcgi_pass unix:/var/run/php/php8.4-fpm.sock; 
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            include fastcgi_params;
        }
    }

    location @snap {
        rewrite /snap/(.*)$ /snap/index.php?/\$1 last;
    }

    error_log  /var/log/nginx/snap_error.log;
    access_log /var/log/nginx/snap_access.log;
}
EOF

# Link Nginx site and reload
ln -sf /etc/nginx/sites-available/snap /etc/nginx/sites-enabled/snap
systemctl reload nginx

# 10. Configure Firewall (Optional)
echo ">>> Configuring Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw --force enable 

echo ">>> Provisioning Complete!"
echo "Next steps:"
echo "1. Clone your Laravel code into $APP_DIR."
echo "2. Setup .env with DB_CONNECTION=pgsql, DB_PORT=5432, DB_DATABASE=$DB_NAME, DB_USERNAME=$DB_USER, DB_PASSWORD=$DB_PASSWORD, APP_URL=http://$APP_DOMAIN/snap, ASSET_URL=/snap."
echo "3. Run 'composer install --optimize-autoloader --no-dev' inside the app dir."
echo "4. Build UI assets: 'npm ci' and 'npm run build'."
echo "5. Fix permissions: 'chown -R www-data:www-data storage bootstrap/cache'"
echo "6. Run migrations: 'php artisan migrate --force'."
