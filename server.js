import express from 'express';
import clientRouter from './routers/clients.js';
import { calculateOffsets } from './services/calculateOffsets.js';

const app = express();

app.use(express.json({limit: '200mb'}));
app.use('/clients', clientRouter);

app.post('/calculate-offsets', (req, res) => {
    const { art_fragments } = req.body;

    const offsets = calculateOffsets(art_fragments);

    res.json({ offsets });
});

app.listen(8090);
