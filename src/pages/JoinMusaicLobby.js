import React, { useState } from 'react';
import styles from '@/styles/Home.module.css';
import Center from "@/components/active/_center";
import Banner from "@/components/active/_bannerandsub";
import MainBox from "@/components/active/_mainbox";
import MainButton from "@/components/active/_generalbutton";

const JoinMusaicLobby = ({ joinLobby, closeLobby, onJoinedLobby }) => {
  const [musaicKeyInput, setMusaicKeyInput] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setMusaicKeyInput(event.target.value);
  };

  const handleJoinMusaic = async () => {
    try {
      setError('');
      const normalized = musaicKeyInput.trim().toUpperCase();
      if (!normalized) {
        setError('Please enter a Musaic key.');
        return;
      }

      await joinLobby(normalized);
      onJoinedLobby(normalized);
    } catch (joinError) {
      setError(joinError.message || 'Unable to join this Musaic.');
    }
  };

  return (
    <MainBox
      object1={
        <Banner
          main="JOIN A MUSAIC"
          sub="Enter the Musaic Key and press -Join- to join your friend's Musaic."
          more=""
          pass={closeLobby}
        />
      }
      object2={
        <div
          className={styles.dashboardbox}
          style={{ flexDirection: "column", marginTop: "30px", justifyContent: "space-between" }}
        >
          <Center
            object={<input
              className={styles.search}
              type="text"
              value={musaicKeyInput}
              onChange={handleChange}
              placeholder="Enter Musaic Key"
            />}
            object2={error ? <p style={{ color: "#ff8a8a" }}>{error}</p> : null}
            object3={<MainButton mtt="20px" name="Join Musaic" loc={handleJoinMusaic} />}
          />
        </div>
      }
    />
  );
};

export default JoinMusaicLobby;
