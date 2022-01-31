import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import productMappingService from '../../services/productMappingService';
import { IProductMappingDTO } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, Joi, errors } from 'celebrate';

const route = Router();

export default (app: Router) => {
  app.use('/productMapping', route);

  route.post('/getAllProductMapping',
    celebrate({
      body: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array()
      }
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllProductMapping: %o', req.body);
      try {
        const productMappingServiceInstance = Container.get(productMappingService);
        const { data } = await productMappingServiceInstance.getAllProductMapping(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.get('/getProductMappingById',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getProductMappingById: %o', req.body);
      try {
        const productMappingServiceInstance = Container.get(productMappingService);
        const { data } = await productMappingServiceInstance.getProductMappingById(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.post('/addProductMapping',
    celebrate({
      body: Joi.object({
        organizationId: Joi.required(),
        organizationName: Joi.string().required(),
        productId: Joi.required(),
        productName: Joi.string().required(),
        // ROI: Joi.number().required(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('addProductMapping: %o', req.body);
      try {
        const productMappingServiceInstance = Container.get(productMappingService);
        const { responseCode, data } = await productMappingServiceInstance.addProductMapping(req.body as IProductMappingDTO);
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.post('/editProductMapping',
  celebrate({
    body: Joi.object({
        organizationId: Joi.required(),
        organizationName: Joi.string().required(),
        productId: Joi.required(),
        productName: Joi.string().required(),
        // ROI: Joi.number().required(),
      })
  }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editProductMapping: %o', req.body);
      try {
        const productMappingServiceInstance = Container.get(productMappingService);
        const { data } = await productMappingServiceInstance.editProductMapping(req, req.body as IProductMappingDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.delete('/deleteProductMapping',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('deleteProductMapping: %o', req.body);
      try {
        const productMappingServiceInstance = Container.get(productMappingService);
        const { data } = await productMappingServiceInstance.deleteProductMapping(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.use(errors());
}