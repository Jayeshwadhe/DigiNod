import { ObjectId } from "mongoose";

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
  BGHospitalId:string;
  address:Array<any>;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  role : String;
  address: Array<Object>;
  BGHospitalId:string;
}
