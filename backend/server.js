require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ── Socket.IO setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["https://travelogue-official.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const { registerChatEvents } = require("./socketHandlers/chatSocket");
const { registerPollEvents } = require("./socketHandlers/pollSocket");
const { registerMapEvents } = require("./socketHandlers/mapSocket");

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ── Trip room join (for real-time member updates) ────────────────────────
  socket.on("join:trip", (tripId) => {
    socket.join(`trip:${tripId}`);
    console.log(`Socket ${socket.id} joined room trip:${tripId}`);
  });

  socket.on("leave:trip", (tripId) => {
    socket.leave(`trip:${tripId}`);
    console.log(`Socket ${socket.id} left room trip:${tripId}`);
  });

  registerChatEvents(io, socket);
  registerPollEvents(io, socket);
  registerMapEvents(io, socket);
});

// ── Attach io to every request ───────────────────────────────────────────────
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["https://travelogue-official.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

app.use("/api/trips", tripRoutes);
app.use("/api/trips/:tripId/itinerary", itineraryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/invites", inviteRoutes);

app.get("/", (req, res) => res.json({ message: "Travelogue API running" }));

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connection.on("error", (err) =>
  console.error("MongoDB runtime error:", err),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`),
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
