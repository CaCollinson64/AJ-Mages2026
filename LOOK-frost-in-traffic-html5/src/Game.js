import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';
import { WorldManager } from './WorldManager.js';
import { Player } from './Player.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.chunkSize = 40; // 40x40 pixels per grid cell

        this.lastTime = 0;
        this.running = false;
        
        this.gameState = 'MENU';
        this.gameOverTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        
        this.difficultyMultiplier = 1.0;
        this.spawnRateMultiplier = 2.0; // Higher = less frequent spawns

        this.inputManager = new InputManager();
        this.worldManager = new WorldManager(this);

        // Player 1 (Left/Blue)
        this.player1 = new Player(this, 14 * this.chunkSize, 17 * this.chunkSize, '#00ffff', true);
        this.p1UI = new UIManager(this, this.player1, 'p1-ui');

        // Player 2 (Right/Gold)
        this.player2 = new Player(this, 17 * this.chunkSize, 17 * this.chunkSize, '#ffd700', false);
        this.p2UI = new UIManager(this, this.player2, 'p2-ui');

        this.inputManager.setGame(this);
    }

    start() {
        this.running = true;
        this.inputManager.bindEvents();
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(deltaTime) {
        let dt = deltaTime > 0.1 ? 0.1 : deltaTime; // Cap dt
        
        this.worldManager.update(dt);
        
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        if (this.gameState === 'MENU') {
            return;
        }

        this.player1.update(dt);
        this.player2.update(dt);
        this.p1UI.update(dt);
        this.p2UI.update(dt);

        this.checkWinCondition(this.player1);
        this.checkWinCondition(this.player2);
        
        let activeCount = 0;
        if (this.player1.isActive) activeCount++;
        if (this.player2.isActive) activeCount++;
        
        let deadCount = 0;
        if (this.player1.isGameOver) deadCount++;
        if (this.player2.isGameOver) deadCount++;

        if (activeCount === 0 && deadCount > 0) {
            this.gameState = 'GAMEOVER';
            this.gameOverTimer += dt;
            if (this.gameOverTimer > 3.0) {
                this.resetToMenu();
            }
        }
    }

    checkWinCondition(player) {
        if (!player.isActive || player.isGameOver) return;
        
        // Reach top safe zone (y <= 1)
        if (player.y <= 1 * this.chunkSize) {
            console.log("Level Complete!");
            player.score += 1000;
            this.difficultyMultiplier += 0.2;
            player.resetPosition();
            player.getUI().updateStatusDisplay();
        }
    }

    triggerShake(duration, intensity) {
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        this.worldManager.draw(this.ctx);

        if (this.gameState !== 'MENU') {
            this.player1.draw(this.ctx);
            this.player2.draw(this.ctx);

            this.p1UI.drawCanvas(this.ctx);
            this.p2UI.drawCanvas(this.ctx);
        }
        
        this.ctx.restore();
    }

    resetToMenu() {
        this.gameState = 'MENU';
        this.gameOverTimer = 0;
        this.difficultyMultiplier = 1.0;
        
        this.worldManager = new WorldManager(this);
        
        this.player1.isActive = false;
        this.player2.isActive = false;
        this.player1.isGameOver = false;
        this.player2.isGameOver = false;
        
        this.p1UI.hideGameOver();
        this.p2UI.hideGameOver();
        
        document.getElementById('title-screen').style.display = 'flex';
        document.getElementById('p1-ui').style.display = 'none';
        document.getElementById('p2-ui').style.display = 'none';
    }

    startGame(playerNum) {
        if (this.gameState === 'MENU') {
            this.gameState = 'PLAYING';
            this.worldManager = new WorldManager(this); // Fresh world
            document.getElementById('title-screen').style.display = 'none';
            document.getElementById('p1-ui').style.display = 'block';
            document.getElementById('p2-ui').style.display = 'block';
        }

        if (playerNum === 1 && !this.player1.isActive) {
            this.player1.joinGame();
        } else if (playerNum === 2 && !this.player2.isActive) {
            this.player2.joinGame();
        }
    }
}
