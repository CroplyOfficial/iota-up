import express from 'express';
import dotenv from 'dotenv';

import { connectToDB } from './config/mongo';

import { errorHandler } from './middleware/errors';

import userRoutes from './routes/userRoutes';

dotenv.config();

connectToDB(process.env.MONGO_URI || '');
const app = express();

app.use(express.json());

app.use('/api/users', userRoutes)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.info(`--> Server running on port ${PORT}`);
});
