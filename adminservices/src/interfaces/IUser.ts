import { ObjectId } from "mongoose";

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

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  organizationId: ObjectId;
  role: string
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
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  address: Array<Object>;
  organizationId: ObjectId;
  testUser: boolean;
  accessControl: number;
}

export interface IAggregatorDTO {
  CINNumber: number,
  TotalNoOfHospital: number,
  NoOfTPAsAssociated: number,
  noOfICompAsd: number,
  ROIForAggregator: number,
}
export interface IVendorDTO {
  userId: string,
  VednorType: string,
  GSTNumber: string,
  PANNumber: string,
  bankName: string,
  accountNumber: string,
  IFSCCode: string,
  authorisedPersonName: string,
  contactDetailsForAuthPerson: number,
  PANNumberForAuthPerson: string,
  relationShip: string,
  RateOfDeduction: number,
  NoOfDaysCreditPeriod: number,
  SanctionLimit: number,
  HospitalName: string,
  HospitalId: string,
  LTV: number,
  KycDocument: string,
  Other: string,
  ParriPassu: string,
  LastTwoYrBank: string,
  LastAudFin: string,
  LastTwoFin: string,
  RegCert: string,
  GstCert: string,
  AddrProof: string
}
export interface ILenderDTO {
  userId: string,
  LenderType: string,
  GSTNumber: string,
  PANNumber: string,
  bankNameDisb: string,
  accountNumberDisb: string,
  IFSCCodeDisb: string,
  authorisedPersonName: string,
  contactDetailsForAuthPerson: number,
  bankNameCollection: string,
  accountNumberCollection: string,
  IFSCCodeCollection: string,
  PANNumberForAuthPerson: string,
  relationShip: string
}
export interface IHospitalDTO {
  LTV: number,
  HospitalType: string,
  GSTNumber: string,
  PANNumber: string,
  bankName: string,
  accountNumber: string,
  IFSCCode: string,
  authorisedPersonName: string,
  contactDetailsForAuthPerson: number,
  PANNumberForAuthPerson: string,
  relationShip: string,
  LenderId: string,
  LenderName: string,
  Visibility: string
  CINNumber: number,
  GSTcertificate: string,
  DateOfRegistration: string,
  HospitalRegistrationCertificate: string
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
export interface IAggrLenAssocDTO {
  aggregatorId: ObjectId,
  lenderId: ObjectId,
}
export interface IPatientLoanDTO {
  invoiceStatus: boolean,
  digiComment: string
}