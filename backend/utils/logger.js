/**
 * Logger Utility
 * Provides structured logging with different log levels
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const time = timestamp.split('T')[1].split('.')[0];
  const date = timestamp.split('T')[0];
  
  let logMessage = `[${date} ${time}] [${level}] ${message}`;
  
  if (data) {
    logMessage += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return logMessage;
};

const logger = {
  /**
   * Info level logging - General information
   */
  info: (message, data = null) => {
    const formatted = formatMessage('INFO', message, data);
    console.log(`${colors.cyan}${formatted}${colors.reset}`);
  },

  /**
   * Success level logging - Successful operations
   */
  success: (message, data = null) => {
    const formatted = formatMessage('SUCCESS', message, data);
    console.log(`${colors.green}${formatted}${colors.reset}`);
  },

  /**
   * Warning level logging - Warnings
   */
  warn: (message, data = null) => {
    const formatted = formatMessage('WARN', message, data);
    console.log(`${colors.yellow}${formatted}${colors.reset}`);
  },

  /**
   * Error level logging - Errors
   */
  error: (message, error = null, data = null) => {
    const formatted = formatMessage('ERROR', message, data);
    console.error(`${colors.red}${formatted}${colors.reset}`);
    
    if (error) {
      console.error(`${colors.red}Error Stack:${colors.reset}`);
      console.error(error.stack || error);
    }
  },

  /**
   * Debug level logging - Debug information (only in development)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const formatted = formatMessage('DEBUG', message, data);
      console.log(`${colors.dim}${formatted}${colors.reset}`);
    }
  },

  /**
   * Request logging - HTTP requests
   */
  request: (method, path, statusCode, duration = null, userId = null) => {
    const statusColor = statusCode >= 500 ? colors.red :
                       statusCode >= 400 ? colors.yellow :
                       statusCode >= 300 ? colors.cyan :
                       colors.green;
    
    let message = `${method} ${path} - ${statusCode}`;
    if (duration) message += ` (${duration}ms)`;
    if (userId) message += ` [User: ${userId}]`;
    
    const formatted = formatMessage('REQUEST', message);
    console.log(`${statusColor}${formatted}${colors.reset}`);
  },

  /**
   * Database logging - Database operations
   */
  database: (operation, collection, data = null) => {
    const message = `DB ${operation} on ${collection}`;
    const formatted = formatMessage('DATABASE', message, data);
    console.log(`${colors.magenta}${formatted}${colors.reset}`);
  },

  /**
   * Authentication logging - Auth operations
   */
  auth: (action, userId = null, email = null, success = true) => {
    let message = `AUTH ${action}`;
    if (userId) message += ` [User ID: ${userId}]`;
    if (email) message += ` [Email: ${email}]`;
    message += ` - ${success ? 'SUCCESS' : 'FAILED'}`;
    
    const formatted = formatMessage('AUTH', message);
    const color = success ? colors.green : colors.red;
    console.log(`${color}${formatted}${colors.reset}`);
  },
};

module.exports = logger;

