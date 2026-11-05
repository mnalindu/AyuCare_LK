import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, StaffProfileDto } from './dto/login-response.dto';
import { Public } from './public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing active staff member' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiServiceUnavailableResponse({ description: 'Staff database integration is unavailable' })
  login(@Body() input: LoginDto): Promise<LoginResponseDto> { return this.auth.login(input); }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current active staff profile' })
  @ApiOkResponse({ type: StaffProfileDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, expired token or inactive user' })
  me(@CurrentUser() user: StaffProfileDto): StaffProfileDto { return user; }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client discards the access token; token remains valid until expiry' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  logout(): void { /* Stateless MVP: no server-side revocation. */ }
}
