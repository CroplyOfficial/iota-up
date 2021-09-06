import express from 'express';
import {
  indexInfractions,
  deleteProject,
  banUser,
} from '../controllers/adminControllers';
import { ensureAuthorized, ensureIsAdmin } from '../middleware/auth';

const router = express.Router();

router
  .route('/infractions')
  .get(ensureAuthorized, ensureIsAdmin, indexInfractions);
router
  .route('/remove-project/:id')
  .get(ensureAuthorized, ensureIsAdmin, deleteProject);
router.route('/ban-user/:id').get(ensureAuthorized, ensureIsAdmin, banUser);

export default router;
