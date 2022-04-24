import express from 'express';
import cors from 'cors';
import clientRouter from './routers/clients.js';
import quotationRouter from './routers/quotations.js';
import { calculateOffsets } from './services/calculateOffsets.js';

const app = express();

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use('/clients', clientRouter);
app.use('/quotations', quotationRouter);

app.post('/calculate-offsets', (req, res) => {
    const { art_fragments } = req.body;

    const offsets = calculateOffsets(art_fragments);

    res.json({ offsets });
});

app.listen(8090);
