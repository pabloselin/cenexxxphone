const peerServerConfig = {
  host: "radio.cenexxx.cl",
  path: "/cenexxxpeerserver",
  port: 9000,
  key: "8ShLY7v0cA",
  secure: true,
  config: {
    iceServers: [
      {
        url: "stun:stun.cenexxx.cl",
      },
      {
        url: "turn:turn.cenexxx.cl",
        username: "cenexxxturn",
        credential: "8ShLY7v0cA",
      },
    ],
  },
};

export default peerServerConfig;
