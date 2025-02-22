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
    }

    loadAssets(function() {
        console.log("info: assets loaded");
        drawGrid(); // Call the function to draw the grid
    });

    function drawGrid() {
        // placeholder square
        ctx.fillStyle = 'red';
        ctx.fillRect(10, 10, 50, 50);
    }
};