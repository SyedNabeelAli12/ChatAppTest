import logo from "./logo.svg";
import "./App.css";
import { w3cwebsocket as W3Cwebsocket } from "websocket";
import { useEffect, useState } from "react";
import { Card, Avatar, Input, Typography } from "antd";

const client = new W3Cwebsocket("ws://127.0.0.1:8000");

function App() {
  const { Search } = Input;
  const { Text } = Typography;
  const { Meta } = Card;

  const [user, setUser] = useState({
    userName: "",
    loggedIn: false,
    messages: [],
    textMsg: "",
  });

  useEffect(() => {
    console.log("ws://127.0.0.1:8000");

    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("got reply", dataFromServer);
      if (dataFromServer.type === "message") {
        setUser((prevUser) => ({
          ...prevUser,
          messages: [
            ...prevUser.messages,
            { msg: dataFromServer.msg, user: dataFromServer.user },
          ],
        }));
      }
    };

    client.onerror = (error) => {
      console.log("WebSocket connection error:", error);
    };
  }, []);

  const onButtonClicked = (value) => {
    client.send(
      JSON.stringify({
        type: "message",
        msg: value,
        user: user?.userName,
      })
    );
  };

  return (
    <div className="App">
      {user?.loggedIn ? (
        <div>
          <div className="title">
            <Text
              id="main-heading"
              type="secondary"
              style={{ fontSize: "36px" }}
            >
              Websocket Chat: {user.userName}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingBottom: 50,
            }}
            id="messages"
          >
            {user.messages.map((message, index) => (
              <Card
                key={index}
                style={{
                  width: 300,
                  margin: "16px 4px 0 4px",
                  alignSelf:
                    user.userName === message.user ? "flex-end" : "flex-start",
                }}
                loading={false}
              >
                <Meta
                  avatar={
                    <Avatar
                      style={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
                    >
                      {message.user[0].toUpperCase()}
                    </Avatar>
                  }
                  title={message.user + ":"}
                  description={message.msg}
                />
              </Card>
            ))}
          </div>
          <div className="bottom">
            <Search
              placeholder="input message and send"
              enterButton="Send"
              value={user.textMsg}
              size="large"
              onChange={(e) => setUser({ ...user, textMsg: e.target.value })}
              onSearch={(value) => onButtonClicked(value)}
            />
          </div>
        </div>
      ) : (
        <div style={{ padding: "200px 40px" }}>
          <Search
            placeholder="Enter Username"
            enterButton="Login"
            size="large"
            onSearch={(value) => {
              setUser((prevUser) => ({
                ...prevUser,
                loggedIn: true,
                userName: value,
                messages: [],
              }));
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
