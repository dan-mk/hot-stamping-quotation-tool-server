import canvas from 'canvas';

const { createCanvas, loadImage } = canvas;

export async function getArtFragments(imgBuffer) {
    const img = await loadImage(imgBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const data = new Uint8Array(imgData.data.buffer);

    const artFragments = [];

    const hasLeft = i => (i % (4 * img.width) !== 0);
    const hasRight = i => (i % (4 * img.width) !== img.width - 1 - 4);
    const hasUp = i => (Math.floor(i / (4 * img.width)) !== 0);
    const hasDown = i => (Math.floor(i / (4 * img.width)) !== img.height - 1);

    const left = i => i - 4;
    const right = i => i + 4;
    const up = i => i - 4 * img.width;
    const down = i => i + 4 * img.width;

    const computeLightness = i => 0.2126 * data[i] + 0.715 * data[i + 1] + 0.0722 * data[i + 2];

    const minList = list => {
        let m = list[0];
        for (let i = 0; i < list.length; i++) {
            m = Math.min(m, list[i]);
        }
        return m;
    };

    const maxList = list => {
        let m = list[0];
        for (let i = 0; i < list.length; i++) {
            m = Math.max(m, list[i]);
        }
        return m;
    };

    const threshold = 128;
    const visited = data.map(n => 0);
    for (let i = 0; i < data.length; i += 4) {
        if (visited[i]) continue;
        visited[i] = 1;

        const lightness = computeLightness(i);
        if (lightness > threshold) continue;

        const artFragment = [];
        const queue = [i];

        for (let j; queue.length !== 0;) {
            j = queue.shift();
            artFragment.push(j);

            if (hasRight(j)) {
                const k = right(j);
                if (visited[k] === 0) {
                    visited[k] = 1;
                    const lightness = computeLightness(k);
                    if (lightness <= threshold) {
                        queue.push(k);
                    }
                }
            }

            if (hasDown(j)) {
                const k = down(j);
                if (visited[k] === 0) {
                    visited[k] = 1;
                    const lightness = computeLightness(k);
                    if (lightness <= threshold) {
                        queue.push(k);
                    }
                }
            }

            if (hasLeft(j)) {
                const k = left(j);
                if (visited[k] === 0) {
                    visited[k] = 1;
                    const lightness = computeLightness(k);
                    if (lightness <= threshold) {
                        queue.push(k);
                    }
                }
            }

            if (hasUp(j)) {
                const k = up(j);
                if (visited[k] === 0) {
                    visited[k] = 1;
                    const lightness = computeLightness(k);
                    if (lightness <= threshold) {
                        queue.push(k);
                    }
                }
            }
        }

        const normalizedArtFragment = artFragment.map(n => n / 4);

        let iList = normalizedArtFragment.map(n => parseInt(n / img.width));
        let jList = normalizedArtFragment.map(n => n % img.width);

        const minI = minList(iList);
        const minJ = minList(jList);

        iList = iList.map(n => n - minI);
        jList = jList.map(n => n - minJ);

        const maxI = maxList(iList);
        const maxJ = maxList(jList);

        const finalArtFragment = new Array(maxI + 1).fill(0);
        for (let l = 0; l < finalArtFragment.length; l++) {
            finalArtFragment[l] = new Array(maxJ + 1).fill(0);
        }

        for (let l = 0; l < iList.length; l++) {
            finalArtFragment[iList[l]][jList[l]] = 1;
        }

        artFragments.push({
            data: finalArtFragment,
            x: minJ,
            y: minI,
            height: maxI + 1,
            width: maxJ + 1,
        });
    }

    return artFragments;
}
