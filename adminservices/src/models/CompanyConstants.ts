
import mongoose from 'mongoose';

const companyConstant = new mongoose.Schema(
    {
        Name_of_the_Bank: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model<mongoose.Document>('companyConstant', companyConstant);
export interface companyConstantBank extends mongoose.Document {
    Name_of_the_Bank:Array<string>,
  
}