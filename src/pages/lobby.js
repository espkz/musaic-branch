import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/Home.module.css';
import { Drawer } from '@mui/material';
import MainButton from "@/components/active/_generalbutton";
import Center from "@/components/active/_center";
import Banner from "@/components/active/_bannerandsub";
import Lobbylist from "@/components/active/_lobbyparty";
import MainBox from "@/components/active/_mainbox";
import VibePicker from "./vibePicker";
import { getDatabase, ref, query, orderByChild, equalTo, onValue, get, update } from "firebase/database";

const Lobby = ({ musaicKey, currentUser, handleCreatePlaylist, closeLobby }) => {
  const [lobbyData, setLobbyData] = useState(null);
  const [anchorVibe, setVibe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!musaicKey) {
      setLobbyData(null);
      return;
    }

    const db = getDatabase();
    const lobbyQuery = query(ref(db, "lobbies"), orderByChild("musaicKey"), equalTo(musaicKey));
    const unsubscribe = onValue(lobbyQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setLobbyData(null);
        return;
      }

      const [id, data] = Object.entries(snapshot.val())[0];
      setLobbyData({ ...data, id });
    });

    return () => unsubscribe();
  }, [musaicKey]);

  const openVibe = () => {
    setVibe(true);
  };

  const closeVibe = () => {
    setVibe(false);
  };

  const closeLobbyAndVibe = () => {
    closeVibe();
    closeLobby();
  };

  const users = useMemo(() => {
    if (!lobbyData?.users) {
      return [];
    }

    return Object.values(lobbyData.users).map((user) => ({
      id: user.id,
      avatar: user?.image_url || "/landing/logo.png",
      ready: !!user.ready,
    }));
  }, [lobbyData]);

  const everyoneReady = users.length > 0 && users.every((user) => user.ready);
  const isHost = currentUser?.user_id && lobbyData?.host_user_id === currentUser.user_id;
  const isLocked = !!lobbyData?.locked;

  const handleReady = async () => {
    try {
      setError('');
      if (!lobbyData?.id || !currentUser?.user_id) {
        return;
      }

      const db = getDatabase();
      const userReadyRef = ref(db, `lobbies/${lobbyData.id}/users/${currentUser.user_id}`);
      const snapshot = await get(userReadyRef);
      if (!snapshot.exists()) {
        setError('You are not currently in this lobby.');
        return;
      }

      await update(userReadyRef, { ready: true });
    } catch (readyError) {
      setError(readyError.message || 'Unable to set ready status.');
    }
  };

  const handleContinue = async () => {
    try {
      setError('');
      if (!lobbyData?.id || !isHost) {
        return;
      }
      if (!everyoneReady) {
        setError('Everyone needs to be ready before starting.');
        return;
      }
      if (isLocked) {
        setError('This lobby is already locked.');
        return;
      }

      const db = getDatabase();
      const lobbyRef = ref(db, `lobbies/${lobbyData.id}`);
      await update(lobbyRef, {
        locked: true,
        generation_started_at: Date.now(),
        generation_started_by: currentUser.user_id,
      });
      openVibe();
    } catch (continueError) {
      setError(continueError.message || 'Unable to start generation.');
    }
  };

  return (
    <MainBox
      object1={
        <Banner
          main="LOBBY"
          sub="MUSAIC KEY:"
          more={musaicKey || ""}
          pass={closeLobby}
        />
      }
      object2={
        <div
          className={styles.dashboardbox}
          style={{ flexDirection: "column", marginTop: "30px", justifyContent: "space-between" }}
        >
          <Center object={<Lobbylist users={users} />} />
          {error ? <p style={{ color: "#ff8a8a", textAlign: "center" }}>{error}</p> : null}
          {isLocked ? (
            <Center object={<p style={{ color: "#c1c8ff", textAlign: "center" }}>Generation already started. Lobby is locked.</p>} />
          ) : !everyoneReady ? (
            <Center object={<MainButton name="Ready Up" loc={handleReady} />} />
          ) : !isHost ? (
            <Center object={<p style={{ color: "#c1c8ff", textAlign: "center" }}>Waiting for host to start generation...</p>} />
          ) : (
            <Center object={<MainButton name="Continue" loc={handleContinue} />} />
          )}

          <Drawer
            anchor="left"
            open={Boolean(anchorVibe)}
            onClose={closeVibe}
            sx={{ backgroundColor: "background" }}
          >
            <VibePicker
              handleCreatePlaylist={handleCreatePlaylist}
              pass={closeVibe}
              closeAllDrawers={closeLobbyAndVibe}
              collaborativeMusaicKey={musaicKey}
            />
          </Drawer>
        </div>
      }
    />
  );
};

export default Lobby;
