
import mongoose from 'mongoose';

const incrementValueSchema = new mongoose.Schema({

    countPlus: {
        type: Number,
        default: 0
    },
    PFfees: {
        type: Number
    }
}
);


export default mongoose.model<mongoose.Document>('incrementValue', incrementValueSchema);

export interface IncrementValueDoc extends mongoose.Document {
    PFfees: number,
    countPlus: number
}