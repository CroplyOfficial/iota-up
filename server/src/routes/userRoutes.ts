import express from 'express';
const router = express.Router();

import {
  authGoogle,
  loginGoogleUser
} from '../controllers/userControllers';

router.route('/authgoogle').get(authGoogle)
router.route('/successgoogle').get(loginGoogleUser);

export default router;
