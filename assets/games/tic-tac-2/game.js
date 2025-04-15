class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 20;
        this.gridWidth = Math.floor(canvas.width / this.tileSize);
        this.gridHeight = Math.floor(canvas.height / this.tileSize);
        this.score = 0;
        this.isGameOver = false;
        
        // Pac-Man properties
        this.pacman = {
            x: this.tileSize * 1,
            y: this.tileSize * 1,
            direction: 'right',
            speed: 2,
            mouthOpen: 0,
            mouthSpeed: 0.15
        };

        // Ghost properties
        this.ghosts = [
            { x: this.tileSize * 10, y: this.tileSize * 10, color: 'red', direction: 'right' },
            { x: this.tileSize * 8, y: this.tileSize * 8, color: 'pink', direction: 'left' },
            { x: this.tileSize * 12, y: this.tileSize * 12, color: 'cyan', direction: 'up' }
        ];

        // Create dots grid
        this.dots = [];
        this.initializeDots();

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);

        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop);
    }

    initializeDots() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (x % 2 === 0 && y % 2 === 0) {
                    this.dots.push({ x: x * this.tileSize, y: y * this.tileSize });
                }
            }
        }
    }

    handleKeyDown(e) {
        if (this.isGameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.pacman.direction = 'left';
                break;
            case 'ArrowRight':
                this.pacman.direction = 'right';
                break;
            case 'ArrowUp':
                this.pacman.direction = 'up';
                break;
            case 'ArrowDown':
                this.pacman.direction = 'down';
                break;
        }
    }

    movePacman() {
        switch (this.pacman.direction) {
            case 'left':
                this.pacman.x -= this.pacman.speed;
                break;
            case 'right':
                this.pacman.x += this.pacman.speed;
                break;
            case 'up':
                this.pacman.y -= this.pacman.speed;
                break;
            case 'down':
                this.pacman.y += this.pacman.speed;
                break;
        }

        // Keep Pac-Man within bounds
        this.pacman.x = Math.max(0, Math.min(this.canvas.width - this.tileSize, this.pacman.x));
        this.pacman.y = Math.max(0, Math.min(this.canvas.height - this.tileSize, this.pacman.y));

        // Update mouth animation
        this.pacman.mouthOpen += this.pacman.mouthSpeed;
        if (this.pacman.mouthOpen > 0.5 || this.pacman.mouthOpen < 0) {
            this.pacman.mouthSpeed = -this.pacman.mouthSpeed;
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            // Simple ghost movement
            if (Math.random() < 0.02) {
                const directions = ['left', 'right', 'up', 'down'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            switch (ghost.direction) {
                case 'left':
                    ghost.x -= 1;
                    break;
                case 'right':
                    ghost.x += 1;
                    break;
                case 'up':
                    ghost.y -= 1;
                    break;
                case 'down':
                    ghost.y += 1;
                    break;
            }

            // Keep ghosts within bounds
            ghost.x = Math.max(0, Math.min(this.canvas.width - this.tileSize, ghost.x));
            ghost.y = Math.max(0, Math.min(this.canvas.height - this.tileSize, ghost.y));
        });
    }

    checkCollisions() {
        // Check dot collisions
        this.dots = this.dots.filter(dot => {
            const distance = Math.hypot(
                this.pacman.x + this.tileSize/2 - (dot.x + 2),
                this.pacman.y + this.tileSize/2 - (dot.y + 2)
            );
            if (distance < this.tileSize/2) {
                this.score += 10;
                return false;
            }
            return true;
        });

        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            const distance = Math.hypot(
                this.pacman.x + this.tileSize/2 - (ghost.x + this.tileSize/2),
                this.pacman.y + this.tileSize/2 - (ghost.y + this.tileSize/2)
            );
            if (distance < this.tileSize) {
                this.isGameOver = true;
            }
        });

        // Check win condition
        if (this.dots.length === 0) {
            this.isGameOver = true;
        }
    }

    drawPacman() {
        this.ctx.save();
        this.ctx.translate(this.pacman.x + this.tileSize/2, this.pacman.y + this.tileSize/2);
        
        // Rotate based on direction
        const rotationAngles = {
            'right': 0,
            'down': Math.PI/2,
            'left': Math.PI,
            'up': -Math.PI/2
        };
        this.ctx.rotate(rotationAngles[this.pacman.direction]);

        // Draw Pac-Man
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.tileSize/2, this.pacman.mouthOpen * Math.PI, 
                     (2 - this.pacman.mouthOpen) * Math.PI);
        this.ctx.lineTo(0, 0);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
        this.ctx.restore();
    }

    drawGhosts() {
        this.ghosts.forEach(ghost => {
            // Ghost body
            this.ctx.beginPath();
            this.ctx.arc(ghost.x + this.tileSize/2, ghost.y + this.tileSize/2, 
                        this.tileSize/2, Math.PI, 0);
            this.ctx.lineTo(ghost.x + this.tileSize, ghost.y + this.tileSize);
            this.ctx.lineTo(ghost.x, ghost.y + this.tileSize);
            this.ctx.closePath();
            this.ctx.fillStyle = ghost.color;
            this.ctx.fill();

            // Ghost eyes
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(ghost.x + this.tileSize/3, ghost.y + this.tileSize/2, 3, 0, Math.PI * 2);
            this.ctx.arc(ghost.x + (this.tileSize/3 * 2), ghost.y + this.tileSize/2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawDots() {
        this.ctx.fillStyle = 'white';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(dot.x + 2, dot.y + 2, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.isGameOver) {
            this.movePacman();
            this.moveGhosts();
            this.checkCollisions();
        }

        // Draw game elements
        this.drawDots();
        this.drawPacman();
        this.drawGhosts();

        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.dots.length === 0 ? 'YOU WIN!' : 'GAME OVER', 
                this.canvas.width/2, 
                this.canvas.height/2
            );
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                `Final Score: ${this.score}`,
                this.canvas.width/2,
                this.canvas.height/2 + 40
            );
        }

        requestAnimationFrame(this.gameLoop);
    }
}
