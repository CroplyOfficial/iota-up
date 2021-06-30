import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

import { connectToDB } from './config/mongo';

import { errorHandler } from './middleware/errors';

dotenv.config();

connectToDB(process.env.MONGO_URI || '');
const app = express();

app.use(express.json());

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.info(`--> Server running on port ${PORT}`);
});
