class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Set canvas size for a 10x20 grid with 30px blocks
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.blockSize = 30;

        // Game state
        this.grid = Array(20).fill().map(() => Array(10).fill(null));
        this.tetrominoShapes = {
            'I': [
                [[1,1,1,1]],                  // 1x4
                [[1],[1],[1],[1]],            // 4x1
                [[1,1,1,1]],                  // 1x4
                [[1],[1],[1],[1]]             // 4x1
            ],
            'O': [
                [[1,1],[1,1]],                // 2x2
                [[1,1],[1,1]],
                [[1,1],[1,1]],
                [[1,1],[1,1]]
            ],
            'T': [
                [[0,1,0],[1,1,1]],            // 2x3
                [[1,0],[1,1],[1,0]],          // 3x2
                [[1,1,1],[0,1,0]],            // 2x3
                [[0,1],[1,1],[0,1]]           // 3x2
            ],
            'S': [
                [[0,1,1],[1,1,0]],            // 2x3
                [[1,0],[1,1],[0,1]],          // 3x2
                [[0,1,1],[1,1,0]],            // 2x3
                [[1,0],[1,1],[0,1]]           // 3x2
            ],
            'Z': [
                [[1,1,0],[0,1,1]],            // 2x3
                [[0,1],[1,1],[1,0]],          // 3x2
                [[1,1,0],[0,1,1]],            // 2x3
                [[0,1],[1,1],[1,0]]           // 3x2
            ],
            'J': [
                [[1,0,0],[1,1,1]],            // 2x3
                [[1,1],[1,0],[1,0]],          // 3x2
                [[1,1,1],[0,0,1]],            // 2x3
                [[0,1],[0,1],[1,1]]           // 3x2
            ],
            'L': [
                [[0,0,1],[1,1,1]],            // 2x3
                [[1,0],[1,0],[1,1]],          // 3x2
                [[1,1,1],[1,0,0]],            // 2x3
                [[1,1],[0,1],[0,1]]           // 3x2
            ]
        };
        this.currentTetromino = null;
        this.nextTetromino = this.getRandomTetromino();
        this.position = { x: 4, y: 0 }; // Starting position near center
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;

        // Colors for retro aesthetic
        this.gridColor = '#FFFFFF';     // White for grid lines
        this.tetrominoColors = {
            'I': '#00FFFF', // Cyan
            'O': '#FFFF00', // Yellow
            'T': '#800080', // Purple
            'S': '#00FF00', // Green
            'Z': '#FF0000', // Red
            'J': '#0000FF', // Blue
            'L': '#FFA500'  // Orange
        };
        this.textColor = '#10B981';     // Neon-green for text

        // Bind event handler
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /** Initialize the game */
    init() {
        // Add key press event listener
        document.addEventListener('keydown', this.handleKeyPress);
        // Start game loop with 500ms interval for falling
        this.interval = setInterval(() => this.update(), 500);
        // Spawn the first tetromino
        this.spawnTetromino();
        // Initial draw
        this.draw();
    }

    /** Toggle pause state */
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.draw();
        }
    }

    /** Handle key presses for movement and controls */
    handleKeyPress(event) {
        if (this.isPaused || this.isGameOver) return;
        switch (event.key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotate();
                break;
            case 'p':
                this.togglePause();
                break;
        }
    }

    /** Generate a random tetromino */
    getRandomTetromino() {
        const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type: type,
            rotation: 0,
            shape: this.tetrominoShapes[type][0]
        };
    }

    /** Spawn a new tetromino */
    spawnTetromino() {
        this.currentTetromino = this.nextTetromino;
        this.nextTetromino = this.getRandomTetromino();
        this.position = { x: 4, y: 0 }; // Top center-ish
        if (this.checkCollision(this.position.x, this.position.y, this.currentTetromino.shape)) {
            this.isGameOver = true;
            clearInterval(this.interval);
            this.drawGameOver();
        }
    }

    /** Check for collisions with walls or blocks */
    checkCollision(x, y, shape) {
        for (let dy = 0; dy < shape.length; dy++) {
            for (let dx = 0; dx < shape[dy].length; dx++) {
                if (shape[dy][dx]) {
                    const gridX = x + dx;
                    const gridY = y + dy;
                    // Collision with walls or bottom
                    if (gridX < 0 || gridX >= 10 || gridY >= 20) {
                        return true;
                    }
                    // Collision with existing blocks (only if within grid)
                    if (gridY >= 0 && this.grid[gridY][gridX] !== null) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /** Lock the tetromino in place on the grid */
    lockTetromino() {
        const shape = this.currentTetromino.shape;
        const color = this.tetrominoColors[this.currentTetromino.type];
        for (let dy = 0; dy < shape.length; dy++) {
            for (let dx = 0; dx < shape[dy].length; dx++) {
                if (shape[dy][dx]) {
                    const gridX = this.position.x + dx;
                    const gridY = this.position.y + dy;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = color;
                    }
                }
            }
        }
    }

    /** Clear completed rows and update score */
    clearRows() {
        let rowsCleared = 0;
        for (let i = 19; i >= 0; i--) {
            if (this.grid[i].every(cell => cell !== null)) {
                this.grid.splice(i, 1);
                this.grid.unshift(Array(10).fill(null));
                rowsCleared++;
                i++; // Re-check the same index after shifting
            }
        }
        if (rowsCleared > 0) {
            this.score += rowsCleared * 100; // 100 points per row
        }
    }

    /** Move tetromino left */
    moveLeft() {
        if (!this.checkCollision(this.position.x - 1, this.position.y, this.currentTetromino.shape)) {
            this.position.x--;
            this.draw();
        }
    }

    /** Move tetromino right */
    moveRight() {
        if (!this.checkCollision(this.position.x + 1, this.position.y, this.currentTetromino.shape)) {
            this.position.x++;
            this.draw();
        }
    }

    /** Move tetromino down manually */
    moveDown() {
        if (!this.checkCollision(this.position.x, this.position.y + 1, this.currentTetromino.shape)) {
            this.position.y++;
            this.draw();
        } else {
            this.lockTetromino();
            this.clearRows();
            this.spawnTetromino();
            this.draw();
        }
    }

    /** Rotate tetromino clockwise */
    rotate() {
        const nextRotation = (this.currentTetromino.rotation + 1) % 4;
        const nextShape = this.tetrominoShapes[this.currentTetromino.type][nextRotation];
        if (!this.checkCollision(this.position.x, this.position.y, nextShape)) {
            this.currentTetromino.rotation = nextRotation;
            this.currentTetromino.shape = nextShape;
            this.draw();
        }
    }

    /** Update game state (automatic falling) */
    update() {
        if (this.isPaused || this.isGameOver) return;
        if (!this.checkCollision(this.position.x, this.position.y + 1, this.currentTetromino.shape)) {
            this.position.y++;
        } else {
            this.lockTetromino();
            this.clearRows();
            this.spawnTetromino();
        }
        this.draw();
    }

    /** Draw a neon-styled block */
    drawNeonBlock(x, y, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
        this.ctx.shadowBlur = 0;
    }

    /** Draw the game state to the canvas */
    draw() {
        if (this.isPaused) return;

        // Clear canvas with dark background
        this.ctx.fillStyle = '#171717'; // Dark retro background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        for (let i = 1; i < 20; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.canvas.width, i * this.blockSize);
            this.ctx.stroke();
        }
        for (let j = 1; j < 10; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.blockSize, 0);
            this.ctx.lineTo(j * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw occupied grid cells
        this.grid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    this.drawNeonBlock(j * this.blockSize, i * this.blockSize, cell);
                }
            });
        });

        // Draw current tetromino
        if (this.currentTetromino) {
            const shape = this.currentTetromino.shape;
            const color = this.tetrominoColors[this.currentTetromino.type];
            shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const x = this.position.x + dx;
                        const y = this.position.y + dy;
                        if (y >= 0) {
                            this.drawNeonBlock(x * this.blockSize, y * this.blockSize, color);
                        }
                    }
                });
            });
        }

        // Draw score
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = 'left';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    /** Draw game over message */
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = 'center';
        this.ctx.font = '40px Arial';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
    }
}