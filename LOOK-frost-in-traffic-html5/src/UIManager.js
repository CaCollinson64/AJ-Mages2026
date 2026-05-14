export class UIManager {
    constructor(game, player, uiRootId) {
        this.game = game;
        this.player = player;
        this.uiRootId = uiRootId;
        
        this.state = 'hidden';
        
        const root = document.getElementById(uiRootId);
        this.rootMenu = root.querySelector('.root-menu');
        this.magicMenu = root.querySelector('.magic-menu');
        this.spDisplay = root.querySelector('.sp-display');
        this.mpDisplay = root.querySelector('.mp-display');
        this.scoreDisplay = root.querySelector('.score-display');
        this.livesDisplay = root.querySelector('.lives-display');
        this.joinOverlay = document.getElementById(`${uiRootId === 'p1-ui' ? 'p1' : 'p2'}-join`);
        this.gameOverOverlay = document.getElementById(`${uiRootId === 'p1-ui' ? 'p1' : 'p2'}-gameover`);
        
        this.menus = {
            'root': ['move', 'magic', 'suicide'],
            'magic': ['blizzard_1', 'blizzard_2', 'blizzard_3', 'float', 'back']
        };
        this.selectedIndex = 0;
        
        this.targetX = 0;
        this.targetY = 0;
        this.activeSpell = null;
        
        this.updateStatusDisplay();
        
        if (!this.player.isActive) {
            this.joinOverlay.style.display = 'block';
        }
    }

    hideJoinOverlay() {
        this.joinOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
    }

    showGameOver() {
        this.gameOverOverlay.style.display = 'block';
    }

    hideGameOver() {
        this.gameOverOverlay.style.display = 'none';
    }

    isActive() {
        return this.state !== 'hidden';
    }

    updateStatusDisplay() {
        if (!this.player) return;
        this.spDisplay.textContent = `${this.player.sp}/${this.player.maxSp}`;
        this.mpDisplay.textContent = `${this.player.mp}/${this.player.maxMp}`;
        this.scoreDisplay.textContent = `${this.player.score}`;
        this.livesDisplay.textContent = `${this.player.lives}`;
    }

    openRootMenu() {
        if (this.state !== 'hidden' || this.player.frozenTimer > 0) return;
        this.state = 'root';
        this.selectedIndex = 0;
        this.updateDOM();
    }

    closeMenu() {
        this.state = 'hidden';
        this.updateDOM();
    }

    handleInput(action) {
        if (this.state === 'root' || this.state === 'magic') {
            this.handleMenuInput(action);
        } else if (this.state.startsWith('targeting')) {
            this.handleTargetingInput(action);
        }
    }

    handleMenuInput(action) {
        const currentMenu = this.menus[this.state];
        
        if (action === 'up') {
            this.selectedIndex = (this.selectedIndex - 1 + currentMenu.length) % currentMenu.length;
            this.updateDOM();
        } else if (action === 'down') {
            this.selectedIndex = (this.selectedIndex + 1) % currentMenu.length;
            this.updateDOM();
        } else if (action === 'confirm') {
            const selection = currentMenu[this.selectedIndex];
            this.executeMenuSelection(selection);
        } else if (action === 'cancel') {
            if (this.state === 'magic') {
                this.state = 'root';
                this.selectedIndex = 1; 
                this.updateDOM();
            } else if (this.state === 'root') {
                this.closeMenu();
            }
        }
    }

    executeMenuSelection(selection) {
        if (selection === 'move') {
            this.state = 'targeting_move';
            const s = this.game.chunkSize;
            this.targetX = Math.round(this.player.targetX / s) * s;
            this.targetY = Math.round(this.player.targetY / s) * s;
            this.updateDOM();
        } else if (selection === 'magic') {
            this.state = 'magic';
            this.selectedIndex = 0;
            this.updateDOM();
        } else if (selection.startsWith('blizzard_')) {
            this.state = 'targeting_magic';
            this.activeSpell = selection; // 'blizzard_1', etc.
            const s = this.game.chunkSize;
            this.targetX = Math.round(this.player.targetX / s) * s;
            this.targetY = Math.round(this.player.targetY / s) * s;
            this.updateDOM();
        } else if (selection === 'float') {
            // Float Spell (Cost: 5MP)
            if (this.player.mp >= 5) {
                this.player.mp -= 5;
                this.updateStatusDisplay();
                this.player.floatTimer = 3.0;
                console.log("FLOAT!");
                this.closeMenu();
            } else {
                console.log("Not enough MP");
            }
        } else if (selection === 'back') {
            this.state = 'root';
            this.selectedIndex = 1;
            this.updateDOM();
        } else if (selection === 'suicide') {
            console.log("Suicide Magic cast!");
            this.player.die();
            this.closeMenu();
        }
    }

    handleTargetingInput(action) {
        const s = this.game.chunkSize;
        if (action === 'up') this.targetY -= s;
        if (action === 'down') this.targetY += s;
        if (action === 'left') this.targetX -= s;
        if (action === 'right') this.targetX += s;
        
        this.targetX = Math.max(0, Math.min(this.game.width - s, this.targetX));
        this.targetY = Math.max(0, Math.min(this.game.height - s, this.targetY));

        if (action === 'confirm') {
            if (this.state === 'targeting_move') {
                const px = Math.round(this.player.targetX / s) * s;
                const py = Math.round(this.player.targetY / s) * s;
                const dx = (this.targetX - px) / s;
                const dy = (this.targetY - py) / s;
                
                if ((dx === 0 || dy === 0) && Math.abs(dx) + Math.abs(dy) <= 3) {
                    if (this.player.move(dx, dy)) {
                        this.closeMenu();
                    } else {
                        console.log("Not enough SP");
                    }
                } else {
                    console.log("Invalid move");
                }
            } else if (this.state === 'targeting_magic') {
                const spellCosts = { 'blizzard_1': 1, 'blizzard_2': 2, 'blizzard_3': 4 };
                const spellRadii = { 'blizzard_1': 0, 'blizzard_2': 1, 'blizzard_3': 2 };
                
                const cost = spellCosts[this.activeSpell];
                const radius = spellRadii[this.activeSpell];
                
                if (this.player.mp >= cost) {
                    this.player.mp -= cost;
                    this.updateStatusDisplay();
                    this.game.worldManager.castBlizzard(this.targetX, this.targetY, this.player, radius);
                    this.closeMenu();
                } else {
                    console.log("Not enough MP");
                }
            }
        } else if (action === 'cancel') {
            if (this.state === 'targeting_move') {
                this.state = 'root';
                this.selectedIndex = 0;
            } else if (this.state === 'targeting_magic') {
                this.state = 'magic';
                this.selectedIndex = 0;
            }
            this.updateDOM();
        }
    }

    updateDOM() {
        this.rootMenu.style.display = this.state === 'root' ? 'block' : 'none';
        this.magicMenu.style.display = this.state === 'magic' ? 'block' : 'none';
        
        const updateSelection = (menuElement) => {
            if (menuElement.style.display !== 'block') return;
            const lis = menuElement.querySelectorAll('li');
            lis.forEach((li, i) => {
                if (i === this.selectedIndex) {
                    li.classList.add('selected');
                } else {
                    li.classList.remove('selected');
                }
            });
        };
        
        updateSelection(this.rootMenu);
        updateSelection(this.magicMenu);
    }

    update(deltaTime) {}

    drawCanvas(ctx) {
        if (this.state.startsWith('targeting')) {
            const s = this.game.chunkSize;
            
            ctx.strokeStyle = this.state === 'targeting_move' ? '#ffff00' : '#00ffff';
            ctx.lineWidth = 3;
            
            if (this.state === 'targeting_magic') {
                const spellRadii = { 'blizzard_1': 0, 'blizzard_2': 1, 'blizzard_3': 2 };
                const radius = spellRadii[this.activeSpell] || 0;
                const size = (1 + radius * 2) * s;
                ctx.strokeRect(this.targetX - radius * s, this.targetY - radius * s, size, size);
            } else {
                ctx.strokeRect(this.targetX, this.targetY, s, s);
            }
            
            // Draw crosshairs
            ctx.beginPath();
            ctx.moveTo(this.targetX - 5, this.targetY + s/2);
            ctx.lineTo(this.targetX + 10, this.targetY + s/2);
            ctx.moveTo(this.targetX + s + 5, this.targetY + s/2);
            ctx.lineTo(this.targetX + s - 10, this.targetY + s/2);
            
            ctx.moveTo(this.targetX + s/2, this.targetY - 5);
            ctx.lineTo(this.targetX + s/2, this.targetY + 10);
            ctx.moveTo(this.targetX + s/2, this.targetY + s + 5);
            ctx.lineTo(this.targetX + s/2, this.targetY + s - 10);
            ctx.stroke();

            if (this.state === 'targeting_move') {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
                const px = Math.round(this.player.targetX / s) * s;
                const py = Math.round(this.player.targetY / s) * s;
                for (let i = 1; i <= 3; i++) {
                    ctx.fillRect(px, py - i*s, s, s);
                    ctx.fillRect(px, py + i*s, s, s);
                    ctx.fillRect(px - i*s, py, s, s);
                    ctx.fillRect(px + i*s, py, s, s);
                }
            } else if (this.state === 'targeting_magic') {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                const spellRadii = { 'blizzard_1': 0, 'blizzard_2': 1, 'blizzard_3': 2 };
                const radius = spellRadii[this.activeSpell] || 0;
                const size = (1 + radius * 2) * s;
                ctx.fillRect(this.targetX - radius * s, this.targetY - radius * s, size, size);
            }
        }
    }
}
