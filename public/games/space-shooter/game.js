class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 40,
            height: 40,
            speed: 5,
            color: '#EC4899' // neon-pink
        };
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.isMuted = false;

        // Game settings
        this.enemySpawnRate = 60;
        this.frameCount = 0;
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Key states
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        
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

    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2,
            color: '#60A5FA' // neon-blue
        };
        this.enemies.push(enemy);
    }

    shoot() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7,
            color: '#EC4899' // neon-pink
        };
        this.bullets.push(bullet);
        
        // Play sound if not muted
        if (!this.isMuted) {
            // Add sound effect here
        }
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        // Update player position
        if (this.keys.ArrowLeft) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys.ArrowRight) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        if (this.keys.Space) {
            if (this.frameCount % 15 === 0) { // Limit shooting rate
                this.shoot();
            }
        }

        // Spawn enemies
        if (this.frameCount % this.enemySpawnRate === 0) {
            this.spawnEnemy();
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            
            // Check collision with enemies
            this.enemies.forEach((enemy, index) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.enemies.splice(index, 1);
                    this.score += 100;
                    return false;
                }
            });
            
            return bullet.y > 0;
        });

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Check collision with player
            if (this.checkCollision(enemy, this.player)) {
                this.isGameOver = true;
                return false;
            }
            
            return enemy.y < this.canvas.height;
        });

        this.frameCount++;
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    drawNeonRect(x, y, width, height, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
        
        // Fill with semi-transparent color
        this.ctx.fillStyle = color + '80'; // 50% opacity
        this.ctx.fillRect(x, y, width, height);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#171717'; // arcade-darker
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.drawNeonRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height,
            this.player.color
        );

        // Draw bullets
        this.bullets.forEach(bullet => {
            this.drawNeonRect(
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height,
                bullet.color
            );
        });

        // Draw enemies
        this.enemies.forEach(enemy => {
            this.drawNeonRect(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height,
                enemy.color
            );
        });

        // Draw score
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#EC4899';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = '40px "Press Start 2P", monospace';
            this.ctx.fillStyle = '#EC4899';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '20px "Press Start 2P", monospace';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
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

    toggleMute() {
        this.isMuted = !this.isMuted;
    }

    restart() {
        this.player.x = this.canvas.width / 2;
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.isGameOver = false;
        this.frameCount = 0;
    }
}
