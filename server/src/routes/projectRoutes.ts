import express from 'express';
import {
  addBackedProject,
  createProject,
  indexProjects,
  recommendedProjects,
  toggleProjectLike,
  trendingProjects,
  getProjectById,
  editProject,
  getProjectsByUser,
} from '../controllers/projectControllers';
import { ensureAuthorized, ensureIsAdmin } from '../middleware/auth';

const router = express.Router();

router.route('/').post(ensureAuthorized, createProject).get(indexProjects);
router
  .route('/by-id/:id')
  .get(getProjectById)
  .put(ensureAuthorized, editProject);
router.route('/:id/toggle-upvote').get(ensureAuthorized, toggleProjectLike);
router.route('/:id/add-backed').get(ensureAuthorized, addBackedProject);
router.route('/trending').get(trendingProjects);
router.route('/recommended').get(ensureAuthorized, recommendedProjects);
router.route('/by-user/:id').get(getProjectsByUser);

export default router;
