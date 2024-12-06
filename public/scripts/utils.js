// Perspective projection utilities
function createProjectionMatrix(aspect, fov = CAMERA.FOV, near = 0.1, far = 10.0) {
    const f = 1.0 / Math.tan(fov / 2);
    return [
        [f/aspect, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, (far+near)/(near-far), (2*far*near)/(near-far)],
        [0, 0, -1, 0]
    ];
}

function project3Dto2D(point, projectionMatrix, canvas) {
    // Transform world coordinates to camera space
    const camX = point.x - CAMERA.POSITION.x;
    const camY = point.y - CAMERA.POSITION.y;
    const camZ = point.z - CAMERA.POSITION.z;
    
    // Apply projection matrix
    const w = -camZ;
    const x = (camX * projectionMatrix[0][0]) / w;
    const y = (camY * projectionMatrix[1][1]) / w;
    
    // Convert to screen coordinates
    return {
        x: (x + 1) * canvas.width / 2,
        y: (1 - y) * canvas.height / 2,
        scale: Math.abs(1 / w)
    };
}

// Math utilities
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}