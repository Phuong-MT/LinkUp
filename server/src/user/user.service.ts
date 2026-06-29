import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { DBName } from 'src/utils/connectDB';
import { Model, Types } from 'mongoose';
import { UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name, DBName.linkUpDB)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async findByUsername(username: string): Promise<UserDocument | null> {
        const query: any = { username };
        return this.userModel.findOne(query).exec();
    }
}
