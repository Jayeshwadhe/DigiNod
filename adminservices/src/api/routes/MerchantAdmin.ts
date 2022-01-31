import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import MerchantAdminService from '../../services/MerchantAdminService';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';


const route = Router();

export default (app: Router) => {
    app.use('/loan', route);

    // Merchant Dashboard APIs

    route.get('/getmdash', async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');
        logger.debug('get mdash: %o', req.body);
        try{
            const merchantAdminServiceInstance = Container.get(MerchantAdminService);
            const { data } = await merchantAdminServiceInstance.getMerchantDash(req);
            return res.status(201).json({ data });
        } catch(e){
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })

    route.get('/merchantDashboardJob', async (req: Request, res: Response, next: NextFunction) =>{
        const logger:Logger = Container.get('logger');
        logger.debug('get merchantDashboardJob: %o', req.body);
        try {
            const merchantAdminServiceInstance =  Container.get(MerchantAdminService);
            const { dashboardData } = await merchantAdminServiceInstance.merchantDashboardJob(req);
            return res.status(201).json({ dashboardData });
          } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
          }
    })
    route.put('/LoneUserException',middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
     async (req: Request, res: Response, next: NextFunction) => {

        const logger: Logger = Container.get('logger');
        logger.debug('downloadTemplate: %o');
        try {
          const merchantAdminServiceInstance = Container.get(MerchantAdminService);
          const { exceptionalData } = await merchantAdminServiceInstance.updateException(req);
          return res.status(201).json({ exceptionalData });
        } catch (e) {
          logger.error('🔥 error: %o', e);
          return next(e);
        }
    
    
      })
}