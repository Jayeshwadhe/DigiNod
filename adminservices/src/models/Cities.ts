import mongoose from 'mongoose';


const CitySchema = new mongoose.Schema({

    Pincode: {
        type: String
    },

    CityName: {
        type: String
    },

    State: {
        type: String
    },

    District: {
        type: String
    }

}, { timestamps: true })


export default mongoose.model<mongoose.Document>('City', CitySchema);


