import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import aggrLenAssocService from '../../services/aggrLenAssocService';
import { IAggrLenAssocDTO } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, Joi, errors } from 'celebrate';

const route = Router();

export default (app: Router) => {
  app.use('/aggLenAssoc', route);

  route.post('/getAllAggLenAssoc',
    celebrate({
      body: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array()
      }
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllAggLenAssoc: %o', req.body);
      try {
        const aggrLenAssocServiceInstance = Container.get(aggrLenAssocService);
        const { data } = await aggrLenAssocServiceInstance.getAllAggLenAssoc(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.get('/getAggLenAssocById',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAggLenAssocById: %o', req.body);
      try {
        const aggrLenAssocServiceInstance = Container.get(aggrLenAssocService);
        const { data } = await aggrLenAssocServiceInstance.getAggLenAssocById(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.post('/addAggLenAssoc',
    celebrate({
      body: Joi.object({
        aggregatorId: Joi.required(),
        lenderId: Joi.required(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('addAggLenAssoc: %o', req.body);
      try {
        const aggrLenAssocServiceInstance = Container.get(aggrLenAssocService);
        const { responseCode, data } = await aggrLenAssocServiceInstance.addAggLenAssoc(req.body as IAggrLenAssocDTO);
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.post('/editAggLenAssoc',
    celebrate({
      body: Joi.object({
        aggregatorId: Joi.required(),
        lenderId: Joi.required(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editAggLenAssoc: %o', req.body);
      try {
        const aggrLenAssocServiceInstance = Container.get(aggrLenAssocService);
        const { data } = await aggrLenAssocServiceInstance.editAggLenAssoc(req, req.body as IAggrLenAssocDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.delete('/deleteAggLenAssoc',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('deleteAggLenAssoc: %o', req.body);
      try {
        const aggrLenAssocServiceInstance = Container.get(aggrLenAssocService);
        const { data } = await aggrLenAssocServiceInstance.deleteAggLenAssoc(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.use(errors());
}