import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { REQUIRED_BUSINESS_ID } from '../constants';

@Injectable()
export class HeadersGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const businessId = request.headers['business'];

    if (!businessId) {
      throw new BadRequestException(REQUIRED_BUSINESS_ID);
    }

    return true;
  }
}
