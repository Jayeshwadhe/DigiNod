import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import roleBasedAccessServices from '../../services/roleBasedAccess';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
import { IRoleInputDTO } from '@/interfaces/IRole';

const route = Router();

export default (app: Router) => {
  app.use('/role', route);

  route.post(
    '/addmodules',
    celebrate({
      body: Joi.object({
        path: Joi.string().required(),
        title: Joi.string().required(),
        icon: Joi.string().required(),        
        submenu: Joi.object().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling addModules: %o', req.body);
      try {
        const roleBasedAccessServicesInstance = Container.get(roleBasedAccessServices);
        const { saveModule } = await roleBasedAccessServicesInstance.addModules(req.body as IRoleInputDTO);
        return res.status(201).json({ saveModule });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

};
