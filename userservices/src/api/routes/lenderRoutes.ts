import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import { IUser, IUserInputDTO, IFilterDTO } from '../../interfaces/IUser';

import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import lenderService from '../../services/lenderService';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
    app.use('/lender', route);
    route.get('/getDashboardForLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getDashboardForLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getDashboardForLender(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getInvoiceGraphToLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getInvoiceGraphToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getInvoiceGraphToLender(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getLenderGraphAmount',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getLenderGraphAmount: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getLenderGraphAmount(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getLenderGraphOne',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getLenderGraphOne: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getLenderGraphOne(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getSecondPieGraphForLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getSecondPieGraphForLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getSecondPieGraphForLender(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAllInvoicesToLender',
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
            logger.debug('getAllInvoicesToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getAllInvoicesToLender(
                    req.query as unknown as IFilterDTO,
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getInvoiceByIdToLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getInvoiceByIdToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getInvoiceByIdToLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getHospitalToLender',
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
            logger.debug('getHospitalToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getHospitalToLender(
                    req.query as unknown as IFilterDTO,
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getHospitalByIdToLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getHospitalByIdToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getHospitalByIdToLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getByIdToLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getByIdToLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getByIdToLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/editLenderProfile',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('editLenderProfile: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.editLenderProfile(req, req.currentUser as IUser);
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
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.updatePassword(req, req.body as IUserInputDTO, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.get('/getTransactionDataforLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getTransactionDataforLender: %o', req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.getTransactionDataforLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/postCreditLimitFromLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get postCreditLimitFromLender: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.postCreditLimitFromLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.post('/calculateInterestfromLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get calculateInterestfromLender: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.calculateInterestfromLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.put('/postFromLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get postFromLender: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.postFromLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.put('/postRejectedFromLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get postRejectedFromLender: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.postRejectedFromLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.put('/fundedFromLenderDisbursed',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get fundedFromLenderDisbursed: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.fundedFromLenderDisbursed(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.put('/postRepaidFromLender',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get postRepaidFromLender: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.postRepaidFromLender(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.put('/repaymentConfirmation',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('get repaymentConfirmation: %o', req.body, req.query);
            try {
                const lenderServiceInstance = Container.get(lenderService);
                const { data } = await lenderServiceInstance.repaymentConfirmation(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
}