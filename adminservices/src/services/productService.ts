import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { IProductDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
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
export default class productService {
  constructor(
    @Inject('productModel') private productModel: Models.productModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) { }


  public async getAllProduct(req: Request): Promise<{ data: any }> {
    try {
      //pagination
      var pageNumber = 1
      var pageSize = 0
      if(req.body.pageNumber){
      var pageNumber = parseInt(req.body.pageNumber.toString())
      }
      if(req.body.pageSize){
      var pageSize = parseInt(req.body.pageSize.toString())
      }
      //search
      var filters = req.body.filters || []
      var searchFilters = [];
      searchFilters.push({ isDeleted: false });
      for (var element of filters) {
        searchFilters.push(
          { [element.searchField]: { $regex: element.searchTerm, $options: 'i' } }
        )
      }
      var productCount = await this.productModel.find({ $and: searchFilters }).count()
      var numberOfPages = pageSize === 0 ? 1 : Math.ceil(productCount / pageSize);
      var products = await this.productModel.find({ $and: searchFilters }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
      var data = { products, numberOfPages };
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getProductById(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      const usr = await this.productModel.findOne({ _id: id });
      var data = usr
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async addProduct(productDTO: IProductDTO): Promise<{ data: any, responseCode: any }> {
    try {
      var productCode = productDTO.productCode;
      const product = await this.productModel.findOne({ 'productCode': productCode });

      if (product && product.productCode) {
        return {
          data: {
            success: false,
            message: 'Product code already exists',
          }, responseCode: 400
        }
      }
      this.logger.silly('Creating product db record');
      const productRecord = await this.productModel.create({
        ...productDTO,
        isActive: true,
        isDeleted: false,
        updatedAt: new Date().toUTCString(),
        createdAt: new Date().toUTCString(),
      });
      if (!productRecord) {
        throw new Error('product cannot be created');
      }
      const productDetails = productRecord.toObject();
      var data = { productDetails, success: true }
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
  public async editProduct(req, productDTO: IProductDTO): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      const user = await this.productModel.findByIdAndUpdate({ _id: id }, { $set: productDTO }, { useFindAndModify: false, new: true });
      var data = ({ message: user })
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async deleteProduct(req: Request, res: Response): Promise<{ data: any }> {
    try {
      const id = req.query._id;
      await this.productModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, isActive: false } }, { useFindAndModify: false });
      const data = ({ success: true, message: 'product deleted' })
      return { data };
    } catch (e) {
      this.logger.error(e);
      return {
        data: { success: false, error: e },
      }
    }
  }
}