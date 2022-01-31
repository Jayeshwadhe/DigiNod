import mongoose from 'mongoose';

const businessLogics = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    AggregetorLoan: {  //split percentage 
      type: Number,
    },
    HospitalLoan: {  //split percentage 
      type: Number,
    },
    AggregetorROI: {
      type: Number,
    },
    HospitalROI: {
      type: Number,
    },
    createdAt: {
      type: Date,
      require: false,
      default: null,
    },
    updatedAt: {
      type: Date,
      require: false,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      require: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<mongoose.Document>('businessLogics', businessLogics);

export interface businessLogicDoc extends mongoose.Document {
  AggregetorROI: number,
  HospitalROI: number,
  HospitalLoan: number,
  AggregetorLoan: number,
}