import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { IPatientLoanDTO, IUser, IFilterDTO } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import practoService from '../../services/practoService';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/patient', route);
  route.get(
    '/getPractoDashboard',
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
      logger.debug('getPractoDashboard: %o', req.query);
      try {
        const practoServiceInstance = Container.get(practoService);
        // var dateFrom = new Date(req.query.dateFrom.toLocaleString());
        // var dateTo = new Date(req.query.dateTo.toLocaleString());

        const { data } = await practoServiceInstance.getPractoDashboard(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get(
    '/getAllInvoices',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      query: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array(),
        isInsured: Joi.boolean(),
        invoiceStatus: Joi.string(),
        dateFrom: JoiDate.date().format('YYYY-MM-DD'),
        dateTo: JoiDate.date().format('YYYY-MM-DD'),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllInvoices: %o', req.query);
      try {
        const practoServiceInstance = Container.get(practoService);
        const { data } = await practoServiceInstance.getAllInvoices(
          req.query as unknown as IFilterDTO,
          req.currentUser as IUser);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get('/getInvoiceById', middlewares.isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('getInvoiceById: %o', req.body);
    try {
      const practoServiceInstance = Container.get(practoService);
      const { data } = await practoServiceInstance.getInvoiceById(req, res);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.post(
    '/postPatientTermLoan',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        isInsured: Joi.boolean(),
        patientName: Joi.string(),
        borrowerName: Joi.string(),
        relation: Joi.any(),
        dateOfBirth: JoiDate.date().format('YYYY-MM-DD'),
        contactNumber: Joi.number(),
        emailId: Joi.string(),
        occupation: Joi.string(),
        permanentAddress: Joi.string(),
        currentAddress: Joi.string(),
        permanentPinCode: Joi.number(),
        permanentCity: Joi.string(),
        permanentState: Joi.string(),
        currentPinCode: Joi.number(),
        currentCity: Joi.string(),
        currentState: Joi.string(),
        companyName: Joi.string(),
        totalIncome: Joi.number(),
        loanAmount: Joi.number(),
        referenceName: Joi.string(),
        contactNoRefPerson: Joi.number(),
        relationship: Joi.string(),
        emailIdRefPerson: Joi.string(),
        hospitalName: Joi.string(),
        bankAssociated: Joi.string(),
        branch: Joi.string(),
        accountNumber: Joi.number().unsafe(),
        IFSCCode: Joi.string(),
        scheme: Joi.number(),
        interest: Joi.number(),
        processingFees: Joi.number(),
        uploadAadharFront: Joi.string(),
        uploadAadharBack: Joi.string(),
        uploadPAN: Joi.string(),
        uploadProof: Joi.string(),
        uploadCancelledCheque: Joi.string(),
        uploadIncomeProof: Joi.string(),
        uploadHospitalBill: Joi.string(),
        uploadBankStatement: Joi.string(),
        uploadInsurancePolicy: Joi.string(),
        uploadOtherDoc: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('postPatientTermLoan: %o', req.body);
      try {
        const practoServiceInstance = Container.get(practoService);
        const { responseCode, data } = await practoServiceInstance.postPatientTermLoan(
          req,
          req.currentUser as IUser,
          req.body as IPatientLoanDTO,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/editInvoice',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      body: Joi.object({
        invoiceStatus: Joi.string(),
        isInsured: Joi.boolean(),
        patientName: Joi.string(),
        borrowerName: Joi.string(),
        relation: Joi.string(),
        dateOfBirth: JoiDate.date().format('YYYY-MM-DD'),
        contactNumber: Joi.number(),
        emailId: Joi.string(),
        occupation: Joi.string(),
        permanentAddress: Joi.string(),
        currentAddress: Joi.string(),
        permanentPinCode: Joi.number(),
        permanentCity: Joi.string(),
        permanentState: Joi.string(),
        currentPinCode: Joi.number(),
        currentCity: Joi.string(),
        currentState: Joi.string(),
        companyName: Joi.string(),
        totalIncome: Joi.number(),
        loanAmount: Joi.number(),
        referenceName: Joi.string(),
        contactNoRefPerson: Joi.number(),
        relationship: Joi.string(),
        emailIdRefPerson: Joi.string(),
        hospitalName: Joi.string(),
        bankAssociated: Joi.string(),
        branch: Joi.string(),
        accountNumber: Joi.number().unsafe(),
        IFSCCode: Joi.string(),
        scheme: Joi.number(),
        interest: Joi.number(),
        processingFees: Joi.number(),
        uploadAadharFront: Joi.string(),
        uploadAadharBack: Joi.string(),
        uploadPAN: Joi.string(),
        uploadProof: Joi.string(),
        uploadCancelledCheque: Joi.string(),
        uploadIncomeProof: Joi.string(),
        uploadHospitalBill: Joi.string(),
        uploadBankStatement: Joi.string(),
        uploadInsurancePolicy: Joi.string(),
        uploadOtherDoc: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editInvoice: %o', req.body);
      try {
        const practoServiceInstance = Container.get(practoService);
        const { data } = await practoServiceInstance.editInvoice(
          req,
          req.currentUser as IUser,
          req.body as IPatientLoanDTO,
        );
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getProductByOrg',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getProductByOrg: %o', req.body);
      try {
        const practoServiceInstance = Container.get(practoService);
        const { data } = await practoServiceInstance.getProductByOrg(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.use(errors());
};
