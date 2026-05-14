export class WorldManager {
    constructor(game) {
        this.game = game;
        this.lanes = [];
        
        const s = this.game.chunkSize;
        
        // Roads: 11 to 16
        this.lanes.push({ y: 16 * s, type: 'road', dir: -1, speed: 70, cars: [], spawnRate: 2.5, spawnTimer: 0 });
        this.lanes.push({ y: 15 * s, type: 'road', dir: 1, speed: 100, cars: [], spawnRate: 2.0, spawnTimer: 0 });
        this.lanes.push({ y: 14 * s, type: 'road', dir: -1, speed: 130, cars: [], spawnRate: 1.5, spawnTimer: 0 });
        this.lanes.push({ y: 13 * s, type: 'road', dir: 1, speed: 60, cars: [], spawnRate: 3.0, spawnTimer: 0 });
        this.lanes.push({ y: 12 * s, type: 'road', dir: -1, speed: 90, cars: [], spawnRate: 2.2, spawnTimer: 0 });
        this.lanes.push({ y: 11 * s, type: 'road', dir: 1, speed: 120, cars: [], spawnRate: 1.8, spawnTimer: 0 });
        
        // River Lanes Bottom: 6 to 9 (4 lanes)
        this.lanes.push({ y: 9 * s, type: 'river', dir: 1, speed: 70, cars: [], spawnRate: 1.5, spawnTimer: 0, subtype: 'log' }); // Logs
        this.lanes.push({ y: 8 * s, type: 'river', dir: -1, speed: 100, cars: [], spawnRate: 1.2, spawnTimer: 0, subtype: 'alligator' }); // Alligators
        this.lanes.push({ y: 7 * s, type: 'river', dir: 1, speed: 130, cars: [], spawnRate: 1.0, spawnTimer: 0, subtype: 'log' }); // Fast Logs
        this.lanes.push({ y: 6 * s, type: 'river', dir: -1, speed: 80, cars: [], spawnRate: 1.6, spawnTimer: 0, subtype: 'log' }); // Slow Logs
        
        // River Lanes Top: 2 to 4 (3 lanes)
        this.lanes.push({ y: 4 * s, type: 'river', dir: 1, speed: 110, cars: [], spawnRate: 1.3, spawnTimer: 0, subtype: 'log' }); // Fast Logs
        this.lanes.push({ y: 3 * s, type: 'river', dir: -1, speed: 150, cars: [], spawnRate: 0.8, spawnTimer: 0, subtype: 'alligator' }); // Fast Alligators
        this.lanes.push({ y: 2 * s, type: 'river', dir: 1, speed: 90, cars: [], spawnRate: 1.4, spawnTimer: 0, subtype: 'log' }); // Logs
        
        this.spells = [];
        this.potions = [];
        this.potionSpawnTimer = 0;
        this.goldBars = [];
        this.goldSpawnTimer = 0;
        this.particles = [];
    }

    update(deltaTime) {
        const diff = this.game.difficultyMultiplier;

        // Spawn cars and river objects
        for (let lane of this.lanes) {
            lane.spawnTimer += deltaTime * diff; // Spawn faster if difficulty increases
            
            // Adjust spawn rate based on difficulty and global spawnRateMultiplier
            const effectiveSpawnRate = Math.max(0.5, (lane.spawnRate * this.game.spawnRateMultiplier) / diff);

            if (lane.spawnTimer >= effectiveSpawnRate) {
                lane.spawnTimer -= effectiveSpawnRate;
                
                if (Math.random() > 0.3) {
                    let canSpawn = true;
                    for (let obj of lane.cars) {
                        if (lane.dir === 1 && obj.x < this.game.chunkSize) canSpawn = false;
                        if (lane.dir === -1 && obj.x > this.game.width - this.game.chunkSize * 2) canSpawn = false;
                    }
                    
                    if (canSpawn) {
                        let widthMultiplier = lane.type === 'river' ? (Math.random() > 0.5 ? 2.5 : 3.5) : 1.5;
                        
                        lane.cars.push({
                            x: lane.dir === 1 ? -this.game.chunkSize * widthMultiplier : this.game.width,
                            y: lane.y,
                            width: this.game.chunkSize * widthMultiplier,
                            height: this.game.chunkSize * 0.8,
                            color: lane.type === 'river' ? (lane.subtype === 'alligator' ? '#2E8B57' : '#8B4513') : ['#ff3333', '#33ff33', '#aaaaaa', '#ffff33'][Math.floor(Math.random()*4)],
                            subtype: lane.subtype,
                            frozenTimer: 0
                        });
                    }
                }
            }

            // Move objects
            for (let i = lane.cars.length - 1; i >= 0; i--) {
                let obj = lane.cars[i];
                
                if (obj.frozenTimer > 0) {
                    obj.frozenTimer -= deltaTime;
                    continue; // Skip moving
                }

                obj.x += lane.dir * lane.speed * diff * deltaTime;

                // Pileup collision for both roads and rivers
                for (let other of lane.cars) {
                    if (other !== obj && other.frozenTimer > 0) {
                        if (obj.x < other.x + other.width && obj.x + obj.width > other.x) {
                            obj.frozenTimer = 5.0; // Freeze this one too
                            obj.x = lane.dir === 1 ? other.x - obj.width : other.x + other.width;
                            // Juice!
                            this.spawnParticles(obj.x + obj.width/2, obj.y + obj.height/2, 15, ['#ffffff', '#aaddff', '#00ffff']);
                            this.game.triggerShake(0.2, 10);
                        }
                    }
                }

                // Remove off-screen
                if ((lane.dir === 1 && obj.x > this.game.width) ||
                    (lane.dir === -1 && obj.x < -this.game.chunkSize * 4)) {
                    lane.cars.splice(i, 1);
                }
            }
        }

        // Update spells
        for (let i = this.spells.length - 1; i >= 0; i--) {
            this.spells[i].timer -= deltaTime;
            if (this.spells[i].timer <= 0) {
                this.spells.splice(i, 1);
            }
        }
        
        // Spawn Potions (Roads & Safe Zones)
        this.potionSpawnTimer += deltaTime;
        if (this.potionSpawnTimer > 5.0) {
            this.potionSpawnTimer -= 5.0;
            if (this.potions.length < 5) {
                const laneY = (Math.floor(Math.random() * 7) + 10) * this.game.chunkSize; // Y: 10 to 16
                const laneX = Math.floor(Math.random() * (this.game.width / this.game.chunkSize)) * this.game.chunkSize;
                this.potions.push({ x: laneX, y: laneY });
            }
        }
        
        // Spawn Gold Bars (River)
        this.goldSpawnTimer += deltaTime;
        if (this.goldSpawnTimer > 8.0) {
            this.goldSpawnTimer -= 8.0;
            if (this.goldBars.length < 3) {
                const riverLanes = [2, 3, 4, 6, 7, 8, 9];
                const laneY = riverLanes[Math.floor(Math.random() * riverLanes.length)] * this.game.chunkSize;
                const laneX = Math.floor(Math.random() * (this.game.width / this.game.chunkSize)) * this.game.chunkSize;
                this.goldBars.push({ x: laneX, y: laneY });
            }
        }
        
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= deltaTime;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        const w = this.game.width;
        const s = this.game.chunkSize;
        
        // Goal Line (top 2 chunks: 0-1)
        ctx.fillStyle = '#005500';
        ctx.fillRect(0, 0, this.game.width, 2 * s);

        // River Top (3 chunks: 2-4)
        ctx.fillStyle = '#1a4b8c';
        ctx.fillRect(0, 2 * s, this.game.width, 3 * s);

        // Island (1 chunk: 5)
        ctx.fillStyle = '#3a8c1a';
        ctx.fillRect(0, 5 * s, this.game.width, s);

        // River Bottom (4 chunks: 6-9)
        ctx.fillStyle = '#1a4b8c';
        ctx.fillRect(0, 6 * s, this.game.width, 4 * s);

        // Middle Safe Zone (1 chunk: 10)
        ctx.fillStyle = '#3a8c1a';
        ctx.fillRect(0, 10 * s, this.game.width, s);

        // Roads (next 6 chunks)
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 11 * s, this.game.width, 6 * s);

        // Start Safe Zone (last 1 chunk)
        ctx.fillStyle = '#3a8c1a';
        ctx.fillRect(0, 17 * s, this.game.width, s);

        // Lane dividers
        ctx.strokeStyle = '#666666';
        ctx.setLineDash([15, 15]);
        for (let i = 12; i <= 16; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i*s);
            ctx.lineTo(w, i*s);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        

        // Draw Cars and Boats
        for (let lane of this.lanes) {
            for (let obj of lane.cars) {
                ctx.fillStyle = obj.frozenTimer > 0 ? '#aaddff' : obj.color;
                let yOffset = (s - obj.height) / 2;
                ctx.fillRect(obj.x, obj.y + yOffset, obj.width, obj.height);
                
                // Draw details
                if (obj.frozenTimer <= 0) {
                    ctx.fillStyle = '#111';
                    if (lane.type === 'road') {
                        if (lane.dir === 1) {
                            ctx.fillRect(obj.x + obj.width - 10, obj.y + yOffset + 2, 6, obj.height - 4);
                        } else {
                            ctx.fillRect(obj.x + 4, obj.y + yOffset + 2, 6, obj.height - 4);
                        }
                    } else if (lane.type === 'river') {
                        if (obj.subtype === 'alligator') {
                            // Draw alligator features (eyes, tail)
                            ctx.fillStyle = '#006400'; // Dark green spots
                            ctx.fillRect(obj.x + 5, obj.y + yOffset + 5, 6, 6);
                            ctx.fillRect(obj.x + obj.width - 15, obj.y + yOffset + 5, 6, 6);
                            // Spikes along back
                            ctx.fillStyle = '#32CD32';
                            for (let i = 15; i < obj.width - 20; i += 12) {
                                ctx.beginPath();
                                ctx.moveTo(obj.x + i, obj.y + yOffset);
                                ctx.lineTo(obj.x + i + 4, obj.y + yOffset - 4);
                                ctx.lineTo(obj.x + i + 8, obj.y + yOffset);
                                ctx.fill();
                            }
                        } else {
                            // Draw log lines
                            ctx.strokeStyle = '#5c2e0e';
                            ctx.beginPath();
                            ctx.moveTo(obj.x + 10, obj.y + yOffset + obj.height/2);
                            ctx.lineTo(obj.x + obj.width - 10, obj.y + yOffset + obj.height/2);
                            ctx.stroke();
                        }
                    }
                }
                
                // Draw ice block if frozen
                if (obj.frozenTimer > 0) {
                    let alpha = 0.6;
                    let offsetX = 0;
                    if (obj.frozenTimer <= 1.5) {
                        // Flashing/shaking indicator when about to thaw
                        alpha = Math.floor(Date.now() / 150) % 2 === 0 ? 0.3 : 0.6;
                        offsetX = (Math.random() - 0.5) * 4;
                    }
                    ctx.fillStyle = `rgba(200, 255, 255, ${alpha})`;
                    ctx.fillRect(obj.x - 4 + offsetX, obj.y + yOffset - 4, obj.width + 8, obj.height + 8);
                }
            }
        }

        // Draw spell effects
        for (let spell of this.spells) {
            ctx.fillStyle = `rgba(150, 255, 255, ${spell.timer / 0.5})`;
            const r = spell.radius || 0;
            const size = (1 + r * 2) * s;
            ctx.fillRect(spell.x - r * s, spell.y - r * s, size, size);
        }
        
        // Draw Potions
        for (let p of this.potions) {
            ctx.fillStyle = '#0088ff';
            ctx.beginPath();
            ctx.moveTo(p.x + s/2, p.y + 4);
            ctx.lineTo(p.x + s/2 - 8, p.y + s - 4);
            ctx.lineTo(p.x + s/2 + 8, p.y + s - 4);
            ctx.fill();
        }

        // Draw Gold Bars
        for (let g of this.goldBars) {
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.fillRect(g.x + 8, g.y + 12, s - 16, s - 24);
            ctx.fillStyle = '#DAA520'; // Darker Gold for depth
            ctx.fillRect(g.x + 10, g.y + 14, s - 20, s - 28);
        }

        // Draw Particles
        for (let p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
    }

    castBlizzard(tx, ty, player, radius = 0) {
        const s = this.game.chunkSize;
        this.spells.push({ x: tx, y: ty, timer: 0.5, radius: radius });
        
        const left = tx - radius * s;
        const right = tx + s + radius * s;
        const top = ty - radius * s;
        const bottom = ty + s + radius * s;

        let objectsFrozen = 0;

        for (let lane of this.lanes) {
            for (let obj of lane.cars) {
                // Ignore already frozen objects
                if (obj.frozenTimer > 0) continue;

                if (obj.x + obj.width > left && obj.x < right &&
                    obj.y + obj.height > top && obj.y < bottom) {
                    obj.frozenTimer = 5.0; // Freeze for 5 seconds
                    objectsFrozen++;
                    this.spawnParticles(obj.x + obj.width/2, obj.y + obj.height/2, 20, ['#ffffff', '#aaddff', '#00ffff']);
                }
            }
        }

        // Friendly Fire
        const otherPlayer = player === this.game.player1 ? this.game.player2 : this.game.player1;
        if (otherPlayer.isActive && !otherPlayer.isGameOver && otherPlayer.floatTimer <= 0) {
            const pcx = otherPlayer.x + s/2;
            const pcy = otherPlayer.y + s/2;
            if (pcx > left && pcx < right && pcy > top && pcy < bottom) {
                otherPlayer.frozenTimer = 3.0; // Freeze other player
                console.log("FRIENDLY FIRE!");
            }
        }

        if (objectsFrozen > 0) {
            player.score += objectsFrozen * 10;
            player.getUI().updateStatusDisplay();
        }
    }

    spawnParticles(x, y, count, colors) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Math.random() * 0.4 + 0.2,
                maxLife: 0.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4
            });
        }
    }
}
