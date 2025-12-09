import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    ticketId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        ticketId: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'El mensaje es obligatorio'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

