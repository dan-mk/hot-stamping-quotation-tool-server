import express from 'express';
import multer from 'multer';
import clientRouter from './routers/clients.js';
import { calculateOffsets } from './services/calculateOffsets.js';
import { getArtFragments } from './services/getArtFragments.js';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/clients', clientRouter);

app.post('/calculate-offsets', (req, res) => {
    const { art_fragments } = req.body;

    const offsets = calculateOffsets(art_fragments);

    res.json({ offsets });
});

app.post('/fragment-image', upload.single('image'), async (req, res) => {
    const image = req.file.buffer;

    const artFragments = await getArtFragments(image);

    res.json({ artFragments });
});

app.listen(8090);
