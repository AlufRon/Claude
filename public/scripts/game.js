class PingPongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.projectionMatrix = createProjectionMatrix(canvas.width / canvas.height);
        this.initializeGame();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    drawTable() {
        const tablePoints = [
            { x: 0, y: TABLE.HEIGHT, z: 0 },
            { x: TABLE.LENGTH, y: TABLE.HEIGHT, z: 0 },
            { x: TABLE.LENGTH, y: TABLE.HEIGHT, z: TABLE.WIDTH },
            { x: 0, y: TABLE.HEIGHT, z: TABLE.WIDTH }
        ];

        // Project table corners
        const projectedPoints = tablePoints.map(p => 
            project3Dto2D(p, this.projectionMatrix));

        // Draw table surface
        this.ctx.beginPath();
        this.ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
        projectedPoints.slice(1).forEach(p => {
            this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.closePath();

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(
            projectedPoints[0].x, projectedPoints[0].y,
            projectedPoints[2].x, projectedPoints[2].y
        );
        gradient.addColorStop(0, COLORS.TABLE_GREEN);
        gradient.addColorStop(1, '#0D470F');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Draw table border
        this.ctx.strokeStyle = COLORS.TABLE_BORDER;
        this.ctx.lineWidth = TABLE.BORDER_WIDTH * projectedPoints[0].scale;
        this.ctx.stroke();

        // Draw legs
        this.drawTableLegs(projectedPoints);
    }

    drawTableLegs(tableCorners) {
        const legWidth = 0.05; // 5cm width
        const legPositions = [
            { x: legWidth, y: 0, z: legWidth },
            { x: TABLE.LENGTH - legWidth, y: 0, z: legWidth },
            { x: TABLE.LENGTH - legWidth, y: 0, z: TABLE.WIDTH - legWidth },
            { x: legWidth, y: 0, z: TABLE.WIDTH - legWidth }
        ];

        legPositions.forEach((bottomPos, i) => {
            const topPos = {
                x: bottomPos.x,
                y: TABLE.HEIGHT - TABLE.TOP_THICKNESS,
                z: bottomPos.z
            };

            const projBottom = project3Dto2D(bottomPos, this.projectionMatrix);
            const projTop = project3Dto2D(topPos, this.projectionMatrix);

            // Draw leg
            this.ctx.beginPath();
            this.ctx.moveTo(projBottom.x, projBottom.y);
            this.ctx.lineTo(projTop.x, projTop.y);
            this.ctx.lineWidth = legWidth * projBottom.scale * 100;
            this.ctx.strokeStyle = '#404040';
            this.ctx.stroke();

            // Draw leg shadow
            const shadowLength = legWidth * 2;
            this.ctx.beginPath();
            this.ctx.ellipse(
                projBottom.x,
                projBottom.y,
                shadowLength * projBottom.scale * 100,
                shadowLength * projBottom.scale * 50,
                0, 0, Math.PI * 2
            );
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.fill();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw floor (simple gradient)
        const floorGradient = this.ctx.createLinearGradient(
            0, this.canvas.height,
            0, this.canvas.height * 0.7
        );
        floorGradient.addColorStop(0, '#1a1a1a');
        floorGradient.addColorStop(1, '#2d2d2d');
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTable();
        // Other draw calls will be added in next steps
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    new PingPongGame(canvas);
};