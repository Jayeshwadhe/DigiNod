import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { IProductMappingDTO } from '../interfaces/IUser';
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
export default class productMappingService {
    constructor(
        @Inject('productMappingModel') private productMappingModel: Models.productMappingModel,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    ) { }


    public async getAllProductMapping(req: Request): Promise<{ data: any }> {
        try {
            //pagination
            var pageNumber = 1
            var pageSize = 0
            if (req.body.pageNumber) {
                var pageNumber = parseInt(req.body.pageNumber.toString())
            }
            if (req.body.pageSize) {
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
            var userCount = await this.productMappingModel.find({ $and: searchFilters }).count()
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var productMapping = await this.productMappingModel.find({ $and: searchFilters }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
            var data = { productMapping, numberOfPages };
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getProductMappingById(req: Request, res: Response): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            const mappingData = await this.productMappingModel.findOne({ _id: id });
            if (!mappingData) {
                return {
                    data: {
                        message: "Empty data or Invalid Id",
                    }
                };
            }
            var data = mappingData
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async addProductMapping(productMappingDTO: IProductMappingDTO): Promise<{ data: any, responseCode: any }> {
        try {
            var productId = productMappingDTO.productId;
            var organizationId = productMappingDTO.organizationId;

            const mapping = await this.productMappingModel.findOne({ productId: productId, organizationId: organizationId });

            if (mapping) {
                return {
                    data: {
                        success: false,
                        message: 'mapping already exists',
                    }, responseCode: 400
                }
            }
            this.logger.silly('Creating product db record');
            const mappingRecord = await this.productMappingModel.create({
                ...productMappingDTO,
                isActive: true,
                isDeleted: false,
                updatedAt: new Date().toUTCString(),
                createdAt: new Date().toUTCString(),
            });
            if (!mappingRecord) {
                throw new Error('mapping cannot be created');
            }
            const mappingDetails = mappingRecord.toObject();
            var data = { mappingDetails, success: true }
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
    public async editProductMapping(req, productMappingDTO: IProductMappingDTO): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            await this.productMappingModel.findOne({ _id: id });
            let { organizationId, organizationName, productId, productName, ROI } = req.body;

            let productData: any = {};
            if (organizationId) { productData.organizationId = organizationId; };
            if (organizationName) { productData.organizationName = organizationName; };
            if (productId) { productData.productId = productId };
            if (productName) { productData.productName = productName };
            // if (ROI) { productData.ROI = ROI };
            productData.updatedAt = new Date().toUTCString();

            const mappingRecord = await this.productMappingModel.findByIdAndUpdate({ _id: id }, { $set: productData }, { useFindAndModify: false, new: true });
            if (!mappingRecord) {
                throw new Error('mapping cannot be created');
            }
            var data = ({ success: true, message: mappingRecord })
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async deleteProductMapping(req: Request, res: Response): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            await this.productMappingModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, isActive: false } }, { useFindAndModify: false });
            const data = ({ success: true, message: 'product mapping deleted' })
            return { data };
        } catch (e) {
            this.logger.error(e);
            return {
                data: { success: false, error: e },
            }
        }
    }
}