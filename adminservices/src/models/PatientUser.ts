import mongoose from 'mongoose';
const { Schema } = mongoose;

const patientUserSchema = new Schema(
    {
        userId: {      // related user Id admin , manger or agent
            type: mongoose.Schema.Types.ObjectId,
        },

        username: {
            type: String,
           // required: true,
            trim: true,
        },

        password: {
            type: String,
           // required: true
        },

        firstname: {
            type: String,
            //required: true
        },
        lastname: {
            type: String,
           // required: true
        },

        emailHash: {
            type: String
        },

        salt: {
            type: String
        },
        
        userType: {
            type: Number,
           // required: true
        },
        Role: {
            type: String,
           // required: true
        },
        NameOfTheOrganisation: {
            type: String
        }, 
        NameOfTheCEO: {
            type: String
        },
         ContactNoOfTheCEO: {
            type: Number
        }, 
        EmailIdOfTheCEO: {
            type: String
        }, 
        NameOfTheContactPersonSPOC: {
            type: String
        }, 
        ContactNoOfTheSPOC: {
            type: Number
        }, 
        EmailIdOfTheSPOC: {
            type: String
        }, 
        CINNoOfTheAggregator: {
            type: String
        },
        NatureOfBusinessOfAggregator: {
            type: String
        },
        Address: {
            type: String
        }, 
        Country: {
            type: String
        }, 
        State: {
            type: String
        },
        City: {
            type: String
        },
        Pincode: {
            type: Number
        },
        uploadPANDoc: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: new Date().toUTCString()
        },
        updatedAt: {
            type: Date,
            default:new Date().toUTCString()
        },

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Patient_Users', patientUserSchema);