// connectDB.ts
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

const logger = new Logger('ConnectDB');

export enum DBName {
    linkUpDB = 'linkup-db',
}
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI_LINKUP_DB'),
                dbName: DBName.linkUpDB,
                onConnectionCreate: (connection: Connection) => {
                    if (connection) {
                        logger.log(
                            'LinkUp-DB database connected successfully',
                        );
                    } else {
                        logger.log('LinkUp-DB connect failed');
                    }
                },
            }),
            connectionName: DBName.linkUpDB,
        }),
    ],
})
export class ConnectDBModule {}
