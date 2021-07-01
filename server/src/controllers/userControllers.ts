import { Request, Response } from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import {
  getGoogleAuthURL,
  getTokens
} from './sso/google';
import asyncHandler from 'express-async-handler';

/**
 * Get the google authorization token and redirect to
 * frontend page
 *
 * @route    GET /api/users/authgoogle
 * @redirect /googlesuccess?code=<authcode>
 */

const authGoogle = asyncHandler(async (req: Request, res: Response) => {
  res.redirect(getGoogleAuthURL());
});

/**
 * Get the user data from the token retrieved via the
 * authorization route for google sign in
 *
 * @route    POST /api/users/authgoogle
 * @returns  user data JSON
 */

const loginGoogleUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { id_token, access_token } = await getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    });

    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch(() => {
        throw new Error('User not found');
      });
    console.log(googleUser)
  } catch (error) {
   throw (error);
  }
});

export {
  authGoogle,
  loginGoogleUser
};
