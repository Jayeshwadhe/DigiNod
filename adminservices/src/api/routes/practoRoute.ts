import e, { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { IFilterDTO, IPatientLoanDTO, IUser } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);
import practoService from '../../services/practoService';
import MerchantAdminService from '../../services/MerchantAdminService';
import middlewares from '../middlewares';
import excel from 'exceljs';

import multer from 'multer';

import excelToJson from 'convert-excel-to-json';

import moment from 'moment';

import decompress from 'decompress';

import path from 'path';

import fs from 'fs';
import { patientLoanRepaymentDC } from '@/models/patientLoanRepayment';

const route = Router();

const storage = multer.diskStorage({
  destination: './upload/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const uploaders = multer({
  storage: storage,
});

export default (app: Router) => {
  app.use('/patient', route);
  route.get('/downloadloan', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('getPractoDashboard: %o', req.body);
    try {
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('Sheet1');
      let Sheet1 = [];
      worksheet.columns = [
        { header: 'invoiceId', key: 'invoiceId', width: 25 },
        { header: 'isInsured', key: 'isInsured', width: 25 },
        { header: 'Status', key: 'Status', width: 25 },
        { header: 'loanAmount', key: 'loanAmount', width: 25 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'email', key: 'email', width: 25 },
        { header: 'Down_Payment_Amount', key: 'Down_Payment_Amount', width: 25 },
        {
          header: 'interest_Amount',
          key: 'interest_Amount',
          width: 25,
        },
        {
          header: 'PF_Amount',
          key: 'PF_Amount',
          width: 25,
        },
        { header: 'Franking_Amount', key: 'Franking_Amount', width: 25 },
        { header: 'GST_Amount', key: 'GST_Amount', width: 25 },
        { header: 'EMI_Tenure', key: 'EMI_Tenure', width: 25 },
        { header: 'EMI_Amount', key: 'EMI_Amount', width: 25 },
        { header: 'Approval_Date', key: 'Approval_Date', width: 25 },
        { header: 'Disbursed_Amount', key: 'Disbursed_Amount', width: 25 },
        { header: 'Disbursement_Date', key: 'Disbursement_Date', width: 25 },
        // { header: 'Unique_Ref_No', key: 'Approval_Date', width: 25 },
        { header: 'Cash_Out_Flow_Amount', key: 'Cash_Out_Flow_Amount', width: 25 },
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'sample_disbursement.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.get('/downloadTemplate', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('downloadTemplate: %o', req.body);
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
        { header: 'AlternateContactNumber', key: 'AlternateContactNumber', width: 25 },
        { header: 'EmailId', key: 'EmailId', width: 25 },
        { header: 'ApplicantsPanNo', key: 'ApplicantsPanNo', width: 25 },
        { header: 'ApplicantsAadhaarNo', key: 'ApplicantsAadhaarNo', width: 25 },
        { header: 'DateOfBirth', key: 'DateOfBirth', width: 25 },
        { header: 'District', key: 'District', width: 25 },
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
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'downloadTemplate.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/uploaddisburs', async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('uploaddisbursment: %o', req.body);
    try {
      var dirPath;
      var destPath;
      var numFiles;
      var filesarr;
      var filepaths;
      var fileWithExt = [];

      uploaders.fields([{ name: 'uploadfile' }, { name: 'uploadzip' }])(req, res, err => {
        dirPath = './upload/' + req.files['uploadfile'][0].filename;
        var ran = Math.floor(Math.random() * 90000) + 10000;

        const excelData = excelToJson({
          sourceFile: './upload/' + req.files['uploadfile'][0].filename,
          sheets: [
            {
              // Excel Sheet Name
              name: 'Sheet1',
              // Header Row -> be skipped and will not be present at our result object.
              header: {
                rows: 1,
              },
              // Mapping columns to keys
              columnToKey: {
                '*': '{{columnHeader}}',
              },
            },
          ],
        });

        if (!excelData.Sheet1.length) {
          return res.status(400).json({
            success: false,
            error: 'Blank sheet not uploaded',
          });
        }

        var arr = [];

        async function invoicer() {
          try {
            for (var i = 0; i < excelData.Sheet1.length; i++) {
              console.log(
                excelData.Sheet1[i].invoiceId,
                // excelData.Sheet1[i].Status &&
                // excelData.Sheet1[i].loanAmount &&
                // excelData.Sheet1[i].name &&
                // excelData.Sheet1[i].Down_Payment_Amount &&
                // excelData.Sheet1[i].Subvention_Amount &&
                // excelData.Sheet1[i].PF_Amount &&
                // excelData.Sheet1[i].Franking_Amount &&
                // excelData.Sheet1[i].GST_Amount &&
                // excelData.Sheet1[i].EMI_Tenure &&
                // excelData.Sheet1[i].EMI_Amount &&
                // excelData.Sheet1[i].Approval_Date &&
                // excelData.Sheet1[i].Disbursed_Amount &&
                // excelData.Sheet1[i].Disbursement_Date &&
                // excelData.Sheet1[i].Unique_Ref_No &&
                // excelData.Sheet1[i].Cash_Out_Flow_Amount,
              );
              if (
                excelData.Sheet1[i].invoiceId &&
                // excelData.Sheet1[i].Status &&
                // excelData.Sheet1[i].loanAmount &&
                // excelData.Sheet1[i].name &&
                // excelData.Sheet1[i].Down_Payment_Amount &&
                // excelData.Sheet1[i].Subvention_Amount &&
                // excelData.Sheet1[i].PF_Amount &&
                // excelData.Sheet1[i].Franking_Amount &&
                // excelData.Sheet1[i].GST_Amount &&
                // excelData.Sheet1[i].EMI_Tenure &&
                // excelData.Sheet1[i].EMI_Amount &&
                // excelData.Sheet1[i].Approval_Date &&
                // excelData.Sheet1[i].Disbursed_Amount &&
                excelData.Sheet1[i].Disbursement_Date
                // excelData.Sheet1[i].Unique_Ref_No &&
                // excelData.Sheet1[i].Cash_Out_Flow_Amount
              ) {
                let invoiceId = excelData.Sheet1[i].invoiceId;
                //  let claimAmount = excelData.Sheet1[i].PatientBillAmount;
                var count = 0;
                count++;
                var ranDate = new Date();
                let randate = ('0' + ranDate.getDate()).slice(-2);
                let ranmonth = ('0' + (ranDate.getMonth() + 1)).slice(-2);
                let ranyear = ranDate.getFullYear();
                let ranhours = ranDate.getHours();
                let ranminutes = ranDate.getMinutes();
                let ranseconds = ranDate.getSeconds();

                var finalRanDate =
                  ranyear + '-' + ranmonth + '-' + randate + '-' + ranhours + '-' + ranminutes + '-' + ranseconds;

                destPath = `./upload/${finalRanDate}-${ran}`;

                // const practoServiceInstance = Container.get(practoService);
                // const { repaymentdData } = await practoServiceInstance.getInvoiceById(invoiceId);

                // // const repaymentdData = await repayment.findOne({
                // //   LL_Code: LL_Code,
                // // });

                // if (repaymentdData) {
                //   return res.status(400).json({
                //     success: false,
                //     message: `LL_Code ${invoiceId} already exists`,
                //   });
                // }

                arr[i] = invoiceId;

                var lenderStatus = excelData.Sheet1[i].Status;
                var loanAmount = excelData.Sheet1[i].loanAmount;
                var Down_Payment_Amount = excelData.Sheet1[i].Down_Payment_Amount;
                var interest_Amount = excelData.Sheet1[i].interest_Amount;
                var PF_Amount = excelData.Sheet1[i].PF_Amount;
                var Franking_Amount = excelData.Sheet1[i].Franking_Amount;
                var GST_Amount = excelData.Sheet1[i].GST_Amount;
                var EMI_Tenure = excelData.Sheet1[i].EMI_Tenure;
                var EMI_Amount = excelData.Sheet1[i].EMI_Amount;
                var Approval_Date = excelData.Sheet1[i].Approval_Date;
                var Disbursed_Amount = excelData.Sheet1[i].Disbursed_Amount;
                var Disbursement_Date = excelData.Sheet1[i].Disbursement_Date;
                var Cash_Out_Flow_Amount = excelData.Sheet1[i].Cash_Out_Flow_Amount;

                var date_regex = moment(Disbursement_Date, 'MM/DD/YYYY', true);

                if (!date_regex.isValid()) {
                  return res.status(400).send({
                    success: false,
                    message: `Please fill mm/dd/yyyy format  ${Disbursement_Date} whose invoiceId is ${invoiceId} `,
                  });
                } else {
                  var Disbursement_Date = date_regex.toISOString();
                }

                var date_regexx = moment(Approval_Date, 'MM/DD/YYYY', true);

                if (!date_regexx.isValid()) {
                  return res.status(400).send({
                    success: false,
                    message: `Please fill mm/dd/yyyy format  ${Approval_Date} whose invoiceId is ${invoiceId} `,
                  });
                } else {
                  var Approval_Date = date_regexx.toISOString();
                }

                const files = await decompress(dirPath, destPath);
                numFiles = files.length;
                filesarr = [];
                filepaths = [];
                const usrObj = {
                  lenderStatus,
                  loanAmount,
                  Down_Payment_Amount,
                  interest_Amount,
                  PF_Amount,
                  Franking_Amount,
                  GST_Amount,
                  EMI_Tenure,
                  EMI_Amount,
                  Approval_Date,
                  Disbursed_Amount,
                  Disbursement_Date,
                  Cash_Out_Flow_Amount,
                  invoiceStatus: 'Funded',
                };
                if (req.files['uploadfile'][0].filename != undefined) {
                  const practoServiceInstance = Container.get(practoService);
                  const { repaymentupdate } = await practoServiceInstance.updateInvoiceById(invoiceId, usrObj);

                  //   const newData = new repayment(usrObj);
                  //   const Invoicedata = await newData.save();
                }
              } else {
                return res.status(400).json({
                  success: false,
                  message: 'Please fill all the fields in excel, missing fields',
                });
              }
            }
            fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);
            return res.status(200).json({ success: true, message: 'uploaded and updated' });
          } catch (error) {
            return res.status(400).send({
              success: false,
              error,
            });
          }
        }
        invoicer();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/downloadrepayment', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('getPractoDashboard: %o', req.body);
    try {
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('Sheet1');
      let Sheet1 = [];
      worksheet.columns = [
        { header: 'invoiceId', key: 'invoiceId', width: 25 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'mobile', key: 'mobile', width: 25 },
        { header: 'EMI_Amount', key: 'EMI_Amount', width: 25 },
        { header: 'status', key: 'status', width: 25 },
        { header: 'reason', key: 'reason', width: 25 },
        { header: 'Bounce_Charges', key: 'Bounce_Charges', width: 25 },
        { header: 'Delay_Charges', key: 'Delay_Charges', width: 25 },
        { header: 'Total_to_be_collected', key: 'Total_to_be_collected', width: 25 },
        { header: 'EMI_Number', key: 'EMI_Number', width: 25 },
        { header: 'active', key: 'active', width: 25 },
        { header: 'total_outstanding', key: 'total_outstanding', width: 25 },
        { header: 'Repayment_Date', key: 'Repayment_Date', width: 25 },
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'sample_Repayment.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.get('/downloadmtl', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('downloadmtl: %o', req.body);
    try {
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('Sheet1');
      let Sheet1 = [];
      worksheet.columns = [
        { header: 'LLCode', key: 'LLCode', width: 25 }, //
        { header: 'KoCode', key: 'KoCode', width: 25 },
        { header: 'FullName', key: 'FullName', width: 25 }, //
        { header: 'ApplicantsPanNo', key: 'ApplicantsPanNo', width: 25 }, //
        {
          header: 'ApplicantsAadhaarNo',
          key: 'ApplicantsAadhaarNo', //
          width: 25,
        },
        { header: 'DateOfBirth', key: 'DateOfBirth', width: 25 }, //
        { header: 'Bank', key: 'Bank', width: 25 }, //
        { header: 'CurrentAddress', key: 'CurrentAddress', width: 25 }, //
        { header: 'District', key: 'District', width: 25 }, //
        { header: 'State', key: 'State', width: 25 }, //
        { header: 'Pincode', key: 'Pincode', width: 25 }, //
        {
          header: 'MobileNumber', //
          key: 'MobileNumber',
          width: 25,
        },
        {
          header: 'EmailId',
          key: 'EmailId', //
          width: 25,
        },
        { header: 'LoanAmount', key: 'LoanAmount', width: 25 }, //
        { header: 'EMI_Amount', key: 'EMI_Amount', width: 25 }, //
        { header: 'Campaign', key: 'Campaign', width: 25 }, //
        { header: 'Action_needed', key: 'Action_needed', width: 25 }, //
        { header: 'Status', key: 'Status', width: 25 }, //
        { header: 'Cases', key: 'Cases', width: 25 }, //
        { header: 'Lender', key: 'Lender', width: 25 }, //
        { header: 'Application_date', key: 'Application_date', width: 25 }, //
        { header: 'Disbursement_Date', key: 'Disbursement_Date', width: 25 }, //
        { header: 'Repayment_Date_1st', key: 'Repayment_Date_1st', width: 25 }, //
        { header: 'Repayment_Date_2st', key: 'Repayment_Date_2st', width: 25 },
        { header: 'Repayment_Date_3st', key: 'Repayment_Date_3st', width: 25 },
        { header: 'Repayment_Date_4st', key: 'Repayment_Date_4st', width: 25 },
        { header: 'Repayment_Date_5st', key: 'Repayment_Date_5st', width: 25 },
        { header: 'Repayment_Date_6st', key: 'Repayment_Date_6st', width: 25 },
        { header: 'Repayment_Date_7st', key: 'Repayment_Date_7st', width: 25 },
        { header: 'Repayment_Date_8st', key: 'Repayment_Date_8st', width: 25 },
        { header: 'Repayment_Date_9st', key: 'Repayment_Date_9st', width: 25 },
        {
          header: 'Repayment_Date_10st',
          key: 'Repayment_Date_10st',
          width: 25,
        },
        {
          header: 'Repayment_Date_11st',
          key: 'Repayment_Date_11st',
          width: 25,
        },
        {
          header: 'Repayment_Date_12th', //
          key: 'Repayment_Date_12th',
          width: 25,
        },
        { header: 'Loan_End_date', key: 'Loan_End_date', width: 25 }, //
        { header: 'Nach_Registration', key: 'Nach_Registration', width: 25 }, //
        { header: 'Scheme', key: 'Scheme', width: 25 }, //
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'sample_repayment.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.get(
    '/getExcelLoanApprove',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    celebrate({
      query: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        dateFrom: JoiDate.date(),
        dateTo: JoiDate.date(),
        searchTerm: Joi.string(),
        Status: Joi.string(),
      },
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getExcelLoanApprove: %o', req.query);
      try {
        const practoServiceInstance = Container.get(practoService);
        var InvoiceNumberdata = await practoServiceInstance.getAllApprovedloans(req.query as unknown as IFilterDTO);
        if (InvoiceNumberdata) {
          return res.status(200).json({
            success: true,
            data: InvoiceNumberdata.data.products,

            numberOfPages: InvoiceNumberdata.data.numberOfPages,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: 'no data list is empty',
          });
        }
      } catch (error) {
        // console.log("signup error:", error);
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/dataUploadByExcelLoan',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('dataUploadByExcelLoan: %o', req.body);
      try {
        var dirPath;
        var destPath;
        var numFiles;
        var filesarr;
        var filepaths;
        var fileWithExt = [];

        uploaders.fields([{ name: 'uploadfile' }, { name: 'uploadzip' }])(req, res, err => {
          dirPath = './upload/' + req.files['uploadfile'][0].filename;
          var ran = Math.floor(Math.random() * 90000) + 10000;
          var update = [];
          var newadded = [];

          const excelData = excelToJson({
            sourceFile: './upload/' + req.files['uploadfile'][0].filename,
            sheets: [
              {
                // Excel Sheet Name
                name: 'Sheet1',
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                  rows: 1,
                },
                // Mapping columns to keys
                columnToKey: {
                  '*': '{{columnHeader}}',
                },
              },
            ],
          });

          if (!excelData.Sheet1.length) {
            return res.status(400).json({
              success: false,
              error: 'Blank sheet not uploaded',
            });
          }

          var arr = [];
          async function invoicer() {
            for (var i = 0; i < excelData.Sheet1.length; i++) {
              var KOcode = excelData.Sheet1[i].KOCode;

              var KOCode: string = KOcode;
              if (!KOCode) {
                return res.status(400).send({
                  success: false,
                  error: `Please Fill KO-Code Field `,
                });
              }
              var count = 0;
              count++;

              arr[i] = KOCode;

              var OfficeName = excelData.Sheet1[i].OfficeName;
              var District = excelData.Sheet1[i].District;
              var AlternateContactNumber = excelData.Sheet1[i].AlternateContactNumber;
              var FullName = excelData.Sheet1[i].FullName;
              var ApplicantsPanNo = excelData.Sheet1[i].ApplicantsPanNo;
              var IFSCCode = excelData.Sheet1[i].IFSCCode;
              var AccountHolderName = excelData.Sheet1[i].AccountHolderName;
              var AadhaarNo = excelData.Sheet1[i].ApplicantsAadhaarNo;
              var Branch = excelData.Sheet1[i].Branch;
              var BranchNO = excelData.Sheet1[i].BranchCode;
              var Occupation = excelData.Sheet1[i].Occupation;
              var BankAssociated = excelData.Sheet1[i].Bank;
              var Account = excelData.Sheet1[i].AccountNumber;
              var Mobile = excelData.Sheet1[i].MobileNumber;
              var EmailId = excelData.Sheet1[i].EmailId;
              var EMIAmount = excelData.Sheet1[i].EMIAmount;
              if (EMIAmount) {
                EMIAmount = Math.round(EMIAmount);
              }
              var Lender = excelData.Sheet1[i].Lender;
              var LoanAmount = excelData.Sheet1[i].LoanAmount;
              var Pin = excelData.Sheet1[i].Pincode;
              var Scheme = excelData.Sheet1[i].Scheme;
              var ProcessingFees = excelData.Sheet1[i].ProcessingFees;
              var City = excelData.Sheet1[i].City;
              var State = excelData.Sheet1[i].State;
              var Country = excelData.Sheet1[i].Country;
              var Interest = excelData.Sheet1[i].Interest;
              var CurrentAddress = excelData.Sheet1[i].CurrentAddress;
              var ROIData = excelData.Sheet1[i].ROI;
              var Status = excelData.Sheet1[i].Status;
              var ActionNeeded = excelData.Sheet1[i].ActionNeeded;
              var RepaymentDate1st = excelData.Sheet1[i].RepaymentDate1st;
              var RepaymentDate2nd = excelData.Sheet1[i].RepaymentDate2nd;
              var RepaymentDate3rd = excelData.Sheet1[i].RepaymentDate3rd;
              var RepaymentDate4th = excelData.Sheet1[i].RepaymentDate4th;
              var RepaymentDate5th = excelData.Sheet1[i].RepaymentDate5th;
              var RepaymentDate6th = excelData.Sheet1[i].RepaymentDate6th;
              var LLCode = excelData.Sheet1[i].LLCode;
              var ApplicationDate = excelData.Sheet1[i].ApplicationDate;
              var DisbursementDate = excelData.Sheet1[i].DisbursementDate;

              var DateOfBirth = excelData.Sheet1[i].DateOfBirth;
              if(DateOfBirth){
                if (typeof DateOfBirth === 'string') {
                  return res.status(400).send({
                    success: false,
                    error: `Please fill dd/mm/yyyy format  ${DateOfBirth} whose KOCode is ${KOCode} `,
                  });
                }
                var date2 = new Date(DateOfBirth);
                var finalDate2 = new Date(date2.setDate(date2.getDate() + 1));
                DateOfBirth = new Date(finalDate2);
              }
             

              // var dateStringA = excelData.Sheet1[i].DateOfBirth;
              // var DateOfBirth
              // var dashConvert= dateStringA.replace(/-/g,"/")
              //   var dateParts = dashConvert.split("/");
              //     var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
              //     DateOfBirth = new Date(dateObject.setDate(dateObject.getDate() + 1));

              if (BranchCode) {
                var BranchCode = BranchNO.toString();
              }
              if (AadhaarNo) {
                var ApplicantsAadhaarNo = AadhaarNo.toString();
              }
              if (Mobile) {
                var MobileNumber = Mobile.toString();
              }
              if (Account) {
                var AccountNumber = Account.toString();
              }
              if (Pin) {
                var Pincode = Pin.toString();
              }

              if (ProcessingFees) {
                var ProcessingFees = ProcessingFees;
              }

              if (ROI) {
                var ROI = ROIData;
              }
              if (Lender) {
                var Lender = Lender;
              }

              const practoServiceInstance = Container.get(practoService);
              const InvoiceNumberdata = await practoServiceInstance.getLoanByKoCode(KOCode);

              // const InvoiceNumberdata = await loan.findOne({ KOCode: KOCode });

              if (InvoiceNumberdata.loan) {
                let data: any = {};

                if (BranchCode) {
                  data.BranchCode = BranchCode;
                }
                if (AccountNumber) {
                  data.AccountNumber = AccountNumber;
                }
                if (Lender) {
                  data.Lender = Lender;
                }
                if (FullName) {
                  data.FullName = FullName;
                }
                if (ApplicantsPanNo) {
                  data.ApplicantsPanNo = ApplicantsPanNo;
                }
                if (Country) {
                  data.Country = Country;
                }
                if (Interest) {
                  data.Interest = Interest;
                }
                if (City) {
                  data.City = City;
                }
                if (ApplicantsAadhaarNo) {
                  data.ApplicantsAadhaarNo = ApplicantsAadhaarNo;
                }
                if (DateOfBirth) {
                  data.DateOfBirth = DateOfBirth;
                }
                // if (Occupation) {
                //     data.Occupation = Occupation
                // }
                if (BankAssociated) {
                  data.BankAssociated = BankAssociated;
                }
                if (CurrentAddress) {
                  data.CurrentAddress = CurrentAddress;
                }
                if (State) {
                  data.State = State;
                }
                if (Pincode) {
                  data.Pincode = Pincode;
                }
                if (MobileNumber) {
                  data.MobileNumber = MobileNumber;
                }
                if (AlternateContactNumber) {
                  data.AlternateContactNumber = AlternateContactNumber;
                }
                if (OfficeName) {
                  data.OfficeName = OfficeName;
                }
                if (District) {
                  data.District = District;
                }
                if (LoanAmount) {
                  data.LoanAmount = LoanAmount;
                }
                if (EmailId) {
                  data.EmailId = EmailId;
                }
                if (Scheme) {
                  data.Scheme = Scheme;
                }
                if (Interest) {
                  data.Interest = Interest;
                }

                if (ActionNeeded) {
                  data.ActionNeeded = ActionNeeded;
                }
                if (RepaymentDate1st) {
                  data.RepaymentDate1st = RepaymentDate1st;
                }
                if (RepaymentDate2nd) {
                  data.RepaymentDate2nd = RepaymentDate2nd;
                }
                if (RepaymentDate3rd) {
                  data.RepaymentDate3rd = RepaymentDate3rd;
                }
                if (RepaymentDate4th) {
                  data.RepaymentDate4th = RepaymentDate4th;
                }
                if (RepaymentDate5th) {
                  data.RepaymentDate5th = RepaymentDate5th;
                }
                if (RepaymentDate6th) {
                  data.RepaymentDate6th = RepaymentDate6th;
                }
                if (LLCode) {
                  data.LLCode = LLCode;
                }
                if (ApplicationDate) {
                  data.ApplicationDate = ApplicationDate;
                }
                if (DisbursementDate) {
                  data.DisbursementDate = DisbursementDate;
                }

                if (ProcessingFees) {
                  data.ProcessingFees = ProcessingFees;
                } else {
                  ProcessingFees = ' ';
                }
                if (ROI) {
                  data.ROI = ROI;
                }

                if (EMIAmount) {
                  data.EMIAmount = EMIAmount;
                } else {
                  EMIAmount = ' ';
                }
                if (Branch) {
                  data.Branch = Branch;
                }
                if (IFSCCode) {
                  data.IFSCCode = IFSCCode;
                }
                if (AccountHolderName) {
                  data.AccountHolderName = AccountHolderName;
                }

                data.Status = 'Approved';
                data.Occupation = 'Self';

                // const updateTPA = await loan.updateOne(

                //   { KOCode: KOCode },
                //   { $set: data },
                //   { useFindAndModify: false }
                // );
                //data.UpdatedDate = Date.now();
                const updateTPA = await practoServiceInstance.UploadLoanByKoCode(KOCode, data);
                update.push(updateTPA);
              } else {
                const invObj = {
                  FullName,
                  ApplicantsPanNo,
                  State,
                  Pincode,
                  CurrentAddress,
                  City,
                  MobileNumber,
                  AlternateContactNumber,
                  OfficeName,
                  District,
                  EmailId,
                  LoanAmount,
                  Scheme,
                  EMIAmount,
                  IFSCCode,
                  AccountHolderName,
                  ApplicantsAadhaarNo,
                  Status: 'Approved',
                  ActionNeeded,
                  ApplicationDate,
                  DisbursementDate,
                  Branch,
                  Occupation: 'Self',
                  BankAssociated,
                  ProcessingFees,
                  ROI,
                  DateOfBirth,
                  KOCode,
                  AccountNumber,
                  Interest,
                  BranchCode,
                  RepaymentDate1st,
                  RepaymentDate2nd,
                  RepaymentDate3rd,
                  RepaymentDate4th,
                  RepaymentDate5th,
                  RepaymentDate6th,
                  LLCode,
                  Lender,
                  CreatedDate: Date.now(),
                };

                for (let key in invObj) {
                  if (invObj[key] === undefined || invObj[key] === null) {
                    delete invObj[key];
                  }
                }

                // const invUpl = new loan(invObj);
                // const upl = await invUpl.save();
                const invUpl = await practoServiceInstance.AddLoan(invObj);
                newadded.push(invUpl);
              }
            }
            fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);
            return res.status(200).json({
              success: true,
              newadded,
              update,
              message: 'uploaded',
            });
          }
          invoicer();
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/uploadrepayment',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('uploadrepayment: %o', req.body);
      try {
        var dirPath;
        var destPath;
        var numFiles;
        var filesarr;
        var filepaths;
        var fileWithExt = [];

        uploaders.fields([{ name: 'uploadfile' }, { name: 'uploadzip' }])(req, res, err => {
          dirPath = './upload/' + req.files['uploadfile'][0].filename;
          var ran = Math.floor(Math.random() * 90000) + 10000;

          const excelData = excelToJson({
            sourceFile: './upload/' + req.files['uploadfile'][0].filename,
            sheets: [
              {
                // Excel Sheet Name
                name: 'Sheet1',
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                  rows: 1,
                },
                // Mapping columns to keys
                columnToKey: {
                  '*': '{{columnHeader}}',
                },
              },
            ],
          });

          if (!excelData.Sheet1.length) {
            return res.status(400).json({
              success: false,
              error: 'Blank sheet not uploaded',
            });
          }

          var arr = [];

          async function invoicer() {
            try {
              var failedRepayment = [];
              var createdRepayment = [];
              for (var i = 0; i < excelData.Sheet1.length; i++) {
                if (excelData.Sheet1[i].invoiceId && excelData.Sheet1[i].Repayment_Date) {
                  let invoiceId = excelData.Sheet1[i].invoiceId;
                  //  let claimAmount = excelData.Sheet1[i].PatientBillAmount;
                  var count = 0;
                  count++;
                  var ranDate = new Date();
                  let randate = ('0' + ranDate.getDate()).slice(-2);
                  let ranmonth = ('0' + (ranDate.getMonth() + 1)).slice(-2);
                  let ranyear = ranDate.getFullYear();
                  let ranhours = ranDate.getHours();
                  let ranminutes = ranDate.getMinutes();
                  let ranseconds = ranDate.getSeconds();

                  var finalRanDate =
                    ranyear + '-' + ranmonth + '-' + randate + '-' + ranhours + '-' + ranminutes + '-' + ranseconds;

                  destPath = `./upload/${finalRanDate}-${ran}`;

                  const practoServiceInstance = Container.get(practoService);
                  var { invoice } = await practoServiceInstance.getInvoiceById(invoiceId);
                  if (!invoice) {
                    failedRepayment.push(invoiceId);
                    continue;
                  } else {
                    createdRepayment.push(invoiceId);
                  }

                  // // const repaymentdData = await repayment.findOne({
                  // //   LL_Code: LL_Code,
                  // // });

                  // if (repaymentdData) {
                  //   return res.status(400).json({
                  //     success: false,
                  //     message: `LL_Code ${invoiceId} already exists`,
                  //   });
                  // }

                  arr[i] = invoiceId;

                  var name = excelData.Sheet1[i].name;
                  var mobile = excelData.Sheet1[i].mobile;
                  var EMI_Amount = excelData.Sheet1[i].EMI_Amount;
                  var status = excelData.Sheet1[i].status;
                  var Bounce_Charges = excelData.Sheet1[i].Bounce_Charges;
                  var Delay_Charges = excelData.Sheet1[i].Delay_Charges;
                  var Total_to_be_collected = excelData.Sheet1[i].Total_to_be_collected;
                  var EMI_Number = 0;
                  var active = excelData.Sheet1[i].active;
                  if (active == 'TRUE') {
                    active = true;
                  } else {
                    active = false;
                  }
                  var total_outstanding = excelData.Sheet1[i].total_outstanding;
                  var Repayment_Date = excelData.Sheet1[i].Repayment_Date;

                  if (invoice.isInsured == false) {
                    EMI_Number = excelData.Sheet1[i].EMI_Number;
                  }

                  var date_regex = moment(Repayment_Date, 'MM/DD/YYYY', true);

                  if (!date_regex.isValid()) {
                    return res.status(400).send({
                      success: false,
                      message: `Please fill mm/dd/yyyy format  ${Repayment_Date} whose invoiceId is ${invoiceId} `,
                    });
                  } else {
                    var Repayment_Date = date_regex.toISOString();
                  }

                  const files = await decompress(dirPath, destPath);
                  numFiles = files.length;
                  filesarr = [];
                  filepaths = [];

                  if (active == false) {
                    const usrObj = {
                      invoiceStatus: 'Repaid',
                      digiComment: 'loan closed via excel',
                      updatedBy: req.currentUser._id,
                    };
                    if (req.files['uploadfile'][0].filename != undefined) {
                      const practoServiceInstance = Container.get(practoService);
                      const { repaymentupdate } = await practoServiceInstance.updateInvoiceById(invoiceId, usrObj);

                      //   const newData = new repayment(usrObj);
                      //   const Invoicedata = await newData.save();
                    }
                  }
                  const repayment = {
                    organizationId: req.currentUser.organizationId,
                    invoiceId: invoiceId,
                    name: name,
                    mobile: mobile,
                    EMI_Amount: EMI_Amount,
                    status: status,
                    Bounce_Charges: Bounce_Charges,
                    Delay_Charges: Delay_Charges,
                    Total_to_be_collected: Total_to_be_collected,
                    EMI_Number: EMI_Number,
                    active: active,
                    total_outstanding: total_outstanding,
                    Repayment_Date: Repayment_Date,
                    updatedBy: req.currentUser._id,
                  };
                  if (req.files['uploadfile'][0].filename != undefined) {
                    const practoServiceInstance = Container.get(practoService);
                    const { repaymentupdated } = await practoServiceInstance.addRepayment(
                      repayment as patientLoanRepaymentDC,
                    );

                    //   const newData = new repayment(usrObj);
                    //   const Invoicedata = await newData.save();
                  }
                } else {
                  return res.status(400).json({
                    success: false,
                    message: 'Please fill all the fields in excel, missing fields',
                  });
                }
              }
              fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);
              return res.status(200).json({
                success: true,
                message:
                  createdRepayment.length +
                  ' repayment uploaded. ' +
                  failedRepayment.length +
                  ' repayment could not be uploaded.',
                failedRepayment,
                createdRepayment,
              });
            } catch (error) {
              return res.status(400).send({
                success: false,
              });
            }
          }
          invoicer();
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/uploadrepayment',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('uploadrepayment: %o', req.body);
      try {
        var dirPath;
        var destPath;
        var numFiles;
        var filesarr;
        var filepaths;
        var fileWithExt = [];

        uploaders.fields([{ name: 'uploadfile' }, { name: 'uploadzip' }])(req, res, err => {
          dirPath = './upload/' + req.files['uploadfile'][0].filename;
          var ran = Math.floor(Math.random() * 90000) + 10000;

          const excelData = excelToJson({
            sourceFile: './upload/' + req.files['uploadfile'][0].filename,
            sheets: [
              {
                // Excel Sheet Name
                name: 'Sheet1',
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                  rows: 1,
                },
                // Mapping columns to keys
                columnToKey: {
                  '*': '{{columnHeader}}',
                },
              },
            ],
          });

          if (!excelData.Sheet1.length) {
            return res.status(400).json({
              success: false,
              error: 'Blank sheet not uploaded',
            });
          }

          var arr = [];

          async function invoicer() {
            try {
              var failedRepayment = [];
              var nonFundedInvoice = [];
              var createdRepayment = [];
              for (var i = 0; i < excelData.Sheet1.length; i++) {
                if (excelData.Sheet1[i].invoiceId && excelData.Sheet1[i].Repayment_Date) {
                  let invoiceId = excelData.Sheet1[i].invoiceId;
                  //  let claimAmount = excelData.Sheet1[i].PatientBillAmount;
                  var count = 0;
                  count++;
                  var ranDate = new Date();
                  let randate = ('0' + ranDate.getDate()).slice(-2);
                  let ranmonth = ('0' + (ranDate.getMonth() + 1)).slice(-2);
                  let ranyear = ranDate.getFullYear();
                  let ranhours = ranDate.getHours();
                  let ranminutes = ranDate.getMinutes();
                  let ranseconds = ranDate.getSeconds();

                  var finalRanDate =
                    ranyear + '-' + ranmonth + '-' + randate + '-' + ranhours + '-' + ranminutes + '-' + ranseconds;

                  destPath = `./upload/${finalRanDate}-${ran}`;

                  const practoServiceInstance = Container.get(practoService);
                  var { invoice } = await practoServiceInstance.getInvoiceById(invoiceId);
                  if (!invoice) {
                    failedRepayment.push(invoiceId);
                    continue;
                  } else {
                    createdRepayment.push(invoiceId);
                  }

                  if (invoice.invoiceStatus == 'Funded') {
                    arr[i] = invoiceId;
                    var name = excelData.Sheet1[i].name;
                    var mobile = excelData.Sheet1[i].mobile;
                    var EMI_Amount = excelData.Sheet1[i].EMI_Amount;
                    var status = excelData.Sheet1[i].status;
                    var Bounce_Charges = excelData.Sheet1[i].Bounce_Charges;
                    var Delay_Charges = excelData.Sheet1[i].Delay_Charges;
                    var Total_to_be_collected = excelData.Sheet1[i].Total_to_be_collected;
                    var EMI_Number = 0;
                    var active = excelData.Sheet1[i].active;
                    if (active == 'TRUE') {
                      active = true;
                    } else {
                      active = false;
                    }
                    var total_outstanding = excelData.Sheet1[i].total_outstanding;
                    var Repayment_Date = excelData.Sheet1[i].Repayment_Date;

                    if (invoice.isInsured == false) {
                      EMI_Number = excelData.Sheet1[i].EMI_Number;
                    }
                    var date_regex = moment(Repayment_Date, 'MM/DD/YYYY', true);
                    if (!date_regex.isValid()) {
                      return res.status(400).send({
                        success: false,
                        message: `Please fill mm/dd/yyyy format  ${Repayment_Date} whose invoiceId is ${invoiceId} `,
                      });
                    } else {
                      var Repayment_Date = date_regex.toISOString();
                    }
                    const files = await decompress(dirPath, destPath);
                    numFiles = files.length;
                    filesarr = [];
                    filepaths = [];
                    if (active == false) {
                      const usrObj = {
                        invoiceStatus: 'Repaid',
                        digiComment: 'loan closed via excel',
                        updatedBy: req.currentUser._id,
                      };

                      const practoServiceInstance = Container.get(practoService);
                      const { repaymentupdate } = await practoServiceInstance.updateInvoiceById(invoiceId, usrObj);

                      //   const newData = new repayment(usrObj);
                      //   const Invoicedata = await newData.save();
                    }
                    const repayment = {
                      organizationId: req.currentUser.organizationId,
                      invoiceId: invoiceId,
                      name: name,
                      mobile: mobile,
                      EMI_Amount: EMI_Amount,
                      status: status,
                      Bounce_Charges: Bounce_Charges,
                      Delay_Charges: Delay_Charges,
                      Total_to_be_collected: Total_to_be_collected,
                      EMI_Number: EMI_Number,
                      active: active,
                      total_outstanding: total_outstanding,
                      Repayment_Date: Repayment_Date,
                      updatedBy: req.currentUser._id,
                    };
                    if (req.files['uploadfile'][0].filename != undefined) {
                      const practoServiceInstance = Container.get(practoService);
                      const { repaymentupdated } = await practoServiceInstance.addRepayment(
                        repayment as patientLoanRepaymentDC,
                      );

                      //   const newData = new repayment(usrObj);
                      //   const Invoicedata = await newData.save();
                    }
                  } else {
                    nonFundedInvoice.push(invoiceId);

                    // return res.status(400).json({
                    //   success: false,
                    //   message:
                    //     'cant take repayment for non funded invoice:' +
                    //     invoiceId +
                    //     'please correct the data and upload again',
                    // });
                  }
                } else {
                  return res.status(400).json({
                    success: false,
                    message: 'Please fill all the fields in excel, missing fields',
                  });
                }
              }
              fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);
              return res.status(200).json({
                success: true,
                message:
                  createdRepayment.length +
                  ' repayment uploaded. ' +
                  failedRepayment.length +
                  ' repayment could not be uploaded.',
                failedRepayment,
                createdRepayment,
                nonFundedInvoice,
              });
            } catch (error) {
              return res.status(400).send({
                success: false,
              });
            }
          }
          invoicer();
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.post(
    '/dataUploadByExcelLoanApprove',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('dataUploadByExcelLoanApprove: %o', req.body);
      try {
        var dirPath;
        var destPath;
        var numFiles;
        var filesarr;
        var filepaths;
        var fileWithExt = [];

        uploaders.fields([{ name: 'uploadfile' }, { name: 'uploadzip' }])(req, res, err => {
          dirPath = './upload/' + req.files['uploadfile'][0].filename;
          var ran = Math.floor(Math.random() * 90000) + 10000;

          const excelData = excelToJson({
            sourceFile: './upload/' + req.files['uploadfile'][0].filename,
            sheets: [
              {
                // Excel Sheet Name
                name: 'Sheet1',
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                  rows: 1,
                },
                // Mapping columns to keys
                columnToKey: {
                  '*': '{{columnHeader}}',
                },
              },
            ],
          });

          if (!excelData.Sheet1.length) {
            return res.status(400).json({
              success: false,
              error: 'Blank sheet not uploaded',
            });
          }

          var uploaded_sheet_length = excelData.Sheet1.length;
          var updateCount = 0;
          var addCount = 0;
          var faildata = [];
          var approvedata = [];
          var creatednewdata = [];
          const DuplicateLLCodeList = [];
          console.log(uploaded_sheet_length);
          var arr = [];
          async function invoicer() {
            for (var i = 0; i < excelData.Sheet1.length; i++) {
              // console.log(i)
              var KOCode = excelData.Sheet1[i].KoCode;
              var LLCode = excelData.Sheet1[i].LLCode;

              var count = 0;
              count++;

              arr[i] = LLCode;

              var FullName = excelData.Sheet1[i].FullName;
              var ApplicantsPanNo = excelData.Sheet1[i].ApplicantsPanNo;
              var AadhaarNo = excelData.Sheet1[i].ApplicantsAadhaarNo;
              var DateOfBirth = excelData.Sheet1[i].DateOfBirth;
              var Occupation = excelData.Sheet1[i].Occupation;
              var BankAssociated = excelData.Sheet1[i].Bank;
              var CurrentAddress = excelData.Sheet1[i].CurrentAddress;
              var City = excelData.Sheet1[i].District;
              var State = excelData.Sheet1[i].State;
              var Pin = excelData.Sheet1[i].Pincode;
              var Mobile = excelData.Sheet1[i].MobileNumber;
              var EmailId = excelData.Sheet1[i].EmailId;
              var LoanAmount = excelData.Sheet1[i].LoanAmount;
              var EMIAmount = excelData.Sheet1[i].EMI_Amount;
              if (EMIAmount) {
                EMIAmount = Math.round(EMIAmount);
              }
              var Campaign = excelData.Sheet1[i].Campaign;
              var ActionNeeded = excelData.Sheet1[i].Action_needed;
              var Status = excelData.Sheet1[i].Status;

              var ApplicationDate = excelData.Sheet1[i].Application_date;
              var DisbursementDate = excelData.Sheet1[i].Disbursement_Date;
              var RepaymentDate1st = excelData.Sheet1[i].Repayment_Date_1st;
              var RepaymentDate2nd = excelData.Sheet1[i].Repayment_Date_2st;
              var RepaymentDate3rd = excelData.Sheet1[i].Repayment_Date_3st;
              var RepaymentDate4th = excelData.Sheet1[i].Repayment_Date_4st;
              var RepaymentDate5th = excelData.Sheet1[i].Repayment_Date_5st;
              var RepaymentDate6th = excelData.Sheet1[i].Repayment_Date_6st;
              var RepaymentDate7th = excelData.Sheet1[i].Repayment_Date_7st;
              var RepaymentDate8th = excelData.Sheet1[i].Repayment_Date_8st;
              var RepaymentDate9th = excelData.Sheet1[i].Repayment_Date_9st;
              var RepaymentDate10th = excelData.Sheet1[i].Repayment_Date_10st;
              var RepaymentDate11th = excelData.Sheet1[i].Repayment_Date_11st;
              var RepaymentDate12th = excelData.Sheet1[i].Repayment_Date_12th;
              var Loan_End_date = excelData.Sheet1[i].Loan_End_date;
              var Cases = excelData.Sheet1[i].Cases;
              var Scheme = excelData.Sheet1[i].Scheme;
              var Lender = excelData.Sheet1[i].Lender;
              var NachRegistration = excelData.Sheet1[i].Nach_Registration;

              var date1 = new Date(DateOfBirth);
              var finalDate1 = new Date(date1.setDate(date1.getDate() + 0));
              DateOfBirth = new Date(finalDate1);

              if (AadhaarNo) {
                var ApplicantsAadhaarNo = AadhaarNo.toString();
              }
              if (Mobile) {
                var MobileNumber = Mobile.toString();
              }

              if (Pin) {
                var Pincode = Pin.toString();
              }
              // if (ProcessingFees) {
              //   var ProcessingFees = Processing * 100;
              // }
              // if (ROI) {
              //   var ROI = ROIData * 100;
              // }
              const practoServiceInstance = Container.get(practoService);
              const { InvoiceNumberdata } = await practoServiceInstance.getAproveLoneByLLCode(LLCode);
              // const InvoiceNumberdata = await Approvedloans.findOne({
              //   LLCode: LLCode,
              // });

              if (InvoiceNumberdata) {
                // console.log("update count", InvoiceNumberdata.LLCode);
                let data: any = {};

                if (FullName) {
                  data.FullName = FullName;
                }
                if (ApplicantsPanNo) {
                  data.ApplicantsPanNo = ApplicantsPanNo;
                }

                if (City) {
                  data.City = City;
                }
                if (ApplicantsAadhaarNo) {
                  data.ApplicantsAadhaarNo = ApplicantsAadhaarNo;
                }
                if (DateOfBirth) {
                  data.DateOfBirth = DateOfBirth;
                }
                if (Occupation) {
                  data.Occupation = Occupation;
                }
                if (BankAssociated) {
                  data.BankAssociated = BankAssociated;
                }
                if (CurrentAddress) {
                  data.CurrentAddress = CurrentAddress;
                }
                if (State) {
                  data.State = State;
                }
                if (Pincode) {
                  data.Pincode = Pincode;
                }
                if (MobileNumber) {
                  data.MobileNumber = MobileNumber;
                }
                if (LoanAmount) {
                  data.LoanAmount = LoanAmount;
                } else {
                  var lamount: any = {};
                  lamount.LLCode = LLCode;
                  lamount.Reason = 'LoanAmount is empty';
                  faildata.push(lamount);
                  continue;
                }
                if (EmailId) {
                  data.EmailId = EmailId;
                }
                if (Scheme) {
                  data.Scheme = Scheme;
                }

                if (
                  Status == 'Disbursed' ||
                  Status == 'DS working' ||
                  Status == 'Duplicate' ||
                  Status == 'Fraud case' ||
                  Status == 'LL is working' ||
                  Status == 'Loan closed' ||
                  Status == 'Loan reversed' ||
                  Status == 'NICT to work' ||
                  Status == 'Yet to disburse' ||
                  Status == 'Rejected' ||
                  Status == 'Withdraw' ||
                  Status == 'Not Interested'
                ) {
                  data.Status = Status;
                } else {
                  var statusissue: any = {};
                  statusissue.LLCode = LLCode;
                  statusissue.Reason = 'not a valid status';
                  faildata.push(statusissue);
                  continue;
                }

                if (ActionNeeded) {
                  data.ActionNeeded = ActionNeeded;
                }
                if (RepaymentDate1st) {
                  data.RepaymentDate1st = RepaymentDate1st;
                }
                if (RepaymentDate2nd) {
                  data.RepaymentDate2nd = RepaymentDate2nd;
                }
                if (RepaymentDate3rd) {
                  data.RepaymentDate3rd = RepaymentDate3rd;
                }
                if (RepaymentDate4th) {
                  data.RepaymentDate4th = RepaymentDate4th;
                }
                if (RepaymentDate5th) {
                  data.RepaymentDate5th = RepaymentDate5th;
                }
                if (RepaymentDate6th) {
                  data.RepaymentDate6th = RepaymentDate6th;
                }
                if (RepaymentDate7th) {
                  data.RepaymentDate7th = RepaymentDate7th;
                }
                if (RepaymentDate8th) {
                  data.RepaymentDate8th = RepaymentDate8th;
                }
                if (RepaymentDate9th) {
                  data.RepaymentDate9th = RepaymentDate9th;
                }
                if (RepaymentDate10th) {
                  data.RepaymentDate10th = RepaymentDate10th;
                }
                if (RepaymentDate11th) {
                  data.RepaymentDate11th = RepaymentDate11th;
                }
                if (RepaymentDate12th) {
                  data.RepaymentDate12th = RepaymentDate12th;
                }

                // if (LLCode) {
                //   data.LLCode = LLCode;
                // }
                if (ApplicationDate) {
                  data.ApplicationDate = ApplicationDate;
                }
                if (Status == 'Disbursed' && !DisbursementDate) {
                  var DisbursedDateIssue: any = {};
                  DisbursedDateIssue.LLCode = LLCode;
                  DisbursedDateIssue.Reason = 'status is disbursed and not a valid disbursment date';
                  faildata.push(DisbursedDateIssue);
                  continue;
                } else {
                  data.DisbursementDate = DisbursementDate;
                }
                if (NachRegistration) {
                  data.NachRegistration = NachRegistration;
                }
                if (Loan_End_date) {
                  data.Loan_End_date = Loan_End_date;
                }
                if (Campaign) {
                  data.Campaign = Campaign;
                }
                if (Cases) {
                  data.Cases = Cases;
                }
                if (Lender) {
                  data.Lender = Lender;
                }

                if (EMIAmount) {
                  data.EMIAmount = EMIAmount;
                }
                // else {
                //   var emiamountissue: any = {};
                //   emiamountissue.LLCode = LLCode;
                //   emiamountissue.Reason = 'not a valid EMI Amount';
                //                     emiamountissue.Reason = 'not a valid EMI Amount';

                //   faildata.push(emiamountissue);
                //   continue;
                // }
                data.UpdatedDate = Date.now();
                const practoServiceInstance = Container.get(practoService);
                const { updateTPA } = await practoServiceInstance.UpdateAproveLoneByLLCode(LLCode, data);

                // const updateTPA = await Approvedloans.updateOne(
                //   { LLCode: LLCode },
                //   { $set: data },
                //   { useFindAndModify: false }
                // );
                if (updateTPA) {
                  DuplicateLLCodeList.push(LLCode);
                  updateCount = updateCount + 1;
                }
              } else {
                const invObj = {
                  LLCode,
                  KOCode,
                  FullName,
                  ApplicantsPanNo,
                  ApplicantsAadhaarNo,
                  DateOfBirth,
                  Occupation,
                  BankAssociated,
                  CurrentAddress,
                  City,
                  State,
                  Pincode,
                  MobileNumber,
                  EmailId,
                  LoanAmount,
                  EMIAmount,
                  Campaign,
                  ActionNeeded,
                  Status,
                  Lender,
                  ApplicationDate,
                  DisbursementDate,
                  RepaymentDate1st,
                  RepaymentDate2nd,
                  RepaymentDate3rd,
                  RepaymentDate4th,
                  RepaymentDate5th,
                  RepaymentDate6th,
                  RepaymentDate7th,
                  RepaymentDate8th,
                  RepaymentDate9th,
                  RepaymentDate10th,
                  RepaymentDate11th,
                  RepaymentDate12th,
                  NachRegistration,
                  Scheme,
                  CreatedDate: Date.now(),
                };

                for (let key in invObj) {
                  if (invObj[key] === undefined || invObj[key] === null) {
                    delete invObj[key];
                  }
                }
                if (LLCode) {
                  const practoServiceInstance = Container.get(practoService);
                  const { upl } = await practoServiceInstance.AddAproveLone(invObj);

                  if (upl) {
                    addCount = addCount + 1;
                  }
                }

                // const invUpl = new Approvedloans(invObj);
                // const upl = await invUpl.save();
              }
            }
            console.log('addCount', addCount);
            console.log('updateCount', updateCount);
            console.log('uploaded_sheet_length', uploaded_sheet_length);
            // console.log("data_in_db_length",(data_in_db_length = updateCount + addCount));
            fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);

             //merchant dashboard Job
            const MerchantAdminServiceInstance = Container.get(MerchantAdminService);
            await MerchantAdminServiceInstance.merchantDashboardJob(null);

            return res.status(200).json({
              success: true,
              message: 'uploaded',
              addCount,
              updateCount,
              faildata,
              uploaded_sheet_length,
              data_in_db_length: updateCount + addCount,
              DuplicateLLCodeList,
            });
          }
          invoicer();
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.use(errors());
};
