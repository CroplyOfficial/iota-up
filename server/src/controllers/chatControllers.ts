import asyncHandler from 'express-async-handler';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Request, Response } from 'express';
import { CryptoUtil } from '../utils/crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../' });
const getCurrentUser = async (token: string) => {
  try {
    const JWT_SECRET: any = process.env.JWT_SECRET;
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user.isBanned) {
      return user;
    } else {
      return null;
    }
  } catch (JsonWebTokenError) {
    return null;
  }
};

// @ts-ignore
const crypto = new CryptoUtil(process.env.SESSION_SECRET);

/**
 * Create a new chat with a user if it doesn't exist
 * else return the already existing chat
 *
 * @route POST /api/chats
 * @access restricted Bearer token
 * @returns {IChat} chat
 */

const tryNewChat = async (partner: string, token: string) => {
  const user = await getCurrentUser(token);
  if (user) {
    const chat = await Chat.findOne({
      members: { $in: [user._id, partner] },
    });
    if (chat) {
      return chat;
    } else {
      const newChat = await Chat.create({
        members: [user._id, partner],
      });
      user.chats = [...user.chats, newChat._id];
      await user.save();
      const partnerUser = await User.findById(partner);
      partnerUser.chats = [...partnerUser.chats, newChat._id];
      await partnerUser.save();
      return newChat;
    }
  }
};

/**
 * Create a new message
 *
 * @route POST /api/chats/message
 * @return {Message}
 */

const newMessage = async (token: string, chatId: string, content: string) => {
  const user = await getCurrentUser(token);
  const chat = await Chat.findById(chatId);
  if (chat?.members?.includes(user._id) && !chat.isBlocked) {
    try {
      const encrypted = crypto.encrypt(content);
      const message = await Message.create({
        sender: user._id,
        content: encrypted,
      });
      chat.messages = [...chat.messages, message._id];
      await chat.save();

      const msg: any = message.toObject();
      msg.content = content;
      return msg;
    } catch (error) {}
  } else {
    return null;
  }
};

/**
 * Get a chat by ID
 *
 * @route GET /api/chats/:id?n=number
 * @returns {IChat}
 */

const getChatById = async (token: string, chatId: string) => {
  const user = await getCurrentUser(token);
  return Chat.findById(chatId)
    .populate('messages')
    .exec()
    .then(async (chatDoc) => {
      if (chatDoc?.members?.includes(user._id)) {
        const chat: any = chatDoc.toObject();
        chat.messages = chat.messages.reverse();
        // ts doesn't understand populate would populat the
        // messages array to become IMessage[] hence the ignore
        // @ts-ignore
        const msgs = crypto.decryptMessageArray(chat.messages);
        chat.messages = msgs;

        const partnerId = chat.members?.filter(
          (member: string) => String(member) !== String(user._id)
        );
        const partner = await User.findById(partnerId);
        chat.partner = partner;

        return chat;
      } else {
        return null;
      }
    })
    .catch((error) => {});
};

/**
 * Update a chat to be blocked
 *
 * @route GET /api/chats/toggle-block/:id
 * @access restricted
 * @returns {Chat}
 */

const toggleBlockChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await Chat.findById(req.params.id);
  if (chat && chat.members.includes(req.user._id)) {
    if (
      chat.isBlocked &&
      chat.blockedBy &&
      String(chat.blockedBy) === String(req.user._id)
    ) {
      chat.isBlocked = false;
      chat.blockedBy = null;
    } else if (!chat.isBlocked) {
      chat.isBlocked = true;
      chat.blockedBy = req.user._id;
    } else {
      res.status(403);
      throw new Error("You can't unblock this chat");
    }
    const saved = await chat.save();
    res.json(chat);
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
});

/**
 * Get all the chats that the current user is a part of
 *
 * @route /api/chats/@me
 * @access Bearer Token
 * @returns {Chat[]}
 */

const getMyChats = async (token: string) => {
  const user = await getCurrentUser(token);
  return User.findById(user._id)
    .populate({
      path: 'chats',
      populate: {
        path: 'members',
        model: 'User',
        select: {
          bio: 0,
          lastName: 0,
          email: 0,
          isBanned: 0,
          isAdmin: 0,
          wallet: 0,
          upvotedProjects: 0,
          backedProjects: 0,
          chats: 0,
        },
      },
    })
    .select('chats')
    .exec()
    .then((chats: any) => {
      return chats.chats;
    })
    .catch((error: any) => {});
};

/**
 * Get chats by partner ID
 *
 * @route GET /api/chats/by-partner/:id
 * @access restricted bearer token
 * @returns {IChat}
 */

const chatByPartnerId = asyncHandler(async (req: Request, res: Response) => {
  const partner = req.params.id;
  Chat.findOne({ members: { $in: [req.user._id, partner] } })
    .populate('messages')
    .populate('members')
    .exec((err, chatDocument) => {
      if (!chatDocument) {
        res.status(404);
        throw new Error('Unable to find chat');
      }
      const chat = chatDocument.toObject();
      const reversed = chat.messages.reverse();
      chat.messages = reversed.slice(30);
      // ts doesn't understand populate would populat the
      // messages array to become IMessage[] hence the ignore
      // @ts-ignore
      const msgs = crypto.decryptMessageArray(chat.messages);
      chat.messages = msgs;

      res.json(chat);
    });
});

export {
  tryNewChat,
  newMessage,
  getChatById,
  toggleBlockChat,
  getMyChats,
  chatByPartnerId,
};
