import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IPatientLoanDTO, IUser, IFilterDTO } from '@/interfaces/IUser';
import { ObjectId } from 'mongoose';
import { patientLoanRepaymentDC } from '@/models/patientLoanRepayment';
const { OK, Created, Bad_Request, Unauthorized, Server_Error } = require('../api/utils/error.def');

@Service()
export default class practoService {
  constructor(
    @Inject('patientLoanModel') private patientLoanModel: Models.patientLoanModel,
    @Inject('loans') private loans: Models.loansModel,
    @Inject('ApprovedLoans') private ApprovedLoans: Models.ApprovedLoansModel,

    @Inject('patientLoanRepayment') private patientLoanRepaymentModel: Models.patientLoanRepaymentModel,

    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }

  public async updateInvoiceById(invoiceId: ObjectId, usrObj: any): Promise<{ repaymentupdate: any }> {
    try {
      const repaymentupdate = await this.patientLoanModel.updateOne({ invoiceId: invoiceId }, { $set: usrObj });
      return { repaymentupdate };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async UploadLoanByKoCode(KOCode: string, usrObj: any): Promise<{ UpdatedLoan: any }> {
    try {
      const UpdatedLoan = await this.loans.updateOne({ KOCode: KOCode }, { $set: usrObj });
      return { UpdatedLoan };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async UpdateAproveLoneByLLCode(LLCode: string, usrObj: any): Promise<{ updateTPA: any }> {
    try {
      const updateTPA = await this.ApprovedLoans.updateOne({ LLCode: LLCode }, { $set: usrObj });
      return { updateTPA };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async AddAproveLone(usrObj: any): Promise<{ upl: any }> {
    try {
      const upl = await this.ApprovedLoans.create(usrObj);
      return { upl };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async AddLoan(usrObj: any): Promise<{ UpdatedLoan: any }> {
    try {
      const UpdatedLoan = await this.loans.create(usrObj);
      return { UpdatedLoan };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getInvoiceById(invoiceId: ObjectId): Promise<{ invoice: any }> {
    try {
      const invoice = await this.patientLoanModel.findOne({ invoiceId: invoiceId });
      return { invoice };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAproveLoneByLLCode(LLCode: string): Promise<{ InvoiceNumberdata: any }> {
    try {
      const InvoiceNumberdata = await this.ApprovedLoans.findOne({ LLCode: LLCode });
      return { InvoiceNumberdata };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllApprovedloans(IFilterDTO: IFilterDTO): Promise<{ data: any }> {
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
      var searchFilters = [];
      searchFilters.push({ _id: { $exists: true } });

      if (IFilterDTO.searchTerm != undefined) {
        searchFilters.push({
          $or: [
            { FullName: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
            { KOCode: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
            { LLCode: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
            { Lender: { $regex: IFilterDTO.searchTerm, $options: 'i' } },
          ]
        })
      }
      // date filter
      if (IFilterDTO.dateFrom != undefined || null && IFilterDTO.dateTo != undefined || null) {
        var dateFrom = IFilterDTO.dateFrom;
        var dateTo = IFilterDTO.dateTo.setDate(IFilterDTO.dateTo.getDate() + 1);
        var dateTo2 = new Date(dateTo)
        searchFilters.push({ UpdatedDate: { $gte: dateFrom, $lte: dateTo2 } });
      }
      //Status Filter
      if (IFilterDTO.Status != undefined || null) {
        searchFilters.push({ Status: IFilterDTO.Status });
      }

      var productCount = await this.ApprovedLoans.find({ $and: searchFilters }).countDocuments();

      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(productCount / pageSize);

      var products = await this.ApprovedLoans
        .find({ $and: searchFilters })
        .sort({ UpdatedDate: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      var data = { products, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getLoanByKoCode(KOCode: string): Promise<{ loan: any }> {
    try {
      const loan = await this.loans.findOne({ KOCode: KOCode });
      return { loan };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async addRepayment(patientLoanRepayment: patientLoanRepaymentDC): Promise<{ repaymentupdated: any }> {
    try {
      var repaymentupdate = await this.patientLoanRepaymentModel.create({
        ...patientLoanRepayment,
      });

      const repaymentupdated = repaymentupdate.toObject();

      return { repaymentupdated };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
