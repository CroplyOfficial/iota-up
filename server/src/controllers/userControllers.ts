import { Request, Response } from "express";
import axios from "axios";
import { getGoogleAuthURL, getTokens } from "./sso/google";
import {
  createFaceBookURL,
  getAccessTokenFromCode,
  getFacebookUserData,
} from "./sso/facebook";
import {
  getLinkedinURI,
  getLinkedinAccessToken,
  getLinkedinUser,
} from "./sso/linkedin";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

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
 * @route    GET /api/users/authgoogle
 * @returns  user data JSON
 */

const loginGoogleUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { id_token, access_token } = await getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
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
        throw new Error("User not found");
      });

    const user_exists = await User.findOne({ email: googleUser.email });

    if (user_exists) {
      user_exists.connections.includes("google")
        ? null
        : user_exists.connections.push("google");
      await user_exists.save();
      const token = jwt.sign(
        { id: user_exists._id },
        process.env.JWT_SECRET || "fallbacksecret"
      );
      res.json({
        token,
        ...user_exists._doc,
      });
    } else {
      const user = await User.create({
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        avatar: googleUser.picture,
        email: googleUser.email,
        connections: ["google"],
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "fallbacksecret"
      );

      res.json({
        token,
        ...user._doc,
      });
    }
  } catch (error) {
    throw error;
  }
});

/**
 * Redirect the logged in user to the facebook
 * authorizatin URL
 *
 * @route     GET /api/users/authfacebook
 * @redirect  /api/users/successfacebook
 */

const authFacebook = asyncHandler(async (req: Request, res: Response) => {
  res.redirect(createFaceBookURL());
});

/**
 * Use the code to get the access code and then the
 * data for the user
 *
 * @route     GET /api/users/successfacebook
 * @returns   User
 */

const loginFacebookUser = asyncHandler(async (req: Request, res: Response) => {
  const code: any = await req.query.code;
  const accessToken = await getAccessTokenFromCode(code);
  const userData: any = await getFacebookUserData(accessToken);

  const user_exists = await User.findOne({ email: userData.email });

  if (user_exists) {
    user_exists.connections.includes("facebook")
      ? null
      : user_exists.connections.push("facebook");
    await user_exists.save();
    const token = jwt.sign(
      { id: user_exists._id },
      process.env.JWT_SECRET || "fallbacksecret"
    );
    res.json({
      token,
      ...user_exists._doc,
    });
  } else {
    const user = await User.create({
      firstName: userData.first_name,
      lastName: userData.last_name,
      avatar: userData.picture.data.url,
      email: userData.email,
      connections: ["facebook"],
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallbacksecret"
    );

    res.json({
      token,
      ...user._doc,
    });
  }
});

/**
 * Redirect to linked auth URL
 *
 * @route     /api/users/authlinkedin
 * @redirects linkedin auth URL
 */

const authLinkedin = asyncHandler(async (req: Request, res: Response) => {
  res.redirect(getLinkedinURI());
});

/**
 * Login the user with linkedin and if
 * the user exists add linkedin to one of
 * the connections else create new user
 *
 * @route     GET /api/users/successlinkedin
 * @returns   {Object} userData
 */

const loginLinkedin = asyncHandler(async (req: Request, res: Response) => {
  const code: any = req.query.code;
  const token = await getLinkedinAccessToken(code);
  const userData: any = await getLinkedinUser(token);

  const user_exists = await User.findOne({ email: userData.email });

  if (user_exists) {
    user_exists.connections.includes("linkedin")
      ? null
      : user_exists.connections.push("linkedin");
    await user_exists.save();
    const token = jwt.sign(
      { id: user_exists._id },
      process.env.JWT_SECRET || "fallbacksecret"
    );
    res.json({
      token,
      ...user_exists._doc,
    });
  } else {
    const user = await User.create({
      firstName: userData.localizedFirstName,
      lastName: userData.localizedLastName,
      email: userData.email,
      avatar: userData.avatar,
      connections: ["linkedin"],
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallbacksecret"
    );

    res.json({
      token,
      ...user._doc,
    });
  }
});

/**
 * Update the user profile with skills, wallet, city, country
 *
 * @route   PUT /api/users/me
 * @returns User JSON
 * @access  restricted, logged in only
 */

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  interface IReqBody {
    username?: string;
    bio?: string;
    wallet?: string;
    city?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    skills?: Array<string>;
  }

  const {
    username,
    bio,
    wallet,
    city,
    country,
    skills,
    firstName,
    lastName,
  }: IReqBody = req.body;
  req.user.wallet = wallet ?? req.user.wallet;
  req.user.city = city ?? req.user.city;
  req.user.country = country ?? req.user.country;
  req.user.skills = skills ?? req.user.skills;
  req.user.firstName = firstName ?? req.user.firstName;
  req.user.lastName = lastName ?? req.user.lastName;
  req.user.username = username ?? req.user.username;
  req.user.bio = bio ?? req.user.bio;

  const user = await req.user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "fallbacksecret"
  );

  res.json({
    token,
    ...user._doc,
  });
});

/**
 * get info about the logged in user
 *
 * @route    GET /api/users/me
 * @returnns User JSON
 * @access   restricted, logged in only
 */

const getUserInfo = asyncHandler(async (req: Request, res: Response) => {
  res.json(req.user);
});

/**
 * Get information about a user, mainly meant for project Info
 *
 * @route /api/users/overview/:id
 * @access  open
 * @returns user object
 */

const getUserOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json({
      username: user.username,
      skills: user.skills,
      displayName: user.userame ?? `${user.firstName} ${user.lastName}`,
      bio: user.bio,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      projects: user.projects,
      city: user.city,
      country: user.country,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

export {
  authGoogle,
  loginGoogleUser,
  authFacebook,
  loginFacebookUser,
  authLinkedin,
  loginLinkedin,
  updateUser,
  getUserInfo,
  getUserOverview,
};
