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
  const patientLoanModel = {
    name: 'patientLoanModel',
    // Notice the require syntax and the '.default'
    model: require('../models/patientLoanSchema').default,
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
  const ClaimInvoiceModel = {
    name: 'ClaimInvoice',
    model: require('../models/claimInvoiceSchema').default,
  };
  const businessLogicsModel = {
    name: 'businessLogics',
    model: require('../models/businessLogicSchema').default,
  };
  const TransactionDataModel = {
    name: 'TransactionDataModel',
    model: require('../models/TransactionData').default,
  }
  const InsuranceMasterModel = {
    name: 'InsuranceMasterModel',
    model: require('../models/InsuranceMasters').default,
  }
  const TPAMasterModel = {
    name: 'TPAMasterModel',
    model: require('../models/TPAMasters').default,
  }
  const LTVMasterModel = {
    name: 'LTVMasterModel',
    model: require('../models/LTVMasters').default,
  }
  const incrementValueModel = {
    name: 'incrementValueModel',
    model: require('../models/IncrementValues').default,
  }
  const CitiesModel = {
    name: 'Cities',
    model: require('../models/Cities').default,
  };

  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [
      userModel,
      patientLoanModel,
      organizationModel,
      productMappingModel,
      productModel,
      ClaimInvoiceModel,
      businessLogicsModel,
      TransactionDataModel,
      TPAMasterModel,
      InsuranceMasterModel,
      LTVMasterModel,
      incrementValueModel,
      CitiesModel
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
