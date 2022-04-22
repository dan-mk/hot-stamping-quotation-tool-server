import express from 'express';
import prisma from '../prisma/init.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const clients = await prisma.client.findMany();
    res.json(clients);
});

router.post('/', async (req, res) => {
    const { name, email } = req.body;

    const newClient = await prisma.client.create({
        data: {
            name,
            email,
        }
    });

    res.json(newClient);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const client = await prisma.client.findUnique({
        where: {
            id: parseInt(id),
        }
    });

    if (!client) {
        return res.status(400).json({ message: 'Client not found' });
    }

    await prisma.client.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name,
            email,
        }
    });

    res.json(client);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
        where: {
            id: parseInt(id),
        }
    });

    if (!client) {
        return res.status(400).json({ message: 'Client not found' });
    }

    await prisma.client.delete({
        where: {
            id: parseInt(id),
        }
    });

    res.json(client);
});

export default router;
