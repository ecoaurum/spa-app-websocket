import io from "socket.io-client";

const socket = io("https://spa-app-websocket-server.up.railway.app/", {
	withCredentials: true,
	transports: ["websocket", "polling"],
});

export default socket;
