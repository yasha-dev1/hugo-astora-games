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
            speed: 3,
            powerUpActive: false,
            powerUpTimer: 0
        };

        // Ghost properties
        this.ghosts = [
            { x: this.tileSize * 18, y: this.tileSize * 1, direction: 'left', color: 'red' },
            { x: this.tileSize * 18, y: this.tileSize * 18, direction: 'up', color: 'pink' },
            { x: this.tileSize * 1, y: this.tileSize * 18, direction: 'right', color: 'cyan' }
        ];

        // Game items
        this.dots = [];
        this.powerUps = [];
        this.walls = [];

        // Initialize maze and items
        this.initializeMaze();
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        
        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    initializeMaze() {
        // Create walls (simplified maze pattern)
        for (let i = 0; i < this.gridWidth; i++) {
            for (let j = 0; j < this.gridHeight; j++) {
                if (i === 0 || i === this.gridWidth - 1 || j === 0 || j === this.gridHeight - 1 ||
                    (i % 4 === 0 && j % 3 !== 0)) {
                    this.walls.push({ x: i * this.tileSize, y: j * this.tileSize });
                } else if (!this.isNearPacman(i * this.tileSize, j * this.tileSize)) {
                    // Add dots where there are no walls
                    this.dots.push({ x: i * this.tileSize + this.tileSize/2, 
                                   y: j * this.tileSize + this.tileSize/2 });
                }
            }
        }

        // Add power-ups in specific locations
        const powerUpPositions = [
            { x: 1, y: 1 },
            { x: this.gridWidth - 2, y: 1 },
            { x: 1, y: this.gridHeight - 2 },
            { x: this.gridWidth - 2, y: this.gridHeight - 2 }
        ];

        powerUpPositions.forEach(pos => {
            this.powerUps.push({
                x: pos.x * this.tileSize + this.tileSize/2,
                y: pos.y * this.tileSize + this.tileSize/2
            });
        });
    }

    isNearPacman(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.pacman.x, 2) + 
            Math.pow(y - this.pacman.y, 2)
        );
        return distance < this.tileSize * 2;
    }

    handleKeyDown(e) {
        switch(e.key) {
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
        let newX = this.pacman.x;
        let newY = this.pacman.y;

        switch(this.pacman.direction) {
            case 'left':
                newX -= this.pacman.speed;
                break;
            case 'right':
                newX += this.pacman.speed;
                break;
            case 'up':
                newY -= this.pacman.speed;
                break;
            case 'down':
                newY += this.pacman.speed;
                break;
        }

        // Check wall collisions
        if (!this.checkWallCollision(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
        }

        // Check dot collisions
        this.checkDotCollision();
        
        // Check power-up collisions
        this.checkPowerUpCollision();
        
        // Check ghost collisions
        this.checkGhostCollision();
    }

    checkWallCollision(x, y) {
        for (let wall of this.walls) {
            if (this.checkCollision(
                x, y, this.tileSize, this.tileSize,
                wall.x, wall.y, this.tileSize, this.tileSize
            )) {
                return true;
            }
        }
        return false;
    }

    checkDotCollision() {
        this.dots = this.dots.filter(dot => {
            if (this.checkCollision(
                this.pacman.x, this.pacman.y, this.tileSize, this.tileSize,
                dot.x - 2, dot.y - 2, 4, 4
            )) {
                this.score += 10;
                return false;
            }
            return true;
        });
    }

    checkPowerUpCollision() {
        this.powerUps = this.powerUps.filter(powerUp => {
            if (this.checkCollision(
                this.pacman.x, this.pacman.y, this.tileSize, this.tileSize,
                powerUp.x - 6, powerUp.y - 6, 12, 12
            )) {
                this.pacman.powerUpActive = true;
                this.pacman.powerUpTimer = 300; // 5 seconds at 60fps
                this.score += 50;
                return false;
            }
            return true;
        });
    }

    checkGhostCollision() {
        for (let ghost of this.ghosts) {
            if (this.checkCollision(
                this.pacman.x, this.pacman.y, this.tileSize, this.tileSize,
                ghost.x, ghost.y, this.tileSize, this.tileSize
            )) {
                if (this.pacman.powerUpActive) {
                    // Reset ghost position when eaten
                    ghost.x = this.tileSize * Math.floor(Math.random() * (this.gridWidth - 2) + 1);
                    ghost.y = this.tileSize * Math.floor(Math.random() * (this.gridHeight - 2) + 1);
                    this.score += 200;
                } else {
                    this.isGameOver = true;
                }
            }
        }
    }

    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }

    moveGhosts() {
        for (let ghost of this.ghosts) {
            // Simple ghost movement
            switch(ghost.direction) {
                case 'left':
                    ghost.x -= 2;
                    if (this.checkWallCollision(ghost.x, ghost.y)) {
                        ghost.x += 2;
                        ghost.direction = 'right';
                    }
                    break;
                case 'right':
                    ghost.x += 2;
                    if (this.checkWallCollision(ghost.x, ghost.y)) {
                        ghost.x -= 2;
                        ghost.direction = 'left';
                    }
                    break;
                case 'up':
                    ghost.y -= 2;
                    if (this.checkWallCollision(ghost.x, ghost.y)) {
                        ghost.y += 2;
                        ghost.direction = 'down';
                    }
                    break;
                case 'down':
                    ghost.y += 2;
                    if (this.checkWallCollision(ghost.x, ghost.y)) {
                        ghost.y -= 2;
                        ghost.direction = 'up';
                    }
                    break;
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw walls
        this.ctx.fillStyle = 'blue';
        for (let wall of this.walls) {
            this.ctx.fillRect(wall.x, wall.y, this.tileSize, this.tileSize);
        }

        // Draw dots
        this.ctx.fillStyle = 'white';
        for (let dot of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw power-ups
        this.ctx.fillStyle = 'yellow';
        for (let powerUp of this.powerUps) {
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x, powerUp.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw Pac-Man
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.arc(
            this.pacman.x + this.tileSize/2,
            this.pacman.y + this.tileSize/2,
            this.tileSize/2,
            0.2 * Math.PI,
            1.8 * Math.PI
        );
        this.ctx.lineTo(this.pacman.x + this.tileSize/2, this.pacman.y + this.tileSize/2);
        this.ctx.fill();

        // Draw ghosts
        for (let ghost of this.ghosts) {
            this.ctx.fillStyle = this.pacman.powerUpActive ? 'blue' : ghost.color;
            this.ctx.beginPath();
            this.ctx.arc(
                ghost.x + this.tileSize/2,
                ghost.y + this.tileSize/2,
                this.tileSize/2,
                Math.PI,
                0
            );
            this.ctx.rect(
                ghost.x,
                ghost.y + this.tileSize/2,
                this.tileSize,
                this.tileSize/2
            );
            this.ctx.fill();
        }

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
                'GAME OVER',
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
    }

    gameLoop() {
        if (!this.isGameOver) {
            this.movePacman();
            this.moveGhosts();
            
            if (this.pacman.powerUpActive) {
                this.pacman.powerUpTimer--;
                if (this.pacman.powerUpTimer <= 0) {
                    this.pacman.powerUpActive = false;
                }
            }

            if (this.dots.length === 0 && this.powerUps.length === 0) {
                this.isGameOver = true;
            }
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
}
