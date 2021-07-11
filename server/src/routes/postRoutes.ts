import express from 'express';
import {
  getPosts,
  createPost,
  editPost,
  deletePost,
} from '../controllers/postControllers';
import { ensureAuthorized } from '../middleware/auth';

const router = express.Router();

router
  .route('/by-project/:id')
  .get(getPosts)
  .post(ensureAuthorized, createPost);

router
  .route('/modify/:id')
  .post(ensureAuthorized, editPost)
  .delete(ensureAuthorized, deletePost);

export default router;
