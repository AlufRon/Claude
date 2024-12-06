class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    drawPaddle(paddle) {
        const ctx = this.ctx;
        const pos = applyPerspective(paddle);
        
        // Draw handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(pos.x - 2, pos.y - 15, 4, 30);
        
        // Draw paddle head
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 15, 10, 0, Math.PI * 2);
        ctx.fillStyle = paddle.isLeft ? '#ff0000' : '#000000';
        ctx.fill();
        
        // Draw highlight
        ctx.beginPath();
        ctx.arc(pos.x - 3, pos.y - 18, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
    }

    drawTable() {
        const ctx = this.ctx;
        
        // Draw legs
        const legs = [
            {x: -TABLE_LENGTH/2 + 20, z: -TABLE_WIDTH/2 + 20},
            {x: TABLE_LENGTH/2 - 20, z: -TABLE_WIDTH/2 + 20},
            {x: -TABLE_LENGTH/2 + 20, z: TABLE_WIDTH/2 - 20},
            {x: TABLE_LENGTH/2 - 20, z: TABLE_WIDTH/2 - 20}
        ];
        
        ctx.fillStyle = '#333';
        legs.forEach(leg => {
            const top = applyPerspective({x: leg.x, y: TABLE_HEIGHT, z: leg.z});
            const bottom = applyPerspective({x: leg.x, y: 0, z: leg.z});
            ctx.fillRect(top.x - 5, top.y, 10, bottom.y - top.y);
        });
        
        // Draw table surface
        ctx.fillStyle = '#0066cc';
        const corners = [
            applyPerspective({x: -TABLE_LENGTH/2, y: TABLE_HEIGHT, z: -TABLE_WIDTH/2}),
            applyPerspective({x: TABLE_LENGTH/2, y: TABLE_HEIGHT, z: -TABLE_WIDTH/2}),
            applyPerspective({x: TABLE_LENGTH/2, y: TABLE_HEIGHT, z: TABLE_WIDTH/2}),
            applyPerspective({x: -TABLE_LENGTH/2, y: TABLE_HEIGHT, z: TABLE_WIDTH/2})
        ];
        
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        corners.forEach(corner => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();
        
        // Draw net
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const netStart = applyPerspective({x: 0, y: TABLE_HEIGHT, z: -TABLE_WIDTH/2});
        const netEnd = applyPerspective({x: 0, y: TABLE_HEIGHT + 15, z: TABLE_WIDTH/2});
        ctx.beginPath();
        ctx.moveTo(netStart.x, netStart.y);
        ctx.lineTo(netEnd.x, netEnd.y);
        ctx.stroke();
    }

    drawBall(ball) {
        const pos = applyPerspective(ball);
        const scale = CAMERA.z / (CAMERA.z + ball.z);
        const radius = 5 * scale;
        
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        
        // Ball shadow
        this.ctx.beginPath();
        const shadowPos = applyPerspective({x: ball.x, y: TABLE_HEIGHT, z: ball.z});
        this.ctx.ellipse(shadowPos.x, shadowPos.y, radius, radius/2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();
    }

    drawScore(score) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`${score.left} - ${score.right}`, this.canvas.width/2 - 30, 30);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}