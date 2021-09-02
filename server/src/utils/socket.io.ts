import { Socket } from 'socket.io';
import {
  getChatById,
  getMyChats,
  newMessage,
  tryNewChat,
} from '../controllers/chatControllers';

const rootSocket = (io: any) => {
  io.on('connection', (socket: Socket) => {
    const { chatId } = socket.handshake.query;
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
      socket.on('getChat', async ({ token, chatId }) => {
        const chat: any = await getChatById(token, chatId);
        if (!chat) return;
        socket.join(chat._id);
        io.in(chatId).emit('messages', chat);
      });

      socket.on('newMessage', async ({ token, chatId, content }) => {
        const message: any = await newMessage(token, chatId, content);
        if (!message) return;
        const chat: any = await getChatById(token, chatId);
        io.in(chatId).emit('messages', chat);
      });
    }
  });
};

export default rootSocket;
