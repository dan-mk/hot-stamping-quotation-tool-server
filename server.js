import express from 'express';
import cors from 'cors';
import jimp from 'jimp';
import clientRouter from './routers/clients.js';
import quotationRouter from './routers/quotations.js';
import configurationsRouter from './routers/configurations.js';
import prisma from './prisma/init.js';
import { calculateOffsets } from './services/calculateOffsets.js';

const app = express();

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use('/clients', clientRouter);
app.use('/quotations', quotationRouter);
app.use('/configurations', configurationsRouter);

app.post('/calculate-offsets', async (req, res) => {
    const { art_fragment_ids } = req.body;

    const art_fragments = await prisma.artFragment.findMany({
        where: {
            id: {
                in: art_fragment_ids.map(id => parseInt(id)),
            },
        },
    });

    const promises = [];
    art_fragments.forEach(art_fragment => {
        promises.push(() => {
            return new Promise((resolve) => {
                jimp.read(`uploads/art_fragments/${art_fragment.id}.png`, function (err, image) {
                    const width = image.getWidth();
                    const height = image.getHeight();
        
                    const data = [];
                    for (let i = 0; i < height; i++) {
                        data.push([]);
                        for (let j = 0; j < width; j++) {
                            const color = image.getPixelColor(j, i);
                            data[i].push(color === 0 ? 0 : 1);
                        }
                    }
                    art_fragment.data = data;

                    resolve(true);
                });
            });
        });
    });
    await Promise.all(promises.map(p => p()));

    const offsets = calculateOffsets(art_fragments, true);
    res.json({ offsets });
});

app.listen(8090);
