import express from 'express';
import prisma from '../prisma/init.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { quotation_id } = req.query;
    const configurations = await prisma.configuration.findMany({
        where: {
            quotation_id: parseInt(quotation_id),
        },
    });
    res.json(configurations.map(configuration => (
        {
            ...configuration,
            arts: JSON.parse(configuration.arts),
        }
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
                    arts: {
                        include: {
                            art_fragments: true,
                        }
                    },
                },
            },
        },
    });
    configuration.arts = JSON.parse(configuration.arts);
    configuration.quotation_instances = JSON.parse(configuration.quotation_instances);
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
                    foil_offsets: [],
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
            next_quotation_instance_id: 1,
            arts: JSON.stringify(artsInitialStructure),
            quotation_instances: JSON.stringify({}),
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

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        next_cliche_id,
        next_cliche_group_id,
        next_foil_id,
        next_quotation_instance_id,
        arts,
        quotation_instances
    } = req.body;

    const configuration = await prisma.configuration.update({
        where: {
            id: parseInt(id),
        },
        data: {
            next_cliche_id,
            next_cliche_group_id,
            next_foil_id,
            next_quotation_instance_id,
            arts: JSON.stringify(arts),
            quotation_instances: JSON.stringify(quotation_instances),
        }
    });

    res.json(configuration);
});

export default router;
