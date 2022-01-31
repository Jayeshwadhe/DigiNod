
import mongoose from 'mongoose';

const HospitalLenderAssociationSchema = new mongoose.Schema({

    HospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    HospitalName: {
        type: String
    },
    LenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    LenderName: {
        type: String
    },
    CreditLimit: {
        type: String
    },
    UtilizedLimit: {
        type: String
    },
}, { timestamps: true });


export default mongoose.model<mongoose.Document>('HospitalLenderAssociation', HospitalLenderAssociationSchema);



