import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

const loansSchema = new mongoose.Schema(
  {
    //org
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organizationschemas',
    },
    organizationName: {
      type: String
    },
    uploadedViaExcel:{
      type: Boolean
    },
    //invoice Type/Status
    isInsured: {
      type: Boolean,
    },
    invoiceStatus: {
      type: String,
      enum: ['Pending', 'InProcess', 'Funded', 'Rejected', 'Repaid'],
      default: 'Pending',
    },
    digiComment: {
      type: String,
    },
    lenderComment: {
      type: String,
    },
    // patient
    patientName: {
      type: String,
    },
    //borrower
    borrowerName: {
      type: String,
    },
    relation: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    emailId: {
      type: String,
    },
    contactNumber: {
      type: Number,
    },
    currentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    //occupaption details
    occupation: {
      type: String,
    },
    companyName: {
      type: String,
    },
    totalIncome: {
      type: Number,
    },
    //loan details
    loanAmount: {
      type: Number,
    },
    scheme: {
      type: Number,
    },
    interest: {
      type: Number,
    },
    processingFees: {
      type: Number,
    },
    //borrower's bank details
    accountNumber: {
      type: Number,
    },
    bankAssociated: {
      type: String,
    },
    branch: {
      type: String,
    },
    IFSCCode: {
      type: String,
    },
    //reference person
    referenceName: {
      type: String,
    },
    contactNoRefPerson: {
      type: Number,
    },
    relationship: {
      type: String,
    },
    emailIdRefPerson: {
      type: String,
    },
    // hospital
    hospitalName: {
      type: String,
    },
    // upload documents
    uploadAadharFront: {
      type: String,
    },
    uploadAadharBack: {
      type: String,
    },
    uploadPAN: {
      type: String,
    },
    uploadHospitalBill: {
      type: String,
    },
    uploadCancelledCheque: {
      type: String,
    },
    //relationship proof
    uploadProof: {
      type: String,
    },
    uploadIncomeProof: {
      type: String,
    },
    uploadBankStatement: {
      type: String,
    },
    uploadInsurancePolicy: {
      type: String,
    },
    uploadOtherDoc: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
    },
    isActive: {
      type: Boolean,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },

    // Disbursement data
    lenderStatus: {
      type: String,
    },
    Down_Payment_Amount: {
      type: Number,
    },
    Subvention_Amount: {
      type: Number,
    },
    PF_Amount: {
      type: Number,
    },
    Franking_Amount: {
      type: Number,
    },
    interest_Amount: {
      type: Number,
    },
    GST_Amount: {
      type: Number,
    },
    deduction_Amount: {
      type: Number,
    },
    EMI_Tenure: {
      type: Number,
    },
    EMI_Amount: {
      type: Number,
    },
    Approval_Date: {
      type: Date,
    },
    Disbursed_Amount: {
      type: Number,
    },
    Disbursement_Date: {
      type: Date,
    },
    Unique_Ref_No: {
      type: String,
    },
    Cash_Out_Flow_Amount: {
      type: Number,
    },
    invoiceId: {
      type: Number,
      index: { unique: true },
    },

    permanentPinCode: {
      type: Number,
    },
    permanentCity: {
      type: String,
    },
    permanentState: {
      type: String,
    },
    currentPinCode: {
      type: Number,
    },
    currentCity: {
      type: String,
    },
    currentState: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
loansSchema.plugin(AutoIncrement, {
  inc_field: 'invoiceId',
  start_seq: 202001,
});

export default mongoose.model<mongoose.Document>('patientloans', loansSchema);
