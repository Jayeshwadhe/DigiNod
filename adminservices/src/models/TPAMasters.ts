import mongoose from 'mongoose';

const TPASchema = new mongoose.Schema({

    TPAName: {
        type: String
    },
    TPACode: {
        type: String
    },
    nameOfInsurer: {
        type: String
    },
    InsuranceCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
    }

}, { timestamps: true });


export default mongoose.model<mongoose.Document>('TPAMaster', TPASchema);
