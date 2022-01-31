import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import MailerService from './mailer';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
import { IRole, IRoleInputDTO } from '@/interfaces/IRole';

@Service()
export default class roleBasedAccess {
  constructor(
    @Inject('RoleModule') private RoleModule: Models.RoleModule,
    @Inject('logger') private logger,

  ) {
  }

  public async addModules(userInputDTO: IRoleInputDTO): Promise<{ saveModule: any }> {
    try {


      let ModuleData = await this.RoleModule.findOne({ title: userInputDTO.title });
  
      // Check if valid user returned, return error if needed
      if (ModuleData) {
        throw new Error('title already exits');
      }

     // const user = req.currentUser;
      const ModuleObj = {
        path : userInputDTO.path,
        title: userInputDTO.title,
        icon : userInputDTO.icon,
        submenu : null,
       // updatedBy: user._id,
        isActive: true,
        isDeleted: false,
      };

      const newModule = new this.RoleModule(ModuleObj);
      let saveModule = await newModule.save();

    
      return { saveModule };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }


}
