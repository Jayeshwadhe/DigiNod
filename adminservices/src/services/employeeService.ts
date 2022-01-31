import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import {
  IUser,
  IUserInputDTO,
  IAggregatorDTO,
  IVendorDTO,
  ILenderDTO,
  IHospitalDTO,
  IPatientLoanDTO,
  IFilterDTO
} from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import argon2 from 'argon2';
import MailerService from './mailer';
import { randomBytes } from 'crypto';
import events from '../subscribers/events';
import { Types } from 'mongoose';
import userDetails from '@/models/userDetails';
const TaError = require('../api/utils/taerror');
const { OK, Created, Bad_Request, Unauthorized, Server_Error } = require('../api/utils/error.def');



@Service()
export default class employeeService {
 
  constructor(
  
    @Inject('Employess') private EmployeesModel: Models.EmployeesModel,
    @Inject('logger') private logger,
  ) { }


  public async getEmployees(IFilterDTO: IFilterDTO): Promise<{ getEmployees: any }> {
    try {
        var pageNumber = 1;
        var pageSize = 0;
        if (IFilterDTO.pageNumber) {
          var pageNumber = IFilterDTO.pageNumber;
        }
        if (IFilterDTO.pageSize) {
          var pageSize = IFilterDTO.pageSize;
        }
         //search
      var searchFilters = [];
      searchFilters.push({ isDeleted: false });
      var userCount = await this.EmployeesModel.find({ $and: searchFilters }).countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);

      var users = await this.EmployeesModel.find({ $and: searchFilters }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
   
      var getEmployees = { users, numberOfPages };
      return { getEmployees };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getEmployeeById(qube_ref_id: string): Promise<{ userCount: any }> {
    try {
        
      var userCount = await this.EmployeesModel.findOne({ qube_ref_id: qube_ref_id });
  


     
  
      return { userCount };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async AddEmployee(usrObj: any): Promise<{ UpdatedLoan: any }> {
    try {
      const UpdatedLoan = await this.EmployeesModel.create(usrObj);
      return { UpdatedLoan };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
 
  public async updateEmployeeLimit(Employee_id: string,Loan_limit:Number): Promise<{ userCount: any }> {
    try {
        var userCount:any={};
      var EmployeeData = await this.EmployeesModel.findOne({ _id: Employee_id });
      if (!EmployeeData) {
        
        userCount.success= false;
        userCount.message= "Invalid Employee";
         
        return {userCount}
      }
     let obj ={
        Loan_limit:Number(Loan_limit), 
        isActive: true 
     }
      const updateEmployee = await this.EmployeesModel.updateOne({ _id: Employee_id },{ $set: obj });
      console.log(updateEmployee)
      if (updateEmployee.ok==1) {
        userCount.success= true;
        userCount.message= "Employee Updated Successfully";
         
        
        
      }else{

        userCount.success= false;
        userCount.message= "Unable to Update";
        return {userCount}
      
      }



     
  
      return { userCount };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}