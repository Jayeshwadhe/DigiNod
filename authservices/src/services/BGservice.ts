import { response, Response } from 'express';
import { Service, Inject } from 'typedi';
import MailerService from './mailer';
import { IBimaGarage, IBGPatientDTO, IBGcase } from '../interfaces/IBimaGarage';
import jwt from 'jsonwebtoken';
import config from '../config';
import axios from 'axios';

import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { filter } from 'lodash';

@Service()
export default class BimaService {

    constructor(
        @Inject('userModel') private userModel: Models.UserModel,
        @Inject('BeemaGarageModel') private BeemaGarageModel: Models.BeemaGarageModel,
        @Inject('BGcaseModel') private IBGcaseModel: Models.BGcaseModel,
        private mailer: MailerService,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
      ) {}
    public async token(){
       let url="https://deskqa2.bimagarage.com/api/token/"
       let userinfo={
        "username":"digisparsh-api",
        "password":"Digi@1234"
       }
        let token= await axios.post(url,userinfo)
       
        return  token.data.access
    }
   
      public async check_patient(mobileNumber:any){
        let url =`https://deskqa2.bimagarage.com/external/api/check-patient/${mobileNumber}`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
       
        return Response.data

      }
      public async check_case(PatientId:any){
        let url =`https://deskqa2.bimagarage.com/external/api/check-case/${PatientId}`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
     
        return Response.data

      }
      public async CreateHospital(Hospitaldata:any){
        
        
        let url =`https://deskqa2.bimagarage.com/external/api/create-hospital/`
        
        let access_token= await this.token();
        
        let Response = await axios.post(url,Hospitaldata,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
     
        return Response.data

      }
      public async CreatePatient(patientdata:any){
       
        
        let url =`https://deskqa2.bimagarage.com/external/api/create-patient/`      
        let access_token= await this.token();      
        let Response = await axios.post(url,patientdata,{
          headers:{
            'Authorization': `Bearer ${access_token}`,
            ...patientdata.getHeaders(),
          },
      
        }).then(res=>{
          return res.data
        }).catch(err=>{
          return err.data
        })
         
        return Response  
       
      }

      public async addPatient(patientdata:IBGPatientDTO, urldata :any){
        try {delete patientdata.policy_doc
          console.log(urldata);
          
          const findUser = await this.BeemaGarageModel.findOne({ primary_phone: patientdata.primary_phone });
          if(findUser){throw new Error('Patient record alredy exist')}
          const patientRecord = await this.BeemaGarageModel.create({...patientdata});
          if (!patientRecord) {throw new Error('Patient record cannot be created')}
          let id = urldata.payload.data.id
          let newId = patientRecord._id
          const addId = await this.BeemaGarageModel.findByIdAndUpdate(newId,{$set:{Bg_Patient_id:id.toString(),policy_doc:urldata.payload.data.policy_doc}});
          if (!addId) {throw new Error('Patient record id not saved')}
          const addPid = addId.toObject();
          var patientData = { addPid, success: true }
            return  patientData 
        } catch (error) {
          this.logger.error(error);
        }
      }

      public async createCase(body :any){
        let url =`https://deskqa2.bimagarage.com/external/api/create-case/`

        let access_token= await this.token();
      
      
        let Response = await axios.post(url,body,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
        return Response.data
      }

      public async addCase(casedata:IBGPatientDTO,urldata){
        try {
          const caseRecord = await this.IBGcaseModel.create({...Object.assign(casedata,{case_id:urldata.payload.data.id})});
          const caseRec = caseRecord.toObject();
          var caseData = { caseRec, success: true }
            return  caseData 
        } catch (error) {
          this.logger.error(error);
        }
      }
      
      // CaseStatistics
      public async CaseStatistics(){
        let url =`https://deskqa2.bimagarage.com/external/api/case-stats/`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
       
        return Response.data

      }
      public async hospitaldata(){
        let url =`https://deskqa2.bimagarage.com/external/api/hospital`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
       
        return Response.data

      }
      public async caselist(id,body){
        try {
          //pagination
          var pageNumber = 1
          var pageSize = 0
          // const addId = await this.IBGcaseModel.find({customer:id.toString()})
          if (body.pageNumber) {
              var pageNumber = parseInt(body.pageNumber.toString())
          }
          if (body.pageSize) {
              var pageSize = parseInt(body.pageSize.toString())
          }
          //search
        
          var searchFilters = [];
          searchFilters.push({customer:id.toString()});
       
          var userCount = await this.IBGcaseModel.find({ $and: searchFilters }).count()
          var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
          var Caselist = await this.IBGcaseModel.find({ $and: searchFilters }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);

          var PatientData = await this.IBGcaseModel.aggregate([
              { "$match": { "$and": searchFilters } },
              { "$skip": (pageNumber - 1) * pageSize },
              // { "$limit": pageSize },
              {
                  "$lookup": {
                    "from":"bgpatients",
                     "localField":"customer",
                     "foreignField":"Bg_Patient_id",
                     "as":"patientdata"
                  }
              }
            
          ])

          var data = {PatientData, numberOfPages,userCount };
          return  data ;
      }catch (e) {
        this.logger.error(e);
        throw e;
    }
    
    }
        
       
        

      

      public async insuranceco(){
        let url =`https://deskqa2.bimagarage.com/external/api/insuranceco`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
       
        return Response.data

      }

      public async getTpa(){
        let url =`https://deskqa2.bimagarage.com/external/api/tpa`
        let access_token= await this.token();
        
        let Response = await axios.get(url,{
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })      
        return Response.data
      }


      public async UpdateClaimStage1(UpdateClaimStage1:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-preauth-ini/${PatientId}`
        let access_token= await this.token();        
        let Response = await axios.patch(url,UpdateClaimStage1,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage1.getHeaders(),
            
          }
        })     
        return Response.data
      }

      public async UpdateClaimStage4(UpdateClaimStage4:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-fappr-rec/${PatientId}`
        let access_token= await this.token();      
        let Response = await axios.patch(url,UpdateClaimStage4,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage4.getHeaders(),
          }
        })      
        return Response.data
      }

