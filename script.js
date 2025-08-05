class AutoBattler {
    constructor() {
        this.currentCharacter = null;
        this.leaderboard = this.loadLeaderboard();
        this.enemyCharacters = this.generateEnemyCharacters();
        this.initializeEventListeners();
        this.loadCharacter();
    }

    initializeEventListeners() {
        document.getElementById('character-form').addEventListener('submit', (e) => this.createCharacter(e));
        document.getElementById('find-battle').addEventListener('click', () => this.findBattle());
        document.getElementById('edit-character').addEventListener('click', () => this.editCharacter());
        document.getElementById('start-battle').addEventListener('click', () => this.startBattle());
        document.getElementById('new-battle').addEventListener('click', () => this.findBattle());
    }

    createCharacter(e) {
        e.preventDefault();
        
        const name = document.getElementById('character-name').value;
        const description = document.getElementById('character-description').value;
        const strategy = document.getElementById('battle-strategy').value;
        
        this.currentCharacter = this.generateCharacterStats(name, description, strategy);
        this.saveCharacter();
        this.displayCharacter();
        this.updateLeaderboard();
    }

    generateCharacterStats(name, description, strategy) {
        const strategyMultipliers = {
            aggressive: { attack: 1.3, defense: 0.8, health: 0.9, speed: 1.1 },
            defensive: { attack: 0.8, defense: 1.4, health: 1.2, speed: 0.7 },
            balanced: { attack: 1.0, defense: 1.0, health: 1.0, speed: 1.0 },
            berserker: { attack: 1.5, defense: 0.6, health: 0.7, speed: 1.2 },
            tactical: { attack: 1.1, defense: 1.1, health: 1.0, speed: 0.8 }
        };

        const baseStats = {
            attack: 50 + Math.floor(Math.random() * 30),
            defense: 40 + Math.floor(Math.random() * 25),
            health: 100 + Math.floor(Math.random() * 50),
            speed: 30 + Math.floor(Math.random() * 40)
        };

        const multiplier = strategyMultipliers[strategy];
        
        return {
            name,
            description,
            strategy,
            stats: {
                attack: Math.floor(baseStats.attack * multiplier.attack),
                defense: Math.floor(baseStats.defense * multiplier.defense),
                health: Math.floor(baseStats.health * multiplier.health),
                speed: Math.floor(baseStats.speed * multiplier.speed)
            },
            maxHealth: Math.floor(baseStats.health * multiplier.health),
            wins: 0,
            losses: 0,
            totalBattles: 0
        };
    }

    displayCharacter() {
        document.getElementById('character-creation').classList.add('hidden');
        document.getElementById('character-display').classList.remove('hidden');
        
        const characterInfo = document.getElementById('character-info');
        const char = this.currentCharacter;
        
        characterInfo.innerHTML = `
            <div class="character-card">
                <h3>${char.name}</h3>
                <p><strong>Strategy:</strong> ${char.strategy.charAt(0).toUpperCase() + char.strategy.slice(1)}</p>
                <p><strong>Description:</strong> ${char.description || 'A mysterious warrior'}</p>
                <div class="character-stats">
                    <div class="stat">
                        <div class="stat-label">Attack</div>
                        <div class="stat-value">${char.stats.attack}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Defense</div>
                        <div class="stat-value">${char.stats.defense}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Health</div>
                        <div class="stat-value">${char.stats.health}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value">${char.stats.speed}</div>
                    </div>
                </div>
                <p><strong>Record:</strong> ${char.wins}W - ${char.losses}L (${char.totalBattles} battles)</p>
            </div>
        `;
    }

    editCharacter() {
        document.getElementById('character-display').classList.add('hidden');
        document.getElementById('character-creation').classList.remove('hidden');
        document.getElementById('battle-section').classList.add('hidden');
        
        if (this.currentCharacter) {
            document.getElementById('character-name').value = this.currentCharacter.name;
            document.getElementById('character-description').value = this.currentCharacter.description;
            document.getElementById('battle-strategy').value = this.currentCharacter.strategy;
        }
    }

    findBattle() {
        document.getElementById('battle-section').classList.remove('hidden');
        
        const enemy = this.enemyCharacters[Math.floor(Math.random() * this.enemyCharacters.length)];
        this.currentEnemy = { ...enemy };
        this.currentEnemy.stats.health = this.currentEnemy.maxHealth;
        this.currentCharacter.stats.health = this.currentCharacter.maxHealth;
        
        this.displayBattleSetup();
        document.getElementById('start-battle').classList.remove('hidden');
        document.getElementById('new-battle').classList.add('hidden');
    }

    displayBattleSetup() {
        document.getElementById('player-name').textContent = this.currentCharacter.name;
        document.getElementById('enemy-name').textContent = this.currentEnemy.name;
        
        this.updateHealthBars();
        this.updateStats();
        
        document.getElementById('battle-log').innerHTML = '<div class="log-entry log-system">Battle arena prepared! Click Start Battle to begin!</div>';
    }

    updateHealthBars() {
        const playerHealthPercent = (this.currentCharacter.stats.health / this.currentCharacter.maxHealth) * 100;
        const enemyHealthPercent = (this.currentEnemy.stats.health / this.currentEnemy.maxHealth) * 100;
        
        document.getElementById('player-health').style.width = `${playerHealthPercent}%`;
        document.getElementById('enemy-health').style.width = `${enemyHealthPercent}%`;
    }

    updateStats() {
        const playerStats = document.getElementById('player-stats');
        const enemyStats = document.getElementById('enemy-stats');
        
        playerStats.innerHTML = `
            <span>ATK: ${this.currentCharacter.stats.attack}</span>
            <span>DEF: ${this.currentCharacter.stats.defense}</span>
            <span>SPD: ${this.currentCharacter.stats.speed}</span>
        `;
        
        enemyStats.innerHTML = `
            <span>ATK: ${this.currentEnemy.stats.attack}</span>
            <span>DEF: ${this.currentEnemy.stats.defense}</span>
            <span>SPD: ${this.currentEnemy.stats.speed}</span>
        `;
    }

    async startBattle() {
        document.getElementById('start-battle').classList.add('hidden');
        const battleLog = document.getElementById('battle-log');
        battleLog.innerHTML = '<div class="log-entry log-system">Battle begins!</div>';
        
        let turn = 1;
        
        while (this.currentCharacter.stats.health > 0 && this.currentEnemy.stats.health > 0) {
            await this.sleep(1000);
            
            this.addLog(`--- Turn ${turn} ---`, 'system');
            
            const playerSpeed = this.currentCharacter.stats.speed + Math.random() * 20;
            const enemySpeed = this.currentEnemy.stats.speed + Math.random() * 20;
            
            if (playerSpeed >= enemySpeed) {
                await this.executeAttack(this.currentCharacter, this.currentEnemy, 'player');
                if (this.currentEnemy.stats.health > 0) {
                    await this.sleep(500);
                    await this.executeAttack(this.currentEnemy, this.currentCharacter, 'enemy');
                }
            } else {
                await this.executeAttack(this.currentEnemy, this.currentCharacter, 'enemy');
                if (this.currentCharacter.stats.health > 0) {
                    await this.sleep(500);
                    await this.executeAttack(this.currentCharacter, this.currentEnemy, 'player');
                }
            }
            
            this.updateHealthBars();
            turn++;
            
            if (turn > 20) break;
        }
        
        await this.sleep(1000);
        this.endBattle();
    }

    async executeAttack(attacker, defender, attackerType) {
        const damage = Math.max(1, attacker.stats.attack - defender.stats.defense + Math.floor(Math.random() * 20) - 10);
        const isCritical = Math.random() < 0.15;
        const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;
        
        defender.stats.health = Math.max(0, defender.stats.health - finalDamage);
        
        const attackerName = attackerType === 'player' ? this.currentCharacter.name : this.currentEnemy.name;
        const defenderName = attackerType === 'player' ? this.currentEnemy.name : this.currentCharacter.name;
        
        let message = `${attackerName} attacks ${defenderName} for ${finalDamage} damage`;
        if (isCritical) message += ' (CRITICAL HIT!)';
        
        this.addLog(message, attackerType);
        
        if (defender.stats.health <= 0) {
            this.addLog(`${defenderName} is defeated!`, 'system');
        }
    }

    addLog(message, type) {
        const battleLog = document.getElementById('battle-log');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = message;
        battleLog.appendChild(logEntry);
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    endBattle() {
        const playerWon = this.currentCharacter.stats.health > 0;
        
        if (playerWon) {
            this.currentCharacter.wins++;
            this.addLog(`🎉 Victory! ${this.currentCharacter.name} wins!`, 'system');
        } else {
            this.currentCharacter.losses++;
            this.addLog(`💀 Defeat! ${this.currentEnemy.name} wins!`, 'system');
        }
        
        this.currentCharacter.totalBattles++;
        this.saveCharacter();
        this.updateLeaderboard();
        this.displayCharacter();
        
        document.getElementById('new-battle').classList.remove('hidden');
    }

    generateEnemyCharacters() {
        const enemies = [
            { name: "Shadow Blade", strategy: "aggressive", description: "A mysterious assassin" },
            { name: "Iron Wall", strategy: "defensive", description: "An impenetrable fortress" },
            { name: "Storm Rider", strategy: "berserker", description: "Rides the lightning" },
            { name: "Wise Monk", strategy: "tactical", description: "Ancient wisdom guides them" },
            { name: "Balanced Warrior", strategy: "balanced", description: "Master of all arts" },
            { name: "Flame Dancer", strategy: "aggressive", description: "Dances with fire" },
            { name: "Stone Guardian", strategy: "defensive", description: "Protector of ancient secrets" },
            { name: "Wild Beast", strategy: "berserker", description: "Untamed and ferocious" },
            { name: "Crystal Sage", strategy: "tactical", description: "Sees all possibilities" },
            { name: "Void Walker", strategy: "balanced", description: "Steps between worlds" }
        ];
        
        return enemies.map(enemy => this.generateCharacterStats(enemy.name, enemy.description, enemy.strategy));
    }

    updateLeaderboard() {
        if (this.currentCharacter) {
            const existingIndex = this.leaderboard.findIndex(entry => entry.name === this.currentCharacter.name);
            const score = this.currentCharacter.wins * 3 - this.currentCharacter.losses;
            
            const leaderboardEntry = {
                name: this.currentCharacter.name,
                wins: this.currentCharacter.wins,
                losses: this.currentCharacter.losses,
                score: score
            };
            
            if (existingIndex >= 0) {
                this.leaderboard[existingIndex] = leaderboardEntry;
            } else {
                this.leaderboard.push(leaderboardEntry);
            }
            
            this.leaderboard.sort((a, b) => b.score - a.score);
            this.leaderboard = this.leaderboard.slice(0, 10);
            
            this.saveLeaderboard();
            this.displayLeaderboard();
        }
    }

    displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (this.leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>No battles yet! Create a character and start fighting!</p>';
            return;
        }
        
        leaderboardList.innerHTML = this.leaderboard.map((entry, index) => `
            <div class="leaderboard-entry">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-record">${entry.wins}W-${entry.losses}L</span>
                <span class="leaderboard-score">${entry.score} pts</span>
            </div>
        `).join('');
    }

    saveCharacter() {
        if (this.currentCharacter) {
            localStorage.setItem('autobattler-character', JSON.stringify(this.currentCharacter));
        }
    }

    loadCharacter() {
        const saved = localStorage.getItem('autobattler-character');
        if (saved) {
            this.currentCharacter = JSON.parse(saved);
            this.displayCharacter();
        }
        this.displayLeaderboard();
    }

    saveLeaderboard() {
        localStorage.setItem('autobattler-leaderboard', JSON.stringify(this.leaderboard));
    }

    loadLeaderboard() {
        const saved = localStorage.getItem('autobattler-leaderboard');
        return saved ? JSON.parse(saved) : [];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AutoBattler();
});