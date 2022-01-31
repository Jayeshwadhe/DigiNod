import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({

        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            ref: 'organizationSchemas'
        },
        productName: {
            type: String,
        },
        // tenure: {
        //     type: String
        // },
        // hasEMI: {
        //     type: Boolean
        // },
        interestMaster: [{ tenure: Number, interest : Number, processingFee: Number, productType: String}],

        moduleName: {
            type: String,
            enum: ['Patient', 'Merchant', 'Hospital'],
            required: false,
            default: null
        },
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
            default: false
        },
        isActive: {
            type: Boolean,
        }
    }, { timestamps: true }
);

export default mongoose.model<mongoose.Document>('productSchema', productSchema);

export interface product extends mongoose.Document {
    productCode: string,
    productName: number
    tenure: string
    hasEMI: Boolean,
    moduleName: number
}