      public async UpdateClaimStage5(UpdateClaimStage5:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-dispatch/${PatientId}`
        let access_token= await this.token();      
        let Response = await axios.patch(url,UpdateClaimStage5,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage5.getHeaders(),
          }
        })       
        return Response.data
      }

      public async UpdateClaimStage6(UpdateClaimStage6:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-settled/${PatientId}`
        let access_token= await this.token();        
        let Response = await axios.patch(url,UpdateClaimStage6,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage6.getHeaders(),
          }
        })
        return Response.data
      }
      public async UpdateClaimStage2(UpdateClaimStage2:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-preauth-appr/${PatientId}`
        let access_token= await this.token();
        
        let Response = await axios.patch(url,UpdateClaimStage2,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage2.getHeaders(),
          }
        })
       
        return Response.data

      }
      public async UpdateClaimStage3(UpdateClaimStage3:any,PatientId:number){
        let url =`https://deskqa2.bimagarage.com/external/api/updclm-fappr-ini/${PatientId}`
        let access_token= await this.token();
        
        let Response = await axios.patch(url,UpdateClaimStage3,{
          headers: {
            'Authorization': `Bearer ${access_token}`,
            ...UpdateClaimStage3.getHeaders(),
          }
        })
       
        return Response.data

      }
      public async updateUser(currentuser:any,data:any){
        console.log(currentuser,data)
        let localcdata={
          BGHospitalId:data
        }
         const updateUser = await this.userModel.findByIdAndUpdate(currentuser._id,{$set:localcdata})
       
       return updateUser
        

      }
      public async updatedcase(Updated:any){
        if(Updated.claim_status==1){
          Updated.claim_status="Preauth Initiated"
        }
        if(Updated.claim_status==2){
          Updated.claim_status="Preauth Approved"
        }
        if(Updated.claim_status==3){
          Updated.claim_status="Final Approval Initiated"
        }

        const updateUser = await this.IBGcaseModel.findOneAndUpdate({case_id:Updated.id.toString()},{$set:Updated})
       
        return updateUser
      }
}