import { StringNullableChain } from 'lodash';
import { ObjectId } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  organizationId: ObjectId;
  role: string;
  testUser: boolean;
  passwordUpdatedOn: Date;
  CINNumber: string,
  GSTNumber: string,
  PANNumber: string,
  hospitalName: string,
  dateOfRegistration: Date,
  address: string,
  mobileNumber: number
  isSplit: Boolean,
  aggregatorSplit: number,
  hospitalSplit: number,
  aggregatorROI: number,
  hospitalROI: number,
  AvailableLimit: number,
  UtilizedAmount: number,
  Repayment: number,
  ExistingCreditLimit: number,
  ROIForAggregator: number,
  LenderTenure: number,
  LenderROI: number,
  isActive: boolean,
  LStatus: any,
  LenderLTV: any,
  LenderId: any,
  aggregatorId: any,
  LTV: any
}
export interface IFilterDTO {
  _id: string;
  pageNumber: number;
  pageSize: number;
  filters: Array<Object>;
  Status: string;
  isInsured: boolean;
  invoiceStatus: string;
  dateFrom: Date;
  dateTo: Date;
  organizationId: string;
  searchTerm: string;
}

export interface IOrgInputDTO {
  nameOfOrganization: string,
  typeOfOrganization: string,
  dateOfRegistration: Date,
  contactNumber: number,
  email: string,
  orgSidebar: boolean,
  testOrg: boolean,
  // CINNumber: string,
  // GSTNumber: string,
  // PANNumber: string,
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
}

export interface IPatientLoanDTO {
  invoiceStatus: string;
  organizationId: ObjectId;
  isInsured: Boolean;
  patientName: string;
  borrowerName: string;
  relation: string;
  dateOfBirth: Date;
  contactNumber: number;
  emailId: string;
  occupation: string;
  permanentAddress: string;
  currentAddress: string;
  companyName: string;
  totalIncome: number;
  loanAmount: number;
  referenceName: string;
  contactNoRefPerson: number;
  relationship: string;
  emailIdRefPerson: string;
  hospitalName: string;
  bankAssociated: string;
  branch: string;
  accountNumber: number;
  IFSCCode: string;
  scheme: number;
  interest: number;
  processingFees: number;
  uploadAadharFront: string;
  uploadAadharBack: string;
  uploadPAN: string;
  uploadProof: string;
  uploadCancelledCheque: string;
  uploadIncomeProof: string;
  uploadHospitalBill: string;
  uploadBankStatement: string;
  uploadInsurancePolicy: string;
  uploadOtherDoc: string;
  permanentPinCode: number;
  permanentCity: string;
  permanentState: string;
  currentPinCode: number;
  currentCity: string;
  currentState: string;
}
export interface IProductDTO {
  productCode: string,
  productName: string,
  // tenure: string,
  // hasEMI: Boolean,
  interestMaster: Array<Object>,
  moduleName: string
}
export interface IProductMappingDTO {
  organizationId: ObjectId,
  organizationName: string,
  productId: ObjectId,
  productName: string,
  // ROI: number,
}

export interface IHospitalDTO {
  hospitalName: string,
  CINNumber: string,
  GSTNumber: string,
  PANNumber: string,
  dateOfRegistration: Date,
  email: string,
  password: string,
  name: string,
  address: string,
  mobileNumber: number
  isSplit: Boolean,
  aggregatorSplit: number,
  hospitalSplit: number,
  aggregatorROI: number,
  hospitalROI: number,
}