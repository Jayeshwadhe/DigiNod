import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IPatientLoanDTO, IUser } from '@/interfaces/IUser';
import { ObjectId } from 'mongoose';
import { companyConstantBank } from '@/models/CompanyConstants';

const { OK, Created, Bad_Request, Unauthorized, Server_Error } = require('../api/utils/error.def');

@Service()
export default class companyConstentService {
  constructor(
    @Inject('companyConstant') private companyConstant: Models.companyConstant,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

 

  public async getAllBanks(): Promise<{ companyConstant: any }> {
    try {
      const companyConstant = await this.companyConstant.find({});
      return { companyConstant };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async addbank(companyConstantBank: any): Promise<{ companyConstantBankdata: any }> {
    try {
        console.log(companyConstantBank);
      var companyConstantBankdata = await this.companyConstant.insertMany([...companyConstantBank]);


      return { companyConstantBankdata };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
