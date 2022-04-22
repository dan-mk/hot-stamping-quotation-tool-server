import express from 'express';
import clientRouter from './routers/clients.js';

const app = express();

app.use(express.json());
app.use('/clients', clientRouter);

app.listen(8090);
