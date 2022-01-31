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
  const organizationModel = {
    name: 'organizationModel',
    model: require('../models/organizationSchema').default,
  }
  const productMappingModel = {
    name: 'productMappingModel',
    model: require('../models/productMapping').default,
  }
  const merchantLoanModel = {
    name: 'merchantLoanModel',
    model: require('../models/loanSchema').default,
  }
  const approvedLoanModel = {
    name: 'approvedLoanModel',
    model: require('../models/approvedLoansSchema').default,
  }
  const BeemaGarageModel = {
    name: 'BeemaGarageModel',
    model: require('../models/BGpatientScheema').default,
  }

  const BGcaseModel = {
    name: 'BGcaseModel',
    model: require('../models/BGcaseScheema').default,
  }

  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [
      userModel,
      organizationModel,
      productMappingModel,
      merchantLoanModel,
      approvedLoanModel,
      // salaryModel,
      // whateverModel
      BeemaGarageModel,
      BGcaseModel
    ],
  });
  Logger.info('✌️ Dependency Injector loaded');

  await jobsLoader({ agenda });
  Logger.info('✌️ Jobs loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
