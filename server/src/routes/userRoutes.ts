import express from 'express';
const router = express.Router();

import {
  authGoogle,
  loginGoogleUser,
  authFacebook,
  loginFacebookUser,
  authLinkedin,
  loginLinkedin,
} from '../controllers/userControllers';

router.route('/authgoogle').get(authGoogle);
router.route('/successgoogle').get(loginGoogleUser);
router.route('/authfacebook').get(authFacebook);
router.route('/successfacebook').get(loginFacebookUser);
router.route('/authlinkedin').get(authLinkedin);
router.route('/successlinkedin').get(loginLinkedin);

export default router;
