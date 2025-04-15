class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = canvas.width / 3; // 3x3 grid for Tic Tac Toe
        this.grid = Array(3).fill().map(() => Array(3).fill(''));
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.winner = null;

        // Bind event handlers
        this.handleClick = this.handleClick.bind(this);

        // Add event listeners
        this.canvas.addEventListener('click', this.handleClick);
    }

    init() {
        this.render();
        this.canvas.focus();
    }

    handleClick(e) {
        if (this.isGameOver) return;

        // Get click position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to grid coordinates
        const row = Math.floor(y / this.cellSize);
        const col = Math.floor(x / this.cellSize);

        // Make move if cell is empty
        if (row >= 0 && row < 3 && col >= 0 && col < 3 && this.grid[row][col] === '') {
            this.grid[row][col] = this.currentPlayer;
            this.checkGameState();
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.render();
        }
    }

    checkGameState() {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (this.grid[i][0] !== '' &&
                this.grid[i][0] === this.grid[i][1] &&
                this.grid[i][1] === this.grid[i][2]) {
                this.isGameOver = true;
                this.winner = this.grid[i][0];
                return;
            }
        }

        // Check columns
        for (let j = 0; j < 3; j++) {
            if (this.grid[0][j] !== '' &&
                this.grid[0][j] === this.grid[1][j] &&
                this.grid[1][j] === this.grid[2][j]) {
                this.isGameOver = true;
                this.winner = this.grid[0][j];
                return;
            }
        }

        // Check diagonals
        if (this.grid[0][0] !== '' &&
            this.grid[0][0] === this.grid[1][1] &&
            this.grid[1][1] === this.grid[2][2]) {
            this.isGameOver = true;
            this.winner = this.grid[0][0];
            return;
        }

        if (this.grid[0][2] !== '' &&
            this.grid[0][2] === this.grid[1][1] &&
            this.grid[1][1] === this.grid[2][0]) {
            this.isGameOver = true;
            this.winner = this.grid[0][2];
            return;
        }

        // Check for draw
        if (this.grid.every(row => row.every(cell => cell !== ''))) {
            this.isGameOver = true;
            this.winner = null;
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#ECF0F1';
        this.ctx.lineWidth = 2;

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw X's and O's
        this.ctx.font = `${this.cellSize * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i][j] === 'X') {
                    this.ctx.fillStyle = '#E74C3C';
                    this.ctx.fillText(
                        'X',
                        j * this.cellSize + this.cellSize / 2,
                        i * this.cellSize + this.cellSize / 2
                    );
                } else if (this.grid[i][j] === 'O') {
                    this.ctx.fillStyle = '#3498DB';
                    this.ctx.fillText(
                        'O',
                        j * this.cellSize + this.cellSize / 2,
                        i * this.cellSize + this.cellSize / 2
                    );
                }
            }
        }

        // Draw current player indicator
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#ECF0F1';
        this.ctx.textAlign = 'left';
        if (!this.isGameOver) {
            this.ctx.fillText(`Current Player: ${this.currentPlayer}`, 10, this.canvas.height - 10);
        }

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.font = '40px Arial';
            this.ctx.fillStyle = '#ECF0F1';
            this.ctx.textAlign = 'center';

            if (this.winner) {
                this.ctx.fillText(
                    `Player ${this.winner} Wins!`,
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
            } else {
                this.ctx.fillText(
                    "It's a Draw!",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
            }

            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                'Click anywhere to restart',
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );

            // Add click listener for restart
            const restartHandler = (e) => {
                this.grid = Array(3).fill().map(() => Array(3).fill(''));
                this.currentPlayer = 'X';
                this.isGameOver = false;
                this.winner = null;
                this.render();
                this.canvas.removeEventListener('click', restartHandler);
            };
            this.canvas.addEventListener('click', restartHandler);
        }
    }
}
