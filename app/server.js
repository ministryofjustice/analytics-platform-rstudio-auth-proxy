var app = require('./index');
var config = require('./config');
var http = require('http');
var log = require('bole')('server');


log.info('Auth proxy process starting');


var server = http.createServer(app)
server.listen(config.express.port, config.express.host, function (error) {

  if (error) {
    log.error('Unable to listen for connections', error);
    process.exit(10);
  }

  log.info('Listening on ' + config.express.host + ':' + config.express.port);
});
