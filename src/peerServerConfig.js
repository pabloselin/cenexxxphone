const peerServerConfig = {
  host: "radio.cenexxx.cl",
  path: "/cenexxxpeerserver",
  port: 9000,
  key: "cenexxx",
  secure: true,
  config: {
    iceServers: [
      {
        url: "stun:numb.viagenie.ca",
      },
      {
        url: "turn:numb.viagenie.ca",
        username: "pabloselin@gmail.com",
        credential: "kL01ZWqK",
      },
    ],
  },
};

export default peerServerConfig;
