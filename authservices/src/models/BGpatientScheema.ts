import { IBimaGarage } from '@/interfaces/IBimaGarage';
import mongoose, { ObjectId } from 'mongoose';

const BGpatient = new mongoose.Schema(
    {   
        firstname: {
        type: String
        },
        lastname: {
          type: String
        },
        email: {
          type: String
        },
        primary_phone: {
          type: Number,
          unique: true,
          index: true,
        },
        dateofbirth: {
          type: String
        },
        gender: {
          type: String
        },
        zip_code: {
          type: String
        },
        address_line1: {
          type: String
        },
        city: {
          type: String
        },
        district: {
          type: String
        },
        state: {
          type: String
        },
        tpa: {
          type: Number
        },
        insuranceco: {
          type: Number
        },
        uhid: {
          type: String
        },
        policy_no: {
          type: String
        },
        inhouse_tpa: {
          type: Boolean
        },
        sum_insured: {
          type: Number
        },
        is_corporate: {
          type: Boolean
        },
        corporate_name: {
          type: String
        },
        policy_startdt: {
          type: Date
        },
        policy_enddt: {
          type: Date
        },
        Bg_Patient_id: {
          type: String
        },
        policy_doc: {
          type: String,
          default:null
        }


    },{
      timestamps:true
    }
)
// {username,password,hospital_name,city,state,policy_no,inhouse_tpa,sum_insured,is_corporate,corporate_name,policy_startdt,policy_enddt,policy_doc,
//   discharge_date,days_of_stay,ipdno,ailment,admission_type,customer,case_rep,hospital}

export default mongoose.model<IBimaGarage & mongoose.Document>('BGpatient', BGpatient);

export interface BimaGarageDoc extends mongoose.Document {

  firstname: string,
  lastname: string,
  email: string,
  primary_phone: string,
  dateofbirth: string,
  gender: string,
  zip_code: string,
  city: string,
  address_line1:string
  district: string,
  state:  string,
  tpa: number,
  insuranceco: number,
  uhid: string,
  policy_no: number,
  inhouse_tpa: boolean,
  sum_insured: number,
  is_corporate: boolean,
  corporate_name: string,  
  policy_startdt: Date,
  policy_enddt: Date,
  policy_doc: string

  }