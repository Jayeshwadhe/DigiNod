import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import supplierAdminService from '../../services/supplierAdmin';
// import supplierAdminService2 from '../../services/supplierAdminService';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger, loggers } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/sdash', route);

  route.get(
    '/getsdash',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get sdash: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { data } = await supplierAdminServiceInstance.getSDash(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.get(
    '/supplierDashboardJob',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get supplierDashboardJob: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { dashboardData } = await supplierAdminServiceInstance.supplierDashboardJob(req);
        return res.status(201).json({ dashboardData });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.get(
    '/getAllHospital',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getAllHospital: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { data } = await supplierAdminServiceInstance.getAllHospital(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.get(
    '/getAllLenderToAdmin',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getAllLenderToAdmin: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { data } = await supplierAdminServiceInstance.getAllLenderToAdmin(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.get(
    '/getAllVendorToAdmin',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getAllVendorToAdmin: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { data } = await supplierAdminServiceInstance.getAllVendorToAdmin(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.get(
    '/getUserByIdToAdmin',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getUserByIdToAdmin: %o', req.body);
      try {
        const supplierAdminServiceInstance = Container.get(supplierAdminService);
        const { data } = await supplierAdminServiceInstance.getUserByIdToAdmin(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
}