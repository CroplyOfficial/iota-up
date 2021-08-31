import express, { Request, Response } from 'express';
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
  getFavoriteProjects,
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
router.route('/me/favorites').get(ensureAuthorized, getFavoriteProjects);
router.route('/overview/:id').get(getUserOverview);
router.get('/test123/', (req: Request, res: Response) => {
  res.send('ok');
});

export default router;
