import express from 'express';
import multer from 'multer';
import fs from 'fs';
import prisma from '../prisma/init.js';
import { createImage, getArtFragments, createImageFromArtFragment } from '../services/artFragments.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
    const { client_id } = req.query;
    const quotations = await prisma.quotation.findMany({
        where: {
            client_id: parseInt(client_id),
        }
    });
    res.json(quotations);
});

router.post('/', async (req, res) => {
    const { client_id, description } = req.body;

    const newQuotation = await prisma.quotation.create({
        data: {
            client_id: parseInt(client_id),
            description,
        }
    });

    res.json(newQuotation);
});

router.post('/:id/arts', upload.array('images'), async (req, res) => {
    const { files } = req;

    const promises = [];
    files.forEach((file) => {
        promises.push(async () => {
            const imgBuffer = file.buffer;

            const img = await createImage(imgBuffer);
            const artFragments = await getArtFragments(img);

            artFragments.forEach((artFragment, i) => {
                const image = createImageFromArtFragment(artFragment);
                fs.writeFileSync(`uploads/fragment${i}.png`, image);
            });
        });
    });

    await Promise.all(promises.map(p => p()));
    res.json({ message: 'ok' });
});

export default router;
