import { IUser } from '@/interfaces/IUser';
import mongoose, { ObjectId } from 'mongoose';

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    emailHash: {
      type: String
    },

    password: String,

    salt: String,

    role: {
      type: String,
      enum: ['Admin', 'Hospital', 'Lender', 'Vendor', 'Aggregator', 'Validator'],
      required: [true, 'Please enter a role'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationSchema',
      required : true
    },

    testUser: {
      type: Boolean
    },
    
    lastLogin: {
      type: Date
    },
    passwordUpdatedOn: {
      type: Date
    },
    
    mobileNumber: Number,

    address: [{ street: String, state: String, city: String, pinCode: Number, country: String }],

    updatedAt: Date,

    createdAt: Date,

    isActive: Boolean,

    isDeleted: Boolean,
    BGHospitalId:{
      type:String,
      default:null
    }
  },
  { timestamps: true },
  
);

export default mongoose.model<IUser & mongoose.Document>('User', User);

export interface UserDoc extends mongoose.Document {
  name: string,
  role: string,
  organization: string,
  address: string
  confirmPassword: string,
  password: string,
  emailHash: string,
  mobileNumber: number,
  organizationId: ObjectId,
  organizationName: string
}