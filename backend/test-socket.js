import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    withCredentials: true,
    reconnection: false
});

socket.on("connect", () => {
    console.log("Connected to socket!");
    setTimeout(() => {
        console.log("Disconnecting...");
        socket.disconnect();
    }, 1000);
});

socket.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
});
