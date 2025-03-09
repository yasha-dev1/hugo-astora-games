class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.userChoice = null;
        this.computerChoice = null;
        this.result = null;
        this.score = { wins: 0, losses: 0, ties: 0 };
        this.keys = {
            'r': 'rock',
            'p': 'paper',
            's': 'scissors'
        };
        // Bind event handler
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init() {
        // Add event listener for keyboard input
        window.addEventListener('keydown', this.handleKeyDown);
        // Draw initial instructions
        this.draw();
        // Ensure canvas can receive focus for key events
        this.canvas.focus();
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (this.keys[key]) {
            this.userChoice = this.keys[key];
            this.playRound();
        }
    }

    playRound() {
        // Generate computer's choice
        const choices = ['rock', 'paper', 'scissors'];
        this.computerChoice = choices[Math.floor(Math.random() * 3)];

        // Determine the winner
        if (this.userChoice === this.computerChoice) {
            this.result = 'tie';
            this.score.ties++;
        } else if (
            (this.userChoice === 'rock' && this.computerChoice === 'scissors') ||
            (this.userChoice === 'paper' && this.computerChoice === 'rock') ||
            (this.userChoice === 'scissors' && this.computerChoice === 'paper')
        ) {
            this.result = 'win';
            this.score.wins++;
        } else {
            this.result = 'lose';
            this.score.losses++;
        }

        // Update the display
        this.draw();
    }

    draw() {
        // Clear the canvas with a dark background
        this.ctx.fillStyle = '#171717'; // Dark background like the example
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set default text properties
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';

        if (!this.userChoice) {
            // Display instructions
            this.ctx.fillStyle = '#EC4899'; // Neon-pink from the example
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Press R for Rock, P for Paper, S for Scissors',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        } else {
            // User's choice
            this.ctx.fillStyle = '#60A5FA'; // Neon-blue for user
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`You chose: ${this.userChoice}`, 50, 50);
            if (this.userChoice === 'rock') {
                this.drawRock(50, 70);
            } else if (this.userChoice === 'paper') {
                this.drawPaper(50, 70);
            } else if (this.userChoice === 'scissors') {
                this.drawScissors(50, 70);
            }

            // Computer's choice
            this.ctx.fillStyle = '#EC4899'; // Neon-pink for computer
            this.ctx.fillText(`Computer chose: ${this.computerChoice}`, this.canvas.width - 250, 50);
            if (this.computerChoice === 'rock') {
                this.drawRock(this.canvas.width - 100, 70);
            } else if (this.computerChoice === 'paper') {
                this.drawPaper(this.canvas.width - 100, 70);
            } else if (this.computerChoice === 'scissors') {
                this.drawScissors(this.canvas.width - 100, 70);
            }

            // Result
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            if (this.result === 'win') {
                this.ctx.fillStyle = '#22C55E'; // Green for win
            } else if (this.result === 'lose') {
                this.ctx.fillStyle = '#EF4444'; // Red for lose
            } else {
                this.ctx.fillStyle = '#FACC15'; // Yellow for tie
            }
            this.ctx.fillText(`Result: ${this.result}`, this.canvas.width / 2, this.canvas.height / 2);

            // Score
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FFFFFF'; // White for visibility
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                `Score: Wins - ${this.score.wins}, Losses - ${this.score.losses}, Ties - ${this.score.ties}`,
                50,
                this.canvas.height - 30
            );
        }
    }

    drawRock(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x + 25, y + 25, 25, 0, Math.PI * 2);
        this.ctx.fillStyle = 'gray';
        this.ctx.fill();
        this.ctx.strokeStyle = '#60A5FA'; // Neon-blue outline
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawPaper(x, y) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, 50, 50);
        this.ctx.strokeStyle = '#60A5FA'; // Neon-blue outline
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, 50, 50);
    }

    drawScissors(x, y) {
        this.ctx.strokeStyle = '#60A5FA'; // Neon-blue lines
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 50, y + 50);
        this.ctx.moveTo(x + 50, y);
        this.ctx.lineTo(x, y + 50);
        this.ctx.stroke();
    }
}
