// PM2 Ecosystem Configuration for Buy9ja API
// Used for process management on Oracle Cloud (or any server)
// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'buy9ja-api',
      script: './server.js',
      
      // Instances
      instances: 2, // Run 2 instances for load balancing
      exec_mode: 'cluster', // Cluster mode for multiple instances
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Restart behavior
      autorestart: true,
      watch: false, // Set to true in development if you want auto-reload
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Error handling
      max_restarts: 10,
      min_uptime: '10s',
      
      // Advanced features
      instance_var: 'INSTANCE_ID',
      
      // Source map support
      source_map_support: true,
      
      // Graceful start/shutdown/reload
      shutdown_with_message: true
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['YOUR_ORACLE_IP'], // Replace with your Oracle Cloud IP
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/buy9ja.git',
      path: '/var/www/buy9ja-api',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo mkdir -p /var/www/buy9ja-api && sudo chown -R ubuntu:ubuntu /var/www/buy9ja-api'
    }
  }
};
