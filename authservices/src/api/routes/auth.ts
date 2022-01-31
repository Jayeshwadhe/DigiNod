import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi, errors } from 'celebrate';
import { Logger } from 'winston';

var ImageKit = require('imagekit');
var fs = require('fs');

var imagekit = new ImageKit({
  publicKey: 'public_5ubBLJI3nCkFI2POvOjHue6Bajo=',
  privateKey: 'private_RTbmvMbeqWVhawNOQY+f7AAJsM8=',
  urlEndpoint: 'https://ik.imagekit.io/efozay929ft/',
});

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        address: Joi.array().items(
          Joi.object().keys({
            street: Joi.string(),
            state: Joi.string(),
            city: Joi.string(),
            pinCode: Joi.number(),
            country: Joi.string(),
          }),
        ),
        mobileNumber: Joi.number().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        return res.status(201).json({ user, token });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/signin',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body.email);
      try {
        const { email, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, loginDetails, token, passwordExpired } = await authServiceInstance.SignIn(email, password);
        return res.json({ user, loginDetails, token, passwordExpired }).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get('/imagekit', async (req: Request, res: Response, next: NextFunction) => {
    try {
      var authenticationParameters = imagekit.getAuthenticationParameters();
      return res.status(201).json({ authenticationParameters });
    } catch (e) {
      return next(e);
    }
  });

  /**
   * @TODO Let's leave this as a place holder for now
   * The reason for a logout route could be deleting a 'push notification token'
   * so the device stops receiving push notifications after logout.
   *
   * Another use case for advance/enterprise apps, you can store a record of the jwt token
   * emitted for the session and add it to a black list.
   * It's really annoying to develop that but if you had to, please use Redis as your data store
   */
  route.post('/logout', middlewares.isAuth, (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Out endpoint with body: %o', req.body);
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      return res.status(200).end();
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });

  // NICT api to get loan by KO Code
  route.get('/getLoanByKoCode', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('get merchant NICT: %o', req.body);
    try {
      const merchantLoanInstance = Container.get(AuthService);
      const { data } = await merchantLoanInstance.getLoanByKoCode(req);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  // NICT api to update loans
  route.put('/updateLoans', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('update loan : %o', req.body);
    try {
      const merchantLoanInstance = Container.get(AuthService);
      const { updatedData } = await merchantLoanInstance.updateLoans(req);
      return res.status(201).json({ updatedData });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  // NICT api to submit loan
  route.post('/postLoan', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('post loan : %o', req.body);
    try {
      const merchantLoanInstance = Container.get(AuthService);
      const { submitData } = await merchantLoanInstance.postLoans(req);
      return res.status(201).json({ submitData });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  // LiquiLoan APIs
  route.get('/getSchemeList', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('getSchemeList: %o');
    try {
      const AuthServiceInstance = Container.get(AuthService);
      const { data } = await AuthServiceInstance.getSchemeList(req);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.post('/getCalculatedEMI', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('getCalculatedEMI: %o', req.body);
    try {
      const AuthServiceInstance = Container.get(AuthService);
      const { data } = await AuthServiceInstance.getCalculatedEMI(req);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.post('/CreateLead', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('CreateLead: %o', req.body);
    try {
      const AuthServiceInstance = Container.get(AuthService);
      const { data } = await AuthServiceInstance.CreateLead(req,res);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.use(errors());
};
