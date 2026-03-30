import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const wss = new WebSocketServer({ noServer: true });

  // Global error handling for uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle WebSocket upgrades manually to avoid conflicts with Next.js
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url!);

    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Let Next.js handle other upgrades (like HMR)
      // socket.destroy(); // Optional: destroy if not handled
    }
  });

  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('error', (error) => {
      console.error('WebSocket Client Error:', error);
    });

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'ALERT') {
          // Broadcast alert to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'NOTIFICATION',
                payload: data.payload
              }));
            }
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Handle all Next.js requests
  expressApp.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
