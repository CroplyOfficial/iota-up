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
    const chat = await Chat.findOne().and([
      { members: { $in: [user._id] } },
      { members: { $in: [partner] } },
    ]);
    if (chat) {
      return chat;
    } else {
      if (String(user._id) === partner) return null;
      const newChat = await Chat.create({
        members: [user._id, partner],
      });
      user.chats = [...user.chats, newChat._id];
      await user.save();
      const partnerUser = await User.findById(partner);
      if (partnerUser.isBanned) return null;
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
  if (!user) return;
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

const editMessage = async (
  token: string,
  messageId: string,
  content: string
) => {
  const user = await getCurrentUser(token);
  if (!user) return;
  const message: any = await Message.findById(messageId);
  if (String(message?.sender) == String(user._id)) {
    const encrypted = crypto.encrypt(content);
    message.content = encrypted;
    return await message.save();
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
  if (!user) return;
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

const toggleBlockChat = async (token: string, chatId: string) => {
  const user = await getCurrentUser(token);
  if (!user) return;
  const chat = await Chat.findById(chatId);
  if (chat && chat.members.includes(user._id)) {
    if (
      chat.isBlocked &&
      chat.blockedBy &&
      String(chat.blockedBy) === String(user._id)
    ) {
      chat.isBlocked = false;
      chat.blockedBy = null;
    } else if (!chat.isBlocked) {
      chat.isBlocked = true;
      chat.blockedBy = user._id;
    } else {
      return null;
    }
    await chat.save();
    return chat;
  }
};

/**
 * Get all the chats that the current user is a part of
 *
 * @route /api/chats/@me
 * @access Bearer Token
 * @returns {Chat[]}
 */

const getMyChats = async (token: string) => {
  const user = await getCurrentUser(token);
  if (!user) return;
  return await User.findById(user._id)
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
    .populate({
      path: 'chats',
      populate: {
        path: 'messages',
        model: 'Message',
      },
    })
    .select('chats')
    .exec()
    .then((chatsDoc: any) => {
      const chats: any = chatsDoc.toObject();
      chats.chats = chatsDoc.chats.map((chatDoc: any) => {
        const chat = chatDoc.toObject();
        let msgs = crypto.decryptMessageArray([
          chat.messages[chat.messages.length - 1],
        ]);
        chat['messages'] = msgs;
        chat.lastMessage = msgs[0];
        return chat;
      });
      chats.chats.sort((a: any, b: any) => {
        try {
          return b.messages[0].date - a.messages[0].date;
        } catch {
          return;
        }
      });
      return chats.chats;
    })
    .catch((error: any) => {
      console.error(error);
    });
};

const deleteChatById = async (token: string, chatId: string) => {
  const user = await getCurrentUser(token);
  if (!user) return;
  const chat = await Chat.findById(chatId);
  if (chat?.members.includes(user._id)) {
    try {
      const encrypted = crypto.encrypt('this message was deleted');
      let update = {
        $set: {
          content: encrypted,
        },
      };
      Message.updateMany(
        {
          $and: [{ _id: { $in: chat.messages } }, { sender: user._id }],
        },
        update
      ).then((messages: any) => {
        return;
      });
    } catch {
      return;
    }
  }
};

export {
  tryNewChat,
  newMessage,
  getChatById,
  toggleBlockChat,
  getMyChats,
  deleteChatById,
  editMessage,
};
