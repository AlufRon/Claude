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

    update(deltaTime) {
        this.updateBall(deltaTime);
        this.updatePaddles(deltaTime);
    }

    updateBall(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        // Update position
        this.ball.x += this.ball.dx * dt;
        this.ball.y += this.ball.dy * dt;
        this.ball.z += this.ball.dz * dt;

        // Apply gravity
        this.ball.dy += 9.81 * dt; // Real gravity in m/s²

        // Table collision
        if (this.ball.y > TABLE.HEIGHT + BALL.DIAMETER/2) {
            this.ball.y = TABLE.HEIGHT + BALL.DIAMETER/2;
            this.ball.dy = -this.ball.dy * 0.85; // Energy loss
            
            // Add some spin effect to z-velocity
            this.ball.dz += this.ball.dx * 0.1;
        }

        // Side bounds
        if (this.ball.z < BALL.DIAMETER/2 || this.ball.z > TABLE.WIDTH - BALL.DIAMETER/2) {
            this.ball.z = this.ball.z < BALL.DIAMETER/2 ? BALL.DIAMETER/2 : TABLE.WIDTH - BALL.DIAMETER/2;
            this.ball.dz *= -0.85;
        }

        // Net collision
        if (Math.abs(this.ball.x - TABLE.LENGTH/2) < 0.02 && 
            this.ball.y < TABLE.HEIGHT + 0.15) { // Net height = 15cm
            this.ball.dx *= -0.5;
            this.ball.x += Math.sign(this.ball.dx) * 0.02;
        }

        this.checkPaddleCollisions();

        // Reset if out
        if (this.ball.x < 0 || this.ball.x > TABLE.LENGTH) {
            this.resetBall();
        }
    }

    checkPaddleCollisions() {
        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            
            // Calculate paddle face center in 3D
            const paddleFaceX = paddle.x + (side === 'left' ? 1 : -1) * 
                               (PADDLE.HEAD_DIAMETER/2) * Math.cos(paddle.rotation);
            const paddleFaceZ = paddle.z + 
                               (PADDLE.HEAD_DIAMETER/2) * Math.sin(paddle.rotation);

            const dx = this.ball.x - paddleFaceX;
            const dy = this.ball.y - paddle.y;
            const dz = this.ball.z - paddleFaceZ;
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (distance < PADDLE.HEAD_DIAMETER/2 + BALL.DIAMETER/2) {
                // Calculate reflection vector
                const normal = {x: dx/distance, y: dy/distance, z: dz/distance};
                const speed = Math.sqrt(
                    this.ball.dx*this.ball.dx + 
                    this.ball.dy*this.ball.dy + 
                    this.ball.dz*this.ball.dz
                );
                
                this.ball.dx = normal.x * speed * 1.1; // Slight speed increase
                this.ball.dy = normal.y * speed * 0.8;
                this.ball.dz = normal.z * speed + (Math.random() - 0.5) * 2; // Add spin
                
                // Move ball out of collision
                this.ball.x = paddleFaceX + normal.x * (PADDLE.HEAD_DIAMETER/2 + BALL.DIAMETER/2);
            }
        });
    }

    updatePaddles(deltaTime) {
        const dt = deltaTime / 1000;

        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            
            // AI targeting
            if (side === 'left' ? this.ball.dx < 0 : this.ball.dx > 0) {
                // Predict ball position
                const timeToIntercept = Math.abs((paddle.x - this.ball.x) / this.ball.dx);
                const predictedZ = this.ball.z + this.ball.dz * timeToIntercept;
                
                // Move paddle towards predicted position
                const targetZ = Math.max(TABLE.WIDTH * 0.1, 
                                Math.min(TABLE.WIDTH * 0.9, predictedZ));
                paddle.z += (targetZ - paddle.z) * dt * 5;

                // Adjust paddle angle based on ball position
                const targetAngle = (side === 'left' ? -15 : 195) + 
                                   (paddle.z - TABLE.WIDTH/2) * 0.2;
                paddle.rotation += (targetAngle * Math.PI/180 - paddle.rotation) * dt * 10;
            } else {
                // Return to center when ball moving away
                paddle.z += (TABLE.WIDTH/2 - paddle.z) * dt * 2;
                const restAngle = (side === 'left' ? -15 : 195) * Math.PI/180;
                paddle.rotation += (restAngle - paddle.rotation) * dt * 5;
            }
        });
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}