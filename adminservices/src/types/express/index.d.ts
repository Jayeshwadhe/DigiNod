
import { Document, Model } from 'mongoose';
import { IUser } from '@/interfaces/IUser';
import { IRole } from '@/interfaces/IRole';
import { ClaimUserDoc } from '@/models/claimUserSchema';
import { ClaimInvoiceDoc } from '@/models/claimInvoiceSchema';
import { SupplierUserDoc } from '@/models/supplier_users';
import { UserDoc } from '@/models/user';
import { Organization } from '@/models/organizationSchema';
import { product } from '@/models/productSchema';
import { productMapping } from '@/models/productMapping';
import { aggrLenAssoc } from '@/models/aggrLenAssocSchema';
import { patientLoanRepaymentDC } from '@/models/patientLoanRepayment';
import { companyConstantBank } from '@/models/CompanyConstants';
// import { CompanyConstantsModel } from '@/models/CompanyConstants';


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
    export type UserDetailsModel = Model<Document>;
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
    export type patientLoanModel = Model<Document>;
  }
  namespace Models {
    export type aggrLenAssocModel = Model<aggrLenAssoc>;
  }

  namespace Models {
    export type RoleModule = Model<IRole & Document>;
  }
  namespace Models {
    export type SupplierAdminDashboardModel = Model<Document>;
  }
  namespace Models {
    export type SupplierInvoiceModel = Model<Document>;
  }
  namespace Models {
    export type SupplierUserModel = Model<SupplierUserDoc>;
  }
  namespace Models {
    export type MerchantAdminDashboardModel = Model<Document>;
  }
  namespace Models {
    export type PatientAdminDashboardModel = Model<Document>;
  }
  namespace Models {
    export type patientLoansDashboardModel = Model<Document>;
  }

  namespace Models {
    export type OverviewAdminDashboardModel = Model<Document>;
  }

  namespace Models {
    export type ApprovedLoansModel = Model<Document>;
  }

  namespace Models {
    export type CitiesModel = Model<Document>;
  }

  // namespace Models {
  //   export type CompanyConstantsModel = Model<Document>;
  // }

  namespace Models {
    export type DigisparshMastersModel = Model<Document>;
  }

  namespace Models {
    export type EmployeesModel = Model<Document>;
  }

  namespace Models {
    export type HospitalLenderAssociationModel = Model<Document>;
  }

  namespace Models {
    export type IncrementValuesModel = Model<Document>;
  }

  namespace Models {
    export type InsuranceMastersModel = Model<Document>;
  }

  namespace Models {
    export type InvoiceModel = Model<Document>;
  }

  // namespace Models {
  //   export type InvoiceUserModel = Model<Document>;
  // }

  namespace Models {
    export type loansModel = Model<Document>;
  }

  namespace Models {
    export type LTVMastersModel = Model<Document>;
  }

  namespace Models {
    export type PatientExcelModel = Model<Document>;
  }

  // namespace Models {
  //   export type patientloansModel = Model<Document>;
  // }

  namespace Models {
    export type PatientUserModel = Model<Document>;
  }

  namespace Models {
    export type RepaymentModel = Model<Document>;
  }

  namespace Models {
    export type TPAMastersModel = Model<Document>;
  }

  namespace Models {
    export type TransactionalDataOutputModel = Model<Document>;
  }

  namespace Models {
    export type TransactionDataModel = Model<Document>;
  }

  namespace Models {
    export type ClaimDashboardModel = Model<Document>;
  }
  namespace Models {
    export type ClaimUserModel = Model<ClaimUserDoc>;
  }
  namespace Models {
    export type ClaimInvoiceModel = Model<ClaimInvoiceDoc>;
  }

  namespace Models {
    export type patientLoanRepaymentModel = Model<patientLoanRepaymentDC>;
  }
  namespace Models {
    export type companyConstant = Model<companyConstantBank>;
  }
}
