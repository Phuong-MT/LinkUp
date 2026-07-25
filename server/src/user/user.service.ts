import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async searchUsers(query: string, limit = 10): Promise<UserDocument[]> {
    return this.userModel
      .find({
        status: UserStatus.ACTIVE,
        username: { $regex: query, $options: 'i' },
      })
      .limit(limit)
      .exec();
  }

  async searchFriends(userId: string, query: string, limit = 10): Promise<UserDocument[]> {
    const user = await this.userModel.findById(userId).select('friends').exec();
    if (!user || !user.friends || user.friends.length === 0) {
      return [];
    }
    return this.userModel
      .find({
        _id: { $in: user.friends },
        status: UserStatus.ACTIVE,
        username: { $regex: query, $options: 'i' },
      })
      .limit(limit)
      .exec();
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $addToSet: { friends: new Types.ObjectId(friendId) },
      })
      .exec();
    await this.userModel
      .findByIdAndUpdate(friendId, {
        $addToSet: { friends: new Types.ObjectId(userId) },
      })
      .exec();
  }

  async findFriendIdsByUsernames(userId: string, usernames: string[]): Promise<Types.ObjectId[]> {
    if (!usernames.length) return [];
    const user = await this.userModel.findById(userId).select('friends').exec();
    if (!user || !user.friends || user.friends.length === 0) {
      return [];
    }
    const friends = await this.userModel
      .find({
        _id: { $in: user.friends },
        username: { $in: usernames },
        status: UserStatus.ACTIVE,
      })
      .select('_id')
      .exec();
    return friends.map((f) => f._id);
  }

  async findFriendIdsByIds(userId: string, ids: string[]): Promise<Types.ObjectId[]> {
    if (!ids.length) return [];
    const user = await this.userModel.findById(userId).select('friends').exec();
    if (!user || !user.friends || user.friends.length === 0) {
      return [];
    }
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const friendObjectIds = objectIds.filter((oid) =>
      user.friends.some((friendId) => friendId.equals(oid)),
    );
    if (friendObjectIds.length === 0) return [];
    const friends = await this.userModel
      .find({
        _id: { $in: friendObjectIds },
        status: UserStatus.ACTIVE,
      })
      .select('_id')
      .exec();
    return friends.map((f) => f._id);
  }

  async findUserIdsByUsernames(usernames: string[]): Promise<Types.ObjectId[]> {
    if (!usernames.length) return [];
    const users = await this.userModel
      .find({
        username: { $in: usernames },
        status: UserStatus.ACTIVE,
      })
      .select('_id')
      .exec();
    return users.map((user) => user._id);
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
