class PingPongGame {
    // Previous code remains the same...

    drawNet() {
        const netHeight = 0.15; // 15cm
        const netPoints = [
            { x: TABLE.LENGTH/2, y: TABLE.HEIGHT, z: 0 },
            { x: TABLE.LENGTH/2, y: TABLE.HEIGHT + netHeight, z: 0 },
            { x: TABLE.LENGTH/2, y: TABLE.HEIGHT + netHeight, z: TABLE.WIDTH },
            { x: TABLE.LENGTH/2, y: TABLE.HEIGHT, z: TABLE.WIDTH }
        ];

        const projectedPoints = netPoints.map(p => 
            project3Dto2D(p, this.projectionMatrix));

        // Draw net mesh pattern
        const meshSize = 0.02; // 2cm mesh
        const verticalLines = Math.ceil(TABLE.WIDTH / meshSize);
        const horizontalLines = Math.ceil(netHeight / meshSize);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= verticalLines; i++) {
            const topPoint = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT + netHeight,
                z: i * meshSize
            }, this.projectionMatrix);
            const bottomPoint = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT,
                z: i * meshSize
            }, this.projectionMatrix);

            this.ctx.beginPath();
            this.ctx.moveTo(topPoint.x, topPoint.y);
            this.ctx.lineTo(bottomPoint.x, bottomPoint.y);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= horizontalLines; i++) {
            const leftPoint = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT + i * meshSize,
                z: 0
            }, this.projectionMatrix);
            const rightPoint = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT + i * meshSize,
                z: TABLE.WIDTH
            }, this.projectionMatrix);

            this.ctx.beginPath();
            this.ctx.moveTo(leftPoint.x, leftPoint.y);
            this.ctx.lineTo(rightPoint.x, rightPoint.y);
            this.ctx.stroke();
        }

        // Net shadow
        const shadowPoints = [
            projectedPoints[0],
            projectedPoints[3],
            { x: projectedPoints[3].x + 10, y: projectedPoints[3].y + 5 },
            { x: projectedPoints[0].x + 10, y: projectedPoints[0].y + 5 }
        ];

        this.ctx.beginPath();
        this.ctx.moveTo(shadowPoints[0].x, shadowPoints[0].y);
        shadowPoints.slice(1).forEach(p => this.ctx.lineTo(p.x, p.y));
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Ambient lighting effect
        const ambientGradient = this.ctx.createRadialGradient(
            this.canvas.width * 0.5, this.canvas.height * 0.3,
            0,
            this.canvas.width * 0.5, this.canvas.height * 0.3,
            this.canvas.width * 0.7
        );
        ambientGradient.addColorStop(0, '#1a1a1a');
        ambientGradient.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = ambientGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTable();
        this.drawNet();
        this.drawPaddle(this.paddles.left);
        this.drawPaddle(this.paddles.right);
        this.drawBall();
    }
}