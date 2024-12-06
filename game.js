class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.reset();
        this.setupControls();
        requestAnimationFrame(() => this.gameLoop());
    }

    reset() {
        this.ball = {x: 0, y: TABLE_HEIGHT + 10, z: 0};
        this.ballSpeed = {x: 5, y: 0, z: 2};
        this.leftPaddle = {x: -TABLE_LENGTH/2 + 30, y: TABLE_HEIGHT + 10, z: 0, isLeft: true};
        this.rightPaddle = {x: TABLE_LENGTH/2 - 30, y: TABLE_HEIGHT + 10, z: 0, isLeft: false};
        this.score = {left: 0, right: 0};
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'w': this.leftPaddle.z -= 5; break;
                case 's': this.leftPaddle.z += 5; break;
                case 'ArrowUp': this.rightPaddle.z -= 5; break;
                case 'ArrowDown': this.rightPaddle.z += 5; break;
            }
            // Constrain paddles to table
            this.leftPaddle.z = Math.max(-TABLE_WIDTH/2, Math.min(TABLE_WIDTH/2, this.leftPaddle.z));
            this.rightPaddle.z = Math.max(-TABLE_WIDTH/2, Math.min(TABLE_WIDTH/2, this.rightPaddle.z));
        });
    }

    updateBall() {
        this.ball.x += this.ballSpeed.x;
        this.ball.y += this.ballSpeed.y;
        this.ball.z += this.ballSpeed.z;

        // Bounce off table edges
        if (Math.abs(this.ball.z) > TABLE_WIDTH/2) {
            this.ballSpeed.z *= -1;
        }

        // Bounce off paddles
        if (this.ball.x < this.leftPaddle.x + 10 && Math.abs(this.ball.z - this.leftPaddle.z) < 20) {
            this.ballSpeed.x *= -1;
        }
        if (this.ball.x > this.rightPaddle.x - 10 && Math.abs(this.ball.z - this.rightPaddle.z) < 20) {
            this.ballSpeed.x *= -1;
        }

        // Score points
        if (this.ball.x < -TABLE_LENGTH/2) {
            this.score.right++;
            this.reset();
        } else if (this.ball.x > TABLE_LENGTH/2) {
            this.score.left++;
            this.reset();
        }
    }

    gameLoop() {
        this.renderer.clear();
        this.updateBall();
        
        this.renderer.drawTable();
        this.renderer.drawPaddle(this.leftPaddle);
        this.renderer.drawPaddle(this.rightPaddle);
        this.renderer.drawBall(this.ball);
        this.renderer.drawScore(this.score);
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();