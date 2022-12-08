import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';

/**
 * The ClientModule is the part of our nest application that handles logic related to
 * users and hotels as well as their administration. It has endpoints for getting user/hotel
 * profile information and editing such information.
 */
@Module({
  controllers: [ClientController]
})
export class ClientModule {}
