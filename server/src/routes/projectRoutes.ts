import express from 'express';
import {
  addBackedProject,
  createProject,
  indexProjects,
  toggleProjectLike,
  trendingProjects,
} from '../controllers/projectControllers';
import { ensureAuthorized, ensureIsAdmin } from '../middleware/auth';

const router = express.Router();

router.route('/').post(ensureAuthorized, createProject).get(indexProjects);
router.route('/:id/toggle-upvote').get(ensureAuthorized, toggleProjectLike);
router.route('/:id/add-backed').get(ensureAuthorized, addBackedProject);
router.route('/trending').get(trendingProjects);

export default router;
