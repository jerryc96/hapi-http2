const Hapi = require('hapi');
const fs = require('fs');
const Path = require('path');
const Inert = require('inert');
const Http2 = require('http2');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require("joi");

//ssh script to make certificate keys
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem

const saltRounds = 10;

// read certificate and private key
const serverOptions = {
  allowHTTP1: true
};

// create http2 secure server listener
const listener = Http2.createSecureServer(serverOptions);

// setup mongoose conn with mlab
const mongoConnector = process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/hapi";
const port = process.env.PORT || 8000;


const init = async() => {

  mongoose.connect(mongoConnector, {useNewUrlParser: true});
  const UserSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
  });

  const UserModel = mongoose.model('User', UserSchema);

  const server = new Hapi.Server({
    "host": "localhost", 
    "port": port,
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
  server.route({
      method: "POST",
      path: "/user",
      options: {
          validate: {}
      },
      handler: async (request, h) => {
        try {
            let user = new UserModel(request.payload);
            const result = await user.save();
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
      }
  });

  server.route({
      method: "GET",
      path: "/users",
      handler: async (request, h) => {
        try {
            const user = await UserModel.find().exec();
            return h.response(user);
        } catch (error) {
            return h.response(error).code(500);
        }
      }
  });

  server.route({
      method: "GET",
      path: "/user/{username}",
      handler: async (request, h) => {
        try {
            const user = await UserModel.find({username:request.params.username}).exec();
            return h.response(user);
        } catch (error) {
            return h.response(error).code(500);
        }
      }
  });

  server.route({
      method: "PUT",
      path: "/user/{username}",
      options: {
          validate: {}
      },
      handler: async (request, h) => {
        try {
            const result = await UserModel.updateOne({username:request.params.username}, 
              request.payload, { new: true });
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
      }
  });

  server.route({
      method: "DELETE",
      path: "/user/{username}",
      handler: async (request, h) => {
        try {
            const result = await UserModel.deleteOne({username:request.params.username});
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
      }
  });

  // start server
  await server.start(err => {
    if (err) console.error(err)
    console.log(`Started ${server.connections.length} connections`)
  });
}

init();

