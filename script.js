window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const assets = {};

    function loadAssets(callback) {
        let imagesLoaded = 0;
        const totalImages = 6;

        function imageLoaded() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                callback(); // Check if all images are loaded
            }
        }

        // Loading assets

        assets.background = new Image();
        assets.background.src = 'assets/fon.png';
        assets.background.onload = imageLoaded;

        assets.avocado = new Image();
        assets.avocado.src = 'assets/avokado.png';
        assets.avocado.onload = imageLoaded;

        assets.strawberry = new Image();
        assets.strawberry.src = 'assets/klubnika-svet.png';
        assets.strawberry.onload = imageLoaded;

        assets.lemon = new Image();
        assets.lemon.src = 'assets/limon.png';
        assets.lemon.onload = imageLoaded;

        assets.mascot1 = new Image();
        assets.mascot1.src = 'assets/mascot01.png';
        assets.mascot1.onload = imageLoaded;

        assets.mascot2 = new Image();
        assets.mascot2.src = 'assets/mascot2.png';
        assets.mascot2.onload = imageLoaded;

        assets.tile_dark = new Image();
        assets.tile_dark.src = 'assets/tile_dark.png';
        assets.tile_dark.onload = imageLoaded;

        assets.tile_light = new Image();
        assets.tile_light.src = 'assets/tile_light.png';
        assets.tile_light.onload = imageLoaded;
    }

    loadAssets(function() {
        console.log("info: assets loaded");
        drawGrid(); // Call the function to draw the grid
    });

    function drawGrid() {
        const gridWidth = 4;
        const gridHeight = 5;
        const tileSize = 90; // size in px
        const padding = 5; // padding in px

        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                tileImage = new Image();
                if ((row + col) % 2 == 0) {
                    tileImage = assets[`tile_light`];
                } else {
                    tileImage = assets[`tile_dark`];
                }

                const x = col * (tileSize + padding);
                const y = row * (tileSize + padding);

                ctx.drawImage(tileImage, x, y, tileSize, tileSize);
            }
        }
}
};