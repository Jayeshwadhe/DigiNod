import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import claimDashboardService from '../../services/claimAdmin';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/cdash', route);

  route.get(
    '/getcdash',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger:Logger = Container.get('logger');
      logger.debug('get cdash: %o', req.body );
      try {
        const claimDashboardServiceInstance = Container.get(claimDashboardService);
        const { data } = await claimDashboardServiceInstance.getCDash(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
 route.get(
   '/claimDashboardJob',
   async (req: Request, res: Response, next: NextFunction) => {
     const logger:Logger = Container.get('logger');
     logger.debug('get claimDashboardJob: %o', req.body);
     try {
       const claimDashboardServiceInstance =  Container.get(claimDashboardService);
       const { dashboardData } = await claimDashboardServiceInstance.claimDashboardJob(req);
       return res.status(201).json({ dashboardData });
     } catch (e) {
       logger.error('🔥 error: %o', e);
       return next(e);
     }
   }
  )

}