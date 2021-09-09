import express from 'express';
import {
  indexInfractions,
  deleteProject,
  banUser,
  ignoreUserInfraction,
  getAllUsers,
  banUserById,
} from '../controllers/adminControllers';
import { ensureAuthorized, ensureIsAdmin } from '../middleware/auth';

const router = express.Router();

router
  .route('/infractions')
  .get(ensureAuthorized, ensureIsAdmin, indexInfractions);
router
  .route('/remove-project/:id')
  .get(ensureAuthorized, ensureIsAdmin, deleteProject);
router
  .route('/ignore-infraction/:id')
  .get(ensureAuthorized, ensureIsAdmin, ignoreUserInfraction);
router
  .route('/ban-user-by-id/:id')
  .get(ensureAuthorized, ensureIsAdmin, banUserById);
router.route('/list-users').get(ensureAuthorized, ensureIsAdmin, getAllUsers);
router.route('/ban-user/:id').get(ensureAuthorized, ensureIsAdmin, banUser);

export default router;
