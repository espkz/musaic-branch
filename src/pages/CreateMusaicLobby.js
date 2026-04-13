import React, { useState, useEffect } from 'react';
import styles from '@/styles/Home.module.css';
import Center from "@/components/active/_center";
import Banner from "@/components/active/_bannerandsub";
import MainBox from "@/components/active/_mainbox";
import MainButton from "@/components/active/_generalbutton";

const CreateMusaicLobby = ({
  closeLobby,
  openVibePicker,
  openCollaborativeLobby,
  musaicKey,
  copyToClipboard,
  createLobby,
}) => {
  useEffect(() => {
    createLobby().catch((error) => {
      console.error("Failed to create lobby:", error);
    });
  }, []);

  return (
    <MainBox
      object1={
        <Banner
          main="CREATE A MUSAIC"
          pass={closeLobby}
        />
      }
      object2={
        <div
          className={styles.dashboardbox}
          style={{ flexDirection: "column", marginTop: "30px", justifyContent: "space-between" }}
        >
          <Center 
            object={<div className={styles.drawertextdesigns}>Musaic Key: {musaicKey || "Generating..."}</div>}
            object2={<div style={{height:"20px"}}></div>}
            object3={<MainButton name="Copy Musaic Key" loc={copyToClipboard} />}
            object4={<div style={{height:"20px"}}></div>}
            object5={<MainButton name="Open Collaborative Lobby" loc={openCollaborativeLobby} />}
            object6={<div style={{height:"20px"}}></div>}
            object7={<MainButton name="Create a Solo Musaic" loc={openVibePicker} />}
          />
        </div>
      }
    />
  );
};

export default CreateMusaicLobby;
