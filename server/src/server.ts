import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import * as http from 'http';
import cors from 'cors';

import { connectToDB } from './config/mongo';
import { errorHandler } from './middleware/errors';

dotenv.config();

import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/projectUploads';
import adminRoutes from './routes/adminRoutes';

import { Server } from 'socket.io';
import rootSocket from './utils/socket.io';

connectToDB(process.env.MONGO_URI || '');
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://api.iotaup.com',
      'https://iotaup.com',
      'https://demo.iotaup.com',
    ],
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
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
});
rootSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`--> WS and HTTP Server Running on ${PORT}`);
});
