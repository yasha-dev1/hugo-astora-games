class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 4;
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.isGameOver = false;

        // Bind event handler
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Add event listener
        window.addEventListener('keydown', this.handleKeyDown);
    }

    init() {
        // Initialize the game by adding two random tiles
        this.addRandomTile();
        this.addRandomTile();
        // Render the initial state
        this.render();
        // Ensure the canvas can receive key events
        this.canvas.focus();
    }

    addRandomTile() {
        // Find all empty cells
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ i, j });
                }
            }
        }
        // Add a random tile (2 or 4) to a random empty cell
        if (emptyCells.length > 0) {
            const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% for 4
            this.grid[i][j] = value;
        }
    }

    handleKeyDown(e) {
        if (this.isGameOver) return;

        let direction;
        switch (e.key) {
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            default:
                return;
        }
        e.preventDefault(); // Prevent page scrolling

        // Store the current grid state
        const oldGrid = this.grid.map(row => [...row]);
        // Perform the move
        this.move(direction);
        // If the grid changed, add a new tile and check for game over
        if (!this.gridsEqual(oldGrid, this.grid)) {
            this.addRandomTile();
            if (this.isFull() && !this.canMerge()) {
                this.isGameOver = true;
            }
        }
        // Update the display
        this.render();
    }

    move(direction) {
        let temp = this.grid.map(row => [...row]);
        let scoreIncrement = 0;

        if (direction === 'left') {
            const result = this.moveLeft(temp);
            temp = result.newGrid;
            scoreIncrement = result.scoreIncrement;
        } else if (direction === 'right') {
            temp = this.reverseRows(temp);
            const result = this.moveLeft(temp);
            temp = result.newGrid;
            scoreIncrement = result.scoreIncrement;
            temp = this.reverseRows(temp);
        } else if (direction === 'up') {
            temp = this.transpose(temp);
            const result = this.moveLeft(temp);
            temp = result.newGrid;
            scoreIncrement = result.scoreIncrement;
            temp = this.transpose(temp);
        } else if (direction === 'down') {
            temp = this.transpose(temp);
            temp = this.reverseRows(temp);
            const result = this.moveLeft(temp);
            temp = result.newGrid;
            scoreIncrement = result.scoreIncrement;
            temp = this.reverseRows(temp);
            temp = this.transpose(temp);
        }

        this.grid = temp;
        this.score += scoreIncrement;
    }

    transpose(grid) {
        return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
    }

    reverseRows(grid) {
        return grid.map(row => [...row].reverse());
    }

    moveLeft(grid) {
        const newGrid = [];
        let scoreIncrement = 0;

        for (let row of grid) {
            // Filter out zeros
            const nonZero = row.filter(tile => tile !== 0);
            const newRow = [];
            // Merge adjacent identical tiles
            for (let k = 0; k < nonZero.length; k++) {
                if (k < nonZero.length - 1 && nonZero[k] === nonZero[k + 1]) {
                    const merged = nonZero[k] * 2;
                    newRow.push(merged);
                    scoreIncrement += merged;
                    k++; // Skip the merged tile
                } else {
                    newRow.push(nonZero[k]);
                }
            }
            // Pad with zeros
            while (newRow.length < this.gridSize) {
                newRow.push(0);
            }
            newGrid.push(newRow);
        }
        return { newGrid, scoreIncrement };
    }

    gridsEqual(grid1, grid2) {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    isFull() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    canMerge() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) {
                    return true;
                }
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) {
                    return true;
                }
            }
        }
        return false;
    }

    render() {
        const cellSize = this.canvas.width / this.gridSize;

        // Clear the canvas with the background color
        this.ctx.fillStyle = '#BBADA0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Define tile colors
        const tileColors = {
            0: '#CDC1B4',    // Empty cell
            2: '#EEE4DA',
            4: '#EDE0C8',
            8: '#F2B179',
            16: '#F59563',
            32: '#F67C5F',
            64: '#F65E3B',
            128: '#EDCF72',
            256: '#EDCC61',
            512: '#EDC850',
            1024: '#EDC53F',
            2048: '#EDC22E'
        };

        // Draw each tile
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const value = this.grid[i][j];
                const color = tileColors[value] || '#3C3A32'; // Default for values > 2048
                this.ctx.fillStyle = color;
                this.ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);

                // Draw the number if the tile is not empty
                if (value !== 0) {
                    this.ctx.font = `${cellSize / 2}px Arial`;
                    this.ctx.fillStyle = '#776E65';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        value.toString(),
                        j * cellSize + cellSize / 2,
                        i * cellSize + cellSize / 2
                    );
                }
            }
        }

        // Draw the score
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#776E65';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, this.canvas.height - 10);

        // Draw game over screen
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = '40px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                `Final Score: ${this.score}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );
        }
    }
}