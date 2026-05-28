#!/bin/bash
# Post-clone Deployment Script for Snap
# Run this inside the /var/www/snap directory AFTER cloning the repository
# MUST BE RUN AS THE OWNER OF THE DIRECTORY (e.g. www-data or ubuntu), NOT ROOT

set -e

# Configuration Variables
APP_DOMAIN="155.138.214.18"
DB_NAME="snap"
DB_USER="snap_user"
DB_PASSWORD="PASSWORD"

echo ">>> Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Update .env variables using sed (this replaces existing keys safely)
sed -i "s|^APP_ENV=.*|APP_ENV=production|" .env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=false|" .env
sed -i "s|^APP_URL=.*|APP_URL=http://$APP_DOMAIN/snap|" .env
sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=pgsql|" .env
sed -i "s|^DB_PORT=.*|DB_PORT=5432|" .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=$DB_NAME|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=$DB_USER|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
# Remove ASSET_URL if it exists, then append it
sed -i '/^ASSET_URL=.*/d' .env
echo "ASSET_URL=/snap" >> .env

echo ">>> Installing Composer dependencies..."
composer install --optimize-autoloader --no-dev

echo ">>> Generating application key..."
php artisan key:generate --force

echo ">>> Linking storage..."
php artisan storage:link

echo ">>> Installing NPM dependencies and building assets..."
npm ci
npm run build

echo ">>> Running database migrations..."
php artisan migrate --force

echo ">>> Seeding Admin User..."
php artisan db:seed --class=AdminUserSeeder --force

echo ">>> Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ">>> Post-deployment setup complete!"
echo "NOTE: If you ran this script as a user other than www-data,"
echo "you may need to run the following command as root/sudo:"
echo "sudo chown -R www-data:www-data storage bootstrap/cache"
