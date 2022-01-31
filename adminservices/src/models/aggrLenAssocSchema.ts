
import mongoose from 'mongoose';

const aggrLenAssocSchema = new mongoose.Schema({

    aggregatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    isActive: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
}, { timestamps: true });


export default mongoose.model<mongoose.Document>('aggregatorLenderAssociation', aggrLenAssocSchema);


export interface aggrLenAssoc extends mongoose.Document {
    aggregatorId: mongoose.Schema.Types.ObjectId,
    lenderId: mongoose.Schema.Types.ObjectId,
}
