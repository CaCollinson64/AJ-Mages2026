export class Player {
    constructor(game, startX, startY, color, isP1) {
        this.game = game;
        this.isP1 = isP1;
        
        this.startX = startX;
        this.startY = startY;

        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        
        this.isMoving = false;
        this.moveSpeed = 300; 

        this.color = color; 
        
        this.sp = 5;
        this.maxSp = 5;
        this.mp = 10;
        this.maxMp = 10;
        this.score = 0;
        this.lives = 3;
        
        this.spRegenTimer = 0;
        this.spRegenRate = 1.0;
        
        this.platformVelocity = 0; 
        
        this.isActive = false; 
        this.isGameOver = false;
        
        this.frozenTimer = 0;
        this.floatTimer = 0;
    }

    joinGame() {
        this.isActive = true;
        this.lives = 3;
        this.score = 0;
        this.isGameOver = false;
        this.resetPosition();
        this.getUI().updateStatusDisplay();
        this.getUI().hideJoinOverlay();
    }

    resetPosition() {
        this.x = this.startX;
        this.y = this.startY;
        this.targetX = this.startX;
        this.targetY = this.startY;
        this.isMoving = false;
        this.sp = this.maxSp;
        this.mp = this.maxMp;
        this.frozenTimer = 0;
    }

    update(deltaTime) {
        if (!this.isActive || this.isGameOver) return;

        if (this.frozenTimer > 0) {
            this.frozenTimer -= deltaTime;
            if (this.frozenTimer <= 0) {
                console.log("Player thawed out!");
            }
            return; // Can't move or regen SP while frozen
        }

        if (this.floatTimer > 0) {
            this.floatTimer -= deltaTime;
        }

        // Handle Movement Interpolation
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < this.moveSpeed * deltaTime) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
            } else {
                this.x += (dx / dist) * this.moveSpeed * deltaTime;
                this.y += (dy / dist) * this.moveSpeed * deltaTime;
            }
        } else {
            // Apply platform velocity if on a river
            if (this.platformVelocity !== 0) {
                this.x += this.platformVelocity * deltaTime;
                this.targetX = this.x; 
                
                if (this.x < -this.game.chunkSize || this.x > this.game.width) {
                    this.die();
                }
            }
        }

        // Regen SP
        if (this.sp < this.maxSp) {
            this.spRegenTimer += deltaTime;
            if (this.spRegenTimer >= this.spRegenRate) {
                this.sp++;
                this.spRegenTimer -= this.spRegenRate;
                this.getUI().updateStatusDisplay();
            }
        }

        this.checkCollisions();
    }

    getUI() {
        return this.isP1 ? this.game.p1UI : this.game.p2UI;
    }

    die() {
        if (!this.isActive || this.isGameOver) return;
        
        console.log("Player died!");
        this.game.worldManager.spawnParticles(this.x + this.game.chunkSize/2, this.y + this.game.chunkSize/2, 30, ['#ff0000', '#ff5500', '#ffffff', '#ffaa00']);
        this.game.triggerShake(0.4, 20);

        this.lives--;
        
        if (this.lives <= 0) {
            this.isGameOver = true;
            this.isActive = false;
            this.getUI().showGameOver();
        } else {
            this.resetPosition();
        }
        
        this.getUI().updateStatusDisplay();
        this.getUI().closeMenu();
    }

    checkCollisions() {
        const s = this.game.chunkSize;
        const cx = this.x + s/2;
        const cy = this.y + s/2;
        
        const gridY = Math.round(this.y / s);
        const inRiver = ((gridY >= 2 && gridY <= 4) || (gridY >= 6 && gridY <= 9));
        let onPlatform = false;
        this.platformVelocity = 0;

        for (let lane of this.game.worldManager.lanes) {
            for (let obj of lane.cars) {
                // Use lane.y and lane.y + s for vertical collision to remove gaps between lanes
                if (cx > obj.x && cx < obj.x + obj.width &&
                    cy > lane.y && cy < lane.y + s) {
                    
                    if (lane.type === 'river') {
                        onPlatform = true;
                        if (obj.frozenTimer <= 0) {
                            this.platformVelocity = lane.dir * lane.speed * this.game.difficultyMultiplier;
                        } else {
                            this.platformVelocity = 0; 
                        }
                    } else {
                        if (this.floatTimer <= 0) {
                            this.die();
                            return; 
                        }
                    }
                }
            }
        }

        if (inRiver && !onPlatform && this.floatTimer <= 0) {
            this.die();
            return;
        }
        
        let potions = this.game.worldManager.potions;
        for (let i = potions.length - 1; i >= 0; i--) {
            let p = potions[i];
            if (cx > p.x && cx < p.x + s &&
                cy > p.y && cy < p.y + s) {
                this.mp = Math.min(this.maxMp, this.mp + 2);
                this.score += 50;
                this.getUI().updateStatusDisplay();
                potions.splice(i, 1);
            }
        }

        let goldBars = this.game.worldManager.goldBars;
        for (let i = goldBars.length - 1; i >= 0; i--) {
            let g = goldBars[i];
            if (cx > g.x && cx < g.x + s &&
                cy > g.y && cy < g.y + s) {
                this.score += 200;
                this.getUI().updateStatusDisplay();
                goldBars.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (!this.isActive || this.isGameOver) return;
        
        const s = this.game.chunkSize;
        
        if (this.floatTimer > 0) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fillRect(this.x - 4, this.y - 4, s + 8, s + 8);
        }
        
        ctx.fillStyle = this.frozenTimer > 0 ? '#ccffff' : this.color;
        ctx.fillRect(this.x + 4, this.y + 4, s - 8, s - 8);
        
        ctx.fillStyle = '#000088';
        ctx.beginPath();
        ctx.moveTo(this.x + s/2, this.y + 4);
        ctx.lineTo(this.x + 8, this.y + s/2);
        ctx.lineTo(this.x + s - 8, this.y + s/2);
        ctx.fill();
        
        if (this.frozenTimer > 0) {
            ctx.fillStyle = 'rgba(200, 255, 255, 0.6)';
            ctx.fillRect(this.x - 2, this.y - 2, s + 4, s + 4);
        }
    }

    move(dx, dy) {
        if (this.isMoving || this.frozenTimer > 0) return false;

        const cost = Math.abs(dx) + Math.abs(dy);
        if (this.sp >= cost) {
            this.sp -= cost;
            this.getUI().updateStatusDisplay();
            
            this.targetX = Math.round(this.targetX / this.game.chunkSize) * this.game.chunkSize;
            
            this.targetX += dx * this.game.chunkSize;
            this.targetY += dy * this.game.chunkSize;
            
            this.targetX = Math.max(0, Math.min(this.game.width - this.game.chunkSize, this.targetX));
            this.targetY = Math.max(0, Math.min(this.game.height - this.game.chunkSize, this.targetY));
            
            this.isMoving = true;
            return true;
        }
        return false;
    }
}
