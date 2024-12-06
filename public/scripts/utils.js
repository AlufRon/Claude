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

function project3Dto2D(point, projectionMatrix) {
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

// Drawing utilities
function drawPaddleShape(ctx, x, y, scale, isRed) {
    const headRadius = PADDLE.HEAD_DIAMETER * scale / 2;
    const handleLength = PADDLE.HANDLE_LENGTH * scale;
    const handleWidth = PADDLE.HANDLE_WIDTH * scale;

    // Draw paddle head
    ctx.beginPath();
    ctx.arc(x, y, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = isRed ? COLORS.PADDLE_RED : COLORS.PADDLE_BLACK;
    ctx.fill();
    
    // Draw handle
    ctx.fillStyle = COLORS.PADDLE_HANDLE;
    ctx.fillRect(x - handleWidth/2, y, handleWidth, handleLength);
    
    // Draw edge detail
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
}