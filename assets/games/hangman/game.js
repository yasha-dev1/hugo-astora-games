class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isPaused = false;

        // Game state
        this.word = '';
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.isGameOver = false;
        this.isLoading = true;
        this.hasError = false;

        // Colors
        this.textColor = '#EC4899';  // Neon pink
        this.lineColor = '#60A5FA';  // Neon blue
        this.correctColor = '#10B981'; // Neon green
        this.wrongColor = '#EF4444';  // Neon red

        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    async init() {
        // Add keyboard event listener
        document.addEventListener('keypress', this.handleKeyPress);
        
        // Initial word fetch and draw
        await this.fetchNewWord();
        this.draw();
    }

    async fetchNewWord() {
        this.isLoading = true;
        this.hasError = false;
        this.draw();

        try {
            const response = await fetch('https://random-word-api.herokuapp.com/word');
            if (!response.ok) throw new Error('Failed to fetch word');
            
            const [word] = await response.json();
            this.word = word.toUpperCase();
            this.guessedLetters.clear();
            this.wrongGuesses = 0;
            this.isGameOver = false;
            this.isLoading = false;
        } catch (error) {
            console.error('Error fetching word:', error);
            this.hasError = true;
            this.isLoading = false;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.draw();
        }
    }

    handleKeyPress(event) {
        if (this.isPaused || this.isLoading || this.hasError) return;

        const letter = event.key.toUpperCase();
        if (/^[A-Z]$/.test(letter) && !this.isGameOver) {
            if (!this.guessedLetters.has(letter)) {
                this.guessedLetters.add(letter);
                if (!this.word.includes(letter)) {
                    this.wrongGuesses++;
                    if (this.wrongGuesses >= this.maxWrongGuesses) {
                        this.isGameOver = true;
                    }
                } else if (this.isWordGuessed()) {
                    this.isGameOver = true;
                }
                this.draw();
            }
        } else if (event.key === 'Enter' && this.isGameOver) {
            this.fetchNewWord();
        }
    }

    isWordGuessed() {
        return [...this.word].every(letter => this.guessedLetters.has(letter));
    }

    drawHangman() {
        const centerX = this.canvas.width / 2;
        const bottomY = this.canvas.height * 0.8;
        
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Base
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 100, bottomY);
        this.ctx.lineTo(centerX + 100, bottomY);
        this.ctx.stroke();

        // Vertical pole
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 50, bottomY);
        this.ctx.lineTo(centerX - 50, bottomY - 200);
        this.ctx.stroke();

        // Top beam
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 50, bottomY - 200);
        this.ctx.lineTo(centerX + 50, bottomY - 200);
        this.ctx.stroke();

        // Rope
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 50, bottomY - 200);
        this.ctx.lineTo(centerX + 50, bottomY - 170);
        this.ctx.stroke();

        if (this.wrongGuesses >= 1) {
            // Head
            this.ctx.beginPath();
            this.ctx.arc(centerX + 50, bottomY - 150, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        if (this.wrongGuesses >= 2) {
            // Body
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 50, bottomY - 130);
            this.ctx.lineTo(centerX + 50, bottomY - 80);
            this.ctx.stroke();
        }

        if (this.wrongGuesses >= 3) {
            // Left arm
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 50, bottomY - 120);
            this.ctx.lineTo(centerX + 20, bottomY - 100);
            this.ctx.stroke();
        }

        if (this.wrongGuesses >= 4) {
            // Right arm
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 50, bottomY - 120);
            this.ctx.lineTo(centerX + 80, bottomY - 100);
            this.ctx.stroke();
        }

        if (this.wrongGuesses >= 5) {
            // Left leg
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 50, bottomY - 80);
            this.ctx.lineTo(centerX + 20, bottomY - 40);
            this.ctx.stroke();
        }

        if (this.wrongGuesses >= 6) {
            // Right leg
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 50, bottomY - 80);
            this.ctx.lineTo(centerX + 80, bottomY - 40);
            this.ctx.stroke();
        }
    }

    draw() {
        if (this.isPaused) return;

        // Clear canvas
        this.ctx.fillStyle = '#171717';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isLoading) {
            // Show loading message
            this.ctx.fillStyle = this.textColor;
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        if (this.hasError) {
            // Show error message
            this.ctx.fillStyle = this.wrongColor;
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Failed to load word', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Press Enter to try again', this.canvas.width / 2, this.canvas.height / 2 + 40);
            return;
        }

        // Draw hangman
        this.drawHangman();

        // Draw word
        this.ctx.font = '40px monospace';
        this.ctx.textAlign = 'center';
        const wordDisplay = [...this.word]
            .map(letter => this.guessedLetters.has(letter) ? letter : '_')
            .join(' ');
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText(wordDisplay, this.canvas.width / 2, this.canvas.height * 0.4);

        // Draw guessed letters
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        const guessedArray = Array.from(this.guessedLetters).sort();
        const correctGuesses = guessedArray.filter(letter => this.word.includes(letter));
        const wrongGuesses = guessedArray.filter(letter => !this.word.includes(letter));

        this.ctx.fillStyle = this.correctColor;
        this.ctx.fillText(`Correct: ${correctGuesses.join(' ')}`, this.canvas.width / 2, this.canvas.height * 0.6);
        
        this.ctx.fillStyle = this.wrongColor;
        this.ctx.fillText(`Wrong: ${wrongGuesses.join(' ')}`, this.canvas.width / 2, this.canvas.height * 0.7);

        // Game over message
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = '40px Arial';
            if (this.isWordGuessed()) {
                this.ctx.fillStyle = this.correctColor;
                this.ctx.fillText('You Win!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillStyle = this.wrongColor;
                this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.font = '30px Arial';
                this.ctx.fillText(`The word was: ${this.word}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            }
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Press Enter to play again', this.canvas.width / 2, this.canvas.height / 2 + 100);
        }
    }
}