import { Logger, NotFoundException } from '@nestjs/common';
import {
  Document,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

export abstract class AbstractRepository<TDocument extends Document> {
  protected abstract readonly logger: Logger;

  protected constructor(protected readonly model: Model<TDocument>) {}

  async create(document: unknown): Promise<TDocument> {
    return (await this.model.create(document)).toJSON() as TDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    throwError = true,
    projection = {},
  ): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, projection, {
      lean: true,
    });

    if (!document && throwError) {
      this.logger.warn(`Document not found with filterQuery`, filterQuery);
      throw new NotFoundException(
        `${this.model.collection.name} document not found.`,
      );
    }

    return document as TDocument;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = {
      new: true,
      lean: true,
    },
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(
      filterQuery,
      update,
      options,
    );

    if (!document) {
      this.logger.warn(`Document not found with filterQuery`, filterQuery);
      throw new NotFoundException(
        `${this.model.collection.name} document not found.`,
      );
    }

    return document as TDocument;
  }

  async updateOne(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<void> {
    const document = await this.model.updateOne(filterQuery, update, {
      lean: true,
    });

    if (!document.modifiedCount) {
      this.logger.warn(`Document could not be updated`, filterQuery);
      throw new NotFoundException(
        `${this.model.collection.name} document not updated.`,
      );
    }
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery);
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<boolean> {
    const deleteResult = await this.model.deleteMany(filterQuery);
    return deleteResult.deletedCount >= 1;
  }
}
