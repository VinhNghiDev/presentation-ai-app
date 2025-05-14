const winston = require('winston');
const path = require('path');

// Custom format cho console output
const consoleFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    // Log errors to error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      format: winston.format.json()
    }),
    // Log all levels to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      format: winston.format.json()
    })
  ]
});

// Chỉ thêm console transport trong môi trường development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      consoleFormat
    )
  }));
}

// Middleware để log các request quan trọng
const requestLogger = (req, res, next) => {
  // Chỉ log các request không phải là health check và static files
  if (!req.path.includes('/health') && !req.path.includes('/static')) {
    logger.info('Incoming Request', {
      method: req.method,
      path: req.path,
      ip: req.ip
    });
  }
  next();
};

// Middleware để log các lỗi
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
}; 