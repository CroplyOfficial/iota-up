import { Socket } from 'socket.io';
import {
  getChatById,
  getMyChats,
  newMessage,
  toggleBlockChat,
  tryNewChat,
} from '../controllers/chatControllers';

const rootSocket = (io: any) => {
  io.on('connection', (socket: Socket) => {
    const { chatId }: any = socket.handshake.query;
    if (chatId) {
      socket.join(chatId);
    }

    socket.on('startChat', async ({ partner, token }) => {
      const chat: any = await tryNewChat(partner, token);
      if (!chat) return;
      io.in(chat._id).emit('chat', chat);
    });

    socket.on('myChats', async ({ token }) => {
      const chat: any = await getMyChats(token);
      if (!chat) return;
      socket.emit('chat', chat);
    });

    if (chatId) {
      socket.on('getChat', async ({ token }) => {
        const chat: any = await getChatById(token, chatId);
        if (!chat) return;
        socket.emit('chats', chat);
      });

      socket.on('newMessage', async ({ token, content }) => {
        const message: any = await newMessage(token, chatId, content);
        if (!message) return;
        const chat: any = await getChatById(token, chatId);
        io.in(chatId).emit('messages', chat.messages);
      });

      socket.on('toggleBlock', async ({ token }) => {
        const chat: any = await toggleBlockChat(token, chatId);
        if (!chat) return;
        io.in(chatId).emit('block', chat);
      });
    }
  });
};

export default rootSocket;
