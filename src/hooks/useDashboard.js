import { useState } from 'react';
import { getDatabase, ref, child, set, push, get, query, orderByChild, equalTo } from "firebase/database";

const useDashboard = (user, setSelectedPlaylist, setUser, closeJoinMusaicDrawer) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [musaicKey, setMusaicKey] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const createLobby = async () => {
    const generatedMusaicKey = Math.random().toString(36).substr(2, 8).toUpperCase();
    setMusaicKey(generatedMusaicKey);

    const db = getDatabase();
    const newLobbyRef = push(child(ref(db), 'lobbies'));

    const userTopArtists = (user?.top_artists || []).slice(0, 20);
    const lobbyId = newLobbyRef.key;
    const lobbyData = {
      id: lobbyId,
      host_user_id: user.user_id,
      created_at: Date.now(),
      locked: false,
      generation_started_at: null,
      generation_started_by: null,
      musaicKey: generatedMusaicKey,
      users: {
        [user.user_id]: {
          id: user.user_id,
          username: user.username || user.user_id,
          image_url: user.image_url || "/landing/logo.png",
          ready: false,
          top_artists: userTopArtists,
        },
      },
    };

    try {
      await set(newLobbyRef, lobbyData);
      setMusaicKey(generatedMusaicKey);
      return generatedMusaicKey;
    } catch (error) {
      console.error('Error creating lobby:', error);
      throw error;
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(musaicKey)
      .then(() => {
        console.log('Musaic Key copied to clipboard:', musaicKey);
      })
      .catch((error) => {
        console.error('Error copying Musaic Key to clipboard:', error);
      });
  };
  
  const joinLobby = async (musaicKey) => {
    const db = getDatabase();
    const lobbiesRef = query(ref(db, "lobbies"), orderByChild("musaicKey"), equalTo(musaicKey));

    const snapshot = await get(lobbiesRef);
    if (!snapshot.exists()) {
      throw new Error("Invalid Musaic Key.");
    }

    const lobbyEntry = Object.entries(snapshot.val())[0];
    const [lobbyId, lobby] = lobbyEntry;
    const userRef = ref(db, `lobbies/${lobbyId}/users/${user.user_id}`);
    const isExistingMember = !!(lobby.users && lobby.users[user.user_id]);

    if (lobby.locked && !isExistingMember) {
      throw new Error("This Musaic has already started and is locked.");
    }

    if (!isExistingMember) {
      const userTopArtists = (user?.top_artists || []).slice(0, 20);
      const userData = {
        id: user.user_id,
        username: user.username || user.user_id,
        image_url: user.image_url || "/landing/logo.png",
        ready: false,
        top_artists: userTopArtists,
      };
      await set(userRef, userData);
    }

    closeJoinMusaicDrawer();
    return musaicKey;
  };
  
  

  const handleCreatePlaylist = async (playlistName, filteredTracks, description) => {
    const accessToken = sessionStorage.getItem('spotify_access_token');
    if (filteredTracks.length > 0) {
      const selectedTracks = filteredTracks;
      const finalPlaylistName = playlistName;
      const userId = user.user_id;
      const finalDescription = description

      try {
        const response = await fetch('/api/create_playlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken, name: finalPlaylistName, tracks: selectedTracks, user_id: userId, description: finalDescription }),
        });

        if (response.ok) {
          const data = await response.json();
          const createdPlaylist = data.playlist;

          // Add the created playlist to the user's playlists in session storage
          const currentUserData = JSON.parse(sessionStorage.getItem('user_data'));
          currentUserData.playlists.push(createdPlaylist);
          sessionStorage.setItem('user_data', JSON.stringify(currentUserData));

          // Update user state to trigger a re-render of the sidebar
          setSelectedPlaylist(createdPlaylist)
          setUser(currentUserData);
        } else {
          console.error('Failed to create playlist:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating playlist:', error);
      }
    } else {
      alert('Please select at least one track.');
    }
  };


  return {
    searchTerm,
    handleSearchChange,
    createLobby,
    joinLobby,
    handleCreatePlaylist,
    copyToClipboard,
    musaicKey,
  };
};

export default useDashboard;
