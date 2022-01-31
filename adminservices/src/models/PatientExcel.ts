import mongoose from 'mongoose';

const PatientExcelSchema = new mongoose.Schema({

    Sr_No: {
        type: Number
    },
    Loan_ID: {
        type: String
    },
    loan_status_for_DigiSparsh: {
        type: String
    },
    Borrower_Name: {
        type: String
    },
    borrower_EmailId: {
        type: String
    },
    Loan_Amount: {
        type: Number
    },
    Amount_Disbursed: {
        type: Number
    },
    Total_Charges: {
        type: Number
    },
    Subvention_Amount: {
        type: Number
    },
    Subvention_percentage: {
        type: Number
    },
    PF_Amount: {
        type: Number
    },
    GST_Amount: {
        type: Number
    },
    EMI_Tenure: {
        type: String
    },
    Amount_to_be_repaid: {
        type: Number
    },
    Amount_Repaid: {
        type: Number
    },
    Excess_Shortfall: {
        type: String
    },
    Application_Date: {
        type: Date
    },
    Approval_ID: {
        type: String
    },
    Disbursement_Date: {
        type: Date
    },
    Aggregator_Name: {
        type: String
    },
    Amount_Credited_to: {
        type: String
    },
    repayment_Date: {
        type: Date
    },
    Due_date: {
        type: Date
    },
    days_Over_due: {
        type: Number
    },
    Account_No: {
        type: String
    },
    Unique_Ref_No: {
        type: String
    },
    FLDG_by_Aggregator: {
        type: Number
    },

}, { timestamps: true });

export default mongoose.model<mongoose.Document>('PatientExcel', PatientExcelSchema);

