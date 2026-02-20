#!/bin/bash

###############################################################################
# Buy9ja API Deployment Script for Oracle Cloud
# This script automates the deployment process on a fresh Oracle Cloud instance
###############################################################################

set -e # Exit on error

echo "======================================================================"
echo "  Buy9ja API - Oracle Cloud Deployment Script"
echo "======================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="buy9ja-api"
APP_DIR="/var/www/${APP_NAME}"
BACKEND_DIR="${APP_DIR}/backend"
NGINX_AVAILABLE="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"
DOMAIN="api.buy9ja.com"
NODE_VERSION="20"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Run as ubuntu user."
    exit 1
fi

# Step 1: System Update
echo ""
print_info "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Step 2: Install Node.js
echo ""
print_info "Step 2: Installing Node.js ${NODE_VERSION}.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Step 3: Install PM2
echo ""
print_info "Step 3: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Step 4: Install Nginx
echo ""
print_info "Step 4: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Step 5: Install Git
echo ""
print_info "Step 5: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# Step 6: Create application directory
echo ""
print_info "Step 6: Setting up application directory..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}
print_success "Application directory created: ${APP_DIR}"

# Step 7: Clone repository
echo ""
print_info "Step 7: Cloning repository..."
read -p "Enter your GitHub repository URL: " REPO_URL
if [ -d "${APP_DIR}/.git" ]; then
    print_warning "Repository already exists. Pulling latest changes..."
    cd ${APP_DIR}
    git pull origin main
else
    git clone ${REPO_URL} ${APP_DIR}
fi
cd ${BACKEND_DIR}
print_success "Repository cloned"

# Step 8: Install dependencies
echo ""
print_info "Step 8: Installing Node.js dependencies..."
npm install
print_success "Dependencies installed"

# Step 9: Create logs directory
echo ""
print_info "Step 9: Creating logs directory..."
mkdir -p ${BACKEND_DIR}/logs
print_success "Logs directory created"

# Step 10: Environment variables
echo ""
print_info "Step 10: Setting up environment variables..."
if [ ! -f "${BACKEND_DIR}/.env" ]; then
    print_warning ".env file not found. Creating from template..."
    cat > ${BACKEND_DIR}/.env << 'EOF'
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://buy9ja.com

# MariaDB SkySQL Configuration
DB_HOST=your-database.mdb0001234.db.skysql.net
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=buy9ja_db
DB_PORT=3306

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
EOF
    print_warning "IMPORTANT: Edit ${BACKEND_DIR}/.env with your actual credentials"
    print_info "Press any key to edit .env file now..."
    read -n 1 -s
    nano ${BACKEND_DIR}/.env
else
    print_success ".env file already exists"
fi

# Step 11: Test database connection
echo ""
print_info "Step 11: Testing database connection..."
if node ${BACKEND_DIR}/check-connection.js; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your .env file"
    exit 1
fi

# Step 12: Configure PM2
echo ""
print_info "Step 12: Setting up PM2..."
pm2 delete ${APP_NAME} 2>/dev/null || true
pm2 start ${BACKEND_DIR}/ecosystem.config.js --env production
pm2 save
print_success "PM2 configured and application started"

# Step 13: Setup PM2 startup
echo ""
print_info "Step 13: Configuring PM2 startup..."
PM2_STARTUP_CMD=$(pm2 startup | grep 'sudo' | tail -1)
if [ ! -z "$PM2_STARTUP_CMD" ]; then
    eval $PM2_STARTUP_CMD
    pm2 save
    print_success "PM2 startup configured"
else
    print_warning "PM2 startup already configured"
fi

# Step 14: Configure Nginx
echo ""
print_info "Step 14: Configuring Nginx..."
sudo cp ${BACKEND_DIR}/nginx.conf ${NGINX_AVAILABLE}
sudo ln -sf ${NGINX_AVAILABLE} ${NGINX_ENABLED}
sudo rm -f /etc/nginx/sites-enabled/default
print_success "Nginx configured"

# Step 15: Test Nginx configuration
echo ""
print_info "Step 15: Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    print_success "Nginx restarted"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 16: Configure firewall
echo ""
print_info "Step 16: Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
print_success "Firewall configured"

# Step 17: Install SSL certificate
echo ""
print_info "Step 17: Installing SSL certificate..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

print_warning "About to request SSL certificate for ${DOMAIN}"
print_info "Make sure DNS is pointing to this server!"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@buy9ja.com --redirect || print_warning "SSL setup failed. You can run 'sudo certbot --nginx -d ${DOMAIN}' manually later"
    print_success "SSL certificate installed"
else
    print_warning "Skipping SSL setup. Run 'sudo certbot --nginx -d ${DOMAIN}' manually later"
fi

# Step 18: Test deployment
echo ""
print_info "Step 18: Testing deployment..."
sleep 3
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Backend is responding on localhost:3000"
else
    print_error "Backend health check failed"
fi

# Final status
echo ""
echo "======================================================================"
print_success "Buy9ja API Deployment Complete!"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "  1. Update DNS: Point ${DOMAIN} to this server's IP"
echo "  2. Test API: curl https://${DOMAIN}/api/health"
echo "  3. Check logs: pm2 logs ${APP_NAME}"
echo "  4. Monitor: pm2 monit"
echo ""
echo "Useful commands:"
echo "  - View logs:     pm2 logs ${APP_NAME}"
echo "  - Restart:       pm2 restart ${APP_NAME}"
echo "  - Status:        pm2 status"
echo "  - Nginx logs:    sudo tail -f /var/log/nginx/buy9ja-api.access.log"
echo "  - Update app:    cd ${BACKEND_DIR} && git pull && npm install && pm2 restart ${APP_NAME}"
echo ""
print_info "Server IP: $(curl -s ifconfig.me)"
echo "======================================================================"
