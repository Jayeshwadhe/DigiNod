import mongoose from 'mongoose';
const PatientSchema = new mongoose.Schema({

    PatientName: {
        type: String
    }

}, { timestamps: true });


export default mongoose.model<mongoose.Document>('PatientSchema', PatientSchema);