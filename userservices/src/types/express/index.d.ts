import { Document, Model } from 'mongoose';
import { IUser } from '@/interfaces/IUser';
import { Organization } from '@/models/organizationSchema';
import { product } from '@/models/productSchema';
import { productMapping } from '@/models/productMapping';
import { ClaimInvoiceDoc } from '@/models/claimInvoiceSchema';
import { businessLogicDoc } from '@/models/businessLogicSchema';
import { LTVDoc } from '@/models/LTVMasters';
import { IncrementValueDoc } from '@/models/IncrementValues';
declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }    
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
  }
  
  namespace Models {
    export type patientLoanModel = Model<Document>;
  }

  namespace Models {
    export type organizationModel = Model<Organization>;
  }
  namespace Models {
    export type productModel = Model<product>;
  }
  namespace Models {
    export type productMappingModel = Model<productMapping>;
  }
  namespace Models {
    export type ClaimInvoiceModel = Model<ClaimInvoiceDoc>;
  }
  namespace Models {
    export type businessLogicsModel = Model<businessLogicDoc & Document>;
  }
  namespace Models {
    export type TransactionDataModel = Model<Document>
  }
  namespace Models {
    export type InsuranceMasterModel = Model<Document>
  }
  namespace Models {
    export type TPAMasterModel = Model<Document>
  }
  namespace Models {
    export type LTVMasterModel = Model<LTVDoc & Document>
  }
  namespace Models {
    export type incrementValueModel = Model<IncrementValueDoc & Document>
  }
  namespace Models {
    export type CitiesModel = Model<Document>;
  }
}
