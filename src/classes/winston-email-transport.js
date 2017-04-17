const nodemailer = require('nodemailer');
const winston = require('winston');

class WinstonEmailTransport extends winston.Transport
{
  constructor(options)
  {
    super(options);

    this.level = 'error';
    this.name = 'WinstonEmail';
    this.options = options;
    this.transporter = nodemailer.createTransport({
      host: options.server.host,
      port: options.server.port,
      auth: {
        pass: options.server.pass,
        user: options.server.user
      }
    });
  }
  log(level, msg, meta, callback)
  {
    const content = [msg];

    if (meta)
    {
      content.push(JSON.stringify(meta, null, 2));
    }

    const mailOptions = {
      from: this.options.from,
      to: this.options.to.join(','),
      subject: `Sherlock Homes - Email log - ${level.toUpperCase()}`,
      text: content.join('\n\r')
    };

    this.transporter.sendMail(mailOptions, (err) => {

      if (err)
      {
        throw err;
      }
      callback(null, true);
    });
  }
}

module.exports = WinstonEmailTransport;
