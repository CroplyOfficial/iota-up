import express from 'express';
const router = express.Router();

import {
  authGoogle,
  loginGoogleUser,
  authFacebook,
  loginFacebookUser,
} from '../controllers/userControllers';

router.route('/authgoogle').get(authGoogle);
router.route('/successgoogle').get(loginGoogleUser);
router.route('/authfacebook').get(authFacebook);
router.route('/successfacebook').get(loginFacebookUser);

export default router;
