// constant variables
const POL = 0;
const STENA = 1;
const ZELYE = 2;
const MECH = 3;
const PLAYER = 4;
const ENEMY = 5;
const ENEMY_DAMAGE = 1.5;
const PLAYER_DAMAGE = 10;

// utils
function createMatrix(n, m) {
	return [...Array(n)].map(() => Array(m).fill(1));
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);      
}

function RoomParameter(mapWidth, mapHeight) {
    i = randomInteger(1, mapWidth - 3);
    j = randomInteger(1, mapHeight - 3);
    roomWidth = randomInteger(3, 8);
    roomHeight = randomInteger(3, 8);
    while (i + roomWidth > mapWidth) {
        roomWidth -= 1;
    }

    while (j + roomHeight > mapHeight) {
        roomHeight -= 1;
    } 

    return {x: i, y: j, width: roomWidth, height: roomHeight}
}

function clear(className) {
    let board = document.getElementById(className);
    board.innerHTML = '';
}

function addHealth(div, width) {
    let health = document.createElement('div');
    health.className = "health";
    health.style.width = width + "%";
    div.appendChild(health);
}


function drawBlock(classCreate, x, y, block_size, classPlace='field') {
    let board = document.getElementById(classPlace);
    let div = document.createElement('div');
    div.className = classCreate;
    div.style.left = x * block_size + "px";
    div.style.top = y * block_size + "px";
    board.appendChild(div);
}

function drawPeople(classCreate, x, y, block_size, health=100) {
    let board = document.getElementById('field');
    let div = document.createElement('div');
    div.className = classCreate;
    div.style.left = x * block_size + "px";
    div.style.top = y * block_size + "px";
    addHealth(div, health);
    board.appendChild(div);
}

// объект для хранения карты с объектами
class Map {
    constructor() {
        this.MAP_WIDTH = 40;
        this.MAP_HEIGHT = 24;
        this.BLOCK_SIZE = 26;
        this.map = createMatrix(this.MAP_WIDTH, this.MAP_HEIGHT);
    }

    setValue(i, j, value) {
        if (i < this.MAP_WIDTH && i > 0) {
            if (j < this.MAP_HEIGHT && j > 0)
                this.map[i][j] = value;
        }
    }

    getEmptyDirection(i, j) {
        if (i < this.MAP_WIDTH - 1 && i > 0) {
            if (this.map[i+1][j] === POL || this.map[i-1][j] === POL)
            return {x:1, y:0}
        }

        if (j < this.MAP_HEIGHT - 1 && j > 0)
            if (this.map[i][j+1] === POL || this.map[i][j-1] === POL)
            return {x:0, y:1}

        return null
    }

    fillMapBlock(x, y, width, height, value=0) {
        for (var i = x; i < x+width; i++){
            for (var j = y; j < y+height; j++) {
                this.map[i][j] = value;
            }
        }
    }

    fillRandOne(value) {
        let i = randomInteger(0, this.MAP_WIDTH - 1);
        let j = randomInteger(0, this.MAP_HEIGHT - 1);
    
        while (this.map[i][j] !== POL) {
            i = randomInteger(0, this.MAP_WIDTH - 1);
            j = randomInteger(0, this.MAP_HEIGHT - 1);
        }
    
        this.map[i][j] = value;
        return {x: i, y: j}
    }

    // return enemy id or null
    checkEnemy(i, j) {
        if (i < this.MAP_WIDTH - 1 && this.map[i+1][j] === ENEMY)
            return String(i+1) + ":" + String(j)

        if (i > 0 && this.map[i-1][j] === ENEMY)
            return String(i-1) + ":" + String(j)

        if (j < this.MAP_HEIGHT - 1 && this.map[i][j+1] === ENEMY)
            return String(i) + ":" + String(j+1)

        if (j > 0 && this.map[i][j-1] === ENEMY)
            return String(i) + ":" + String(j-1)

        return null
    }

