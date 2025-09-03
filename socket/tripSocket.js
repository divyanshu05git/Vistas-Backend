const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("New Client connected", socket.id);

    // Receive live location updates
    socket.on("locationUpdate", (data) => {
      console.log("Location update:", data);
      io.emit("locationBroadcast", data);
    });

    // Send alerts in real-time

    socket.on("sendAlert", (alert) => {
      console.log("Alert", alert);
      io.emit("receiveAlert", alert);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};

export default socketHandler