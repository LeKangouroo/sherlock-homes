const AbstractObservable = require('./abstract-observable');
const path = require('path');
const spawn = require('child_process').spawn;

class CasperScript extends AbstractObservable
{
  constructor(name, args = [], { debug = false } = {})
  {
    super();

    const binPath = path.resolve(__dirname, '../../node_modules/.bin/casperjs');
    const scriptPath = path.resolve(__dirname, `../scripts/casperjs/${name}.js`);

    args.unshift(scriptPath);

    const childProcess = spawn(binPath, args);

    if (debug)
    {
      childProcess.stdout.pipe(process.stdout);
      childProcess.stderr.pipe(process.stderr);
    }

    childProcess.stdout.on('data', (buffer) => {

      const data = CasperScript.parseStreamBuffer(buffer);

      if (data !== null)
      {
        this.notifyObservers('data', data);
      }
    });

    childProcess.on('exit', (code) => {

      this.notifyObservers('exit', code);
    });

    this.process = childProcess;
  }

  getProcess()
  {
    return this.process;
  }

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
}

module.exports = CasperScript;

