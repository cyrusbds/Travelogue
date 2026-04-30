// server.js — UPDATED version
// Changes from original:
//   1. Import and register registerPollEvents alongside registerChatEvents
//   2. Attach `io` to every request via middleware (needed by poll controller)
// Everything else is identical to the original.

require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const http     = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);

// ── Socket.IO setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

const { registerChatEvents } = require('./socketHandlers/chatSocket');
const { registerPollEvents } = require('./socketHandlers/pollSocket'); // ← NEW

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  registerChatEvents(io, socket);
  registerPollEvents(io, socket); // ← NEW
});

// ── Attach io to every request so controllers can emit events ────────────────
// This is the standard pattern; it avoids passing io through every call chain.
app.use((req, _res, next) => {  // ← NEW
  req.io = io;
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());
app.use("/api/trips", tripRoutes);
app.use("/api/trips/:tripId/itinerary", itineraryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/invites", inviteRoutes);


app.get("/", (req, res) => res.json({ message: "Travelogue API running" }));

mongoose.connection.on("error", (err) => console.error("MongoDB runtime error:", err));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});