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
  deleteProject,
  flagProject,
} from '../controllers/projectControllers';
import { ensureAuthorized } from '../middleware/auth';

const router = express.Router();

router.route('/').post(ensureAuthorized, createProject).get(indexProjects);
router
  .route('/by-id/:id')
  .get(getProjectById)
  .put(ensureAuthorized, editProject)
  .delete(ensureAuthorized, deleteProject);
router.route('/:id/toggle-upvote').get(ensureAuthorized, toggleProjectLike);
router.route('/:id/add-backed').get(ensureAuthorized, addBackedProject);
router.route('/trending').get(trendingProjects);
router.route('/recommended').get(ensureAuthorized, recommendedProjects);
router.route('/by-user/:id').get(getProjectsByUser);
router.route('/flag/:id').get(ensureAuthorized, flagProject);

export default router;
