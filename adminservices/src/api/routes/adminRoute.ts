import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import adminService from '../../services/adminService';
import {
  IUserInputDTO,
  IAggregatorDTO,
  IVendorDTO,
  ILenderDTO,
  IHospitalDTO,
  IPatientLoanDTO,
  IUser,
  IFilterDTO
} from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, Joi, errors } from 'celebrate';
import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import middlewares from '../middlewares';
import excel from 'exceljs';

const route = Router();

export default (app: Router) => {
  app.use('/admin', route);

  //get All users to admin/ user master/ with pagination/search
  route.get(
    '/getAllUsers',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      query: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array(),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllUsers: %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getAllUsers(req.query as unknown as IFilterDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getAllLenderToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getAllLenderToAdmin: %o');
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getAllLenderToAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  // get user by ID
  route.get(
    '/getUserByIdToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get getUserByIdToAdmin: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getUserByIdToAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  //sign up user by admin with common user info
  route.post(
    '/addUserByAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        organizationId: Joi.string().required(),
        name: Joi.string().required(),
        address: Joi.array().items(
          Joi.object().keys({
            street: Joi.string(),
            state: Joi.string(),
            city: Joi.string(),
            pinCode: Joi.number(),
            country: Joi.string(),
          }),
        ),
        mobileNumber: Joi.number().required(),
        accessControl: Joi.any().allow(null),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get addUserByAdmin: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { responseCode, data } = await adminServiceInstance.addUserByAdmin(
          req.body as IUserInputDTO,
          req.currentUser as IUser,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.put(
    '/updatePassword',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get updatePassword: %o', req.body, req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.updatePassword(
          req,
          req.body as IUserInputDTO,
          req.currentUser as IUser,
        );
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  // update additional aggregator details
  route.post(
    '/updateAggregator',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        CINNumber: Joi.string(),
        TotalNoOfHospital: Joi.number(),
        NoOfTPAsAssociated: Joi.number(),
        noOfICompAsd: Joi.number(),
        ROIForAggregator: Joi.number(), 
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('get updateAggregator: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { responseCode, data } = await adminServiceInstance.updateAggregator(req,
          req.body as IAggregatorDTO,
          req.currentUser as IUser,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  // update additional vendor details
  route.post(
    '/updateVendor',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        userId: Joi.string().required(),
        VednorType: Joi.string(),
        GSTNumber: Joi.string(),
        PANNumber: Joi.string(),
        bankName: Joi.string(),
        accountNumber: Joi.string(),
        IFSCCode: Joi.string(),
        authorisedPersonName: Joi.string(),
        contactDetailsForAuthPerson: Joi.number(),
        PANNumberForAuthPerson: Joi.string(),
        relationShip: Joi.string(),
        RateOfDeduction: Joi.number(),
        NoOfDaysCreditPeriod: Joi.number(),
        SanctionLimit: Joi.number(),
        HospitalName: Joi.string(),
        HospitalId: Joi.string(),
        LTV: Joi.number(),
        KycDocument: Joi.string(),
        Other: Joi.string(),
        ParriPassu: Joi.string(),
        LastTwoYrBank: Joi.string(),
        LastAudFin: Joi.string(),
        LastTwoFin: Joi.string(),
        RegCert: Joi.string(),
        GstCert: Joi.string(),
        AddrProof: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('updateVendor: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { responseCode, data } = await adminServiceInstance.updateVendor(
          req.body as IVendorDTO,
          req.currentUser as IUser,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  // update additional lender details
  route.post(
    '/updateLender',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        userId: Joi.string().required(),
        LenderType: Joi.string(),
        GSTNumber: Joi.string(),
        PANNumber: Joi.string(),
        bankNameDisb: Joi.string(),
        accountNumberDisb: Joi.string(),
        IFSCCodeDisb: Joi.string(),
        authorisedPersonName: Joi.string(),
        contactDetailsForAuthPerson: Joi.number(),
        bankNameCollection: Joi.string(),
        accountNumberCollection: Joi.string(),
        IFSCCodeCollection: Joi.string(),
        PANNumberForAuthPerson: Joi.string(),
        relationShip: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('updateLender: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { responseCode, data } = await adminServiceInstance.updateLender(
          req.body as ILenderDTO,
          req.currentUser as IUser,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  // update additional hospital details
  route.post(
    '/updateHospital',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        LTV: Joi.number(),
        HospitalType: Joi.string(),
        GSTNumber: Joi.string(),
        PANNumber: Joi.string(),
        bankName: Joi.string(),
        accountNumber: Joi.string(),
        IFSCCode: Joi.string(),
        authorisedPersonName: Joi.string(),
        contactDetailsForAuthPerson: Joi.number(),
        PANNumberForAuthPerson: Joi.string(),
        relationShip: Joi.string(),
        LenderId: Joi.string(),
        LenderName: Joi.string(),
        Visibility: Joi.string(),
        CINNumber: Joi.number(),
        GSTcertificate: Joi.string(),
        DateOfRegistration: JoiDate.date().format('YYYY-MM-DD'),
        HospitalRegistrationCertificate: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('updateHospital: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { responseCode, data } = await adminServiceInstance.updateHospital(req,
          req.body as IHospitalDTO,
          req.currentUser as IUser,
        );
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/editUserByAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editUserByAdmin: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.editUserByAdmin(
          req.body as IUserInputDTO,
          req.currentUser as IUser,
          req,
        );
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.delete(
    '/deleteUserByAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('deleteUserByAdmin: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.deleteUserByAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getAllInvoicesToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      query: {
        pageNumber: Joi.number().positive().allow(null),
        pageSize: Joi.number().positive().allow(null),
        filters: Joi.array().allow(null),
        isInsured: Joi.boolean().allow(null),
        invoiceStatus: Joi.string().allow(null),
        dateFrom: JoiDate.date().allow(null),
        dateTo: JoiDate.date().allow(null),
        organizationId: Joi.string().allow(null),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllInvoicesToAdmin: %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getAllInvoicesToAdmin(req.query as unknown as IFilterDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getClaimInvoicesToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      query: {
        pageNumber: Joi.number().positive().allow(null),
        pageSize: Joi.number().positive().allow(null),
        filters: Joi.array().allow(null),
        Status: Joi.string().allow(null),
        organizationId: Joi.string().allow(null),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getClaimInvoicesToAdmin: %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getClaimInvoicesToAdmin(req.query as unknown as IFilterDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getClaimInvoiceByIdToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getClaimInvoiceByIdToAdmin: %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getClaimInvoiceByIdToAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/getInvoiceByIdToAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getInvoiceByIdToAdmin: %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getInvoiceByIdToAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/editInvoiceByAdmin',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.requiredRole('Admin'),
    middlewares.requiredOrg('DigiSparsh'),
    celebrate({
      body: Joi.object({
        invoiceStatus: Joi.boolean(),
        digiComment: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editInvoiceByAdmin: %o', req.body);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.editInvoiceByAdmin(
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

  // get merchant list in NICT
  route.get(
    '/getMerchantList',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      query: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        dateFrom: JoiDate.date(),
        dateTo: JoiDate.date(),
        searchTerm: Joi.string()
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('merchant list : %o', req.query);
      try {
        const adminServiceInstance = Container.get(adminService);
        const { data } = await adminServiceInstance.getMerchantList(req.query as unknown as IFilterDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // get merchant by Id in NICT
  route.get('/getMerchantById', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('merchant by Id : %o', req.body);
    try {
      const adminServiceInstance = Container.get(adminService);
      const { data } = await adminServiceInstance.getMerchantById(req);
      return res.status(201).json({ data });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  // NICT api to update loans to Admin
  route.put('/updateLoansToAdmin', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('update loan to Admin : %o', req.body);
    try {
      const adminServiceInstance = Container.get(adminService);
      const { updatedData } = await adminServiceInstance.updateLoansToAdmin(req);
      return res.status(201).json({ updatedData });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/downloadTemplate', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('downloadTemplate: %o');
    try {
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('Sheet1');
      let Sheet1 = [];
      worksheet.columns = [
        { header: 'KOCode', key: 'KOCode', width: 25 },
        { header: 'BankAssociated', key: 'BankAssociated', width: 25 },
        { header: 'OfficeName', key: 'OfficeName', width: 25 },
        { header: 'Branch', key: 'Branch', width: 25 },
        { header: 'FullName', key: 'FullName', width: 25 },
        { header: 'MobileNumber', key: 'MobileNumber', width: 25 },
        {
          header: 'AlternateContactNumber',
          key: 'AlternateContactNumber',
          width: 25,
        },
        { header: 'EmailId', key: 'EmailId', width: 25 },
        { header: 'ApplicantsPanNo', key: 'ApplicantsPanNo', width: 25 },
        {
          header: 'ApplicantsAadhaarNo',
          key: 'ApplicantsAadhaarNo',
          width: 25,
        },
        { header: 'DateOfBirth', key: 'DateOfBirth', width: 25 },
        { header: 'District', key: 'District', width: 25 },
        { header: 'City', key: 'City', width: 25 },
        { header: 'CurrentAddress', key: 'CurrentAddress', width: 25 },
        { header: 'State', key: 'State', width: 25 },
        { header: 'Pincode', key: 'Pincode', width: 25 },
        { header: 'AccountNumber', key: 'AccountNumber', width: 25 },
        { header: 'IFSCCode', key: 'IFSCCode', width: 25 },
        { header: 'AccountHolderName', key: 'AccountHolderName', width: 25 },
        { header: 'LoanAmount', key: 'LoanAmount', width: 25 },
        { header: 'EMIAmount', key: 'EMIAmount', width: 25 },
        { header: 'Scheme', key: 'Scheme', width: 25 },
        { header: 'ProcessingFees', key: 'ProcessingFees', width: 25 },
        { header: 'Interest', key: 'Interest', width: 25 },
        { header: 'Lender', key: 'Lender', width: 25 },
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'new_data_template.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  

  route.use(errors());
};
