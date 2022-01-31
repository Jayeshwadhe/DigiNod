import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '@/interfaces/IUser';
import { Logger } from 'winston';
import { Organization } from '@/models/organizationSchema';

/**
 * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */

export default requiredOrg =>  {
  return async (req, res, next) =>  {
    console.log('organization Check');

    const OrganizationModel = Container.get('organizationModel') as mongoose.Model<Organization & mongoose.Document>;
    const OrganizationRecord = await OrganizationModel.findOne({ _id: req.currentUser.organizationId });

    if (OrganizationRecord.nameOfOrganization !== requiredOrg) {
      return res.status(401).end();
    } else {
      console.log('User meet required nameOfOrganization, going to next middleware');
      return next();
    }
  };
};

// const requiredOrg = async (req, res, next, nameOfOrganization) => {
//   const Logger: Logger = Container.get('logger');
//   try {
//     console.log('organisation Check');

//     const OrganizationModel = Container.get('organizationModel') as mongoose.Model<Organization & mongoose.Document>;
//     const OrganizationRFecord = await OrganizationModel.findById(req.currentUser._id);

//     if (OrganizationRFecord.nameOfOrganization !== nameOfOrganization) {
//       return res.status(401).end();
//     } else {
//       console.log('User meet required nameOfOrganization, going to next middleware');
//       return next();
//     }
//   } catch (e) {
//     Logger.error('🔥 Error attaching user to req: %o', e);
//     return next(e);
//   }
// };

// export default requiredOrg;
