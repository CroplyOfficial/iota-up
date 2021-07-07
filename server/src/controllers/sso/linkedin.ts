import axios from 'axios';
import { access } from 'fs';
import querystring from 'querystring';

/**
 * get the linkedin authorization URLI
 * @returns {String} linkedinAuthURI
 */

const getLinkedinURI = (): string => {
  const stringifiedParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.LINKEDIN_APP_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT,
    scope: 'r_liteprofile r_emailaddress',
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${stringifiedParams}`;
};

/**
 * get access token from the authorization code
 *
 * @code    {String} authCode authorization code from linkedin
 * @returns {String} access token
 */

const getLinkedinAccessToken = async (accessCode: string): Promise<string> => {
  const params = querystring.stringify({
    grant_type: 'authorization_code',
    code: accessCode,
    client_id: process.env.LINKEDIN_APP_ID,
    client_secret: process.env.LINKEDIN_APP_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT,
  });

  const { data }: any = await axios
    .post(`https://www.linkedin.com/oauth/v2/accessToken?${params}`, {})
    .catch((error) => {
      console.log(error);
    });
  return data.access_token;
};

/**
 * get linkedin user data from linkedin api
 *
 * @param   {String} accessToken  linkedin user token
 * @returns user data
 */

const getLinkedinUser = async (accessToken: string): Promise<any> => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const userData = await axios.get('https://api.linkedin.com/v2/me', config);
  const userEmail: any = await axios.get(
    'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))',
    config
  );
  const userProfilePicture = await axios.get(
    'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))',
    config
  );
  return {
    ...userData.data,
    email: userEmail.data.elements[0]['handle~'].emailAddress,
    avatar:
      userProfilePicture.data.profilePicture['displayImage~'].elements[0]
        .identifiers[0].identifier,
  };
};

export { getLinkedinURI, getLinkedinAccessToken, getLinkedinUser };
