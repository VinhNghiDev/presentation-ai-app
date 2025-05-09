const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware để log các request
const requestLogger = (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
};

// Middleware để log các lỗi
const errorLogger = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
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