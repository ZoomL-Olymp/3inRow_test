class Tile {
    constructor(type, color) {
        this.type = type; // "Strawberry", "Avocado", "Lemon"
        this.color = color;
        this.isLocked = false;
    }

    destroy() {
        console.log("info: tile destroyed");
    }
}

class Grid {
    constructor(gridWidth, gridHeight, tileTypes, tileColors) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileTypes = tileTypes; // Array of tile type names (e.g., ["Strawberry", "Avocado", "Lemon"])
        this.tileColor = tileColors // Number of different tile colors
        this.grid = [];
        this.initializeGrid();
    }

    initializeGrid() {
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                // Randomly select a tile type
                const tileType = this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
                let tileColor = new String;
                if ((col + row) % 2 == 0) {
                    tileColor = "dark";
                } else {
                    tileColor = "light";
                }
                this.grid[row][col] = new Tile(tileType, tileColor);
            }
        }
    }

    draw(ctx, assets, tileSize, padding) {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid[row][col];
                const tileType = tile.type;
                const tileColor = tile.color;

                const tileImageKey = `tile_${tileColor}_${tileType.toLowerCase()}`;
                console.log(`info: drawing ${tileImageKey} at ${row}, ${col}`);
                const tileImage = assets[tileImageKey];

                const x = col * (tileSize + padding);
                const y = row * (tileSize + padding);

                ctx.drawImage(tileImage, x, y, tileSize, tileSize);
            }
        }
    }

    attemptSwap(row1, col1, row2, col2) {
        console.log(`info: attempting swap of ${row1}, ${col1} with ${row2}, ${col2}`);
        // Check if the tiles are adjacent
        if (Math.abs(row1 - row2) + Math.abs(col1 - col2) !== 1) {
            console.log("info: tiles are not adjacent");
            return; // Not adjacent
        }

        // Swap the tiles
        this.swapTiles(row1, col1, row2, col2);

        // Check for matches (implement later)
        // If no matches, swap back (implement later)
    }

    swapTiles(row1, col1, row2, col2) {
        // Store the types of the tiles
        const type1 = this.grid[row1][col1].type;
        const type2 = this.grid[row2][col2].type;

        // Swap the types
        this.grid[row1][col1].type = type2;
        this.grid[row2][col2].type = type1;
    }
}


window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const assets = {};
    let gridObj;

    const gridWidth = 4;
    const gridHeight = 5;
    const tileSize = 90;
    const padding = 5;
    const tileTypes = ["Strawberry", "Avocado", "Lemon"];
    const tileColors = 2;

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
        draw();
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        gridObj.draw(ctx, assets, tileSize, padding); // Draw the grid
    }

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
        if (selectedTile === null) {
            // First tile selected
            selectedTile = { row: row, col: col };
            console.log(`info: first tile selected at ${row}, ${col}`);
            draw();
        } else {
            // Second tile selected - attempt to swap
            const firstTile = selectedTile;
            selectedTile = null; // Reset selection
            gridObj.attemptSwap(firstTile.row, firstTile.col, row, col);
            draw();
        }
    }


};