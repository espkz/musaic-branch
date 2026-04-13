import React from 'react';
import styles from '@/styles/Home.module.css';
import MainButton from "../components/active/_generalbutton";

const GPTinput = ({
    textInput,
    userInput,
    openAiApiKey,
    handleInputChange,
    handleApiKeyChange,
    handleSubmit,
    handleKeyPress,
    errorMessage
}) => {
    return (
        <div style={{flexDirection:"column", justifyContent:"center",display:"flex"}}>
            <div style={{flexDirection:"column", justifyContent:"center", display:"flex"}}>
            <h1 style={{fontSize:"3vh", fontFamily:"Inter, sans-serif", fontWeight:"100", alignSelf:"center", marginTop:"40px", color:"#c1c8ff", letterSpacing:"2px", lineHeight:"30px"}}>Enter a phrase to create a playlist: </h1>
            <input
                className={styles.searchv}
                styles = {{borderColor: "#343059"}}
                ref={textInput}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter a phrase"
                onKeyPress={handleKeyPress}
                />
            <h1 style={{fontSize:"2vh", fontFamily:"Inter, sans-serif", fontWeight:"100", alignSelf:"center", marginTop:"20px", color:"#c1c8ff", letterSpacing:"1px"}}>OpenAI API key (used only for this request):</h1>
            <input
                className={styles.searchv}
                styles = {{borderColor: "#343059"}}
                type="password"
                value={openAiApiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..."
                autoComplete="off"
                onKeyPress={handleKeyPress}
                />
            {errorMessage && (
                <p style={{ color: "#ff8a8a", textAlign: "center", marginTop: "10px", marginBottom: "0px" }}>
                    {errorMessage}
                </p>
            )}
            {/* <button onClick={handleSubmit}>Submit</button> */}
            </div>
            <div style={{flexDirection:"row", justifyContent:"space-around", marginTop:"40px", alignSelf:"center"}}>
            <MainButton loc={handleSubmit} name="Submit"  width = "50px" height = "40px"/>
            </div>
        </div>
    );
};

export default GPTinput;
