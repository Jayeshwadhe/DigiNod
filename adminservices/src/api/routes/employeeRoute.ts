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
import employeeService from '../../services/employeeService';


import multer from 'multer';

import excelToJson from 'convert-excel-to-json';

import moment from 'moment';

import decompress from 'decompress';

import path from 'path';

import fs from 'fs';
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
  app.use('/employee', route);
  

route.get("/getEmployees",middlewares.isAuth,middlewares.attachCurrentUser,middlewares.requiredRole("Admin"),
 celebrate({
    query: {
      pageNumber: Joi.number().positive(),
      pageSize: Joi.number().positive(),
      filters: Joi.array(),
    },
  }),async (req:Request,res:Response,next:NextFunction)=>{
        try {
            const logger: Logger = Container.get('logger');
            logger.debug('GetEmployee: %o');
          
    
            const EmployeeServiceInstance = Container.get(employeeService);
        const  {getEmployees}  = await EmployeeServiceInstance.getEmployees(req.query as unknown as IFilterDTO);
        return res.status(201).json({
            success: true,
            data: getEmployees,

        }
            
        );
    
         
        } catch (error) {
          console.log(" error:", error);
          res.status(400).json({ success: false,
            data: [],
             error: error });
        }
     


})
route.get('/downloadEmployee', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('downloadEmployee: %o', req.body);
    try {
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('Sheet1');
      let Sheet1 = [];
      worksheet.columns = [
        // 10. Details of services used through Qube health app from the empanelled merchant/ Hospital
        // 11. Merchant l/ Hospital name to whom amt will be credited
        // 12. Address, City, State and Pincode of the merchant
        // 14. Contact no of the merchant/ Hospital
        { header: "qube_ref_id", key: "qube_ref_id", width: 25 },
        { header: "Employee_name", key: "Employee_name", width: 25 },
        { header: "Mobile_no", key: "Mobile_no", width: 25 },
        { header: "EmailId", key: "EmailId", width: 25 },
        { header: "Joining_date", key: "Joining_date", width: 25 },
        { header: "Date_of_birth", key: "Date_of_birth", width: 25 },
        { header: "Pan_no", key: "Pan_no", width: 25 },
        { header: "Aadhaar_no", key: "Aadhaar_no", width: 25 },
        { header: "Address", key: "Address", width: 25 },
        { header: "state", key: "state", width: 25 },
        { header: "City", key: "City", width: 25 },
        { header: "PinCode", key: "PinCode", width: 25 },
        { header: "salary", key: "salary", width: 25 },
      ];
      // Add Array Rows
      worksheet.addRows(Sheet1);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'sample_Employee.xlsx');

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
  route.post('/uploadEmployee', async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('uploadEmployee: %o', req.body);
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
        var uploaded_sheet_length = excelData.Sheet1.length;
        var addCount = 0;
        const Duplicate_qube_ref_id = [];
        async function invoicer() {
            try {
              loop1: for (var i = 0; i < excelData.Sheet1.length; i++) {
                if (
                  excelData.Sheet1[i].Employee_name &&
                  excelData.Sheet1[i].Mobile_no &&
                  excelData.Sheet1[i].EmailId &&
                  excelData.Sheet1[i].Joining_date &&
                  excelData.Sheet1[i].Date_of_birth &&
                  excelData.Sheet1[i].Pan_no &&
                  excelData.Sheet1[i].Aadhaar_no &&
                  excelData.Sheet1[i].Address &&
                  excelData.Sheet1[i].state &&
                  excelData.Sheet1[i].City &&
                  excelData.Sheet1[i].PinCode &&
                  excelData.Sheet1[i].salary &&
                  excelData.Sheet1[i].qube_ref_id
                ) {
                  let qube_ref_id = excelData.Sheet1[i].qube_ref_id;
                  //  let claimAmount = excelData.Sheet1[i].PatientBillAmount;
                  var count = 0;
                  count++;
                  var ranDate = new Date();
                  let randate = ("0" + ranDate.getDate()).slice(-2);
                  let ranmonth = ("0" + (ranDate.getMonth() + 1)).slice(-2);
                  let ranyear = ranDate.getFullYear();
                  let ranhours = ranDate.getHours();
                  let ranminutes = ranDate.getMinutes();
                  let ranseconds = ranDate.getSeconds();

                  var finalRanDate =
                    ranyear +
                    "-" +
                    ranmonth +
                    "-" +
                    randate +
                    "-" +
                    ranhours +
                    "-" +
                    ranminutes +
                    "-" +
                    ranseconds;

                  destPath = `./upload/${finalRanDate}-${ran}`;
                  const EmployeeServiceInstance = Container.get(employeeService);
                  const EmployeeData = await EmployeeServiceInstance.getEmployeeById(qube_ref_id)
                
                  if (EmployeeData.userCount != null) {
                    Duplicate_qube_ref_id.push(qube_ref_id);
                    continue loop1;
                    // return res.status(400).json({
                    //   success: false,
                    //   message: `Mobile_no ${Mobile_no} already exists`,
                    // });
                  }
                  arr[i] = qube_ref_id;

                  var Employee_name = excelData.Sheet1[i].Employee_name;
                  var EmailId = excelData.Sheet1[i].EmailId;

                  var Joining_date = excelData.Sheet1[i].Joining_date;

                  var date_regex = moment(
                    Joining_date,
                    "MM/DD/YYYY",
                    true
                  ).isValid();

                  if (!date_regex) {
                    return res.status(400).send({
                      success: false,
                      message: `Please fill mm/dd/yyyy format  ${Joining_date} whose qube_ref_id is ${qube_ref_id} `,
                    });
                  }

                  var Date_of_birth = excelData.Sheet1[i].Date_of_birth;

                  var date_regexx = moment(
                    Date_of_birth,
                    "MM/DD/YYYY",
                    true
                  ).isValid();

                  if (!date_regexx) {
                    return res.status(400).send({
                      success: false,
                      message: `Please fill mm/dd/yyyy format  ${Date_of_birth} whose qube_ref_id is ${qube_ref_id} `,
                    });
                  }
                  var Pan_no = excelData.Sheet1[i].Pan_no;
                  var Aadhaar_no = excelData.Sheet1[i].Aadhaar_no;
                  var Address = excelData.Sheet1[i].Address;
                  var state = excelData.Sheet1[i].state;
                  var City = excelData.Sheet1[i].City;
                  var PinCode = excelData.Sheet1[i].PinCode;
                  var salary = excelData.Sheet1[i].salary;
                  var Mobile_no = excelData.Sheet1[i].Mobile_no;

                  const files = await decompress(dirPath, destPath);
                  numFiles = files.length;
                  filesarr = [];
                  filepaths = [];

                  const usrObj = {
                    Employee_name,
                    Mobile_no,
                    EmailId,
                    Joining_date,
                    Date_of_birth,
                    Pan_no,
                    Aadhaar_no,
                    Address,
                    state,
                    City,
                    PinCode,
                    salary,
                    qube_ref_id,
                  };

                 
                
                  const update = await EmployeeServiceInstance.AddEmployee(usrObj)
                    // const newData = new Employee(usrObj);
                    // const IEmployeedata = await newData.save();
                    if (update) {
                      addCount = addCount + 1;
                
                  }
                } else {
                  return res.status(400).json({
                    success: false,
                    message: "Please fill all the fields in excel",
                  });
                }
              }

              fs.unlinkSync('./upload/' + req.files['uploadfile'][0].filename);
              return res.status(200).json({
                success: true,
                message: "uploaded",
                addCount,
                uploaded_sheet_length,
                Duplicate_qube_ref_id,
              });
            } catch (error) {
              console.log("error: ", error);
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
  route.post(
    '/updateEmployeeLimit',
    celebrate({
      body: Joi.object({
        Employee_id: Joi.string().required(),
        Loan_limit: Joi.number().required(),
      
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling addModules: %o', req.body);
      try {
            const {Employee_id,Loan_limit}=req.body
        const EmployeeServiceInstance = Container.get(employeeService);
        const EmployeeData = await EmployeeServiceInstance.updateEmployeeLimit(Employee_id,Loan_limit)
      
        return res.status(201).json( EmployeeData );
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

}