    generateRoom() {
        let countRoom = randomInteger(5, 10);
        for (let i = 0; i < countRoom; i++) {
            let block = RoomParameter(this.MAP_WIDTH, this.MAP_HEIGHT);

            this.fillMapBlock(block.x, block.y, block.width, block.height);
        }
    }

    generateTrek() {
        let count = randomInteger(3, 5);
        for (let i=0; i<count; i++) {
            let x = randomInteger(0, this.MAP_WIDTH - 1);
            while (this.map[x][0] !== STENA)
                x = randomInteger(0, this.MAP_WIDTH - 1);

            this.fillMapBlock(x, 0, 1, this.MAP_HEIGHT);
        }

        count = randomInteger(3, 5);
        for (let i=0; i<count; i++) {
            let y = randomInteger(0, this.MAP_HEIGHT - 1);
            while (this.map[0][y] !== STENA)
                y = randomInteger(0, this.MAP_HEIGHT - 1);

            this.fillMapBlock(0, y, this.MAP_WIDTH, 1);
        }
    }

    generateEnemy(count=10) {
        let enemy = []
        for (let i = 0; i < count; i++) {
            let enemyPosition = this.fillRandOne(ENEMY);
            
            enemy.push({
                        id: enemyPosition.x + ':' + enemyPosition.y,
                        ...enemyPosition, 
                        health: 100,
                        direction: this.getEmptyDirection(enemyPosition.x, enemyPosition.y),
                        velocity: 1
            });
        }

        return enemy;
    }

    render() {
        this.map = createMatrix(this.MAP_WIDTH, this.MAP_HEIGHT);
        this.generateRoom();
        this.generateTrek();
        
        for (let i = 0; i < 10; i++) {
            this.fillRandOne(ZELYE);
        }

        for (let i = 0; i < 2; i++) {
            this.fillRandOne(MECH);
        }
    }

    move(from, to, value=PLAYER) {
        if (to.x < 0 || to.y < 0 || to.x >= this.MAP_WIDTH || to.y >= this.MAP_HEIGHT) {
            return null
        }

        if (value === ENEMY && this.map[to.x][to.y] === POL) {
            this.map[from.x][from.y] = this.map[to.x][to.y];
            this.map[to.x][to.y] = value;

            return {x: to.x, y: to.y};
        } else if (value === PLAYER && 
                this.map[to.x][to.y] !== STENA &&
                this.map[to.x][to.y] !== ENEMY) {

            let y = this.map[to.x][to.y];
            this.map[from.x][from.y] = POL;
            this.map[to.x][to.y] = value;

            if (y === ZELYE)
                return {x: to.x, y: to.y, health: 100};
            if (y === MECH) {
                return {x: to.x, y: to.y, damage: 1};
            }
            return {x: to.x, y: to.y};
        } else return null;
    }

    moveTo(direction, i, j) {
        let i_ = i;
        let j_ = j;
        if (direction === "W")
            j_ -= 1;
        else if (direction === "D")
            i_ += 1;
        else if (direction === "S")
            j_ += 1
        else if (direction === "A")
            i_ -= 1;

        return this.move({x:i, y:j}, {x:i_, y:j_})
    }

    draw(enemy, player) {
        for (var i = 0; i < this.MAP_WIDTH; i++) {
            for (var j = 0; j < this.MAP_HEIGHT; j++) {
                switch (this.map[i][j]) {
                    case 0: 
                        drawBlock("tile", i, j, this.BLOCK_SIZE);
                        break
                    case 1:
                        drawBlock("tileW", i, j, this.BLOCK_SIZE);
                        break
                    case 2:
                        drawBlock("tileHP", i, j, this.BLOCK_SIZE);
                        break
                    case 3:
                        drawBlock("tileSW", i, j, this.BLOCK_SIZE);
                        break
                    case 4:
                        drawPeople("tileP", i, j, this.BLOCK_SIZE, player.health);
                        break
                    case 5:
                        let index = enemy.findIndex((e) => e.id === String(i)+":"+String(j));
                        drawPeople("tileE", i, j, this.BLOCK_SIZE, enemy[index].health);
                        break
                    default: 
                        break;
                }
            }
        }
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.player = {};
        this.enemy = [];
        this.pause = false;
    }

