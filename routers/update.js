import express from 'express';
import prisma from '../prisma/init.js';

const router = express.Router();

router.get('/', async (req, res) => {
    // const configurations = await prisma.configuration.findMany();

    // for (const configuration of configurations) {
    //     const quotation_instances = JSON.parse(configuration.quotation_instances);

    //     Object.values(quotation_instances).forEach((quotation_instance) => {
    //         quotation_instance.discount = 0;
    //     });

    //     await prisma.configuration.update({
    //         where: {
    //             id: configuration.id,
    //         },
    //         data: {
    //             quotation_instances: JSON.stringify(quotation_instances),
    //         },
    //     });
    // }

    res.send('nothing has changed');
});

export default router;
