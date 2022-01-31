import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import { IUser, IUserInputDTO, IFilterDTO } from '../../interfaces/IUser';

import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import aggregatorService from '../../services/aggregatorService';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
    app.use('/aggregator', route);
    route.get('/getDashboardForAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getDashboardForAggregator: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getDashboardForAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getInvoiceGraphToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getInvoiceGraphToAggregator: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getInvoiceGraphToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAggregatorGraphAmount',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getAggregatorGraphAmount: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getAggregatorGraphAmount(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAggregatorGraphOne',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getAggregatorGraphOne: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getAggregatorGraphOne(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getSecondPieGraphForAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getSecondPieGraphForAggregator: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getSecondPieGraphForAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.post('/addHospitalByAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        // celebrate({
        //     body: {
        //         hospitalName: Joi.string(),
        //         CINNumber: Joi.string(),
        //         GSTNumber: Joi.string(),
        //         PANNumber: Joi.string(),
        //         dateOfRegistration: Joi.date(),
        //         email: Joi.string().required(),
        //         password: Joi.string().required(),
        //         name: Joi.string().required(),
        //         address: Joi.array().items(Joi.object().keys(
        //             { street: Joi.string(), state: Joi.string(), city: Joi.string(), pinCode: Joi.number(), country: Joi.string() })
        //         ),
        //         mobileNumber: Joi.number().required()
        //     },
        // }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('addHospitalByAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.addHospitalByAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAllHospitalToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        celebrate({
            query: {
                pageNumber: Joi.number().positive(),
                pageSize: Joi.number().positive(),
                filters: Joi.array()
            }
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getAllHospitalToAggregator: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getAllHospitalToAggregator(
                    req.query as unknown as IFilterDTO,
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.post('/splitForAgri',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        // celebrate({
        //   body: {
        //     HospitalROI: Joi.any(),
        //     AggregetorLoan: Joi.any(),
        //     HospitalLoan: Joi.any(),
        //     AggregeorId: Joi.any(),
        //   }
        // }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('splitForAgri: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.splitForAgri(req, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getHospitalByIdToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getHospitalByIdToAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getHospitalByIdToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getByIdToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getByIdToAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getByIdToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/editHospitalProfileByAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('editHospitalProfileByAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.editHospitalProfileByAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.put('/editAggregatorProfile',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('editAggregatorProfile: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.editAggregatorProfile(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.delete('/deleteHospitalByAggregator',
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('deleteHospitalByAggregator: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.deleteHospitalByAggregator(req, res);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        }
    );
    route.get('/aggregatorInvoices',
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
            logger.debug('aggregatorInvoices: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getInvoiceByAggregatorID(
                    req.query as unknown as IFilterDTO,
                    req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getInvoiceByIdToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getInvoiceByIdToAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getInvoiceByIdToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getAllInvoicebyHospitalToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getAllInvoicebyHospitalToAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getAllInvoicebyHospitalToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getRepaidInvoiceToAggregator',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getRepaidInvoiceToAggregator: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getRepaidInvoiceToAggregator(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getFundedInvoiceToAggregatorV1',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        celebrate({
            query: {
                _id: Joi.string(),
                pageNumber: Joi.number().positive().allow(null),
                pageSize: Joi.number().positive().allow(null),
                filters: Joi.array().allow(null),
            },
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('getFundedInvoiceToAggregatorV1: %o', req.query);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.getFundedInvoiceToAggregatorV1(
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
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.bulkUpdateRepayment(req, res, req.currentUser as IUser);
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
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.updatePassword(req, req.body as IUserInputDTO, req.currentUser as IUser);
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
            const aggregatorServiceInstance = Container.get(aggregatorService);
            const { data } = await aggregatorServiceInstance.getTPAwithInsurer(req);
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
            const aggregatorServiceInstance = Container.get(aggregatorService);
            const { data } = await aggregatorServiceInstance.getInsurance(req);
            return res.status(201).json({ data });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/invoiceUploadagv1',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            logger.debug('invoiceUploadagv1: %o', req.body);
            try {
                const aggregatorServiceInstance = Container.get(aggregatorService);
                const { data } = await aggregatorServiceInstance.invoiceUploadagv1(req, res, req.currentUser as IUser);
                return res.status(201).json({ data });
            } catch (e) {
                logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );
    route.get('/getCity', async (req: Request, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');
        logger.debug('getCity : %o', req.query);
        try {
            const aggregatorServiceInstance = Container.get(aggregatorService);
            const { data } = await aggregatorServiceInstance.getCity(req);
            return res.status(201).json({ data });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.use(errors());
}