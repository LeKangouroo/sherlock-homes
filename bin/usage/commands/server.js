module.exports = {
  command: 'server',
  describe: 'Runs a webservice with a REST API',
  builder: {
    port: {
      default: 8080,
      describe: 'The port exposed by the webservice',
      type: 'number'
    }
  }
};
