import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import productService from '../../services/productService';
import { IProductDTO } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, Joi, errors } from 'celebrate';

const route = Router();

export default (app: Router) => {
  app.use('/product', route);

  route.post('/getAllProduct',
    celebrate({
      body: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array()
      }
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllProduct: %o', req.body);
      try {
        const productServiceInstance = Container.get(productService);
        const { data } = await productServiceInstance.getAllProduct(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.get('/getProductById',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getProductById: %o', req.body);
      try {
        const productServiceInstance = Container.get(productService);
        const { data } = await productServiceInstance.getProductById(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.post('/addProduct',
    celebrate({
      body: Joi.object({
        organizationId: Joi.string(),
        productName: Joi.string().required(),
        interestMaster: Joi.array().items(Joi.object().keys(
          { tenure: Joi.number(), interest: Joi.number(), processingFee: Joi.number(), productType: Joi.string() })
        ),
        moduleName: Joi.string().required(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('addProduct: %o', req.body);
      try {
        const productServiceInstance = Container.get(productService);
        const { responseCode, data } = await productServiceInstance.addProduct(req.body as IProductDTO);
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.post('/editProduct',
    celebrate({
      body: Joi.object({
        organizationId: Joi.string(),
        productName: Joi.string(),
        interestMaster: Joi.array().items(Joi.object().keys(
          { tenure: Joi.number(), interest: Joi.number(), processingFee: Joi.number(), productType: Joi.string() })
        ),
        moduleName: Joi.string(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editProduct: %o', req.body);
      try {
        const productServiceInstance = Container.get(productService);
        const { data } = await productServiceInstance.editProduct(req, req.body as IProductDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.delete('/deleteProduct',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('deleteProduct: %o', req.body);
      try {
        const productServiceInstance = Container.get(productService);
        const { data } = await productServiceInstance.deleteProduct(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.use(errors());
}