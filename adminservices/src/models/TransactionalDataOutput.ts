import mongoose from 'mongoose';


const TransactionalDataOutputSchema = new mongoose.Schema({

    TPAName: {
        type: String
    },
    hospialID: {
        type: mongoose.Schema.Types.ObjectId
    },
    hospitalID: {
        type: mongoose.Schema.Types.ObjectId
    },

}, { timestamps: true });

export default mongoose.model<mongoose.Document>('TransactionalDataOutput', TransactionalDataOutputSchema);

