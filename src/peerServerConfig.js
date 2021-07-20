const peerServerConfig = {
  host: "radio.cenexxx.cl",
  path: "/cenexxxpeerserver",
  port: 9000,
  key: "cenexxx",
  secure: true,
  config: {
    iceServers: [
      {
        url: "stun:stun.cenexxx.cl",
      },
      {
        url: "turn:turn.cenexxx.cl",
        username: "cenexxx",
        credential: "cenexxx2120",
      },
    ],
  },
};

export default peerServerConfig;
