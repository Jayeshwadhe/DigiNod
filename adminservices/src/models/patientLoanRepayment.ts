import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

const patientLoanRepayment = new mongoose.Schema(
  {
    //org
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organizationschemas',
    },
    invoiceId: {
      type: Number,
      index: true,
    },
    name: {
      type: String,
    },
    mobile: {
      type: String,
    },
    EMI_Amount: {
      type: Number,
    },
    status: {
      type: String,
    },
    Bounce_Charges: {
      type: Number,
    },
    Delay_Charges: {
      type: Number,
    },
    Total_to_be_collected: {
      type: Number,
    },
    EMI_Number: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
    total_outstanding: {
      type: Number,
    },
    Repayment_Date: {
      type: Date,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<mongoose.Document>('patientLoanRepayment', patientLoanRepayment);

export interface patientLoanRepaymentDC extends mongoose.Document {
  organizationId: any;
  invoiceId: any;
  name: any;
  mobile: any;
  EMI_Amount: any;
  status: any;
  Bounce_Charges: any;
  Delay_Charges: any;
  Total_to_be_collected: any;
  EMI_Number: any;
  active: any;
  total_outstanding: any;
  Repayment_Date: any;
  updatedBy: any;
}
