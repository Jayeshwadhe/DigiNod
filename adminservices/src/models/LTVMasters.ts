import mongoose from 'mongoose';

const LTVSchema = new mongoose.Schema({

    hospialName: {
        type: String
    },
    hospialID: {
        type: mongoose.Schema.Types.ObjectId
    },
    LTV: {
        type: Number
    }

}, { timestamps: true });

export default mongoose.model<mongoose.Document>('LTVMaster', LTVSchema);









