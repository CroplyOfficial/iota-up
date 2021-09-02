import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import cors from 'cors';

import { connectToDB } from './config/mongo';
import { errorHandler } from './middleware/errors';

dotenv.config();

import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/projectUploads';

import {
  getChatById,
  getMyChats,
  newMessage,
  tryNewChat,
} from './controllers/chatControllers';
import { IChatModel } from './models/Chat';

connectToDB(process.env.MONGO_URI || '');
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'token',
    ],
  })
);

const server = http.createServer(app);

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket: Socket) => {
  const { chatId } = socket.handshake.query;
  console.log('chatId', chatId);
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`--> WS and HTTP Server Running on ${PORT}`);
});
