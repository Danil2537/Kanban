import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { nanoid } from 'nanoid';
@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: test, default: () => nanoid() })
  hashedId: string;
}
export type BoardDocument = Board & Document;
export const BoardSchema = SchemaFactory.createForClass(Board);
