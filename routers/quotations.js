import express from 'express';
import prisma from '../prisma/init.js';

const router = express.Router();

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

export default router;
