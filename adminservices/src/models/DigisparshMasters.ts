import mongoose from 'mongoose';

const digiSparshSchema = new mongoose.Schema({

    hospitalID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    hospitalName: {
        type: String
    },
    InsuranceCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InsuranceMasters',
        default: null
    },
    nameOfInsurer: {
        type: String
    },
    TPAId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TPAMaster',
        default: null
    },
    TPAName: {
        type: String
    },
    LTV: {
        type: Number
    },
    Tenure: {
        type: String
    },
    ROI: {
        type: String
    },

}, { timestamps: true });


export default mongoose.model<mongoose.Document>('digiSparshMaster', digiSparshSchema);

