import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { ConnectDBModule } from './utils/connectDB';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
     ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        ConnectDBModule,  
  ],
  controllers: [AppController],
  providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
