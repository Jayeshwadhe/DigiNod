import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { IAggrLenAssocDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
const TaError = require('../api/utils/taerror');
const {
    OK,
    Created,
    Bad_Request,
    Unauthorized,
    Server_Error
} = require('../api/utils/error.def');

@Service()
export default class aggrLenAssocService {
    constructor(
        @Inject('aggrLenAssocModel') private aggrLenAssocModel: Models.aggrLenAssocModel,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    ) { }


    public async getAllAggLenAssoc(req: Request): Promise<{ data: any }> {
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
            var userCount = await this.aggrLenAssocModel.find({ $and: searchFilters }).count()
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var aggLenAssoc = await this.aggrLenAssocModel.find({ $and: searchFilters }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);

            var associationData = await this.aggrLenAssocModel.aggregate([
                { "$match": { "$and": searchFilters } },
                { "$skip": (pageNumber - 1) * pageSize },
                // { "$limit": pageSize },
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "aggregatorId",
                        "foreignField": "_id",
                        "as": "aggregatorData"
                    }
                },
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "lenderId",
                        "foreignField": "_id",
                        "as": "lenderData"
                    }
                }
            ])

            var data = { aggLenAssoc, associationData, numberOfPages };
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAggLenAssocById(req: Request, res: Response): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            const associationData = await this.aggrLenAssocModel.findOne({ _id: id });
            if (!associationData) {
                return {
                    data: {
                        message: "Empty data or Invalid Id",
                    }
                };
            }
            var data = associationData
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async addAggLenAssoc(aggrLenAssocDTO: IAggrLenAssocDTO): Promise<{ data: any, responseCode: any }> {
        try {
            var aggregatorId = aggrLenAssocDTO.aggregatorId;
            var lenderId = aggrLenAssocDTO.lenderId;

            const association = await this.aggrLenAssocModel.findOne({ aggregatorId: aggregatorId, lenderId: lenderId });

            if (association) {
                return {
                    data: {
                        success: false,
                        message: 'association already exists',
                    }, responseCode: 400
                }
            }
            this.logger.silly('Creating product db record');
            const associationRecord = await this.aggrLenAssocModel.create({
                ...aggrLenAssocDTO,
                isActive: true,
                isDeleted: false,
                updatedAt: new Date().toUTCString(),
                createdAt: new Date().toUTCString(),
            });
            if (!associationRecord) {
                throw new Error('association cannot be created');
            }
            const associationDetails = associationRecord.toObject();
            var data = { associationDetails, success: true }
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
    public async editAggLenAssoc(req, aggrLenAssocDTO: IAggrLenAssocDTO): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            await this.aggrLenAssocModel.findOne({ _id: id });
            let { aggregatorId, lenderId } = aggrLenAssocDTO;

            let associationData: any = {};
            if (aggregatorId) { associationData.aggregatorId = aggregatorId; };
            if (lenderId) { associationData.lenderId = lenderId; };
            associationData.updatedAt = new Date().toUTCString();

            const associationRecord = await this.aggrLenAssocModel.findByIdAndUpdate({ _id: id }, { $set: associationData }, { useFindAndModify: false, new: true });
            if (!associationRecord) {
                throw new Error('association cannot be created');
            }
            var data = ({ success: true, message: associationRecord })
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async deleteAggLenAssoc(req: Request, res: Response): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            await this.aggrLenAssocModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, isActive: false } }, { useFindAndModify: false });
            const data = ({ success: true, message: 'association deleted' })
            return { data };
        } catch (e) {
            this.logger.error(e);
            return {
                data: { success: false, error: e },
            }
        }
    }
}