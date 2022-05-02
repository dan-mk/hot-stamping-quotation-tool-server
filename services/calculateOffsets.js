import canvas from 'canvas';
import fs from 'fs';
import { cmToPixels } from '../helpers/index.js';

const { createCanvas } = canvas;

function assembleCanvas(artFragments) {
    const minX = artFragments.reduce((min, artFragment) => min ? Math.min(min, artFragment.x) : artFragment.x, null);
    const maxX = artFragments.reduce((max, artFragment) => Math.max(max, artFragment.x + artFragment.width - 1), 0);

    const minY = artFragments.reduce((min, artFragment) => min ? Math.min(min, artFragment.y) : artFragment.y, null);
    const maxY = artFragments.reduce((max, artFragment) => Math.max(max, artFragment.y + artFragment.height - 1), 0);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `rgba(0, 0, 0, 0)`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = `rgba(0, 0, 0, 1)`;
    artFragments.forEach(artFragment => {
        for (let i = 0; i < artFragment.data.length; i++) {
            for (let j = 0; j < artFragment.data[0].length; j++) {
                if (artFragment.data[i][j] === 1) {
                    const x = artFragment.x + j - minX;
                    const y = artFragment.y + i - minY;

                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    });

    return canvas;
}

function explodeCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const padding = parseInt(cmToPixels(0.5) / 2) * 2;

    const explodedCanvas = createCanvas(canvas.width + padding, canvas.height + padding);
    const explodedCtx = explodedCanvas.getContext('2d');

    explodedCtx.fillStyle = `rgba(0, 0, 0, 0)`;
    explodedCtx.fillRect(0, 0, canvas.width, canvas.height);

    const isNull = (value) => value === 0 || value === undefined;

    explodedCtx.fillStyle = `rgba(0, 0, 0, 1)`;
    for (let x = 0; x < canvas.width; x += 1) {
        for (let y = 0; y < canvas.height; y += 1) {
            const index = (x + y * canvas.width) * 4 + 3;
            
            const pixel = pixels[index];
            const pixelTop = pixels[index - canvas.width * 4];
            const pixelRight = pixels[index + 4];
            const pixelBottom = pixels[index + canvas.width * 4];
            const pixelLeft = pixels[index - 4];


            const radius = padding / 2;
            const newX = x + radius;
            const newY = y + radius;
            if (pixel === 255 && (isNull(pixelTop) || isNull(pixelRight) || isNull(pixelBottom) || isNull(pixelLeft))) {
                explodedCtx.beginPath();
                explodedCtx.arc(newX, newY, radius, 0, 2 * Math.PI);
                explodedCtx.fill();
            } else if (pixel === 255) {
                explodedCtx.fillRect(newX, newY, 1, 1);
            }
        }
    }

    return explodedCanvas;
}

function getThresholdOffset(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let thresholdOffset = 0;
    for (let col = 0; col < canvas.width; col += 1) {
        let firstFilledRow = 0;
        for (let row = 0; row < canvas.height; row += 1) {
            if (pixels[4 * (canvas.width * row + col) + 3] !== 0) {
                firstFilledRow = row;
                break;
            }
        }
        let lastFilledRow = 0;
        for (let row = canvas.height - 1; row >= 0; row -= 1) {
            if (pixels[4 * (canvas.width * row + col) + 3] !== 0) {
                lastFilledRow = row;
                break;
            }
        }
        thresholdOffset = Math.max(thresholdOffset, lastFilledRow - firstFilledRow + 1);
    }

    return thresholdOffset;
}

function getOffsetList(canvas, thresholdOffset) {
    const offsetList = [];

    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const workspaceCanvasHeight = 4 * canvas.height;
    const workspaceCanvas = createCanvas(canvas.width, workspaceCanvasHeight);
    const workspaceCtx = workspaceCanvas.getContext('2d');
    workspaceCtx.fillStyle = `rgba(0, 0, 0, 0)`;
    workspaceCtx.fillRect(0, 0, canvas.width, workspaceCanvasHeight);
    workspaceCtx.drawImage(canvas, 0, 0);

    let offset = 0;
    while (offset < thresholdOffset && offset < workspaceCanvasHeight) {
        const workspacePixels = workspaceCtx.getImageData(0, 0, canvas.width, workspaceCanvasHeight).data;
        while (offset < workspaceCanvasHeight) {
            if (!isConflicting(workspacePixels, pixels, offset, canvas.width, canvas.height)) {
                break;
            }
            offset += 4;
        }
        const previousOffsetSum = offsetList.reduce((acc, offset) => acc + offset, 0);
        offsetList.push(offset - previousOffsetSum);
        workspaceCtx.drawImage(canvas, 0, offset);
        offset += 4;
    }

    if (offset >= workspaceCanvasHeight) {
        throw new Error('Offset is too large!');
    }

    return offsetList;
}

function isConflicting(workspacePixels, pixels, offset, width, height) {
    for (let col = 0; col < width; col += 1) {
        for (let row = 0; row < height; row += 1) {
            const workspaceIndex = (width * (row + offset) + col) * 4 + 3;
            const index = (width * row + col) * 4 + 3;
            if (workspacePixels[workspaceIndex] !== 0 && pixels[index] !== 0) {
                return true;
            }
        }
    }
    return false;
}

function assembleWorkspaceCanvas(canvas, offsetList) {
    const offsetSum = offsetList.reduce((acc, offset) => acc + offset, 0);
    const workspaceCanvas = createCanvas(canvas.width, canvas.height + offsetSum);
    const ctx = workspaceCanvas.getContext('2d');

    [0, ...offsetList].forEach((_, i) => {
        const previousOffsetSum = offsetList.slice(0, i).reduce((acc, offset) => acc + offset, 0);
        ctx.drawImage(canvas, 0, previousOffsetSum);
    });

    return workspaceCanvas;
}

export function calculateOffsets(artFragments, logResult = false) {
    const originalCanvas = assembleCanvas(artFragments);
    const explodedCanvas = explodeCanvas(originalCanvas);

    const thresholdOffset = getThresholdOffset(explodedCanvas);
    const offsetList = getOffsetList(explodedCanvas, thresholdOffset);

    if (logResult) {
        const finalWorkspaceCanvas = assembleWorkspaceCanvas(explodedCanvas, offsetList);
        fs.writeFileSync('out.png', finalWorkspaceCanvas.toBuffer());
    }

    return offsetList;
}
