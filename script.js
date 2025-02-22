let canvas, ctx, assets, gridObj, tileSize, padding, selectedScale; // global variables

/**
 * Represents a single tile in the game grid.
 */
class Tile {
    /**
     * @param {string} type The type of the tile (e.g., "Strawberry", "Avocado").
     * @param {string} color The color of the tile (e.g., "dark", "light").
     */
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.isSelected = false;
        this.isMatched = false;
        this.alpha = 1; // Opacity, used for fade-out animation
        this.yOffset = 0; // For the drop animation, how far the tile is from its intended spot
    }

    /**
     * Resets the tile's properties when it's destroyed or removed.
     */
    destroy() {
        this.type = null; // Set type to null, effectively destroying the tile
        this.alpha = 1; // Reset alpha for new tiles
        this.yOffset = 0; // Reset yOffset
        this.isMatched = false;
        console.log("info: tile destroyed");
    }
}

/**
 * Represents the game grid and its logic.
 */
class Grid {
    /**
     * @param {number} gridWidth The width of the grid in tiles.
     * @param {number} gridHeight The height of the grid in tiles.
     * @param {string[]} tileTypes An array of possible tile types.
     * @param {number} tileColors Number of tile colors. In reality a boolean would be better.
     */
    constructor(gridWidth, gridHeight, tileTypes, tileColors) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileTypes = tileTypes;
        this.tileColors = tileColors;
        this.grid = []; // 2D array representing the grid of tiles
        this.initializeGrid();
        this.isAnimating = false; // Flag to prevent multiple animations running simultaneously
        this.animationProgress = 0; // Progress of the swap animation (0 to 1)
        this.animationStart = { row: null, col: null }; // Starting position of the swap animation
        this.animationEnd = { row: null, col: null }; // Ending position of the swap animation
        this.matchesToRemove = []; // Array to store matches found for removal
        this.isRemovingMatches = false; // Flag to prevent match removal logic from interfering with other processes.
        this.isFilling = false; // Flag to track fill animation state
    }

    /**
     * Initializes the grid with random tiles.
     */
    initializeGrid() {
        console.log("info: initializing grid");
        this.grid = [];
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                this.grid[row][col] = this.createRandomTile(row, col);
            }
        }
        console.log("info: grid initialized");
    }

    /**
     * Creates a random tile for the given row and column.
     * @param {number} row The row of the tile.
     * @param {number} col The column of the tile.
     * @returns {Tile} The newly created tile.
     */
    createRandomTile(row, col) {
        const tileType = this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
        let tileColor = ((col + row) % 2 == 0) ? "dark" : "light"; // alternating tile colors
        const tile = new Tile(tileType, tileColor);

        // Initial vertical offset for drop animation
        tile.yOffset = -(tileSize + padding) * (row + 1);
        return tile;
    }

    /**
     * Attempts to swap two adjacent tiles.
     * @param {number} row1 The row of the first tile.
     * @param {number} col1 The column of the first tile.
     * @param {number} row2 The row of the second tile.
     * @param {number} col2 The column of the second tile.
     */
    attemptSwap(row1, col1, row2, col2) {
        console.log(`info: attempting swap of ${row1}, ${col1} with ${row2}, ${col2}`);
        if (Math.abs(row1 - row2) + Math.abs(col1 - col2) !== 1) {
            console.log("info: tiles are not adjacent");
            return;
        }

        // Check if the swap will create a match
        if (!this.isSwapValid(row1, col1, row2, col2)) {
            console.log("info: swap does not create a match");
            return;
        }

        this.startSwapAnimation(row1, col1, row2, col2);
    }

    /**
     * Checks if the swap will result in a match.
     * @param {number} row1 The row of the first tile.
     * @param {number} col1 The column of the first tile.
     * @param {number} row2 The row of the second tile.
     * @param {number} col2 The column of the second tile.
     * @returns {boolean} True if the swap is valid (creates a match), false otherwise.
     */
    isSwapValid(row1, col1, row2, col2) {
        // Temporarily swap the tiles
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;

        // Check for matches around both swapped tiles
        const match1 = this.hasMatchAt(row1, col1);
        const match2 = this.hasMatchAt(row2, col2);

        // Swap the tiles back to their original positions
        const temp2 = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp2;

        return match1 || match2;
    }

    /**
     * Checks if there is a match at the given tile.
     * @param {number} row The row of the tile.
     * @param {number} col The column of the tile.
     * @returns {boolean} True if there is a match, false otherwise.
     */
    hasMatchAt(row, col) {
        const tile = this.grid[row][col];
        if (!tile) return false;

        const type = tile.type;

        // Check horizontal matches
        let horizontalMatch = 1;
        let i = col - 1;
        while (i >= 0 && this.grid[row][i] && this.grid[row][i].type === type) {
            horizontalMatch++;
            i--;
        }
        i = col + 1;
        while (i < this.gridWidth && this.grid[row][i] && this.grid[row][i].type === type) {
            horizontalMatch++;
            i++;
        }
        if (horizontalMatch >= 3) return true;

        // Check vertical matches
        let verticalMatch = 1;
        i = row - 1;
        while (i >= 0 && this.grid[i][col] && this.grid[i][col].type === type) {
            verticalMatch++;
            i--;
        }
        i = row + 1;
        while (i < this.gridHeight && this.grid[i][col] && this.grid[i][col].type === type) {
            verticalMatch++;
            i++;
        }
        return verticalMatch >= 3;
    }



    /**
     * Starts the swap animation between two tiles.
     * @param {number} row1 The row of the first tile.
     * @param {number} col1 The column of the first tile.
     * @param {number} row2 The row of the second tile.
     * @param {number} col2 The column of the second tile.
     */
    startSwapAnimation(row1, col1, row2, col2) {
        if (this.isAnimating || this.isRemovingMatches || this.isFilling) {
            console.log("info: a process is already in motion.");
            return;
        }

        this.isAnimating = true;
        this.animationProgress = 0;
        this.animationStart = { row: row1, col: col1 };
        this.animationEnd = { row: row2, col: col2 };

        this.animateSwap();
    }

    /**
     * Animates the swap between two tiles.
     */
    animateSwap() {
        const animationDuration = 0.2; // Not actually used
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

    /**
     * Swaps two tiles in the grid.
     * @param {number} row1 The row of the first tile.
     * @param {number} col1 The column of the first tile.
     * @param {number} row2 The row of the second tile.
     * @param {number} col2 The column of the second tile.
     */
    swapTiles(row1, col1, row2, col2) {
        console.log(`info: swapping tiles at ${row1}, ${col1} and ${row2}, ${col2}`);
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
        console.log(`info: tiles swapped`);
    }

    /**
     * Sets the selected state of a tile.
     * @param {number} row The row of the tile.
     * @param {number} col The column of the tile.
     * @param {boolean} isSelected Whether the tile is selected.
     */
    setSelected(row, col, isSelected) {
        this.grid[row][col].isSelected = isSelected;
    }

    /**
     * Finds all matches of three or more tiles of the same type.
     * @returns {Array<Array<{row: number, col: number}>>} An array of matches, where each match is an array of tile coordinates.
     */
    findMatches() {
        const matches = [];

        // Check for horizontal matches
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
                     col+=2;
                     continue;
                }
            }
        }

        // Check for vertical matches
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
                    row+=2;
                    continue;
                }
            }
        }

        console.log(`info: found ${matches.length} matches`);
        return matches;
    }

    /**
     * Removes the given matches from the grid.
     * @param {Array<Array<{row: number, col: number}>>} matches An array of matches to remove.
     */
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

    /**
     * Animates the removal of matched tiles by fading them out.
     */
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
            console.log("info: animating match removal");
            requestAnimationFrame(() => this.animateMatchRemoval());
            draw();
        } else {
            console.log("info: match removal animation complete");
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


    /**
     * Shifts tiles down to fill any empty spaces created by removed matches.
     */
    shiftTilesDown() {
        console.log("info: shifting tiles down");
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
        console.log("info: tiles shifted");
    }

     /**
     * Fills empty tiles in the grid with new random tiles, initiating the drop animation.
     */
    fillEmptyTiles() {
        if (this.isFilling || this.isAnimating || this.isRemovingMatches) return;
        this.isFilling = true;
        console.log("info: filling empty tiles");

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

    /**
     * Animates the dropping of new tiles into the grid.
     */
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
            console.log("info: tiles filled");
        }
    }

    /**
     * Handles the process of finding and removing matches in the grid.  Loops until no more matches are found.
     */
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

    /**
     * Draws the grid and its tiles on the canvas.
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context of the canvas.
     * @param {Object<string, HTMLImageElement>} assets An object containing the loaded image assets.
     * @param {number} tileSize The size of each tile.
     * @param {number} padding The padding between tiles.
     * @param {number} selectedScale The scale factor for selected tiles.
     */
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

/**
 * Clears the canvas and redraws the grid.
 */
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

    /**
     * Loads the image assets for the game.
     * @param {function} callback A function to call when all assets are loaded.
     */
    function loadAssets(callback) {
        let imagesLoaded = 0;
        const totalImages = tileTypes.length * tileColors + tileColors;

        /**
         * Called when an image has loaded.  Checks if all images are loaded.
         */
        function imageLoaded() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                callback();
            }
        }

        // Load all tile images
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

    // Load assets and then start the game
    loadAssets(function() {
        console.log("info: assets loaded");
        gridObj = new Grid(gridWidth, gridHeight, tileTypes, tileColors);
        gridObj.handleMatches();
        draw();
    });

    let selectedTile = null;

    /**
     * Handles the click event on the canvas.
     * @param {MouseEvent} event The mouse event.
     */
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

    /**
     * Handles a click on a tile.
     * @param {number} row The row of the clicked tile.
     * @param {number} col The column of the clicked tile.
     */
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