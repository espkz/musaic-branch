
import { useState, useEffect } from 'react';

const useVibePicker = () => {
  const [phase, setPhase] = useState('input');
  const [error, setError] = useState('');
  const [publicRatio, setPublicRatio] = useState(50);
  const [limit, setLimit] = useState(20);

  const [publicTracks, setPublicTracks] = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [userTopData, setUserTopData] = useState([]);
  
  useEffect(() => {
    if (publicTracks.length > 0 && userTracks.length > 0) {
      const userTracksPercentage = publicRatio / 100;
      const publicTracksPercentage = 1 - userTracksPercentage;

      const maxPossibleUserTracks = Math.min(
        Math.round(publicTracks.length * userTracksPercentage / publicTracksPercentage),
        userTracks.length
      );
      const maxPossiblePublicTracks = Math.min(
        Math.round(userTracks.length * publicTracksPercentage / userTracksPercentage),
        publicTracks.length
      );

      const selectedUserTracks = userTracks.slice(0, maxPossibleUserTracks);
      const selectedPublicTracks = publicTracks.slice(0, maxPossiblePublicTracks);

      // Combine and shuffle the selected tracks
      const selectedTracks = shuffleArray([...selectedPublicTracks, ...selectedUserTracks]);
  
      setFilteredTracks(selectedTracks);
      setPhase("playlist");
    }
  }, [publicTracks, userTracks, publicRatio, limit]);
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const fetchRecommendedTracks = async (userInput, openAiApiKey) => {
    try {
      setError('');
      setPhase('processing');

      const userData = JSON.parse(sessionStorage.getItem('user_data'));
      const accessToken = sessionStorage.getItem('spotify_access_token');
      const { top_artists: artists } = userData;
      const { user_id : user_id } = userData;
  
      if (!openAiApiKey || !openAiApiKey.trim()) {
        throw new Error('Please provide your OpenAI API key.');
      }
  
      const requestBody = {
        input: userInput,
        artist_ids: artists,
        user_id: user_id
      };

      const gptRequestBody = {
        ...requestBody,
        openai_api_key: openAiApiKey.trim(),
      };
  
      // Fetch GPT artists
      const gptResponse = await fetch('/api/get_GPT_artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gptRequestBody),
      });
  
      if (!gptResponse.ok) {
        throw new Error(`Error fetching GPT artists: ${gptResponse.status} ${gptResponse.statusText}`);
      }
  
      const gptData = await gptResponse.json();
      const { public_artists, user_artists } = gptData;
  
      // Filter out empty artist names
      const filteredPublicArtists = public_artists.filter(artist => artist !== '');
      const filteredUserArtists = user_artists.filter(artist => artist !== '');

      const response2 = await fetch('/api/get_posters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data2 = await response2.json();

  
      // Function to fetch tracks in batches
      const fetchTracks = async (artists) => {
        let tracks = [];
      
        for (const artist of artists) {
          const requestBody = {
            token: accessToken,
            artist: artist,
          };

          const response = await fetch("/api/get_GPT_tracks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
      
          if (!response.ok) {
            throw new Error(`Error fetching recommended tracks: ${response.status} ${response.statusText}`);
          }
      
          const data = await response.json();
          const fetchedTracks = data.tracks;
      
          if (fetchedTracks && fetchedTracks.length > 0) {
            const tracksToAdd = fetchedTracks.slice(0, 60 - tracks.length);

            tracks = [...tracks, ...tracksToAdd];
          }
          else {
            // Continue if no tracks are found for this artist.
          }
        }
        return tracks;
      };
      
      const publicFetchedTracks = await fetchTracks(filteredPublicArtists);
      const userFetchedTracks = await fetchTracks(filteredUserArtists);
      
      

      setPublicTracks(publicFetchedTracks);
      setUserTracks(userFetchedTracks);
      setUserTopData(data2);

    } catch (error) {
      setError(error.message || 'Unable to build playlist.');
      setPhase('input');
    }
  };
  
  
  
  // Other functions to handle playlist customization

  return {
    phase,
    error,
    userTopData,
    filteredTracks,
    fetchRecommendedTracks,
    publicRatio,
    setPublicRatio,
    limit,
    setLimit,
  };
};

export default useVibePicker;
