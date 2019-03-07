class GameController {
    constructor(gridDimension, speed) {
        this.gridDimension = gridDimension;
        this.speed = speed;
        this.grid = null;
        this.onInit();
    }
    onInit() {
        this.grid = new Grid(this.gridDimension, this.speed);
        this.hangEvents();
    }
    hangEvents() {
        document.onkeydown = key => {
            if (key.code === 'KeyW') {
                this.grid.slideUp();
            } else if (key.code === 'KeyA') {
                this.grid.slideLeft();
            } else if (key.code === 'KeyS') {
                this.grid.slideDown();
            } else if (key.code === 'KeyD') {
                this.grid.slideRight();
            }
        }
    }
}
class Grid {
    constructor(gridDimension, speed) {
        this.gridDimension = gridDimension;
        this.speed = speed;
        this.DOMGrid = null;
        this.canInteract = true;
        this.tiles = null;
        this.canCreateTile = false;
        this.onInit();
    }
    onInit() {
        if (!localStorage.getItem('grid') || localStorage.getItem('grid') === 'undefined') {
            this._createArray();
            this._createDOMGrid();
            this.createTile();
        } else {
            this._createDOMGrid();
            this.restoreGrid();
        }
    }
    createTile() {
        if (this.tiles.length < Math.pow(this.gridDimension, 2)) {
            const tileCoordinates = this._findEmptyCell();
            this.tiles[tileCoordinates.y][tileCoordinates.x] = new Tile(tileCoordinates.x, tileCoordinates.y, this.speed);
        } else {
            console.warn('Grid is full');
        }
    }
    slideUp() {
        if (this.canInteract) {
            this.canInteract = false;
            for (let i = 0; i < this.tiles.length; i++) {
                for (let j = 0; j < this.tiles[i].length; j++) {
                    if (this.tiles[i][j] !== null && i !== 0) {
                        this._slideUp(i, j);
                    }
                }
            }
            this._unlockTiles();
            setTimeout(() => {
                if (this.canCreateTile) {
                    this.createTile();
                    this.canCreateTile = false;
                }
                this.saveGrid();
                this.canInteract = true;
            }, this.speed);
        }
    }
    slideLeft() {
        if (this.canInteract) {
            this.canInteract = false;
            for (let i = 0; i < this.tiles.length; i++) {
                for (let j = 0; j < this.tiles[i].length; j++) {
                    if (this.tiles[i][j] !== null && j !== 0) {
                        this._slideLeft(i, j);
                    }
                }
            }
            this._unlockTiles();
            setTimeout(() => {
                this.canInteract = true;
                if (this.canCreateTile) {
                    this.createTile();
                    this.canCreateTile = false;
                }
                this.saveGrid();
            }, this.speed);
        }
    }
    slideDown() {
        if (this.canInteract) {
            this.canInteract = false;
            for (let i = this.tiles.length - 1; i >= 0; i--) {
                for (let j = 0; j < this.tiles[i].length; j++) {
                    if (this.tiles[i][j] !== null && i !== this.tiles.length - 1) {
                        this._slideDown(i, j);
                    }
                }
            }
            this._unlockTiles();
            setTimeout(() => {
                if (this.canCreateTile) {
                    this.createTile();
                    this.canCreateTile = false;
                }
                this.saveGrid();
                this.canInteract = true;
            }, this.speed);
        }
    }
    slideRight() {
        if (this.canInteract) {
            this.canInteract = false;
            for (let i = 0; i < this.tiles.length; i++) {
                for (let j = this.tiles[i].length - 1; j >= 0; j--) {
                    if (this.tiles[i][j] !== null && j !== this.tiles[i].length - 1) {
                        this._slideRight(i, j);
                    }
                }
            }
            this._unlockTiles();
            setTimeout(() => {
                if (this.canCreateTile) {
                    this.createTile();
                    this.canCreateTile = false;
                }
                this.saveGrid();
                this.canInteract = true;
            }, this.speed);
        }
    }
    saveGrid() {
        localStorage.setItem('grid', JSON.stringify(this.tiles));
    }
    restoreGrid() {
        const grid = JSON.parse(localStorage.getItem('grid'));
        this.tiles = new Array(grid.length);
        for (let i = 0; i < grid.length; i++) {
            this.tiles[i] = new Array(grid.length);
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === null) {
                    this.tiles[i][j] = null;
                }  else {
                    this.tiles[i][j] = new Tile(grid[i][j].x, grid[i][j].y, grid[i][j].speed, grid[i][j].value);
                }
            }
        }
    }

    _slideUp(i, j) {
        if (this.tiles[i - 1] !== undefined) {
            if (this.tiles[i - 1][j] === null) {
                this.canCreateTile = true;
                this.tiles[i - 1][j] = this.tiles[i][j];
                this.tiles[i - 1][j].y--;
                this.tiles[i - 1][j].DOMTile.style.top = this.tiles[i - 1][j].y * 100 + 'px';
                this.tiles[i][j] = null;
                this._slideUp(i - 1, j);
            } else if (this.tiles[i - 1][j] instanceof Tile) {
                if (this.tiles[i][j].value === this.tiles[i - 1][j].value && !this.tiles[i - 1][j].locked) {
                    this.canCreateTile = true;
                    this.tiles[i - 1][j].value += this.tiles[i][j].value;
                    this.tiles[i - 1][j].DOMTile.innerText = this.tiles[i - 1][j].value;
                    this.tiles[i - 1][j].locked = true;
                    this.tiles[i][j].DOMTile.style.zIndex = 0;
                    const ghostTile = Object.assign({}, this.tiles[i][j]);
                    this.tiles[i][j] = null;
                    ghostTile.DOMTile.style.top = this.tiles[i - 1][j].y * 100 + 'px';
                    setTimeout(() => {
                        ghostTile.DOMTile.remove();
                    }, this.speed);
                }
            }
        }
    }
    _slideLeft(i, j) {
        if (this.tiles[i][j - 1] !== undefined) {
            if (this.tiles[i][j - 1] === null) {
                this.canCreateTile = true;
                this.tiles[i][j - 1] = this.tiles[i][j];
                this.tiles[i][j - 1].x--;
                this.tiles[i][j - 1].DOMTile.style.left = this.tiles[i][j - 1].x * 100 + 'px';
                this.tiles[i][j] = null;
                this._slideLeft(i, j - 1);
            } else if (this.tiles[i][j - 1] instanceof Tile) {
                if (this.tiles[i][j].value === this.tiles[i][j - 1].value && !this.tiles[i][j - 1].locked) {
                    this.canCreateTile = true;
                    this.tiles[i][j - 1].value += this.tiles[i][j].value;
                    this.tiles[i][j - 1].DOMTile.innerText = this.tiles[i][j - 1].value;
                    this.tiles[i][j - 1].locked = true;
                    this.tiles[i][j].DOMTile.style.zIndex = 0;
                    const ghostTile = Object.assign({}, this.tiles[i][j]);
                    this.tiles[i][j] = null;
                    ghostTile.DOMTile.style.left = this.tiles[i][j - 1].x * 100 + 'px';
                    setTimeout(() => {
                        ghostTile.DOMTile.remove();
                    }, this.speed);
                }
            }
        }
    }
    _slideDown(i, j) {
        if (this.tiles[i + 1] !== undefined) {
            if (this.tiles[i + 1][j] === null) {
                this.canCreateTile = true;
                this.tiles[i + 1][j] = this.tiles[i][j];
                this.tiles[i + 1][j].y++;
                this.tiles[i + 1][j].DOMTile.style.top = this.tiles[i + 1][j].y * 100 + 'px';
                this.tiles[i][j] = null;
                this._slideDown(i + 1, j);
            } else if (this.tiles[i + 1][j] instanceof Tile) {
                if (this.tiles[i][j].value === this.tiles[i + 1][j].value && !this.tiles[i + 1][j].locked) {
                    this.canCreateTile = true;
                    this.tiles[i + 1][j].value += this.tiles[i][j].value;
                    this.tiles[i + 1][j].DOMTile.innerText = this.tiles[i + 1][j].value;
                    this.tiles[i + 1][j].locked = true;
                    this.tiles[i][j].DOMTile.style.zIndex = 0;
                    const ghostTile = Object.assign({}, this.tiles[i][j]);
                    this.tiles[i][j] = null;
                    ghostTile.DOMTile.style.top = this.tiles[i + 1][j].y * 100 + 'px';
                    setTimeout(() => {
                        ghostTile.DOMTile.remove();
                    }, this.speed);
                }
            }
        }
    }
    _slideRight(i, j) {
        if (this.tiles[i][j + 1] !== undefined) {
            if (this.tiles[i][j + 1] === null) {
                this.canCreateTile = true;
                this.tiles[i][j + 1] = this.tiles[i][j];
                this.tiles[i][j + 1].x++;
                this.tiles[i][j + 1].DOMTile.style.left = this.tiles[i][j + 1].x * 100 + 'px';
                this.tiles[i][j] = null;
                this._slideRight(i, j + 1);
            } else if (this.tiles[i][j + 1] instanceof Tile) {
                if (this.tiles[i][j].value === this.tiles[i][j + 1].value && !this.tiles[i][j + 1].locked) {
                    this.canCreateTile = true;
                    this.tiles[i][j + 1].value += this.tiles[i][j].value;
                    this.tiles[i][j + 1].DOMTile.innerText = this.tiles[i][j + 1].value;
                    this.tiles[i][j + 1].locked = true;
                    this.tiles[i][j].DOMTile.style.zIndex = 0;
                    const ghostTile = Object.assign({}, this.tiles[i][j]);
                    this.tiles[i][j] = null;
                    ghostTile.DOMTile.style.left = this.tiles[i][j + 1].x * 100 + 'px';
                    setTimeout(() => {
                        ghostTile.DOMTile.remove();
                    }, this.speed);
                }
            }
        }
    }
    _createArray() {
        this.tiles = new Array(this.gridDimension);
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = new Array(this.tiles.length);
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j] = null;
            }
        }
    }
    _createDOMGrid() {
        const DIV = document.createElement('div');
              DIV.classList.add('grid');
              DIV.style.width = this.gridDimension * 100 + 'px';
              DIV.style.height = this.gridDimension * 100 + 'px';
        document.body.appendChild(DIV);
        this.DOMGrid = DIV;
        return this;
    }
    _findEmptyCell() {
        let x = Math.round(Math.random() * (this.gridDimension - 1));
        let y = Math.round(Math.random() * (this.gridDimension - 1));

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] !== null && this.tiles[i][j].x === x && this.tiles[i][j].y === y) {
                    return this._findEmptyCell();
                }
            }
        }

        return {x, y};
    }
    _unlockTiles() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] !== null) {
                    this.tiles[i][j].locked = false;
                }
            }
        }
    }
}
class Tile {
    constructor(x, y, speed, value) {
        this.x = x;
        this.y = y;
        this.value = value === undefined ? null : value;
        this.locked = false;
        this.DOMTile = null;
        this.speed = speed;
        this.onInit();
    }
    onInit() {
        this._generateValue();
        this._createDOMTile();
    }
    _generateValue() {
        if (this.value === null) {
            this.value = Math.round(Math.random() * 9) === 0 ? 4 : 2;
        }
    }
    _createDOMTile() {
        const DIV = document.createElement('div');
              DIV.style.left = (this.x * 100) + 'px';
              DIV.style.top = (this.y * 100) + 'px';
              DIV.classList.add('tile');
              DIV.innerText = this.value;
              DIV.style.transitionDuration = `${this.speed}ms`;
        document.getElementsByClassName('grid')[0].appendChild(DIV);
        this.DOMTile = DIV;
        return this;
    }

    static getColor(value) {}
}

const gameController = new GameController(4, 150);
