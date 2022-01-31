import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    nameOfOrganization: {
        type: String,
    },
    typeOfOrganization: {
        type: String,
    },
    dateOfRegistration: {
        type: Date,
    },
    contactNumber: {
        type: Number,
    },
    email: {
        type: String,
    },
    // CINNumber: {
    //     type: String,
    // },
    // GSTNumber: {
    //     type: String,
    // },
    // PANNumber: {
    //     type: String,
    // },
    orgSidebar: {
        type: Boolean
    },
    testOrg: {
        type: Boolean
    },
    // // used in case when hospital is created by aggregator(pristyn)
    // aggregatorId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users',
    //     required: false,
    // },

    isActive: Boolean,
    isDeleted: Boolean,
    updatedAt: Date,
    createdAt: Date,
});

export default mongoose.model<mongoose.Document>('OrganizationSchema', OrganizationSchema);

export interface Organization extends mongoose.Document {
    email: string,
    nameOfOrganization: string,
    typeOfOrganization: string
    dateOfRegistration: Date,
    contactNumber: number,
    orgSidebar: boolean,
    testOrg: boolean,
}