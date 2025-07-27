import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map, catchError } from 'rxjs';
import { SendIssueEmailDto } from './dtos';

@Injectable()
export class NotificationService {
  private logger: Logger;
  constructor(private httpService: HttpService) {
    this.logger = new Logger(NotificationService.name);
  }

  async sendIssueEmail(emailBody: SendIssueEmailDto): Promise<any> {
    const requestData: SendIssueEmailDto = {
      type: 'ISSUE_WITH_ORDER',
      provider: 'Cartwheel Delivery',
      ...emailBody,
    };

    return lastValueFrom(
      this.httpService
        .post(
          `${process.env.NOTIFICATION_BASE_URL}/notification/alert`,
          requestData,
        )
        .pipe(map((response) => response.data?.data))
        .pipe(
          catchError((e) => {
            this.logger.error('Send Issue Email: ', e);
            throw new BadRequestException(e);
          }),
        ),
    );
  }
}
