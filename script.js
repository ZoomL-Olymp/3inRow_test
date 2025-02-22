let canvas, ctx, assets, gridObj, tileSize, padding, selectedScale; // global variables

class Tile {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.isLocked = false;
        this.isSelected = false;
        this.isMatched = false;
        this.alpha = 1;
        this.yOffset = 0; // For the drop animation
    }

    destroy() {
        this.type = null;
        this.alpha = 1; // Reset alpha for new tiles
        this.yOffset = 0; // Reset yOffset
        console.log("info: tile destroyed");
    }
}

class Grid {
    constructor(gridWidth, gridHeight, tileTypes, tileColors) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileTypes = tileTypes;
        this.tileColors = tileColors;
        this.grid = [];
        this.initializeGrid();
        this.isAnimating = false;
        this.animationProgress = 0;
        this.animationStart = { row: null, col: null };
        this.animationEnd = { row: null, col: null };
        this.matchesToRemove = [];
        this.isRemovingMatches = false;
        this.isFilling = false; // Flag to track fill animation state
    }

    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                this.grid[row][col] = this.createRandomTile(row, col);
            }
        }
    }

    createRandomTile(row, col) {
        const tileType = this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
        let tileColor = ((col + row) % 2 == 0) ? "dark" : "light";
        const tile = new Tile(tileType, tileColor);

        // Initial vertical offset for drop animation
        tile.yOffset = -(tileSize + padding) * (row + 1);
        return tile;
    }

    attemptSwap(row1, col1, row2, col2) {
        console.log(`info: attempting swap of ${row1}, ${col1} with ${row2}, ${col2}`);
        if (Math.abs(row1 - row2) + Math.abs(col1 - col2) !== 1) {
            console.log("info: tiles are not adjacent");
            return;
        }
        this.startSwapAnimation(row1, col1, row2, col2);
    }

    startSwapAnimation(row1, col1, row2, col2) {
        if (this.isAnimating || this.isRemovingMatches || this.isFilling) {
            return;
        }

        this.isAnimating = true;
        this.animationProgress = 0;
        this.animationStart = { row: row1, col: col1 };
        this.animationEnd = { row: row2, col: col2 };

        this.animateSwap();
    }

    animateSwap() {
        const animationDuration = 0.2;
        const animationStep = 0.02;

        this.animationProgress += animationStep;

        if (this.animationProgress < 1) {
            requestAnimationFrame(() => this.animateSwap());
        } else {
            this.swapTiles(this.animationStart.row, this.animationStart.col, this.animationEnd.row, this.animationEnd.col);
            this.isAnimating = false;
            this.animationProgress = 0;
            this.animationStart = { row: null, col: null };
            this.animationEnd = { row: null, col: null };
            this.handleMatches();
            draw();
            return;
        }

        draw();
    }

    swapTiles(row1, col1, row2, col2) {
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
    }

    setSelected(row, col, isSelected) {
        this.grid[row][col].isSelected = isSelected;
    }

    findMatches() {
        const matches = [];

        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth - 2; col++) {
                const tile1 = this.grid[row][col];
                const tile2 = this.grid[row][col + 1];
                const tile3 = this.grid[row][col + 2];

                if (tile1 && tile2 && tile3 && tile1.type === tile2.type && tile1.type === tile3.type) {
                    matches.push([
                        { row: row, col: col },
                        { row: row, col: col + 1 },
                        { row: row, col: col + 2 }
                    ]);
                }
            }
        }

        for (let col = 0; col < this.gridWidth; col++) {
            for (let row = 0; row < this.gridHeight - 2; row++) {
                const tile1 = this.grid[row][col];
                const tile2 = this.grid[row + 1][col];
                const tile3 = this.grid[row + 2][col];

                if (tile1 && tile2 && tile3 && tile1.type === tile2.type && tile1.type === tile3.type) {
                    matches.push([
                        { row: row, col: col },
                        { row: row + 1, col: col },
                        { row: row + 2, col: col }
                    ]);
                }
            }
        }

        return matches;
    }

    removeMatches(matches) {
        if (this.isRemovingMatches || this.isAnimating || this.isFilling) return;

        this.matchesToRemove = matches;
        this.matchesToRemove.forEach(match => {
            match.forEach(tile => {
                this.grid[tile.row][tile.col].isMatched = true;
            });
        });
        this.isRemovingMatches = true;
        this.animateMatchRemoval();
    }

    animateMatchRemoval() {
        const animationStep = 0.02;

        if (this.matchesToRemove.length === 0) {
            this.isRemovingMatches = false;
            this.shiftTilesDown();
            this.fillEmptyTiles();
            return;
        }

        let allTilesFaded = true;

        this.matchesToRemove.forEach(match => {
            match.forEach(tile => {
                // Check if the tile is still valid before trying to animate it
                if (this.grid[tile.row][tile.col] && this.grid[tile.row][tile.col].alpha > 0) {
                    this.grid[tile.row][tile.col].alpha -= animationStep;
                    allTilesFaded = false;
                } else {
                    if (this.grid[tile.row][tile.col]) {
                        this.grid[tile.row][tile.col].alpha = 0;
                    }
                }
            });
        });

        if (!allTilesFaded) {
            console.log("Animating match removal");
            requestAnimationFrame(() => this.animateMatchRemoval());
            draw();
        } else {
            console.log("Match removal animation complete");
            this.matchesToRemove.forEach(match => {
                match.forEach(tile => {
                    if (this.grid[tile.row][tile.col]) {
                        this.grid[tile.row][tile.col].destroy();
                        this.grid[tile.row][tile.col] = null; // remove Tile from grid
                    }

                });
            });
            this.matchesToRemove = [];
            this.isRemovingMatches = false;
            this.shiftTilesDown();
            this.fillEmptyTiles();
        }
    }


    shiftTilesDown() {
        for (let col = 0; col < this.gridWidth; col++) {
            let emptyRows = [];
            for (let row = this.gridHeight - 1; row >= 0; row--) {
                if (!this.grid[row][col] || this.grid[row][col].type === null) {
                    emptyRows.push(row);
                } else if (emptyRows.length > 0) {
                    const bottomEmptyRow = emptyRows.shift();
                    this.grid[bottomEmptyRow][col] = this.grid[row][col];
                    this.grid[row][col] = null; // Set it to null
                    emptyRows.push(row);
                }
            }
        }
    }

     fillEmptyTiles() {
        if (this.isFilling || this.isAnimating || this.isRemovingMatches) return;
        this.isFilling = true;

        // Create the new tiles with their initial yOffset values
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (!this.grid[row][col] || this.grid[row][col] === null) {
                    this.grid[row][col] = this.createRandomTile(row, col);
                }
            }
        }

        this.animateTileDrop();
    }

    animateTileDrop() {
        let allTilesLanded = true;
        const dropSpeed = 10; // Adjust this value to control the drop speed

        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid[row][col];

                if (tile && tile.yOffset < 0) {
                    tile.yOffset += dropSpeed;
                    if (tile.yOffset >= 0) {
                        tile.yOffset = 0;  // Ensure the tile doesn't overshoot
                    }
                    allTilesLanded = false;
                }
            }
        }

        if (!allTilesLanded) {
            requestAnimationFrame(() => this.animateTileDrop());
            draw();
        } else {
            this.isFilling = false;
            this.handleMatches();
            draw();
        }
    }

    handleMatches() {
        if (this.isAnimating || this.isRemovingMatches || this.isFilling) return; // Add this line

        let matches;
        do {
            matches = this.findMatches();
            if (matches.length > 0) {
                this.removeMatches(matches);
                return;
            }
        } while (matches.length > 0);
    }

    draw(ctx, assets, tileSize, padding, selectedScale) {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid[row][col];

                if (tile && tile.type) {
                    const tileType = tile.type;
                    const tileColor = tile.color;
                    const isSelected = tile.isSelected;

                    const tileImageKey = `tile_${tileColor}_${tileType.toLowerCase()}`;
                    const tileImage = assets[tileImageKey];

                    let x = col * (tileSize + padding);
                    let y = row * (tileSize + padding) + tile.yOffset;  // Apply yOffset here
                    let width = tileSize;
                    let height = tileSize;

                    if (isSelected) {
                        width *= selectedScale;
                        height *= selectedScale;
                        x -= (width - tileSize) / 2;
                        y -= (height - tileSize) / 2;
                    }

                    if (this.isAnimating) {
                        const startRow = this.animationStart.row;
                        const startCol = this.animationStart.col;
                        const endRow = this.animationEnd.row;
                        const endCol = this.animationEnd.col;

                        if (row === startRow && col === startCol) {
                            const distanceX = (endCol - startCol) * (tileSize + padding);
                            const distanceY = (endRow - startRow) * (tileSize + padding);

                            const animatedX = x + distanceX * this.animationProgress;
                            const animatedY = y + distanceY * this.animationProgress;

                            ctx.drawImage(tileImage, animatedX, animatedY, width, height);
                            continue;
                        }

                        if (row === endRow && col === endCol) {
                            const distanceX = (startCol - endCol) * (tileSize + padding);
                            const distanceY = (startRow - endRow) * (tileSize + padding);

                            const animatedX = x + distanceX * this.animationProgress;
                            const animatedY = y + distanceY * this.animationProgress;

                            ctx.drawImage(tileImage, animatedX, animatedY, width, height);
                            continue;
                        }
                    }

                    // Set alpha for fading effect
                    ctx.globalAlpha = tile.alpha;

                    ctx.drawImage(tileImage, x, y, width, height);

                    // Reset alpha to 1 for other drawings
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gridObj.draw(ctx, assets, tileSize, padding, selectedScale);
}

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    assets = {};

    const gridWidth = 4;
    const gridHeight = 5;
    tileSize = 90;
    padding = 5;
    const tileTypes = ["Strawberry", "Avocado", "Lemon"];
    const tileColors = 2;
    selectedScale = 1.1;

    function loadAssets(callback) {
        let imagesLoaded = 0;
        const totalImages = tileTypes.length * tileColors + tileColors;

        function imageLoaded() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                callback();
            }
        }

        assets.tile_dark = new Image();
        assets.tile_dark.src = 'assets/tile_dark.png';
        assets.tile_dark.onload = imageLoaded;

        assets.tile_dark_strawberry = new Image();
        assets.tile_dark_strawberry.src = 'assets/tile_dark_strawberry.png';
        assets.tile_dark_strawberry.onload = imageLoaded;

        assets.tile_dark_avocado = new Image();
        assets.tile_dark_avocado.src = 'assets/tile_dark_avocado.png';
        assets.tile_dark_avocado.onload = imageLoaded;

        assets.tile_dark_lemon = new Image();
        assets.tile_dark_lemon.src = 'assets/tile_dark_lemon.png';
        assets.tile_dark_lemon.onload = imageLoaded;

        assets.tile_light = new Image();
        assets.tile_light.src = 'assets/tile_light.png';
        assets.tile_light.onload = imageLoaded;

        assets.tile_light_strawberry = new Image();
        assets.tile_light_strawberry.src = 'assets/tile_light_strawberry.png';
        assets.tile_light_strawberry.onload = imageLoaded;

        assets.tile_light_avocado = new Image();
        assets.tile_light_avocado.src = 'assets/tile_light_avocado.png';
        assets.tile_light_avocado.onload = imageLoaded;

        assets.tile_light_lemon = new Image();
        assets.tile_light_lemon.src = 'assets/tile_light_lemon.png';
        assets.tile_light_lemon.onload = imageLoaded;
    }

    loadAssets(function() {
        console.log("info: assets loaded");
        gridObj = new Grid(gridWidth, gridHeight, tileTypes, tileColors);
        gridObj.handleMatches();
        draw();
    });

    let selectedTile = null;

    canvas.addEventListener('mousedown', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / (tileSize + padding));
        const row = Math.floor(y / (tileSize + padding));

        if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
            handleTileClick(row, col);
        }
    });

    function handleTileClick(row, col) {
        if (gridObj.isAnimating || gridObj.isRemovingMatches || gridObj.isFilling) return;

        if (selectedTile === null) {
            selectedTile = { row: row, col: col };
            gridObj.setSelected(row, col, true);
            console.log(`info: first tile selected at ${row}, ${col}`);
            draw();
        } else {
            const firstTile = selectedTile;
            gridObj.setSelected(firstTile.row, firstTile.col, false);
            selectedTile = null;
            gridObj.attemptSwap(firstTile.row, firstTile.col, row, col);
            draw();
        }
    }
};