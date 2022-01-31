import mongoose from 'mongoose';

const insuranceSchema = new mongoose.Schema({

    InsuranceCompanyName: {
        type: String
    },
    InsuranceCompanyCode: {
        type: String
    },

    InHouseTPA: {
        type: Boolean
    },

    TPAId: {
        type: mongoose.Schema.Types.ObjectId
    },

}, { timestamps: true });

export default mongoose.model<mongoose.Document>('InsuranceMaster', insuranceSchema);


