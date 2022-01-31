import mongoose from 'mongoose';

const productMapping = new mongoose.Schema({

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productSchemas'
    },
    productName: {
        type: String
    },
    organizationName: {
        type: String
    },
    // ROI: {
    //     type: Number,
    // },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
    },
    isDeleted: {
        type: Boolean,
    },
    isActive:{
        type: Boolean
    }
}, { timestamps: true })

export default mongoose.model<mongoose.Document>('productMapping', productMapping);

export interface productMapping extends mongoose.Document {
    organizationId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    productName: string,
    organizationName: string,
    ROI: number
}


