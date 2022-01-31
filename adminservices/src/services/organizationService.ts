import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { IOrgInputDTO, IFilterDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import argon2 from 'argon2';
import MailerService from './mailer';
import { randomBytes } from 'crypto';
import events from '../subscribers/events';
const TaError = require('../api/utils/taerror');
const {
  OK,
  Created,
  Bad_Request,
  Unauthorized,
  Server_Error
} = require('../api/utils/error.def');
const validator = require('../api/utils/validator');
const tools = require('../api/utils/tools');
const crypto = require('crypto');

@Service()
export default class adminSidebarService {
  constructor(
    @Inject('organizationModel') private organizationModel: Models.organizationModel,
    private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }


  public async getAllOrg(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1
      var pageSize = 0
      if(IFilterDTO.pageNumber){
      var pageNumber = IFilterDTO.pageNumber
      }
      if(IFilterDTO.pageSize){
      var pageSize = IFilterDTO.pageSize
      }
      //search
      var filters = IFilterDTO.filters || []
      var searchFilters = [];
      searchFilters.push({isDeleted: false});
      // for(var element of filters){
      //   searchFilters.push(
      //     {[element.searchField]: { $regex: element.searchTerm, $options: 'i' }}
      //   )
      // }
      var userCount = await this.organizationModel.find({$and: searchFilters}).countDocuments()
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
      var organizations = await this.organizationModel.find({$and: searchFilters}).sort({ updatedAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
      var data = { organizations, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getOrgByIdToAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      const usr = await this.organizationModel.findOne({ _id: id });
      var data = usr
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async addOrgByAdmin(orgInputDTO: IOrgInputDTO): Promise<{ data: any, responseCode: any }> {
    try {
      var email = orgInputDTO.email.toLowerCase();
      const findOrg = await this.organizationModel.findOne({ 'email': email });

      if (findOrg && findOrg.email) {
        return {
          data: {
            success: false,
            message: 'Email is already registered.',
          }, responseCode: 400
        }
      }
      this.logger.silly('Creating user db record');
      const OrgRecord = await this.organizationModel.create({
        ...orgInputDTO,
        isActive: true,
        isDeleted: false,
        updatedAt: new Date().toUTCString(),
        createdAt: new Date().toUTCString(),
      });
      if (!OrgRecord) {
        throw new Error('Organization cannot be created');
      }
      this.logger.silly('Sending welcome email');
      await this.mailer.SendWelcomeEmail(OrgRecord);

      // this.eventDispatcher.dispatch(events.user.signUp, { organization: OrgRecord });

      const organization = OrgRecord.toObject();
      var data = { organization, success: true }
      return { data, responseCode: Created };
    }
    catch (error) {
      this.logger.error(error);
      return {
        responseCode: Server_Error,
        data: { success: false, error: error }
      }
    }
  }
  public async editOrgByAdmin(req, orgInputDTO: IOrgInputDTO): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      await this.organizationModel.findOne({ _id: id });
      let { email, contactNumber, dateOfRegistration, typeOfOrganization, nameOfOrganization } = req.body;

      let OrgData: any = {};
      if (email) { OrgData.email = email; };
      if (contactNumber) { OrgData.contactNumber = contactNumber; };
      if (dateOfRegistration) { OrgData.dateOfRegistration = dateOfRegistration };
      if (typeOfOrganization) { OrgData.typeOfOrganization = typeOfOrganization };
      if (nameOfOrganization) { OrgData.nameOfOrganization = nameOfOrganization };
      OrgData.updatedAt = new Date().toUTCString();

      const user = await this.organizationModel.findByIdAndUpdate({ _id: id }, { $set: OrgData }, { useFindAndModify: false, new: true });
      var data = ({ message: user })
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async deleteOrgByAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      await this.organizationModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, isActive: false } }, { useFindAndModify: false });
      const data = ({ success: true, message: 'organization deleted' })
      return { data };
    } catch (e) {
      this.logger.error(e);
      return {
        data: { success: false, error: e },
      }
    }
  }
}