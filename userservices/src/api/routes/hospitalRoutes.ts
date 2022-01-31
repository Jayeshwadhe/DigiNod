import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import { IFilterDTO, IUser, IUserInputDTO } from '../../interfaces/IUser';

import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import hospitalService from '../../services/hospitalService';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
    app.use('/hospital', route);
    route.get('/getDashboardForHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getDashboardForHospital: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getDashboardForHospital(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getInvoiceGraphToHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getInvoiceGraphToHospital: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getInvoiceGraphToHospital(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getHospitalGraphAmount',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getHospitalGraphAmount: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getHospitalGraphAmount(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getHospitalGraphOne',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getHospitalGraphOne: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getHospitalGraphOne(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getSecondPieGraphForHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getSecondPieGraphForHospital: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getSecondPieGraphForHospital(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getFundedInvoiceToHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        celebrate({
            query: {
              pageNumber: Joi.number().positive().allow(null),
              pageSize: Joi.number().positive().allow(null),
              filters: Joi.array().allow(null),
            },
          }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getFundedInvoiceToHospital: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getFundedInvoiceToHospital(
                    req.query as unknown as IFilterDTO, 
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.post('/buildupdatetorepaument',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('buildupdatetorepaument: %o', req.body);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.bulkUpdateRepayment(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getByIdToHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getByIdToHospital: %o', req.body);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getByIdToHospital(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/editHospitalPersonalInfo',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('editHospitalPersonalInfo: %o', req.body);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.editHospitalPersonalInfo(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAllInvoicesToHospital',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        celebrate({
            query: {
              pageNumber: Joi.number().positive(),
              pageSize: Joi.number().positive(),
              filters: Joi.array(),
              Status: Joi.string(),
            },
          }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getAllInvoicesToHospital: %o', req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.getAllInvoicesToHospital(
                    req.query as unknown as IFilterDTO, 
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/updatePassword',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        // middlewares.requiredRole('Admin'),
        // middlewares.requiredOrg('DigiSparsh'),
        celebrate({
            body: Joi.object({
                password: Joi.string().required(),
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get updatePassword: %o', req.body, req.query);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.updatePassword(req, req.body as IUserInputDTO, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    // get TPA with Insurer
    route.get('/getTPAwithInsurer', async (req: Request, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');
        logger.debug('TPA with Insurer : %o', req.body);
        try {
            const hospitalServiceInstance = Container.get(hospitalService);
            const { data } = await hospitalServiceInstance.getTPAwithInsurer(req);
            return res.status(201).json({ data });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    // get Insurance
    route.get('/getInsurance', async (req: Request, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');
        logger.debug('get insurance : %o', req.body);
        try {
            const hospitalServiceInstance = Container.get(hospitalService);
            const { data } = await hospitalServiceInstance.getInsurance(req);
            return res.status(201).json({ data });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/invoiceUpload',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('invoiceUpload: %o', req.body);
            try {
                const hospitalServiceInstance = Container.get(hospitalService);
                const { data } = await hospitalServiceInstance.invoiceUpload(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );

    route.use(errors());
}