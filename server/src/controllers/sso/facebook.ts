import querystring from 'querystring';
import axios from 'axios';

/**
 * Get facebook authorization URL
 *
 * @returns {String} facebook auth url
 */

const createFaceBookURL = (): string => {
  const stringifiedParams = querystring.stringify({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: process.env.FACEBOOK_REDIRECT,
    scope: ['email', 'public_profile'].join(','), // comma seperated string
    response_type: 'code',
    auth_type: 'rerequest',
    display: 'popup',
  });

  return `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
};

/**
 * get access token from access code
 *
 * @param   {String} code facebook access code
 * @returns {String} access code
 */

const getAccessTokenFromCode = async (code: string): Promise<string> => {
  const { data }: any = await axios({
    url: 'https://graph.facebook.com/v4.0/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: process.env.FACEBOOK_REDIRECT,
      code,
    },
  });

  return data.access_token;
};

/**
 * get facebook user data and then return it
 *
 * @param   {String} accesstoken
 * @returns {Object} userData
 */

const getFacebookUserData = async (accesstoken: string): Promise<string> => {
  const { data } = await axios({
    url: 'https://graph.facebook.com/me',
    method: 'get',
    params: {
      fields: ['id', 'email', 'first_name', 'last_name', 'picture'].join(','),
      access_token: accesstoken,
    },
  });
  console.log(data); // { id, email, first_name, last_name }
  return data;
};

export { createFaceBookURL, getAccessTokenFromCode, getFacebookUserData };
