import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import PatientAdminService from '../../services/PatientAdminService';
import patientService from '../../services/PatientService';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {

    app.use('/patientloan', route);

    //new microservice api data
    route.get('/getPatientData', async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');
        logger.debug('get patient data: %o', req.body);
        try{
            const patientServiceInstance = Container.get(patientService);
            const { patientDataDashboard } = await patientServiceInstance.getPatientData(req);
            return res.status(201).json({ patientDataDashboard });
        } catch(e){
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });


    // Patient Dashboard APIs

    route.get('/getpdash', async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');
        logger.debug('get pdash: %o', req.body);
        try{
            const patientAdminServiceInstance = Container.get(PatientAdminService);
            const { data } = await patientAdminServiceInstance.getPatientDash(req);
            return res.status(201).json({ data });
        } catch(e){
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })

    // dashboard job api for patient
    route.get('/patientDashboardJob', async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');

        try{
            const patientAdminServiceInstance = Container.get(PatientAdminService);
            const {patientDashboardData} = await patientAdminServiceInstance.patientDashboardJob(req);
            return res.status(201).json({ patientDashboardData });
        } catch(e){
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

    // get userlist for patient
    route.get('/getPatientUserListToAdmin', async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');
        logger.debug('get patient userlist to admin: %o', res);
        try{
            const patientAdminServiceInstance = Container.get(PatientAdminService);
            const {resPatientUserListToAdmin} = await patientAdminServiceInstance.getPatientUserListToAdmin(req);
            return res.status(201).json({ resPatientUserListToAdmin });
        } catch(e){
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

}