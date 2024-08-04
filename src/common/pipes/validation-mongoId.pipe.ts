import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ValidationMongoIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (mongoose.Types.ObjectId.isValid(value)) {
      return value;
    }
    throw new BadRequestException(`${value} must be valid MongoId`);
  }
}
