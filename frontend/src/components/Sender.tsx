import { useEffect, useState } from "react";

function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    // I can use socket.send also but it throw error if socket not connected so when it connected,
    // Then onopen will trigger
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };

    setSocket(socket);
  }, []);

  const startSendingVideo = async () => {
    if (!socket) return;

    const pc = new RTCPeerConnection();

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer(); //SDP
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };

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

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        await pc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        await pc.addIceCandidate(data.candidate);
      }
    };

    // const steam = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: false,
    // });
    const steam = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    pc.addTrack(steam.getVideoTracks()[0]);
    const video = document.createElement("video");
    document.body.appendChild(video);
    video.srcObject = steam;
    video.play();
  };

  return (
    <div>
      <h1>Sender View</h1>
      <button onClick={startSendingVideo}>Send Video</button>
    </div>
  );
}

export default Sender;
