import { useEffect } from "react";

function Receiver() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };
    let pc: RTCPeerConnection | null = null;

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        pc = new RTCPeerConnection();

        pc.ontrack = async(event) => {
          const video = document.createElement("video");
          document.body.appendChild(video);
          video.srcObject = new MediaStream([event.track]);
          video.muted = true;
          await video.play();
        };

        await pc.setRemoteDescription(message.sdp);

        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            socket?.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );
      } else if (message.type === "iceCandidate") {
        await pc?.addIceCandidate(message.candidate);
      }
    };
  }, []);

  return <div>Receiver</div>;
}

export default Receiver;
