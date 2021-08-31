import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { Server, Socket } from 'socket.io';
import * as http from 'http';

import { connectToDB } from './config/mongo';
import { errorHandler } from './middleware/errors';

dotenv.config();

import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/projectUploads';

import { tryNewChat } from './controllers/chatControllers';
import { IChatModel } from './models/Chat';

connectToDB(process.env.MONGO_URI || '');
const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

const io = new Server(server, {
  path: '/chat',
});

io.on('connection', (socket: Socket) => {
  socket.on('startChat', async ({ partner, token }) => {
    const chat: any = await tryNewChat(partner, token);
    socket.join(chat._id);
    socket.emit('chat', chat);
    io.to(chat._id).emit('chat', chat);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`--> WS and HTTP Server Running on ${PORT}`);
});
