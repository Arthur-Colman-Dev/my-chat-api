import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  get() {
    return { status: 'ok', uptime: process.uptime() };
  }
}
