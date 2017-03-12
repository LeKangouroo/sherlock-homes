module.exports = {
  command: 'server',
  describe: 'Runs a webservice with a REST API',
  builder: {
    host: {
      default: 'localhost',
      describe: 'The host of the webservice',
      type: 'string'
    },
    port: {
      default: 8080,
      describe: 'The port exposed by the webservice',
      type: 'number'
    }
  }
};
