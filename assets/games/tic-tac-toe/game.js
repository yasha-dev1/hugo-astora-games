class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Game state
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.winner = null;
        this.isPaused = false;

        // Colors for neon aesthetic
        this.gridColor = '#FFFFFF';  // White for grid lines
        this.xColor = '#EC4899';    // Neon-pink for X
        this.oColor = '#60A5FA';    // Neon-blue for O
        this.textColor = '#10B981'; // Neon-green for text

        // Bind event handler
        this.handleClick = this.handleClick.bind(this);
    }

    /** Initialize the game */
    init() {
        // Add click event listener
        this.canvas.addEventListener('click', this.handleClick);
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

    /** Handle mouse clicks to place marks or restart the game */
    handleClick(event) {
        if (this.isPaused) return;
        
        if (this.isGameOver) {
            this.restart();
            return;
        }

        // Get click coordinates relative to the canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate cell dimensions and clicked cell
        const cellWidth = this.canvas.width / 3;
        const cellHeight = this.canvas.height / 3;
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        // Place mark if cell is empty
        if (this.board[row][col] === null) {
            this.board[row][col] = this.currentPlayer;

            // Check for win or draw
            if (this.checkWin(this.currentPlayer)) {
                this.isGameOver = true;
                this.winner = this.currentPlayer;
            } else if (this.checkDraw()) {
                this.isGameOver = true;
                this.winner = 'Draw';
            } else {
                // Switch player
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }

            // Update display
            this.draw();
        }
    }

    /** Check if the specified player has won */
    checkWin(player) {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] === player && this.board[i][1] === player && this.board[i][2] === player) {
                return true;
            }
        }
        // Check columns
        for (let j = 0; j < 3; j++) {
            if (this.board[0][j] === player && this.board[1][j] === player && this.board[2][j] === player) {
                return true;
            }
        }
        // Check diagonals
        if (this.board[0][0] === player && this.board[1][1] === player && this.board[2][2] === player) {
            return true;
        }
        if (this.board[0][2] === player && this.board[1][1] === player && this.board[2][0] === player) {
            return true;
        }
        return false;
    }

    /** Check if the game is a draw (board full, no winner) */
    checkDraw() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    /** Draw a neon-styled line */
    drawNeonLine(x1, y1, x2, y2, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    /** Draw a neon-styled circle */
    drawNeonCircle(x, y, radius, color) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    /** Render the game state to the canvas */
    draw() {
        if (this.isPaused) return;

        // Clear canvas with a dark background
        this.ctx.fillStyle = '#171717'; // Dark color from example
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate cell dimensions
        const cellWidth = this.canvas.width / 3;
        const cellHeight = this.canvas.height / 3;

        // Draw grid lines
        this.drawNeonLine(cellWidth, 0, cellWidth, this.canvas.height, this.gridColor);
        this.drawNeonLine(2 * cellWidth, 0, 2 * cellWidth, this.canvas.height, this.gridColor);
        this.drawNeonLine(0, cellHeight, this.canvas.width, cellHeight, this.gridColor);
        this.drawNeonLine(0, 2 * cellHeight, this.canvas.width, 2 * cellHeight, this.gridColor);

        // Draw X's and O's
        this.board.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 'X') {
                    const x1 = j * cellWidth + 20;
                    const y1 = i * cellHeight + 20;
                    const x2 = (j + 1) * cellWidth - 20;
                    const y2 = (i + 1) * cellHeight - 20;
                    this.drawNeonLine(x1, y1, x2, y2, this.xColor);
                    this.drawNeonLine(x2, y1, x1, y2, this.xColor);
                } else if (cell === 'O') {
                    const centerX = (j + 0.5) * cellWidth;
                    const centerY = (i + 0.5) * cellHeight;
                    const radius = Math.min(cellWidth, cellHeight) * 0.3;
                    this.drawNeonCircle(centerX, centerY, radius, this.oColor);
                }
            });
        });

        // Draw game status messages
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = 'center';
        if (!this.isGameOver) {
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Player ${this.currentPlayer}'s turn`, this.canvas.width / 2, 30);
        } else {
            // Game over overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.textColor;
            this.ctx.font = '40px Arial';
            if (this.winner === 'Draw') {
                this.ctx.fillText('Draw!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillText(`Player ${this.winner} wins!`, this.canvas.width / 2, this.canvas.height / 2);
            }
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    /** Restart the game by resetting the state */
    restart() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.winner = null;
        this.draw();
    }
}
