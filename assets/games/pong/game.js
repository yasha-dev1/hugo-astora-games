class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Player 1 paddle (left side)
        this.paddle1 = {
            x: 50,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 5,
            color: '#EC4899' // neon-pink
        };

        // Player 2 paddle (right side)
        this.paddle2 = {
            x: this.canvas.width - 60,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 5,
            color: '#60A5FA' // neon-blue
        };

        // Ball
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            dx: 5 * (Math.random() > 0.5 ? 1 : -1), // Random initial direction
            dy: 5 * (Math.random() > 0.5 ? 1 : -1),
            color: '#10B981' // neon-green
        };

        // Game state
        this.score1 = 0; // Player 1 score
        this.score2 = 0; // Player 2 score
        this.isGameOver = false;
        this.isPaused = false;

        // Key states
        this.keys = {
            KeyW: false,      // Player 1 up
            KeyS: false,      // Player 1 down
            ArrowUp: false,   // Player 2 up
            ArrowDown: false, // Player 2 down
            Space: false      // For restart
        };

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    init() {
        // Start the game loop
        this.gameLoop();
    }

    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = false;
        }
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        // Move Player 1 paddle
        if (this.keys.KeyW) {
            this.paddle1.y = Math.max(0, this.paddle1.y - this.paddle1.speed);
        }
        if (this.keys.KeyS) {
            this.paddle1.y = Math.min(this.canvas.height - this.paddle1.height, this.paddle1.y + this.paddle1.speed);
        }

        // Move Player 2 paddle
        if (this.keys.ArrowUp) {
            this.paddle2.y = Math.max(0, this.paddle2.y - this.paddle2.speed);
        }
        if (this.keys.ArrowDown) {
            this.paddle2.y = Math.min(this.canvas.height - this.paddle2.height, this.paddle2.y + this.paddle2.speed);
        }

        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddles
        if (this.checkCollision(this.ball, this.paddle1) && this.ball.dx < 0) {
            this.ball.dx = -this.ball.dx * 1.05; // Slight speed increase
            this.ball.x = this.paddle1.x + this.paddle1.width + this.ball.radius; // Prevent sticking
        }
        if (this.checkCollision(this.ball, this.paddle2) && this.ball.dx > 0) {
            this.ball.dx = -this.ball.dx * 1.05; // Slight speed increase
            this.ball.x = this.paddle2.x - this.ball.radius; // Prevent sticking
        }

        // Scoring
        if (this.ball.x < 0) {
            this.score2 += 1;
            this.resetBall();
        }
        if (this.ball.x > this.canvas.width) {
            this.score1 += 1;
            this.resetBall();
        }

        // Check for game over (first to 10 wins)
        if (this.score1 >= 10 || this.score2 >= 10) {
            this.isGameOver = true;
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
    }

    checkCollision(ball, paddle) {
        return ball.x - ball.radius < paddle.x + paddle.width &&
               ball.x + ball.radius > paddle.x &&
               ball.y - ball.radius < paddle.y + paddle.height &&
               ball.y + ball.radius > paddle.y;
    }

    drawNeonRect(x, y, width, height, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = color + '80'; // 50% opacity
        this.ctx.fillRect(x, y, width, height);
    }

    drawNeonCircle(x, y, radius, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = color + '80';
        this.ctx.fill();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#171717'; // arcade-darker
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.drawNeonRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height, this.paddle1.color);
        this.drawNeonRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height, this.paddle2.color);

        // Draw ball
        this.drawNeonCircle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);

        // Draw scores
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.fillStyle = this.paddle1.color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score1, this.canvas.width / 4, 30);
        this.ctx.fillStyle = this.paddle2.color;
        this.ctx.fillText(this.score2, 3 * this.canvas.width / 4, 30);

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = '40px "Press Start 2P", monospace';
            this.ctx.fillStyle = '#EC4899';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '20px "Press Start 2P", monospace';
            this.ctx.fillText(`Player ${this.score1 >= 10 ? 1 : 2} Wins!`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);

            if (this.keys.Space) {
                this.restart();
            }
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    restart() {
        this.paddle1.y = this.canvas.height / 2 - 50;
        this.paddle2.y = this.canvas.height / 2 - 50;
        this.score1 = 0;
        this.score2 = 0;
        this.isGameOver = false;
        this.resetBall();
    }
}