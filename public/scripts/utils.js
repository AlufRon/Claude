function project3Dto2D(x, y, z) {
    const focalLength = 1000;
    const scale = focalLength / (focalLength + z);
    return {
        x: x * scale,
        y: y * scale,
        scale
    };
}

function createShadow(ctx, x, y, width, height, alpha = 0.2) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height/3, 0, 0, Math.PI * 2);
    ctx.fill();
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}