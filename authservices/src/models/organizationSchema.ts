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
    isActive: Boolean,
    isDeleted: Boolean,
    orgSidebar : Boolean,
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
    orgSidebar : Boolean
}