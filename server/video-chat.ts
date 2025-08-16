import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { storage } from "./storage";

interface CallUser {
  userId: string;
  socketId: string;
  matchId: string;
}

export function setupVideoChat(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const users = new Map<string, CallUser>();
  const activeRooms = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    console.log('User connected to video chat:', socket.id);

    socket.on('join-room', (matchId: string) => {
      socket.join(matchId);
      
      if (!activeRooms.has(matchId)) {
        activeRooms.set(matchId, new Set());
      }
      activeRooms.get(matchId)!.add(socket.id);
      
      console.log(`User ${socket.id} joined room ${matchId}`);
    });

    socket.on('initiate-call', async (data) => {
      const { sessionId, to, from, matchId, callerName } = data;
      
      try {
        // Update session status in storage
        await storage.updateVideoChatSession(sessionId, {
          status: 'pending'
        });

        // Notify the target user about incoming call
        socket.to(matchId).emit('incoming-call', {
          sessionId,
          from,
          callerName,
          matchId
        });

        console.log(`Call initiated from ${from} to ${to} in match ${matchId}`);
      } catch (error) {
        console.error('Error initiating call:', error);
        socket.emit('call-error', { message: 'Failed to initiate call' });
      }
    });

    socket.on('accept-call', async (data) => {
      const { sessionId, to, from } = data;
      
      try {
        // Update session status
        await storage.updateVideoChatSession(sessionId, {
          status: 'active',
          startedAt: new Date()
        });

        // Notify caller that call was accepted
        socket.to(data.matchId || 'room').emit('call-accepted', {
          sessionId,
          from
        });

        console.log(`Call accepted: session ${sessionId}`);
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    });

    socket.on('reject-call', async (data) => {
      const { sessionId, to } = data;
      
      try {
        // Update session status
        await storage.updateVideoChatSession(sessionId, {
          status: 'declined'
        });

        // Notify caller that call was rejected
        socket.to(data.matchId || 'room').emit('call-rejected', {
          sessionId
        });

        console.log(`Call rejected: session ${sessionId}`);
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
    });

    socket.on('end-call', async (data) => {
      const { to, from, matchId } = data;
      
      // Notify other user that call ended
      socket.to(matchId).emit('call-ended', {
        from
      });

      console.log(`Call ended in match ${matchId}`);
    });

    socket.on('peer-signal', (data) => {
      const { signal, to, from, matchId } = data;
      
      // Forward WebRTC signaling data to the target user
      socket.to(matchId).emit('peer-signal', signal);
      
      console.log(`Peer signal forwarded from ${from} to ${to}`);
    });

    socket.on('leave-room', (matchId: string) => {
      socket.leave(matchId);
      
      if (activeRooms.has(matchId)) {
        activeRooms.get(matchId)!.delete(socket.id);
        if (activeRooms.get(matchId)!.size === 0) {
          activeRooms.delete(matchId);
        }
      }
      
      console.log(`User ${socket.id} left room ${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from video chat:', socket.id);
      
      // Clean up user from all rooms
      for (const [matchId, socketIds] of activeRooms.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            activeRooms.delete(matchId);
          }
          break;
        }
      }
      
      users.delete(socket.id);
    });
  });

  return io;
}