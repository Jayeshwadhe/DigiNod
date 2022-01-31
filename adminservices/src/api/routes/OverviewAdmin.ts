import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import OverviewAdminService from '../../services/OverviewAdminService';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
    app.use('/overview', route);

    route.get('/getodash', async (req: Request, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');
        logger.debug('get pdash: %o', req.body);
        try {
            const overviewAdminServiceInstance = Container.get(OverviewAdminService);
            const { data } = await overviewAdminServiceInstance.getOverviewDash(req);
            return res.status(201).json({ data });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

    route.get('/patientDashboardJob', async (req: Request, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');

        try {
            const overviewAdminServiceInstance = Container.get(OverviewAdminService);
            const { overviewdashboard } = await overviewAdminServiceInstance.OverviewDashboardJob(req);
            return res.status(201).json({ overviewdashboard });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });



}
