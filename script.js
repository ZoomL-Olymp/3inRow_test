class Tile {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.isLocked = false;
        this.isSelected = false;
    }

    destroy() {
        console.log("info: tile destroyed");
    }
}

class Grid {
    constructor(gridWidth, gridHeight, tileTypes, tileColors) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileTypes = tileTypes;
        this.tileColor = tileColors;
        this.grid = [];
        this.initializeGrid();
    }

    initializeGrid() {
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
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

    draw(ctx, assets, tileSize, padding, selectedScale) {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid[row][col];
                const tileType = tile.type;
                const tileColor = tile.color;
                const isSelected = tile.isSelected;

                const tileImageKey = `tile_${tileColor}_${tileType.toLowerCase()}`;
                const tileImage = assets[tileImageKey];

                let x = col * (tileSize + padding);
                let y = row * (tileSize + padding);
                let width = tileSize;
                let height = tileSize;

                if (isSelected) {
                    width *= selectedScale;
                    height *= selectedScale;
                    x -= (width - tileSize) / 2;
                    y -= (height - tileSize) / 2; // Center the tile
                }

                ctx.drawImage(tileImage, x, y, width, height);
            }
        }
    }

    attemptSwap(row1, col1, row2, col2) {
        console.log(`info: attempting swap of ${row1}, ${col1} with ${row2}, ${col2}`);
        if (Math.abs(row1 - row2) + Math.abs(col1 - col2) !== 1) {
            console.log("info: tiles are not adjacent");
            return;
        }

        this.swapTiles(row1, col1, row2, col2);
    }

    swapTiles(row1, col1, row2, col2) {
        const type1 = this.grid[row1][col1].type;
        const type2 = this.grid[row2][col2].type;

        this.grid[row1][col1].type = type2;
        this.grid[row2][col2].type = type1;
    }

    setSelected(row, col, isSelected) {
        this.grid[row][col].isSelected = isSelected;
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
    const selectedScale = 1.1; // Масштаб увеличения при выделении

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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gridObj.draw(ctx, assets, tileSize, padding, selectedScale); // Передаем selectedScale в draw
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
            gridObj.setSelected(row, col, true); // Устанавливаем isSelected = true
            console.log(`info: first tile selected at ${row}, ${col}`);
            draw();
        } else {
            // Second tile selected - attempt to swap
            const firstTile = selectedTile;
            gridObj.setSelected(firstTile.row, firstTile.col, false); // Убираем выделение с первого тайла
            selectedTile = null;
            gridObj.attemptSwap(firstTile.row, firstTile.col, row, col);
            draw();
        }
    }
};