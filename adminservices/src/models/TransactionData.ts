import mongoose from 'mongoose';


const TransactionDataSchema = new mongoose.Schema({

    nameOfTPA: {
        type: String
    },
    hospialID: {
        type: mongoose.Schema.Types.ObjectId
    },
    hospitalID: {
        type: mongoose.Schema.Types.ObjectId
    },
}, { timestamps: true });

export default mongoose.model<mongoose.Document>('TransactionData', TransactionDataSchema);
