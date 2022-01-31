import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import patientLoanAdminService from '../../services/patientLoanAdminService';
// import supplierAdminService2 from '../../services/supplierAdminService';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import { Logger, loggers } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/patientDash', route);

  route.get(
    '/getPatientDash',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getPatientDash: %o', req.body);
      try {
        const patientLoanAdminServiceInstance = Container.get(patientLoanAdminService);
        const { data } = await patientLoanAdminServiceInstance.getPatientDash(req);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  ),
  route.get(
    '/patientLoanDashJob',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      query: {
        dateFrom: JoiDate.date().allow(null),
        dateTo: JoiDate.date().allow(null),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('patientLoanDashJob: %o', req.query);
      try {
        const patientLoanAdminServiceInstance = Container.get(patientLoanAdminService);
        // var dateFrom = new Date(req.query.dateFrom.toLocaleString());
        // var dateTo = new Date(req.query.dateTo.toLocaleString());

        const { data } = await patientLoanAdminServiceInstance.patientLoanDashJob(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
}