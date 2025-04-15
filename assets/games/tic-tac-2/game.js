class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game objects
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };
        
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        this.isGameOver = false;
        this.enemySpawnInterval = 1000; // Spawn enemy every 1 second
        this.lastEnemySpawn = 0;
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Key states
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        
        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    init() {
        this.gameLoop();
    }

    handleKeyDown(e) {
        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
        if (e.code === 'Space') {
            this.keys.Space = true;
            this.shoot();
        }
        if (e.code === 'Enter' && this.isGameOver) {
            this.resetGame();
        }
    }

    handleKeyUp(e) {
        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
        if (e.code === 'Space') this.keys.Space = false;
    }

    shoot() {
        if (!this.isGameOver) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 7
            });
        }
    }

    spawnEnemy() {
        const currentTime = Date.now();
        if (currentTime - this.lastEnemySpawn > this.enemySpawnInterval) {
            this.enemies.push({
                x: Math.random() * (this.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 2
            });
            this.lastEnemySpawn = currentTime;
        }
    }

    update() {
        if (this.isGameOver) return;

        // Update player position
        if (this.keys.ArrowLeft) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys.ArrowRight) {
            this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });

        // Spawn and update enemies
        this.spawnEnemy();
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Check collision with bullets
            this.bullets = this.bullets.filter(bullet => {
                if (this.checkCollision(bullet, enemy)) {
                    this.score += 10;
                    return false;
                }
                return true;
            });

            // Check collision with player
            if (this.checkCollision(enemy, this.player)) {
                this.isGameOver = true;
            }

            return enemy.y < this.height && !this.checkCollision(enemy, this.player);
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw player
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw bullets
        this.ctx.fillStyle = '#FFFFFF';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw enemies
        this.ctx.fillStyle = '#FF0000';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

        // Draw score
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
            this.ctx.fillText('Press ENTER to restart', this.width / 2, this.height / 2 + 80);
        }
    }

    resetGame() {
        this.player.x = this.width / 2;
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        this.isGameOver = false;
        this.lastEnemySpawn = 0;
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}
