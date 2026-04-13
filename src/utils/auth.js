import axios from 'axios';
import queryString from 'query-string';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'bea1db6218ac4115ab7542a5ede4d160';
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'https://musaic-topaz.vercel.app/callback';

export const getAuthorizeUrl = () => {
  const params = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    show_dialog: true, 
    scope: 'user-top-read playlist-modify-private playlist-modify-public user-read-email user-read-recently-played user-read-private',
  };

  const authorizeUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(params)}`;

  return authorizeUrl;
};

export const getAccessToken = async (code) => {
  try {
    const response = await axios.post('/api/exchange_spotify_token', { code }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const accessToken = response.data.access_token;

    // Fetch the user display name
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Add the display name to the response data
    response.data.display_name = userResponse.data.display_name;

    return response.data;
  } catch (error) {
    console.error('Error during token exchange:', error);
    throw error;
  }
};
