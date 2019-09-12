const Hapi = require('hapi');
const fs = require('fs');
const Path = require('path');
const Inert = require('inert');
const Http2 = require('http2');
const mongoose = require('mongoose');

//ssh script to make certificate keys
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem


// read certificate and private key
const serverOptions = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
};

// create http2 secure server listener
const listener = Http2.createSecureServer(serverOptions);

const init = async() => {
  const server = new Hapi.Server({
    "host": "localhost", 
    "port": 8000,
    "listener": listener,
    "routes": {
      "files": {
        "relativeTo": Path.join(__dirname, 'static')
      }
    }
  });

  server.route([{
    method: 'GET',
    path: '/ping',
    handler: (request, reply) => {
      return 'pong';
    }
  }]);

  await server.register(Inert);
  // serving static files
  server.route({
      method: 'GET',
      path: '/static/{param*}',
      handler: {
          directory: {
              path: '.',
              redirectToSlash: true
          }
      }
  });

  // mongodb
  
  // start server
  await server.start(err => {
    if (err) console.error(err)
    console.log(`Started ${server.connections.length} connections`)
  });
}

init();

