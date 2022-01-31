import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import OrgService from '../../services/organizationService';
import { IOrgInputDTO,IFilterDTO } from '../../interfaces/IUser';
import { Logger, loggers } from 'winston';
import { celebrate, Joi } from 'celebrate';
import DateExtension  from '@joi/date'
const JoiDate = Joi.extend(DateExtension)

const route = Router();

export default (app: Router) => {
  app.use('/org', route);

  route.get('/getAllOrg',
    celebrate({
      query: {
        pageNumber: Joi.number().positive(),
        pageSize: Joi.number().positive(),
        filters: Joi.array()
      }
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getAllOrg: %o', req.query);
      try {
        const OrgServiceInstance = Container.get(OrgService);
        const { data } = await OrgServiceInstance.getAllOrg(req.query as unknown as IFilterDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.get('/getOrgByIdToAdmin',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('getOrgByIdToAdmin: %o', req.body);
      try {
        const OrgServiceInstance = Container.get(OrgService);
        const { data } = await OrgServiceInstance.getOrgByIdToAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.post('/addOrgByAdmin',
    celebrate({
      body: Joi.object({
        nameOfOrganization: Joi.string().required(),
        typeOfOrganization: Joi.string().required(),
        dateOfRegistration: JoiDate.date().format('DD-MM-YYYY'),
        contactNumber: Joi.number().required(),
        email: Joi.string(),
        testOrg: Joi.boolean().required(),
        orgSidebar: Joi.boolean().required(),
      })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('addOrgByAdmin: %o', req.body);
      try {
        const OrgServiceInstance = Container.get(OrgService);
        const { responseCode, data } = await OrgServiceInstance.addOrgByAdmin(req.body as IOrgInputDTO);
        return res.status(responseCode).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
  route.post('/editOrgByAdmin',
  celebrate({
    body: Joi.object({
      nameOfOrganization: Joi.string().required(),
      typeOfOrganization: Joi.string().required(),
      dateOfRegistration: JoiDate.date().format('DD-MM-YYYY'),
      contactNumber: Joi.number().required(),
      email: Joi.string(),
    })
  }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('editOrgByAdmin: %o', req.body);
      try {
        const OrgServiceInstance = Container.get(OrgService);
        const { data } = await OrgServiceInstance.editOrgByAdmin(req, req.body as IOrgInputDTO);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  )
  route.delete('/deleteOrgByAdmin',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('deleteOrgByAdmin: %o', req.body);
      try {
        const OrgServiceInstance = Container.get(OrgService);
        const { data } = await OrgServiceInstance.deleteOrgByAdmin(req, res);
        return res.status(201).json({ data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    }
  )
}