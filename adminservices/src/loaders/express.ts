import express from 'express';
import cors from 'cors';
import { OpticMiddleware } from '@useoptic/express-middleware';
import routes from '../api';
import config from '../config';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
// const swaggerDocument = YAML.load(".optic/generated/openapi.yaml");
import crypto from "crypto";
import { AES,enc } from 'crypto-ts';
 //const swaggerDocument = require("../../.optic/generated/openapi.json")
 //const swaggerChanges = require("../../.optic/generated/adminSwagger.json")
import expressLogger from '../loaders/expressLogger';
let isswagger=false
// import Encryption_Decrapion from '../api/middlewares/encryption'

var morgan = require('mongoose-morgan');

export default ({ app }: { app: express.Application }) => {
  // swagger
  // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerChanges));

  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */

  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());
 

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Transforms the raw string of req.body into json
  app.use(express.json());



 // Load API routes and Encryption , Decraption
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  function responseInterceptor(req, res, next) {
    let data = res.send;
  
    const secret = 'abcdefg';
    
    var today = new Date();
    var month = pad(today.getMonth() + 1, 2, 0);
    var date = pad(today.getDate(), 2, 0);

   
    let url = new URL(req.get('referer'))

    if(url.pathname!="/api-docs/"){
      res.send = function(event){

        event = AES.encrypt(JSON.stringify(event),  today.getFullYear() + "" + month + "" + date + "1201").toString();
        res.send = data 
        return res.send({data:event})
       
      };
    }
     

     
      next();
     
  }
  function requestIntercept(req,res,next){
    var today = new Date();
    var month = pad(today.getMonth() + 1, 2, 0);
    var date = pad(today.getDate(), 2, 0);
    // console.log(req.url,"request");
    let url = new URL(req.get('referer'))
    if(url.pathname!="/api-docs/"){
      if(req.body.Data){
       
        const bytes = AES.decrypt(req.body.Data, today.getFullYear() + "" + month + "" + date + "1201");
         req.body =JSON.parse(bytes.toString(enc.Utf8)) ;
         console.log("hello body",req.body)
  
      
    }
   }
    next();
  }
 app.use(requestIntercept)

  app.use(config.api.prefix, routes());


  // API Documentation
  app.use(
    OpticMiddleware({
      enabled: process.env.NODE_ENV !== 'production',
    }),
  );

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
 
};
