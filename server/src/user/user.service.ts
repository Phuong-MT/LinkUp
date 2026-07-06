import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DBName } from 'src/utils/connectDB';
import { User, type UserDocument, UserStatus } from './schema/user.schema';

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

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
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

  async createPendingUser(
    username: string,
    email: string,
    passwordHash: string,
    code: string,
    expiresAt: Date,
  ): Promise<UserDocument> {
    // Delete any existing pending user with the same username or email to avoid conflicts
    await this.userModel
      .deleteMany({
        status: UserStatus.PENDING,
        $or: [{ username }, { email }],
      })
      .exec();

    const newUser = new this.userModel({
      username,
      email,
      passwordHash,
      status: UserStatus.PENDING,
      verificationCode: code,
      verificationCodeExpiresAt: expiresAt,
    });
    return newUser.save();
  }

  async activateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          status: UserStatus.ACTIVE,
          $unset: { verificationCode: 1, verificationCodeExpiresAt: 1 },
        },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
