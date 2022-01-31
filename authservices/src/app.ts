import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';

import express from 'express';

import Logger from './loaders/logger';

var ImageKit = require('imagekit');
var fs = require('fs');

var imagekit = new ImageKit({
  publicKey: 'public_5ubBLJI3nCkFI2POvOjHue6Bajo=',
  privateKey: 'private_RTbmvMbeqWVhawNOQY+f7AAJsM8=',
  urlEndpoint: 'https://ik.imagekit.io/efozay929ft/',
});

async function startServer() {
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require('./loaders').default({ expressApp: app });

  app
    .listen(config.port, () => {
      Logger.info(`
    ######################################################################
      ✌️✌️  Server listening on port: ${config.port} for AuthServices ✌️✌️
      ####################################################################
    `);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();
