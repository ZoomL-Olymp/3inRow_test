# Match 3 Game

## Overview

This is a simple Match 3 game implemented using HTML, CSS, and JavaScript.  The goal of the game is to swap adjacent tiles to create horizontal or vertical matches of three or more tiles of the same type.  Matched tiles are removed, and new tiles fall from the top to fill the empty spaces.

[game_screenshot.png]

## Features

*   **Classic Match 3 Gameplay:** Swap adjacent tiles to create matches.
*   **Multiple Tile Types:** Features [Number] different tile types: Strawberry, Avocado, and Lemon.
*   **Animated Tile Swapping:** Smooth animations for tile swaps, match removal, and tile drops.
*   **Match Detection:** Automatically detects matches and removes them from the grid.
*   **Tile Shifting and Filling:**  Tiles shift down to fill empty spaces, and new tiles are generated to refill the grid.
*   **Invalid Swap Indication:**  Tiles shake briefly when an invalid swap (one that doesn't create a match) is attempted.
*   **UI Elements:** Includes UI elements for settings and hints (currently non-functional - see "Future Enhancements").

## Technologies Used

*   **HTML:**  For structuring the game's layout and elements.
*   **CSS:**  For styling the game's appearance.
*   **JavaScript:** For implementing the game logic, animations, and user interaction.

## How to Play

1.  Open the `index.html` file in your web browser.
2.  Click on a tile to select it.
3.  Click on an adjacent tile to attempt a swap.
4.  If the swap creates a match of three or more tiles, the match will be removed, and new tiles will fall into place.
5.  Continue swapping tiles and creating matches until you get bored.

## Game Logic

The game's logic is primarily handled within the `script.js` file. Key classes and functions include:

*   **`Tile` Class:** Represents a single tile on the game grid.  Stores tile type, color, selection state, and animation properties.
*   **`Grid` Class:** Represents the game grid and manages tile creation, swapping, match detection, and removal.
    *   `initializeGrid()`: Creates the initial game grid with random tiles.
    *   `attemptSwap(row1, col1, row2, col2)`: Attempts to swap two tiles and initiates the swap animation if valid.
    *   `isSwapValid(row1, col1, row2, col2)`: Checks if a potential swap will result in a match.
    *   `findMatches()`: Detects horizontal and vertical matches of three or more tiles.
    *   `removeMatches(matches)`: Removes matched tiles from the grid and initiates the removal animation.
    *   `shiftTilesDown()`: Shifts tiles down to fill empty spaces.
    *   `fillEmptyTiles()`: Creates new tiles to fill empty spaces and initiates the drop animation.
    *   `handleMatches()`: Orchestrates the process of finding and removing matches.
    *   `draw(ctx, assets, tileSize, padding, selectedScale)`: Draws the grid and tiles on the canvas.
*   **`draw()` Function:** Clears the canvas and redraws the game grid, centering it on the screen.
*   **`handleTileClick(row, col)` Function:** Handles click events on the game grid, managing tile selection and swap attempts.

## Assets

The game uses the following image assets, located in the `assets/` directory:

*   `background.png`: The background image for the game.
*   `status.png`:  The image displayed in the header.
*   `progress.png`: The image used for the progress bar.
*   `mascot_left.png`, `mascot_right.png`: Images of the mascots on either side of the level counter.
*   `level.png`: The image for the level counter.
*   `tile_dark.png`, `tile_light.png`: Base images for the dark and light tiles.
*   `tile_dark_strawberry.png`, `tile_dark_avocado.png`, `tile_dark_lemon.png`: Images for dark tiles with different fruit types.
*   `tile_light_strawberry.png`, `tile_light_avocado.png`, `tile_light_lemon.png`: Images for light tiles with different fruit types.
*   `settings_icon.png`: Icon for the settings button.
*   `hint_icon.png`: Icon for the hint button.

## Installation

1.  Clone the repository:
    ```bash
    git clone [Your Repository URL]
    ```
2.  Navigate to the project directory:
    ```bash
    cd [Your Project Directory]
    ```
3.  Open `index.html` in your web browser.

## Future Enhancements

*   **Scoring System:** Implement a scoring system to track the player's progress.
*   **Level System:** Add multiple levels with increasing difficulty.
*   **Sound Effects:** Integrate sound effects for tile swaps, match removal, and other game events.
*   **Settings Menu:** Implement functionality for the settings button (e.g., volume control, difficulty settings).
*   **Hint System:** Implement functionality for the hint button.
*   **More Tile Types:** Add more variety to the gameplay by including additional tile types.
*   **Power-ups:** Introduce power-ups that can help the player clear tiles or achieve specific goals.
*   **Mobile Optimization:**  Optimize the game for mobile devices.
*   **Progress Bar Functionality:** Link the progress bar to the game level.

## Credits

*   ZoomL — Main Developer
*   KMND Studio — Idea and assets provider
