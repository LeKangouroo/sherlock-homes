const path = require('path');
const spawn = require('child_process').spawn;

class Casper
{
  static runScript(name, args = [])
  {
    return new Promise((resolve, reject) => {

      const binPath = path.resolve(__dirname, '../../node_modules/.bin/casperjs');
      const scriptPath = path.resolve(__dirname, `../scripts/${name}.js`);

      args.unshift(scriptPath);

      const childProcess = spawn(binPath, args);
      const stdout = [];
      const stderr = [];

      childProcess.stdout.on('data', (data) => stdout.push(data));
      childProcess.stderr.on('data', (data) => stderr.push(data));
      childProcess.on('close', (code) => {

        if (code !== 0)
        {
          reject(stderr.join(''));
        }
        else
        {
          resolve(stdout.join(''));
        }
      })
    });
  }
}

module.exports = Casper;
