import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import jobsLoader from './jobs';
import Logger from './logger';
//We have to import at least all the events once so they can be triggered
import './events';

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  /**
   * WTF is going on here?
   *
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */

  const userModel = {
    name: 'userModel',
    // Notice the require syntax and the '.default'
    model: require('../models/user').default,
  };
  const userDetailsModel = {
    name: 'userDetailsModel',
    model: require('../models/userDetails').default,
  };
  const organizationModel = {
    name: 'organizationModel',
    model: require('../models/organizationSchema').default,
  };
  const productModel = {
    name: 'productModel',
    model: require('../models/productSchema').default,
  };
  const productMappingModel = {
    name: 'productMappingModel',
    model: require('../models/productMapping').default,
  };
  const aggrLenAssocModel = {
    name: 'aggrLenAssocModel',
    model: require('../models/aggrLenAssocSchema').default,
  };
  const patientLoanModel = {
    name: 'patientLoanModel',
    // Notice the require syntax and the '.default'
    model: require('../models/patientLoanSchema').default,
  };

  const supplierdashboardModel = {
    name: 'SupplierAdminDashboard',
    // Notice the require syntax and the '.default'
    model: require('../models/supplierdashboard').default,
  };

  const patientLoansDashboardModel = {
    name: 'patientLoansDashboardModel',
    // Notice the require syntax and the '.default'
    model: require('../models/patientLoansDashboard').default,
  };

  const supplierUserModel = {
    name: 'SupplierUser',
    // Notice the require syntax and the '.default'
    model: require('../models/supplier_users').default,
  };

  const SupplierInvoiceModel = {
    name: 'SupplierInvoice',
    model: require('../models/SupplierInvoiceSchema').default,
  };

  const RoleModuledModel = {
    name: 'RoleModule',
    // Notice the require syntax and the '.default'
    model: require('../models/RoleModule').default,
  };

  const MerchantAdminDashboard = {
    name: 'MerchantAdminDashboard',
    // Notice the require syntax and the '.default'
    model: require('../models/MerchantDashboard').default,
  };

  const PatientAdminDashboard = {
    name: 'PatientAdminDashboard',
    // Notice the require syntax and the '.default'
    model: require('../models/PatientDashboard').default,
  };

  const OverviewAdminDashboard = {
    name: 'OverviewAdminDashboard',
    // Notice the require syntax and the '.default'
    model: require('../models/OverviewDashboard').default,
  };

  const ApprovedLoansModel = {
    name: 'ApprovedLoans',
    model: require('../models/ApprovedLoans').default,
  };

  const CitiesModel = {
    name: 'Cities',
    model: require('../models/Cities').default,
  };

  const companyConstant = {
    name: 'companyConstant',
    model: require('../models/CompanyConstants').default,
  };

  const DigisparshMastersModel = {
    name: 'DigisparshMasters',
    model: require('../models/DigisparshMasters').default,
  };

  const EmployeesModel = {
    name: 'Employess',
    model: require('../models/Employees').default,
  };

  const HospitalLenderAssociationModel = {
    name: 'HospitalLenderAssociation',
    model: require('../models/HospitalLenderAssociations').default,
  };

  const IncrementValuesModel = {
    name: 'IncrementValues',
    model: require('../models/IncrementValues').default,
  };

  const InsuranceMastersModel = {
    name: 'InsuranceMasters',
    model: require('../models/InsuranceMasters').default,
  };

  // const InvoiceModel = {
  //   name: 'Invoice',
  //   model: require('../models/claimInvoiceSchema').default,
  // };

  // const InvoiceUserModel = {
  //   name: 'InvoiceUser',
  //   model: require('../models/InvoiceUser').default,
  // };

  const loansModel = {
    name: 'loans',
    model: require('../models/loans').default,
  };

  const PatientUserModel = {
    name: 'PatientUser',
    model: require('../models/PatientUser').default,
  };

  const RepaymentModel = {
    name: 'Repayment',
    model: require('../models/Repayment').default,
  };

  const TPAMastersModel = {
    name: 'TPAMasters',
    model: require('../models/TPAMasters').default,
  };

  const TransactionalDataOutputModel = {
    name: 'TransactionalDataOutput',
    model: require('../models/TransactionalDataOutput').default,
  };

  const TransactionDataModel = {
    name: 'TransactionData',
    model: require('../models/TransactionData').default,
  };
  const ClaimInvoiceModel = {
    name: 'ClaimInvoice',
    model: require('../models/claimInvoiceSchema').default,
  };

  const ClaimUserModel = {
    name: 'ClaimUser',
    model: require('../models/claimUserSchema').default,
  };
  const ClaimDashboardModel = {
    name: 'ClaimDashboard',
    model: require('../models/claimDashboard').default,
  };
  const patientLoanRepayment = {
    name: 'patientLoanRepayment',
    model: require('../models/patientLoanRepayment').default,
  };
  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [
      userModel,
      userDetailsModel,
      organizationModel,
      productModel,
      patientLoanModel,
      aggrLenAssocModel,
      productMappingModel,
      supplierUserModel,
      SupplierInvoiceModel,
      supplierdashboardModel,
      patientLoansDashboardModel,
      MerchantAdminDashboard,
      PatientAdminDashboard,
      OverviewAdminDashboard,
      RoleModuledModel,
      ApprovedLoansModel,
      CitiesModel,
      companyConstant,
      DigisparshMastersModel,
      EmployeesModel,
      HospitalLenderAssociationModel,
      IncrementValuesModel,
      InsuranceMastersModel,
      // InvoiceModel,
      // InvoiceUserModel,
      loansModel,
      PatientUserModel,
      RepaymentModel,
      TPAMastersModel,
      TransactionalDataOutputModel,
      TransactionDataModel,
      ClaimInvoiceModel,
      ClaimUserModel,
      ClaimDashboardModel,
      patientLoanRepayment,
      // patientLoansModel
      // salaryModel,
      // whateverModel
    ],
  });
  Logger.info('✌️ Dependency Injector loaded');

  await jobsLoader({ agenda });
  Logger.info('✌️ Jobs loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
