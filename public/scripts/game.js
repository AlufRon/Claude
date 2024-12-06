class PingPongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.projectionMatrix = createProjectionMatrix(canvas.width / canvas.height);
        this.initializeGame();
        this.lastTime = performance.now();
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

    initializeGame() {
        this.paddles = {
            left: {
                x: 0.3,
                y: TABLE.HEIGHT + PADDLE.HEAD_DIAMETER/2,
                z: TABLE.WIDTH/2,
                rotation: -15 * Math.PI/180,
                isRed: true
            },
            right: {
                x: TABLE.LENGTH - 0.3,
                y: TABLE.HEIGHT + PADDLE.HEAD_DIAMETER/2,
                z: TABLE.WIDTH/2,
                rotation: 195 * Math.PI/180,
                isRed: false
            }
        };

        this.ball = {
            x: TABLE.LENGTH/2,
            y: TABLE.HEIGHT + BALL.DIAMETER/2,
            z: TABLE.WIDTH/2,
            dx: BALL.INITIAL_SPEED,
            dy: 0,
            dz: 0
        };
    }

    drawTable() {
        // Draw table top
        const tableCorners = [
            {x: 0, y: TABLE.HEIGHT, z: 0},
            {x: TABLE.LENGTH, y: TABLE.HEIGHT, z: 0},
            {x: TABLE.LENGTH, y: TABLE.HEIGHT, z: TABLE.WIDTH},
            {x: 0, y: TABLE.HEIGHT, z: TABLE.WIDTH}
        ];

        const projectedCorners = tableCorners.map(p => 
            project3Dto2D(p, this.projectionMatrix));

        // Table surface
        this.ctx.beginPath();
        this.ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
        for (let i = 1; i < projectedCorners.length; i++) {
            this.ctx.lineTo(projectedCorners[i].x, projectedCorners[i].y);
        }
        this.ctx.closePath();

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(
            projectedCorners[0].x, projectedCorners[0].y,
            projectedCorners[2].x, projectedCorners[2].y
        );
        gradient.addColorStop(0, COLORS.TABLE_GREEN);
        gradient.addColorStop(1, '#0D470F');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Table border
        this.ctx.strokeStyle = COLORS.TABLE_BORDER;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw legs
        this.drawTableLegs(projectedCorners);
    }

    drawTableLegs() {
        const legWidth = 0.05; // 5cm width
        const legPositions = [
            {x: legWidth, y: 0, z: legWidth},
            {x: TABLE.LENGTH - legWidth, y: 0, z: legWidth},
            {x: TABLE.LENGTH - legWidth, y: 0, z: TABLE.WIDTH - legWidth},
            {x: legWidth, y: 0, z: TABLE.WIDTH - legWidth}
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
        });
    }

    drawNet() {
        const netHeight = 0.15;
        const netPoints = [
            {x: TABLE.LENGTH/2, y: TABLE.HEIGHT, z: 0},
            {x: TABLE.LENGTH/2, y: TABLE.HEIGHT + netHeight, z: 0},
            {x: TABLE.LENGTH/2, y: TABLE.HEIGHT + netHeight, z: TABLE.WIDTH},
            {x: TABLE.LENGTH/2, y: TABLE.HEIGHT, z: TABLE.WIDTH}
        ];

        const projectedPoints = netPoints.map(p => 
            project3Dto2D(p, this.projectionMatrix));

        // Draw net mesh
        this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= 20; i++) {
            const z = (i/20) * TABLE.WIDTH;
            const top = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT + netHeight,
                z: z
            }, this.projectionMatrix);
            const bottom = project3Dto2D({
                x: TABLE.LENGTH/2,
                y: TABLE.HEIGHT,
                z: z
            }, this.projectionMatrix);

            this.ctx.beginPath();
            this.ctx.moveTo(top.x, top.y);
            this.ctx.lineTo(bottom.x, bottom.y);
            this.ctx.stroke();
        }
    }

    drawPaddle(paddle) {
        const projected = project3Dto2D(
            {x: paddle.x, y: paddle.y, z: paddle.z},
            this.projectionMatrix
        );
        
        this.ctx.save();
        this.ctx.translate(projected.x, projected.y);
        this.ctx.rotate(paddle.rotation);

        // Draw paddle shadow
        this.ctx.save();
        this.ctx.translate(0, PADDLE.HEAD_DIAMETER * projected.scale * 0.5);
        this.ctx.scale(1, 0.5);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, PADDLE.HEAD_DIAMETER * projected.scale * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();
        this.ctx.restore();

        // Draw paddle head
        this.ctx.beginPath();
        this.ctx.arc(0, 0, PADDLE.HEAD_DIAMETER * projected.scale * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = paddle.isRed ? COLORS.PADDLE_RED : COLORS.PADDLE_BLACK;
        this.ctx.fill();

        // Draw handle
        this.ctx.fillStyle = COLORS.PADDLE_HANDLE;
        this.ctx.fillRect(
            -PADDLE.HANDLE_WIDTH * projected.scale * 0.5,
            0,
            PADDLE.HANDLE_WIDTH * projected.scale,
            PADDLE.HANDLE_LENGTH * projected.scale
        );

        this.ctx.restore();
    }

    drawBall() {
        const projected = project3Dto2D(
            {x: this.ball.x, y: this.ball.y, z: this.ball.z},
            this.projectionMatrix
        );

        // Ball shadow
        this.ctx.beginPath();
        this.ctx.ellipse(
            projected.x,
            projected.y + (BALL.DIAMETER * projected.scale),
            BALL.DIAMETER * projected.scale,
            BALL.DIAMETER * projected.scale * 0.4,
            0, 0, Math.PI * 2
        );
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();

        // Ball
        this.ctx.beginPath();
        this.ctx.arc(
            projected.x,
            projected.y,
            BALL.DIAMETER * projected.scale,
            0, Math.PI * 2
        );
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTable();
        this.drawNet();
        this.drawPaddle(this.paddles.left);
        this.drawPaddle(this.paddles.right);
        this.drawBall();
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    new PingPongGame(canvas);
};