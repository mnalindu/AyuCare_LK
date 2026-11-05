import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Check API process health (does not check database)' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  check(): { status: string } { return { status: 'ok' }; }
}