    init() {
        this.map.render();
        this.player = {...this.map.fillRandOne(PLAYER), health: 100, damage: 1};
        this.enemy = this.map.generateEnemy();
        this.pause = false;
    }

    movePlayer(direction) {
        let newPosition = this.map.moveTo(direction, this.player.x, this.player.y);
        if (newPosition) {
            if (newPosition.damage) {
                let oldDamage = this.player.damage;
                drawBlock("tileSW_", oldDamage - 1, 0, 32, 'inventory');
                this.player = {
                                ...this.player, 
                                x: newPosition.x,
                                y: newPosition.y,
                                damage: oldDamage + 1,
                            };
            } else this.player = {...this.player, ...newPosition}
        }
    }

    moveEnemy(index) {
        let enemy_ = this.enemy[index];
        let newPosition = {
            x: enemy_.x + enemy_.direction.x * enemy_.velocity,
            y: enemy_.y + enemy_.direction.y * enemy_.velocity
        }

        if (this.map.move({x:enemy_.x, y:enemy_.y}, newPosition, ENEMY)) {
            this.enemy[index] = {
                ...enemy_,
                x: newPosition.x,
                y: newPosition.y,
                id: newPosition.x+":"+newPosition.y,
            }
        } else {
            this.enemy[index] = {
                ...enemy_,
                velocity: enemy_.velocity * (-1)
            }
        }
    }

    playerAtack() {
        let x = this.player.x;
        let y = this.player.y;

        let enemy_ = this.map.checkEnemy(x, y)
        if (enemy_) {
            let index = this.enemy.findIndex((e) => e.id === enemy_);
            this.enemy[index].health -= PLAYER_DAMAGE * this.player.damage;

            if (this.enemy[index].health <=0) {
                let i = this.enemy[index].x;
                let j = this.enemy[index].y;
                this.enemy.splice(index, 1);
                this.map.setValue(i, j, POL);

                if (this.enemy.length === 0) {
                    this.pause = true;
                    alert("You win!");
                }
            }
        }
    }

    setEnemyVelocity(enemyId, value) {
        let index = this.enemy.findIndex((e) => e.id === enemyId);
        if (this.enemy[index].velocity !== 0 && value !== 0) return
        
        this.enemy[index].velocity = value;
    }

    enemyAtack(enemyId) {
        this.player.health -= ENEMY_DAMAGE;
        if (this.player.health <= 0) {
            this.pause = true;
            alert("You lose!");
        }
    }

    eventListener(event) {
        if (event.code === 'KeyW') {
            this.movePlayer('W');
        } else if (event.code === 'KeyD') {
            this.movePlayer('D')
        } else if (event.code === 'KeyA') {
            this.movePlayer('A')
        } else if (event.code === 'KeyS') {
            this.movePlayer('S')
        } else if (event.code === 'Space') {
            this.playerAtack()
        } 
    }

    draw() {
        this.map.draw(this.enemy, this.player);
    }


    update() {
        clear('field');
        this.map.draw(this.enemy, this.player);
    }

    game() {
        let last;
        let step;
        let enemyId;
        document.addEventListener('keydown', (event) => {
            this.eventListener(event);
        });
        game.draw();

        const loop = (timestamp) => {
            requestAnimationFrame(loop);
            if (!last) {
                last = timestamp;
                step = 0;
            }
            
            if (step === 40) {
                this.enemy.forEach((_, index) => {
                    if (index > 5) this.moveEnemy(index);
                })
                step = 0;
            } else if (step === 20) {
                this.enemy.forEach((_, index) => {
                    if (index < 5) this.moveEnemy(index);
                })
            }

            if (this.map.checkEnemy(this.player.x, this.player.y))
                this.enemyAtack();

            

            step += 1;

            if (this.pause) {
                clear('inventory');
                this.init();
            }

            this.update();
        }

        requestAnimationFrame(loop);
    }
}

