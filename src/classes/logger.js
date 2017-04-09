const winston = require('winston');

class Logger
{
  static getInstance()
  {
    if (!this.instance)
    {
      this.instance = new Logger();
    }
    return this.instance;
  }
  constructor()
  {
    this.winston = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          humanReadableUnhandledException: true,
          prettyPrint: true,
          timestamp: true
        })
      ]
    });
    this.winston.level = 'debug';
    this.winston.cli();
  }
  debug(message, data = null)
  {
    this.log('debug', message, data);
  }
  error(message, data = null)
  {
    this.log('error', message, data);
  }
  info(message, data = null)
  {
    this.log('info', message, data);
  }
  log(level, message, data = null)
  {
    this.winston.log(level, message, data);
  }
  warn(message, data = null)
  {
    this.log('warn', message, data);
  }
}

module.exports = Logger;
