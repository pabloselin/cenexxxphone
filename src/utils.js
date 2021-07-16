const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return (
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()
    );
};

let handlePeerDisconnect = (peer) => {
    // manually close the peer connections
    for (let conns in peer.connections) {
        peer.connections[conns].forEach((conn, index, array) => {
            console.log(
                `closing ${conn.connectionId} peerConnection (${index + 1}/${
                    array.length
                })`,
                conn.peerConnection
            );
            conn.peerConnection.close();

            // close it using peerjs methods
            if (conn.close) conn.close();
        });
    }
};

export { guid, handlePeerDisconnect };
