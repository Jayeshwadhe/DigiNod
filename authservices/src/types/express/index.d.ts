import { Document, Model } from 'mongoose';
import { IUser } from '@/interfaces/IUser';
import { UserDoc } from '@/models/user';
import { Organization } from '@/models/organizationSchema';
import { productMapping } from '@/models/productMapping';
import { approvedLoanDC } from '@/models/approvedLoansSchema';
import { BimaGarageDoc } from '@/models/BGpatientScheema'
import { IBimaGarage } from '@/interfaces/IBimaGarage';
import { IBGcase } from '@/interfaces/IBimaGarage';
import { BgCaseDoc } from '@/models/BGcaseScheema'



declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }    
  }

  namespace Models {
    export type UserModel = Model<IUser & UserDoc>;
  }
  namespace Models {
    export type organizationModel = Model<Organization>
  }
  namespace Models {
    export type productMappingModel = Model<productMapping>
  }
  namespace Models {
    export type merchantLoanModel = Model<merchantLoanModel>
  }
  namespace Models {
    export type approvedLoanModel = Model<approvedLoanDC>
  }

    namespace Models {
    export type BeemaGarageModel = Model<IBimaGarage & BimaGarageDoc>;
  } 
    namespace Models {
    export type BGcaseModel = Model<IBGcase & BgCaseDoc>;
  }
}
