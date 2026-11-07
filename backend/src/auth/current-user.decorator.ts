import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { StaffProfileDto } from './dto/login-response.dto';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): StaffProfileDto => context.switchToHttp().getRequest<Request & { user: StaffProfileDto }>().user);
