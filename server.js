import express from 'express';
import multer from 'multer';
import cors from 'cors';
import clientRouter from './routers/clients.js';
import quotationRouter from './routers/quotations.js';
import { calculateOffsets } from './services/calculateOffsets.js';
import { createImage, getArtFragments } from './services/getArtFragments.js';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/clients', clientRouter);
app.use('/quotations', quotationRouter);

app.post('/calculate-offsets', (req, res) => {
    const { art_fragments } = req.body;

    const offsets = calculateOffsets(art_fragments);

    res.json({ offsets });
});

app.post('/fragment-image', upload.single('image'), async (req, res) => {
    const imgBuffer = req.file.buffer;

    const img = await createImage(imgBuffer);
    const artFragments = await getArtFragments(img);

    res.json({ artFragments, width: img.width, height: img.height });
});

app.listen(8090);
