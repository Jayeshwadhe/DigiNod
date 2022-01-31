import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { IPatientLoanDTO, IUser } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, errors, Joi } from 'celebrate';
import DateExtension from '@joi/date';
import practoService from '../../services/practoService';
import middlewares from '../middlewares';
import excel from 'exceljs';

import multer from 'multer';

import excelToJson from 'convert-excel-to-json';

import moment from 'moment';

import decompress from 'decompress';

import path from 'path';

import fs from 'fs';
import companyConstentService from '../../services/companyConstentService';
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
    app.use('/bank', route);
    route.post('/uploadbanks', async (req: any, res: Response, next: NextFunction) => {
        const logger: Logger = Container.get('logger');
        logger.debug('uploadbanks: %o', req.body);
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
                  var bankstoadd=[]
                for (var i = 0; i < excelData.Sheet1.length; i++) {                 
                  if (
                    excelData.Sheet1[i].Name_of_the_Bank
                  ) {
                    let Name_of_the_Bank = excelData.Sheet1[i].Name_of_the_Bank;
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
  
                    arr[i] = Name_of_the_Bank;

                    const files = await decompress(dirPath, destPath);
                    numFiles = files.length;
                    filesarr = [];
                    filepaths = [];
                    var obj={
                        Name_of_the_Bank:Name_of_the_Bank 
                    }
                   bankstoadd.push(obj)
                   
                  } else {
                    return res.status(400).json({
                      success: false,
                      message: 'Please fill all the fields in excel, missing fields',
                    });
                  }
                }
                if (bankstoadd != null) {
                    const bankserviceinstance = Container.get(companyConstentService);
                    const { companyConstantBankdata } = await bankserviceinstance.addbank(bankstoadd)
                    
                    
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
      route.get('/getAllBanks',async (req:any,res:any,next:NextFunction)=>{
        const logger: Logger = Container.get('logger');
        logger.debug('getOrgByIdToAdmin: %o', req.body);
        try {
          const OrgServiceInstance = Container.get(companyConstentService);
          const data  = await OrgServiceInstance.getAllBanks();
          return res.status(201).json({ data });
        } catch (e) {
          logger.error('🔥 error: %o', e);
          return next(e);
        } 
      })


}