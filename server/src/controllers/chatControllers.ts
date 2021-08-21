import asyncHandler from "express-async-handler";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { Request, Response } from "express";

/**
 * Create a new chat with a user if it doesn't exist
 * else return the already existing chat
 *
 * @route POST /api/chats
 * @access restricted Bearer token
 * @returns {IChat} chat
 */

const tryNewChat = asyncHandler(async (req: Request, res: Response) => {
  const { partner } = req.body;
  const chat = await Chat.findOne({
    members: { $in: [req.user._id, partner] },
  });
  if (chat) {
    res.json(chat);
  } else {
    const newChat = await Chat.create({
      members: [req.user._id, partner],
    });
    res.json(newChat);
  }
});

/**
 * Create a new message
 *
 * @route POST /api/chats/message
 * @return {Message}
 */

const newMessage = asyncHandler(async (req: Request, res: Response) => {
  const { chatId, content } = req.body;
  if (chatId && content) {
    const chat = await Chat.findById(chatId);
    if (chat?.members?.includes(req.user._id) && !chat.isBlocked) {
      const message = await Message.create({ sender: req.user._id, content });
      chat.messages = [...chat.messages, message._id];
      await chat.save();
      res.json(message);
    } else {
      res.status(403);
      throw new Error(
        "You can't send messages to this chat, you have either been blocked or are not a part of it"
      );
    }
  } else {
    res.status(400);
    throw new Error("Requirements not satisfied");
  }
});

/**
 * Get a chat by ID
 *
 * @route GET /api/chats/:id?n=number
 * @returns {IChat}
 */

const getChatById = asyncHandler(async (req: Request, res: Response) => {
  const num = req.query.n || 30;
  const chat = Chat.findById(req.params.id)
    .populate("messages")
    .exec((err, chat) => {
      if (err) throw err;
      if (chat?.members?.includes(req.user._id)) {
        chat.messages = chat.messages.slice(-30);
        res.json(chat);
      } else {
        res.status(403);
        throw new Error("you can only get your own chats");
      }
    });
});

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
    throw new Error("Chat not found");
  }
});

export { tryNewChat, newMessage, getChatById, toggleBlockChat };