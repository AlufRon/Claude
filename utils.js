// Constants
const TABLE_LENGTH = 274;
const TABLE_WIDTH = 152.5;
const TABLE_HEIGHT = 76;
const CAMERA = {
    x: -100,
    y: 80,
    z: 150,
    fov: 60
};

// Perspective transformation
function applyPerspective(point) {
    const scale = CAMERA.z / (CAMERA.z + point.z);
    return {
        x: (point.x - CAMERA.x) * scale + canvas.width/2,
        y: (point.y - CAMERA.y) * scale + canvas.height/2
    };
}

// Easing functions
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;