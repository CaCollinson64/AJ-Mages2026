export class InputManager {
    constructor() {
        this.game = null;
        
        // P1 Key bindings (WASD)
        this.p1Binds = {
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right',
            ' ': 'confirm',
            'q': 'cancel'
        };

        // P2 Key bindings (Arrows)
        this.p2Binds = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Enter': 'confirm',
            'Shift': 'cancel'
        };
    }

    setGame(game) {
        this.game = game;
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') e.preventDefault(); // Prevent scrolling
            
            // Allow checking for Shift even if not perfectly cased, though 'Shift' is standard
            let keyToTest = e.key;
            
            const p1Action = this.p1Binds[keyToTest.toLowerCase()] || this.p1Binds[keyToTest];
            const p2Action = this.p2Binds[keyToTest];

            if (this.game.gameState === 'MENU') {
                if (p1Action === 'confirm') {
                    this.game.startGame(1);
                } else if (p2Action === 'confirm') {
                    this.game.startGame(2);
                }
                return;
            }

            // P1 Input (WASD)
            if (p1Action) {
                if (p1Action === 'confirm' && !this.game.player1.isActive && !this.game.player1.isGameOver) {
                    this.game.player1.joinGame();
                } else if (this.game.p1UI.isActive()) {
                    this.game.p1UI.handleInput(p1Action);
                } else if (!this.game.player1.isMoving && this.game.player1.isActive) {
                    this.game.p1UI.openRootMenu();
                }
            }

            // P2 Input (Arrows)
            if (p2Action) {
                if (p2Action === 'confirm' && !this.game.player2.isActive && !this.game.player2.isGameOver) {
                    this.game.player2.joinGame();
                } else if (this.game.p2UI.isActive()) {
                    this.game.p2UI.handleInput(p2Action);
                } else if (!this.game.player2.isMoving && this.game.player2.isActive) {
                    this.game.p2UI.openRootMenu();
                }
            }
        });
    }
}
