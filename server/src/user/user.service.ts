import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DBName } from 'src/utils/connectDB';
import { User, type UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name, DBName.linkUpDB)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async saveVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      })
      .exec();
  }

  async clearVerificationCode(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $unset: { verificationCode: 1, verificationCodeExpiresAt: 1 },
      })
      .exec();
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordHash,
      })
      .exec();
  }
}
