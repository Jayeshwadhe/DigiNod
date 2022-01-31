const expressWinston = require('express-winston');
import winston from 'winston';

const requestLog = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.json({
        space: 2
      })
    }),
    new winston.transports.MongoDB({
        db: 'mongodb://localhost:27017/DigiSparshExpress',
        options: {
        useNewUrlParser: true,
        poolSize: 2,
        autoReconnect: true
      }
    })
  ],
  meta: true,
  msg: "Request: HTTP {{req.method}} {{req.url}}; Username: {{req.user.preferred_username}}; ipAddress {{req.connection.remoteAddress}}",
  requestWhitelist: [
    "url",
    "method",
    "httpVersion",
    "originalUrl",
    "query",
    "body"
  ]
});

export default requestLog;