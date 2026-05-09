import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { getClientOrigins } from './config/clientOrigins.js';
import { seedExperts } from './seed/seedExperts.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: getClientOrigins(),
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinExpert', (expertId) => {
    if (expertId) socket.join(`expert:${expertId}`);
  });

  socket.on('leaveExpert', (expertId) => {
    if (expertId) socket.leave(`expert:${expertId}`);
  });
});

await connectDB();
await seedExperts();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
