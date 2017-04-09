const path = require('path');
const winston = require('winston');

class Logger
{
  static getInstance(options = {})
  {
    if (!this.instance)
    {
      this.instance = new Logger(options);
    }
    return this.instance;
  }
  constructor(options = {})
  {
    const DEFAULT_OPTIONS = {
      file: {
        name: 'sherlock.log',
        directory: process.cwd()
      }
    };

    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

    this.winston = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          colorize: true,
          humanReadableUnhandledException: true,
          level: 'debug',
          prettyPrint: true,
          timestamp: true
        }),
        new (winston.transports.File)({
          colorize: false,
          filename: path.resolve(opts.file.directory, opts.file.name),
          json: false,
          level: 'debug',
          maxFiles: 5,
          maxsize: 1000,
          tailable: true,
          timestamp: true
        })
      ]
    });
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
