import express from 'express';
import prisma from '../prisma/init.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { quotation_id } = req.query;
    const configurations = await prisma.configuration.findMany({
        where: {
            quotation_id: parseInt(quotation_id),
        },
        include: {
            quotation: {
                include: {
                    arts: true,
                },
            },
        },
    });
    res.json(configurations.map(configuration => (
        { ...configuration, arts: JSON.parse(configuration.arts) }
    )));
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const configuration = await prisma.configuration.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            quotation: {
                include: {
                    arts: true,
                },
            },
        },
    });
    configuration.arts = JSON.parse(configuration.arts);
    res.json(configuration);
});

router.post('/', async (req, res) => {
    const { quotation_id } = req.body;

    const quotation = await prisma.quotation.findUnique({
        where: {
            id: parseInt(quotation_id),
        },
        include: {
            arts: true,
        },
    });

    const artsInitialStructure = {};
    quotation.arts.forEach((art, i) => {
        const id = i + 1;
        artsInitialStructure[id] = {
            id,
            art_id: art.id,
            steps: {
                '1': {
                    id: 1,
                    cliches: {
                        data: {},
                    },
                    foils: {
                        data: {},
                    },
                }
            }

        }
    });

    let newConfiguration = await prisma.configuration.create({
        data: {
            quotation_id: parseInt(quotation_id),
            description: '',
            next_cliche_id: 1,
            next_cliche_group_id: 1,
            next_foil_id: 1,
            arts: JSON.stringify(artsInitialStructure),
        }
    });

    newConfiguration = await prisma.configuration.update({
        where: {
            id: newConfiguration.id,
        },
        data: {
            description: `Configuration ${newConfiguration.id}`,
        },
    });

    res.json(newConfiguration);
});

export default router;
