const path = require('path');
const spawn = require('child_process').spawn;

class Casper
{
  static parseStreamBuffer(buffer)
  {
    try
    {
      const message = JSON.parse(buffer.toString('utf8'));

      if (typeof message.type !== 'string')
      {
        return null;
      }
      return message;
    }
    catch (e)
    {
      return null;
    }
  }
  static runScript(name, args = [])
  {
    const binPath = path.resolve(__dirname, '../../node_modules/.bin/casperjs');
    const scriptPath = path.resolve(__dirname, `../scripts/casperjs/${name}.js`);

    args.unshift(scriptPath);

    return spawn(binPath, args);
  }
}

module.exports = Casper;
