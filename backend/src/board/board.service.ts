import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from 'src/schemas/board.schema';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async createBoard(_name: string) {
    return await this.boardModel.create({ name: _name });
  }

  async updateBoardName(_hashedId: string, _name: string) {
    const boardDoc = await this.boardModel.findOne({
      hashedId: _hashedId,
    });
    if (boardDoc) {
      boardDoc.name = _name;
      await boardDoc.save();
    } else {
      throw new NotFoundException('Board with specified hashed ID not found');
    }
  }

  async deleteBoard(_hashedId: string) {
    const result = await this.boardModel.deleteOne({ hashedId: _hashedId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Board with specified hashed ID not found');
    }
    return { message: 'Board deleted successfully' };
  }

  async findBoard(_hashedId: string) {
    const boardDoc = await this.boardModel.findOne({ hashedId: _hashedId });
    if (boardDoc) return boardDoc;
    else
      throw new InternalServerErrorException(
        'Board with specified hashed id not found',
      );
  }
}
