import { IBGcase } from '@/interfaces/IBimaGarage';
import mongoose, { ObjectId } from 'mongoose';

const BgCase = new mongoose.Schema(
    {   
        insuranceco: {
        type: String
        },
        tpa: {
          type: String
        },
        customer: {
          type: String
        },
        case_rep: {
          type: String
        },
        claim_status: {
          type: String
        },
        ipdno: {
          type: String
        },
        contact_name: {
          type: String
        },
        contact_number: {
          type: String
        },
        admission_type: {
          type: String
        },
        treatment_type: {
          type: String
        },
        description: {
          type: String
        },
        admission_date: {
          type: String
        },
        discharge_date: {
          type: String
        },
        primary_doc: {
          type: String
        },
        ailment: {
          type: String
        },
        days_of_stay: {
          type: Number
        },
        room_type: {
          type: String
        },
        deposit_amount: {
          type: String
        },
        files: {
          type: String
        },
        claim_number: {
          type: String
        },
        preauth_inidate: {
          type: String
        },
        preauth_iniamt: {
          type: String
        },
        prauth_apdate: {
            type: String,
            default: null
          },
        preauth_apamt: {
          type: String,
          default: null
        },
        finalapreq_date: {
            type: String,
            default: null
        },
        expense_pharmacy: {
            type: String,
            default: null
        },
        expense_diagnosis: {
            type: String,
            default: null
        },
        expense_total: {
            type: String,
            default: null
        },
        billing_date: {
            type: String,
            default: null
        },
        fappr_date: {
            type: String,
            default: null
        },
        fappr_amt: {
            type: String,
            default: null
        },
        fappr_hosp_disc: {
            type: String,
            default: null
        },
        fappr_deduction_amt: {
            type: String
        },
        fappr_deduction_reason: {
            type: String
        },
        file_sentdate: {
            type: String,
            default: null
        },
        tracking_no: {
            type: String
        },
        courier_company: {
            type: String,
            default: null
        },
        notes: {
            type: String,
            default: null
        },
        utrno: {
            type: String
        },
        utr_date: {
            type: String,
            default: null
        },
        settle_date: {
            type: String,
            default: null
        },
        settlement_letter: {
            type: String,
            default: null
        },
        settlement_action: {
            type: String,
            default: null
        },
        deduction_amount: {
            type: String,
            default: null
        },
        deduction_reason: {
            type: String
        },
        deduction_tds: {
            type: String,
            default: null
        },
        cheque_amount: {
            type: String,
            default: null
        },
        queryp_comments: {
            type: String
        },
        rejection_comments: {
            type: String
        },
        preauth_form_status: {
            type: Number
        },
        preauth_form: {
            type: String
        },
        final_appr_letter: {
            type: String,
            default: null
        },
        settlement_letter_file: {
            type: String,
            default: null
        },
        created_on: {
            type: String
        },
        created_on_time: {
            type: String
        },
        preauth_init_time: {
            type: String
        },
        preauth_app_time: {
            type: String,
            default: null
        },
        fappr_init_time: {
            type: String,
            default: null
        },
        fappr_received_timestamp: {
            type: String,
            default: null
        },
        file_dispatch_time: {
            type: String,
            default: null
        },
        pending_file_dispatch_time: {
            type: String,
            default: null
        },
        claim_settled_time: {
            type: String,
            default: null
        },
        mopreauth_appr: {
            type: Boolean
        },
        mofinappr_appr: {
            type: Boolean
        },
        mo_comments: {
            type: String,
            default: null
        },
        mofinappr_comments: {
            type: String,
            default: null
        },
        nursing_charges: {
            type: String,
            default: null
        },
        room_charges: {
            type: String,
            default: null
        },
        other_charges: {
            type: String,
            default: null
        },
        mou_deduction_amt: {
            type: Boolean
        },
        non_medical_amt: {
            type: String,
            default: null
        },
        co_pay_d_amt: {
            type: String,
            default: null
        },
        other_deduction: {
            type: String,
            default: null
        },
        pre_auth_appr_letter: {
            type: String,
            default: null
        },
        claim_rejec_letter: {
            type: String,
            default: null
        },
        fin_bill_summ: {
            type: String,
            default: null
        },
        courier_receipt: {
            type: String,
            
        },
        case_id:{
            type:String
        },
        hospital:{
            type:Number
        }
    },{
        timestamps:true
    }
)
// {username,password,hospital_name,city,state,policy_no,inhouse_tpa,sum_insured,is_corporate,corporate_name,policy_startdt,policy_enddt,policy_doc,
//   discharge_date,days_of_stay,ipdno,ailment,admission_type,customer,case_rep,hospital}

export default mongoose.model<BgCaseDoc & mongoose.Document>('BGcase', BgCase);


export interface BgCaseDoc extends mongoose.Document {
    insuranceco: string,
    tpa: string,
    customer: string,
    case_rep: string,
    claim_status: string,
    ipdno: string,
    contact_name: string,
    contact_number: string,
    admission_type:string
    treatment_type: string,
    description:  string,
    admission_date: string,
    discharge_date: string,
    primary_doc: string,
    ailment: string,
    days_of_stay: number,
    room_type: string,
    deposit_amount: string,
    files: string,
    claim_number: string,  
    preauth_inidate: string,
    preauth_iniamt: string,
    prauth_apdate: string,
    preauth_apamt: string,
    finalapreq_date: string,
    expense_pharmacy: string,
    expense_diagnosis: string,
    expense_total: string,
    billing_date: string,
    fappr_date: string,
    fappr_amt: string,
    fappr_hosp_disc: string,
    fappr_deduction_amt: string,
    fappr_deduction_reason: string,
    file_sentdate: string,
    tracking_no: string,
    courier_company: string,
    notes: string,
    utrno: string,
    utr_date: string,
    settle_date: string,
    settlement_letter: string,
    settlement_action: string,
    deduction_amount: string,
    deduction_reason: string,
    deduction_tds: string,
    cheque_amount: string,
    queryp_comments: string,
    rejection_comments: string,
    preauth_form_status: number,
    preauth_form: string,
    final_appr_letter: string,
    settlement_letter_file: string,
    created_on: string,
    created_on_time: string,
    preauth_init_time: string,
    preauth_app_time: string,
    fappr_init_time: string,
    fappr_received_timestamp: string,
    file_dispatch_time: string,
    pending_file_dispatch_time: string,
    claim_settled_time: string,
    mopreauth_appr: string,
    mofinappr_appr: string,
    mo_comments: string,
    mofinappr_comments: string,
    nursing_charges: string,
    room_charges: string,
    other_charges: string,
    mou_deduction_amt: string,
    non_medical_amt: string,
    co_pay_d_amt: string,
    other_deduction: string,
    pre_auth_appr_letter: string,
    claim_rejec_letter: string,
    fin_bill_summ: string,
    courier_receipt: string
}

