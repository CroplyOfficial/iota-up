import express from 'express';
const router = express.Router();

import { ensureAuthorized, ensureIsAdmin } from '../middleware/auth';
import {
  authGoogle,
  loginGoogleUser,
  authFacebook,
  loginFacebookUser,
  authLinkedin,
  loginLinkedin,
  updateUser,
  getUserInfo,
  getUserOverview,
} from '../controllers/userControllers';

router.route('/authgoogle').get(authGoogle);
router.route('/successgoogle').get(loginGoogleUser);
router.route('/authfacebook').get(authFacebook);
router.route('/successfacebook').get(loginFacebookUser);
router.route('/authlinkedin').get(authLinkedin);
router.route('/successlinkedin').get(loginLinkedin);
router
  .route('/me')
  .put(ensureAuthorized, updateUser)
  .get(ensureAuthorized, getUserInfo);
router.route('/overview/:id').get(getUserOverview);

export default router;
