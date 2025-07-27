import { Injectable } from '@nestjs/common';
import { CreateTaskDto, QuoteDataForCreateDeliveryDto } from './dto';
import { DeliveryProvidersEnum } from '../../common/enums';

@Injectable()
export class HelpersJobService {
  mapCreateDeliveryData(
    createTaskData: CreateTaskDto,
    quote: QuoteDataForCreateDeliveryDto,
  ): CreateTaskDto {
    createTaskData.quoteExternalReference = quote.quoteId;
    createTaskData.shouldSendCustomerNotifications = false;
    if (quote.providerService === DeliveryProvidersEnum.NASH) {
      createTaskData.jobId = quote.jobId;
      createTaskData.taskId = quote.taskId;
      createTaskData.jobConfigurationId = quote.jobConfigurationId;
    }

    return createTaskData;
  }
}
