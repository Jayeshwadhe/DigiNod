import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import BimaService from '../../services/BGservice';
import { Logger } from 'winston';
import { celebrate, Joi } from 'celebrate';
import middlewares from '../middlewares';
import { IBGPatientDTO } from '@/interfaces/IBimaGarage';
import FormData from "form-data"
var multer  = require('multer');
var path =require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })
var fs = require('fs');

const route = Router();

export default (app: Router) => {

  app.use('/bima', route);

  route.get('/token', async (req: any, res: any, next) => {
    const bimaServiceInstance = Container.get(BimaService);
    const data = await bimaServiceInstance.token();
    res.send({token:data})
  })

  route.get('/check-patient', celebrate({
    query: Joi.object({
      mobileNumber: Joi.number().required(),
    }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {
      const mobileNumber = req.query.mobileNumber
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.check_patient(mobileNumber);
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.get('/check-case', celebrate({
    query: Joi.object({
      PatientId: Joi.number().required(),
    }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {
      const PatientId = req.query.PatientId
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.check_case(PatientId);
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.post('/CreateHospital', celebrate({
    body: Joi.object({
      hospital_name: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
    }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    try {
      // const PatientId=req.query.PatientId
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.CreateHospital(req.body);
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.post('/CreatePatient',middlewares.isAuth, middlewares.attachCurrentUser,upload.single('policy_doc'), async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    const bimaServiceInstance = Container.get(BimaService);
    let data :any ={} 
    let patientData:any={};
    console.log(req.body,req.file);
    let form_data = new FormData();
    for ( var key in req.body ) {
      form_data.append(key, req.body[key]);
  }
    try {

      if(req.file){
        form_data.append('policy_doc',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
      }
      
      if (req.currentUser.BGHospitalId) {
       data = await bimaServiceInstance.CreatePatient(form_data);
      if(data){
        patientData = await bimaServiceInstance.addPatient(req.body as IBGPatientDTO,data);  
      }else{
        return res.status(400).json({data:"Unable to create Patient",success:false})
      }
               
      return res.status(201).json({data,patientData,success:true})
      } else {
        let hospitaldata = {
          hospital_name: req.currentUser.name,
          city: req.currentUser.address[0].city,
          state: req.currentUser.address[0].state,
        };
        let approveddata = await bimaServiceInstance.CreateHospital(hospitaldata);
        if (approveddata.Message == 'Hospital Created Successfully') {
          const hospitalUpdatedData = await bimaServiceInstance.updateUser(
            req.currentUser,
            approveddata.payload.data.id,
          );
           data = await bimaServiceInstance.CreatePatient(form_data);
          patientData = await bimaServiceInstance.addPatient(req.body as IBGPatientDTO,data);
         return res.status(201).json({data, patientData,success:true})
        } else {
          return res.status(400).json({ Message: 'Unable to create Hospital at BG' });
        }
      }     
      
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

  route.post('/createCase',middlewares.isAuth, middlewares.attachCurrentUser,async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      let data:any={}
      let caseData:any={}
      try {
        const bimaServiceInstance = Container.get(BimaService);
        const BgCaseInstance = Container.get(BimaService);
        // req.body.hospital=req.currentUser.BGHospitalId
        let newbody = Object.assign({hospital:Number(req.currentUser.BGHospitalId),claim_status:"New"},req.body)

         data = await bimaServiceInstance.createCase(newbody);
        if(data.Message='Case Created Successfully'){
          caseData = await BgCaseInstance.addCase(newbody,data);
          return res.status(201).json({'On BG portal':data,'Local DB':caseData,success:true} );
         
        }else{
          return res.status(201).json({Message:"Unable to create Case",success:false} );
        }
         

        
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get('/CaseStatistics', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {

      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.CaseStatistics();
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.get('/getHospitalList', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {

      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.hospitaldata();
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.get('/getCaseList', celebrate({
    body: {
      pageNumber: Joi.number().positive(),
      pageSize: Joi.number().positive(),
     
    },
  }), async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {

      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.caselist(req.query.customerId,req.body);
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

  route.get('/insuranceco', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.insuranceco();
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

  route.get('/tpa', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.query);
    try {
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.getTpa();
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

  route.patch('/UpdateClaimStage1',upload.single('preauth_form'), celebrate({
    body: Joi.object({
      claim_status: Joi.number().required(),
      preauth_inidate: Joi.string().allow(null),
      preauth_iniamt: Joi.string().allow(null),


    }),
    query: Joi.object({
      PatientId: Joi.number().required()
    })
  }), async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    try {
      console.log(req.body,req.file)
      // console.log(fs.createReadStream('uploads/'+req.file.filename));
      let formData= new FormData();
      formData.append('claim_status',req.body.claim_status)
      if(req.body.preauth_inidate){
        formData.append('preauth_inidate',req.body.preauth_inidate)
      }
      if(req.body.preauth_iniamt){
        formData.append('preauth_iniamt',req.body.preauth_iniamt)
      }

      if(req.file){
        formData.append('preauth_form',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
      }
      
   
      const PatientId = Number(req.query.PatientId);

      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.UpdateClaimStage1(formData, PatientId);
      if(data['Message']=="Claim Stage 1 Completed Successfully, PreAuth Initiated."){
        let updatedcase = await bimaServiceInstance.updatedcase(data.payload);
        return res.status(201).json({success:true,data,updatedcase});
      }else{
        return res.status(400).json({success:false});
      }
     
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.patch('/UpdateClaimStage2', upload.single('pre_auth_appr_letter'), celebrate({
    body: Joi.object({
      claim_status: Joi.string().required(),
      prauth_apdate: Joi.string(),
      preauth_apamt: Joi.string(),
      claim_number: Joi.string(),
  


    }),
    query: Joi.object({
      PatientId: Joi.number().required()
    })
  }),async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    let formData= new FormData();
    formData.append('claim_status',req.body.claim_status)
    if(req.body.prauth_apdate){
      formData.append('prauth_apdate',req.body.prauth_apdate)
    }
    if(req.body.preauth_apamt){
      formData.append('preauth_apamt',req.body.preauth_apamt)
    }
    if(req.body.claim_number){
      formData.append('claim_number',req.body.claim_number)
    }

    if(req.file){
      formData.append('pre_auth_appr_letter',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
    }
    try {
      const PatientId = Number(req.query.PatientId);

      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.UpdateClaimStage2(formData, PatientId);
      if(data['Message']=="Claim Stage 2 Completed Successfully, PreAuth Approved."){
        let updatedcase = await bimaServiceInstance.updatedcase(data.payload);
        return res.status(201).json({success:true,data,updatedcase});
      }else{
        return res.status(400).json({success:false});
      }
   
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );
  route.patch('/UpdateClaimStage3',upload.single('fin_bill_summ'), celebrate({
    body: Joi.object({
      claim_status: Joi.string().required(),
      discharge_date: Joi.string(),
      billing_date: Joi.string(),
      finalapreq_date: Joi.string(),
      nursing_charges: Joi.string(),
      room_charges: Joi.string(),
      other_charges: Joi.string(),
      expense_pharmacy: Joi.string(),
      expense_diagnosis: Joi.string(),
      expense_total: Joi.string(),
  
    }),
    query: Joi.object({
      PatientId: Joi.number().required()
    })
  }), async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    try {
      let formData= new FormData();
      for ( var key in req.body ) {
        formData.append(key, req.body[key]);
    }

      if(req.file){
        formData.append('fin_bill_summ',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
      }
      const PatientId = Number(req.query.PatientId);
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.UpdateClaimStage3(formData, PatientId);
      if(data['Message']=="Claim Stage 3 Completed Successfully, Final Approval Initiated."){
        let updatedcase = await bimaServiceInstance.updatedcase(data.payload);
        return res.status(201).json({success:true,data,updatedcase});
      }else{
        return res.status(400).json({success:false});
      }
    
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

  route.patch('/UpdateClaimStage4',upload.single('final_appr_letter'),
    celebrate({
      body: Joi.object({
        claim_status: Joi.string().required(),
        fappr_date: Joi.string(),
        fappr_amt: Joi.string(),
        fappr_hosp_disc: Joi.string(),
        fappr_deduction_reason: Joi.string(),
       
        non_medical_amt: Joi.number(),
        co_pay_d_amt: Joi.number(),
        other_deduction: Joi.number(),
      }),
      query: Joi.object({
        PatientId: Joi.number().required()
      })
    }), async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        let formData= new FormData();
      for ( var key in req.body ) {
        formData.append(key, req.body[key]);
    }

      if(req.file){
        formData.append('final_appr_letter',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
      }
        const PatientId = Number(req.query.PatientId);
        const bimaServiceInstance = Container.get(BimaService);
        const data = await bimaServiceInstance.UpdateClaimStage4(formData, PatientId);
        if(data['Message']=="Claim Stage 3 Completed Successfully, Final Approval Initiated."){
          let updatedcase = await bimaServiceInstance.updatedcase(data.payload);
          return res.status(201).json({success:true,data,updatedcase});
        }else{
          return res.status(400).json({success:false});
        }
     
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.patch('/UpdateClaimStage5',upload.single('notes'),
    celebrate({
      body: Joi.object({
        claim_status: Joi.string().required(),
        file_sentdate: Joi.string(),
        tracking_no: Joi.string(),
        courier_company: Joi.string(),
     
      }),
      query: Joi.object({
        PatientId: Joi.number().required()
      })
    }), async (req: any, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        let formData= new FormData();
        for ( var key in req.body ) {
          formData.append(key, req.body[key]);
      }
  
        if(req.file){
          formData.append('notes',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
        }
        const PatientId = Number(req.query.PatientId);
        const bimaServiceInstance = Container.get(BimaService);
        const data = await bimaServiceInstance.UpdateClaimStage5(formData, PatientId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.patch('/UpdateClaimStage6',upload.single('settlement_letter_file'), celebrate({
    body: Joi.object({
      claim_status: Joi.string().required(),
      utrno: Joi.string(),
      utr_date: Joi.string(),
      settlement_letter: Joi.string(),
      discharge_date: Joi.string(),
      deduction_amount: Joi.string(),
      deduction_reason: Joi.string(),
      deduction_tds: Joi.string(),
      admission_type: Joi.string(),
      cheque_amount: Joi.string(),

    }),
    query: Joi.object({
      PatientId: Joi.number().required()
    })
  }), async (req: any, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    // logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
    try {
      let formData= new FormData();
      for ( var key in req.body ) {
        formData.append(key, req.body[key]);
    }

      if(req.file){
        formData.append('settlement_letter_file',fs.createReadStream('uploads/'+req.file.filename),req.file.filename)
      }
      const PatientId = Number(req.query.PatientId);
      const bimaServiceInstance = Container.get(BimaService);
      const data = await bimaServiceInstance.UpdateClaimStage6(formData, PatientId);
      return res.status(201).json(data);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  },
  );

}

