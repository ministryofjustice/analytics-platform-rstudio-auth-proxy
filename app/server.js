var app = require('./index');
var config = require('./config');
var http = require('http');
var log = require('bole')('server');
var proxy = require('./proxy');


log.info('Auth proxy process starting');


var server = http.createServer(app)
server.listen(config.express.port, config.express.host, function (error) {

  if (error) {
    log.error('Unable to listen for connections', error);
    process.exit(10);
  }

  log.info('Listening on ' + config.express.host + ':' + config.express.port);
});

server.on('upgrade', function (req, socket, head) {
  var target = 'ws://' + config.proxy.target.host + ':' + config.proxy.target.port;
  proxy.ws(req, socket, head, {target: target});
});
