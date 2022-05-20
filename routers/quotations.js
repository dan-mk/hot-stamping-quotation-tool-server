import express from 'express';
import multer from 'multer';
import fs from 'fs';
import prisma from '../prisma/init.js';
import { createImage, getArtFragments, createImageFromArtFragment, doArtFragmentsHavePadding } from '../services/artFragments.js';
import { cmToPixels } from '../helpers/index.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
    const { client_id } = req.query;
    const quotations = await prisma.quotation.findMany({
        where: {
            client_id: parseInt(client_id),
        },
        include: {
            arts: true,
        }
    });
    res.json(quotations);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const quotation = await prisma.quotation.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            arts: true,
        }
    });
    res.json(quotation);
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
    const { id } = req.params;
    const { files } = req;

    const promises = [];
    files.forEach((file, index) => {
        promises.push(async () => {
            const imgBuffer = file.buffer;

            const img = await createImage(imgBuffer);
            const artFragments = await getArtFragments(img);

            if (!doArtFragmentsHavePadding(artFragments, img.width, img.height)) {
                img.width += cmToPixels(3);
                img.height += cmToPixels(3);
                artFragments.forEach(artFragment => {
                    artFragment.x += cmToPixels(1.5);
                    artFragment.y += cmToPixels(1.5);
                });
            }

            const newArt = await prisma.art.create({
                data: {
                    index: index + 1,
                    quotation_id: parseInt(id),
                    dpi: 300,
                    height: img.height,
                    width: img.width,
                },
            });
            fs.writeFileSync(`./uploads/arts/${newArt.id}.png`, imgBuffer);

            const subPromises = [];
            artFragments.forEach((artFragment) => {
                subPromises.push(async () => {
                    const artFragmentBuffer = createImageFromArtFragment(artFragment);

                    const newArtFragment = await prisma.artFragment.create({
                        data: {
                            art_id: newArt.id,
                            x: artFragment.x,
                            y: artFragment.y,
                            height: artFragment.height,
                            width: artFragment.width,
                        },
                    });

                    fs.writeFileSync(`./uploads/art_fragments/${newArtFragment.id}.png`, artFragmentBuffer);
                });
            });

            await Promise.all(subPromises.map(p => p()));
        });
    });

    await Promise.all(promises.map(p => p()));
    res.json({ message: 'ok' });
});

export default router;
