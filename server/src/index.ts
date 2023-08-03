import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import { lists } from './assets/mockData';
import { Database } from './data/database';
import { CardHandler } from './handlers/card.handler';
import { ListHandler } from './handlers/list.handler';
import { reorderServiceProxy } from './services/reorder.service';
import { HistoryHandler } from './handlers/history.handler';

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const db = Database.Instance;

if (process.env.NODE_ENV !== 'production') {
  db.setData(lists);
}

const onConnection = (socket: Socket): void => {
  new ListHandler(io, db, reorderServiceProxy).handleConnection(socket);
  new CardHandler(io, db, reorderServiceProxy).handleConnection(socket);
  new HistoryHandler(io, db, reorderServiceProxy).handleConnection(socket);
};

io.on('connection', onConnection);

httpServer.listen(PORT, () => console.log('listening on port: ' + PORT));

export { httpServer };
