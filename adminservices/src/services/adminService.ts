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
export default class adminSidebarService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('userDetailsModel') private userDetails: Models.UserDetailsModel,
    @Inject('organizationModel') private organizationModel: Models.organizationModel,
    @Inject('patientLoanModel') private patientLoanModel: Models.patientLoanModel,
    @Inject('ApprovedLoans') private ApprovedLoansModel: Models.ApprovedLoansModel,
    @Inject('loans') private loansModel: Models.loansModel,
    @Inject('ClaimInvoice') private Invoice: Models.ClaimInvoiceModel,
    private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }

  public async getAllUsers(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1;
      var pageSize = 0;
      if (IFilterDTO.pageNumber) {
        var pageNumber = IFilterDTO.pageNumber;
      }
      if (IFilterDTO.pageSize) {
        var pageSize = IFilterDTO.pageSize;
      }
      //search

      var filters = IFilterDTO.filters || [];
      var searchFilters = [];
      searchFilters.push({ isDeleted: false });

      // for (var element of filters) {
      //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
      // }

      var userCount = await this.userModel.find({ $and: searchFilters }).countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);

      var users = await this.userModel.aggregate([
        { $match: { $and: searchFilters } },
        { $sort: { createdAt: -1 } },
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize },
        {
          $lookup: {
            from: 'organizationschemas',
            localField: 'organizationId',
            foreignField: '_id',
            as: 'organizationData',
          },
        },
      ]);

      var data = { users, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllLenderToAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const usr = await this.userModel.find({ role: 'Lender' }).sort({ updateAt: -1 });
      var data = usr;
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getUserByIdToAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id.toString();
      const usr = await this.userModel.aggregate([
        { $match: { _id: Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'organizationschemas',
            localField: 'organizationId',
            foreignField: '_id',
            as: 'orgData',
          },
        },
      ]);
      var data = usr;
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async addUserByAdmin(
    userInputDTO: IUserInputDTO,
    currentUser: IUser,
  ): Promise<{ data: any; responseCode: any }> {
    try {
      const salt = randomBytes(32);
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      var email = userInputDTO.email.toLowerCase();
      const findUser = await this.userModel.findOne({ email: email });

      if (findUser && findUser.email) {
        return {
          data: {
            success: false,
            message: 'Email is already registered.',
          },
          responseCode: 400,
        };
      }
      const orgData = await this.organizationModel.findOne({ _id: userInputDTO.organizationId });
      userInputDTO.testUser = orgData.testOrg;

      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        isActive: true,
        isDeleted: false,
        updatedAt: new Date().toUTCString(),
        createdAt: new Date().toUTCString(),
        updatedBy: currentUser._id,
        salt: salt.toString('hex'),
        password: hashedPassword,
        passwordUpdatedOn: new Date().toUTCString(),
      });
      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      this.logger.silly('Sending welcome email');
      await this.mailer.SendWelcomeEmail(userRecord);

      this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      var data = { user, success: true };
      return { data, responseCode: Created };
    } catch (error) {
      this.logger.error(error);
      return {
        responseCode: Server_Error,
        data: { success: false, error: error },
      };
    }
  }
  public async updatePassword(req, userInputDTO: IUserInputDTO, currentUser: IUser): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      const userDetails = await this.userModel.findOne({ _id: id });
      if (!userDetails) {
        return {
          data: {
            success: false,
            message: 'user not found',
          },
        };
      }
      const salt = randomBytes(32);
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });

      this.logger.silly('updating password');
      let passwordData: any = {};

      passwordData.updatedAt = new Date().toUTCString();
      passwordData.updatedBy = currentUser._id;
      passwordData.salt = salt.toString('hex');
      passwordData.password = hashedPassword;
      passwordData.passwordUpdateOn = new Date().toUTCString();

      const userRecord = await this.userModel.findByIdAndUpdate(
        { _id: id },
        { $set: passwordData },
        { useFindAndModify: false, new: true },
      );
      if (!userRecord) {
        throw new Error('password cannot be updated');
      }

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      var data = { success: true };
      return { data };
    } catch (error) {
      this.logger.error(error);
      return {
        data: { success: false, error: error },
      };
    }
  }
  public async editUserByAdmin(
    userInputDTO: IUserInputDTO,
    currentUser: IUser,
    req: Request,
  ): Promise<{ data: any; responseCode: any }> {
    try {
      const id = req.query._id;
      this.logger.silly('updating user db record');
      let userData: any = {
        ...userInputDTO,
        updatedAt: new Date().toUTCString(),
        updatedBy: currentUser._id,
      };

      const user = await this.userModel.findByIdAndUpdate(
        { _id: id },
        { $set: userData },
        { useFindAndModify: false, new: true },
      );
      var data = { success: true, message: user };
      return { data, responseCode: 200 };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async deleteUserByAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      await this.userModel.findByIdAndUpdate(
        { _id: id },
        { $set: { isDeleted: true, isActive: false } },
        { useFindAndModify: false },
      );
      const data = { success: true, message: 'user deleted' };
      return { data };
    } catch (e) {
      this.logger.error(e);
      return {
        data: { success: false, error: e },
      };
    }
  }
  public async updateAggregator(req,
    IAggregatorDTO: IAggregatorDTO,
    currentUser: IUser,
  ): Promise<{ data: any; responseCode: any }> {
    try {
      var user = await this.userModel.findOne({ _id: req.query._id });
      if (!user) {
        return {
          responseCode: Bad_Request,
          data: {
            success: false,
            message: 'user not found',
          },
        };
      }
      var saveUserDetails = await this.userModel.findByIdAndUpdate(
        { _id: req.query._id },
        { $set: IAggregatorDTO, updatedAt: new Date().toUTCString(), updatedBy: currentUser._id },
        { useFindAndModify: false, upsert: true, new: true },
      );
      return {
        responseCode: Created,
        data: {
          success: true,
          message: 'success',
          user: saveUserDetails,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return {
        responseCode: Bad_Request,
        data: {
          success: false,
          error: error,
        },
      };
    }
  }
  public async updateVendor(IVendorDTO: IVendorDTO, currentUser: IUser): Promise<{ data: any; responseCode: any }> {
    try {
      let userId = IVendorDTO.userId;
      var user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        return {
          responseCode: Bad_Request,
          data: {
            success: false,
            message: 'user not found',
          },
        };
      }
      let saveUserDetails = await this.userDetails.findByIdAndUpdate(
        { userId: userId },
        { $set: IVendorDTO, updatedAt: new Date().toUTCString(), updatedBy: currentUser._id },
        { useFindAndModify: false, upsert: true, new: true },
      );
      return {
        responseCode: Created,
        data: {
          success: true,
          message: 'success',
          user: saveUserDetails,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return {
        responseCode: Bad_Request,
        data: {
          success: false,
          error: error,
        },
      };
    }
  }
  public async updateLender(ILenderDTO: ILenderDTO, currentUser: IUser): Promise<{ data: any; responseCode: any }> {
    try {
      let userId = ILenderDTO.userId;
      var user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        return {
          responseCode: Bad_Request,
          data: {
            success: false,
            message: 'user not found',
          },
        };
      }
      let saveUserDetails = await this.userDetails.findByIdAndUpdate(
        { userId: userId },
        { $set: ILenderDTO, updatedAt: new Date().toUTCString(), updatedBy: currentUser._id },
        { useFindAndModify: false, upsert: true, new: true },
      );
      return {
        responseCode: Created,
        data: {
          success: true,
          message: 'success',
          user: saveUserDetails,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return {
        responseCode: Bad_Request,
        data: {
          success: false,
          error: error,
        },
      };
    }
  }
  public async updateHospital(req: Request,
    IHospitalDTO: IHospitalDTO,
    currentUser: IUser,
  ): Promise<{ data: any; responseCode: any }> {
    try {
      var user = await this.userModel.findOne({ _id: req.query._id });
      if (!user) {
        return {
          responseCode: Bad_Request,
          data: {
            success: false,
            message: 'user not found',
          },
        };
      }
      let saveUserDetails = await this.userModel.findByIdAndUpdate(
        { _id: req.query._id },
        { $set: IHospitalDTO, updatedAt: new Date().toUTCString(), updatedBy: currentUser._id },
        { useFindAndModify: false, upsert: true, new: true },
      );
      // let lenderAssociation = await this.HospitalLenderAssociationModel.
      return {
        responseCode: Created,
        data: {
          success: true,
          message: 'success',
          user: saveUserDetails,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return {
        responseCode: Bad_Request,
        data: {
          success: false,
          error: error,
        },
      };
    }
  }
  public async getClaimInvoicesToAdmin(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1;
      var pageSize = 0;
      if (IFilterDTO.pageNumber) {
        var pageNumber = IFilterDTO.pageNumber;
      }
      if (IFilterDTO.pageSize) {
        var pageSize = IFilterDTO.pageSize;
      }
      //search
      // var filters = IFilterDTO.filters || [];
      var searchFilters = [];
      // because search filter can't be an empty array
      searchFilters.push({ "LoanID": { $exists: true } });

      if (IFilterDTO.Status != undefined || null) {
        searchFilters.push({ Status: IFilterDTO.Status });
      }

      // for (var element of filters) {
      //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
      // }
      var userCount = await this.Invoice.find({ $and: searchFilters }).countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
      var claimInvoices = await this.Invoice
        .find({ $and: searchFilters })
        .sort({ updatedAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      var data = { claimInvoices, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllInvoicesToAdmin(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1;
      var pageSize = 0;
      if (IFilterDTO.pageNumber) {
        var pageNumber = IFilterDTO.pageNumber;
      }
      if (IFilterDTO.pageSize) {
        var pageSize = IFilterDTO.pageSize;
      }
      //uninsured/ reimbursement
      // var insuredStatus = IFilterDTO.isInsured

      //search
      var filters = IFilterDTO.filters || [];
      var searchFilters = [];
      searchFilters.push({ isDeleted: false });

      if (IFilterDTO.dateFrom != undefined || (null && IFilterDTO.dateTo != undefined) || null) {
        searchFilters.push({ createdAt: { $gte: IFilterDTO.dateFrom, $lte: IFilterDTO.dateTo } });
      }

      if (IFilterDTO.organizationId != undefined || null) {
        searchFilters.push({ organizationId: IFilterDTO.organizationId });
      }

      if (IFilterDTO.invoiceStatus != undefined || null) {
        searchFilters.push({ invoiceStatus: IFilterDTO.invoiceStatus });
      }
      if (IFilterDTO.isInsured != undefined || null) {
        searchFilters.push({ isInsured: IFilterDTO.isInsured });
      }
      // for (var element of filters) {
      //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
      // }
      var userCount = await this.patientLoanModel.find({ $and: searchFilters }).countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
      var patientLoans = await this.patientLoanModel
        .find({ $and: searchFilters })
        .sort({ updatedAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      var DApprovedInvoiceCount = 0;
      var totalFundedAmount = 0;

      var newData = await this.patientLoanModel.aggregate([
        {
          $facet: {
            DApprovedInvoiceCount: [
              {
                $match: {
                  $or: [{ invoiceStatus: 'InProcess' }, { invoiceStatus: 'Funded' }, { invoiceStatus: 'Repaid' }],
                },
              },
              { $count: 'total' },
            ],
            totalFundedAmount: [
              {
                $match: {
                  $or: [{ invoiceStatus: 'Funded' }, { invoiceStatus: 'Repaid' }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
            ],
          },
        },
      ]);
      if (newData[0].DApprovedInvoiceCount[0] != undefined) {
        DApprovedInvoiceCount = newData[0].DApprovedInvoiceCount[0].total
      }
      if (newData[0].totalFundedAmount[0] != undefined) {
        totalFundedAmount = newData[0].totalFundedAmount[0].total
      }

      var data = { DApprovedInvoiceCount, totalFundedAmount, patientLoans, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getInvoiceByIdToAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id.toString();
      const usr = await this.patientLoanModel.aggregate([
        { $match: { _id: Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'patientloanrepayments',
            localField: 'invoiceId',
            foreignField: 'invoiceId',
            as: 'repaymentData',
          },
        },
      ]);
      var data = usr;
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getClaimInvoiceByIdToAdmin(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id.toString();
      const usr = await this.Invoice.findOne({ _id: id })
      var data = usr;
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async editInvoiceByAdmin(req, currentUser: IUser, patientLoanDTO: IPatientLoanDTO): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      await this.patientLoanModel.findOne({ _id: id });
      let invoiceData: any = {};
      if (patientLoanDTO.invoiceStatus == true) {
        invoiceData.invoiceStatus = 'InProcess';
      } else {
        invoiceData.invoiceStatus = 'Rejected';
      }
      if (patientLoanDTO.digiComment) {
        invoiceData.digiComment = patientLoanDTO.digiComment;
      }
      invoiceData.updatedAt = new Date().toUTCString();
      invoiceData.updatedBy = currentUser._id;
      // invoiceData.organizationId = currentUser.organizationId

      const invoice = await this.patientLoanModel.findByIdAndUpdate(
        { _id: id },
        { $set: invoiceData },
        { useFindAndModify: false, new: true },
      );
      var data = { success: true, message: invoice };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // get Merchant list NICT
  public async getMerchantList(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1;
      var pageSize = 0;
      if (IFilterDTO.pageNumber) {
        var pageNumber = IFilterDTO.pageNumber;
      }
      if (IFilterDTO.pageSize) {
        var pageSize = IFilterDTO.pageSize;
      }

      var searchFilters = [];
      searchFilters.push({ _id: { $exists: true } });

      //search filter
      if (IFilterDTO.searchTerm != undefined) {
        searchFilters.push({
          $or: [
            { FullName: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
            { KOCode: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
            { Lender: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
          ]
        })
      }
      //date filter
      if (IFilterDTO.dateFrom != undefined || null && IFilterDTO.dateTo != undefined || null) {
        var dateFrom = IFilterDTO.dateFrom;
        var dateTo = IFilterDTO.dateTo.setDate(IFilterDTO.dateTo.getDate() + 1);
        var dateTo2 = new Date(dateTo)
        searchFilters.push({ UpdatedDate: { $gte: dateFrom, $lte: dateTo2 } });
      }

      var userCount = await this.loansModel.find({ $and: searchFilters }).countDocuments();
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
      var merchantUserList = await this.loansModel
        .find({ $and: searchFilters })
        .sort({ UpdatedDate: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      var todaysCount = 0;
      var todaysAmount = 0;
      var today = new Date();
      var todayDate = new Date(today.setHours(0,0,0,0));
      var tomorrow = new Date(today.setDate(today.getDate() + 1));

      var merchantData = await this.loansModel.aggregate([
        {
          $facet: {
            todaysCount: [
              { $match: { UpdatedDate: { $gte: todayDate, $lte: tomorrow } } },
              { $count: 'total' }
            ],
            todaysAmount: [
              { $match: { UpdatedDate: { $gte: todayDate, $lte: tomorrow } } },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
          },
        },
      ]);

      if (merchantData[0].todaysCount[0] != undefined) {
        todaysCount = merchantData[0].todaysCount[0].total
      }
      if (merchantData[0].todaysAmount[0] != undefined) {
        todaysAmount = merchantData[0].todaysAmount[0].total
      }

      var data = { merchantUserList, numberOfPages, todaysCount, todaysAmount };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // merchant details
  public async getMerchantById(req: Request): Promise<{ data: any }> {
    try {
      const merchantId = req.query.koCode;
      var merchantUser = await this.loansModel.findOne({ KOCode: merchantId });
      var data = { merchantUser };

      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update Loans NICT admin
  public async updateLoansToAdmin(req: Request): Promise<{ updatedData: any }> {
    try {
      const Code = req.query.KoCode;
      const {
        FullName,
        ApplicantsPanNo,
        ApplicantsAadhaarNo,
        DateOfBirth,
        Occupation,
        Country,
        City,
        BankAssociated,
        CurrentAddress,
        State,
        Pincode,
        MobileNumber,
        EmailId,
        LoanAmount,
        Scheme,
        ReferenceName,
        AlternateContactNumber,
        Interest,
        ProcessingFees,
        EMIAmount,
        uploadAadharDoc,
        uploadAadharDocs,
        uploadPANDoc,
        AccountNumber,
        District,
        Branch,
        IFSCCode,
        AccountHolderName,
        ApproveOrReject,
        valueChanged,
        AccountNumberForSBI,
      } = req.body;

      var dateObj = new Date().toISOString();

      let data = {
        ApproveOrReject,
        uploadAadharDoc,
        uploadAadharDocs,
        valueChanged,
        uploadPANDoc,
        AccountNumber,
        AccountNumberForSBI,
        FullName,
        ApplicantsPanNo,
        Country,
        City,
        ApplicantsAadhaarNo,
        DateOfBirth,
        Occupation,
        BankAssociated,
        CurrentAddress,
        State,
        Pincode,
        MobileNumber,
        LoanAmount,
        EmailId,
        Scheme,
        ReferenceName,
        AlternateContactNumber,
        Interest,
        ProcessingFees,
        EMIAmount,
        District,
        Branch,
        IFSCCode,
        AccountHolderName,
      };

      data.ApproveOrReject = ApproveOrReject;
      // data.UpdatedDate = dateObj;

      if (uploadAadharDoc) {
        data.uploadAadharDoc = uploadAadharDoc;
      }
      if (uploadAadharDocs) {
        data.uploadAadharDocs = uploadAadharDocs;
      }
      if (valueChanged) {
        data.valueChanged = valueChanged;
      }
      if (uploadPANDoc) {
        data.uploadPANDoc = uploadPANDoc;
      }
      if (AccountNumber) {
        data.AccountNumber = AccountNumber;
      }
      if (AccountNumberForSBI) {
        data.AccountNumberForSBI = AccountNumberForSBI;
      }
      if (FullName) {
        data.FullName = FullName;
      }
      if (ApplicantsPanNo) {
        data.ApplicantsPanNo = ApplicantsPanNo;
      }
      if (Country) {
        data.Country = Country;
      }
      if (City) {
        data.City = City;
      }
      if (ApplicantsAadhaarNo) {
        data.ApplicantsAadhaarNo = ApplicantsAadhaarNo;
      }
      if (DateOfBirth) {
        data.DateOfBirth = DateOfBirth;
      }
      if (Occupation) {
        data.Occupation = Occupation;
      }
      if (BankAssociated) {
        data.BankAssociated = BankAssociated;
      }
      if (CurrentAddress) {
        data.CurrentAddress = CurrentAddress;
      }
      if (State) {
        data.State = State;
      }
      if (Pincode) {
        data.Pincode = Pincode;
      }
      if (MobileNumber) {
        data.MobileNumber = MobileNumber;
      }
      if (LoanAmount) {
        data.LoanAmount = LoanAmount;
      }
      if (EmailId) {
        data.EmailId = EmailId;
      }
      if (Scheme) {
        data.Scheme = Scheme;
      }
      if (ReferenceName) {
        data.ReferenceName = ReferenceName;
      }
      if (AlternateContactNumber) {
        data.AlternateContactNumber = AlternateContactNumber;
      }
      if (Interest) {
        data.Interest = Interest;
      }
      if (ProcessingFees) {
        data.ProcessingFees = ProcessingFees;
      }
      if (EMIAmount) {
        data.EMIAmount = EMIAmount;
      }
      ///////////////////////////
      if (District) {
        data.District = District;
      }
      if (Branch) {
        data.Branch = Branch;
      }
      if (IFSCCode) {
        data.IFSCCode = IFSCCode;
      }
      if (AccountHolderName) {
        data.AccountHolderName = AccountHolderName;
      }

      const updateTPA = await this.loansModel.updateOne({ KOCode: Code }, { $set: data }, { useFindAndModify: false });
      var updatedData = {
        success: true,
        message: 'Data Update Successfully',
      };
      return { updatedData };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
