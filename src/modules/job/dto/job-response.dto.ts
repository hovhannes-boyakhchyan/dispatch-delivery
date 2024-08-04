import { TaskStatusEnums } from '../../../common/enums';

export class JobResponseDto {
  deliveryId: string;
  status: TaskStatusEnums;
}
