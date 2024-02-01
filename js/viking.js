 function animateCharacter() {

     // FPS control
     var fps, fpsInterval, startTime, now, then, elapsed;

     // Get a reference to the canvas and context
     var canvas = $('#viking');
     var context = canvas.get(0).getContext('2d');

     // The spacing between sprites
     var spriteSpacing = 2; // 1px spacing between sprites

     // Load the sprite sheet
     var spriteSheet = new Image();
     spriteSheet.src = 'img/viking.png'; // Update with the path to your sprite sheet

     // The number of sprites per row and column
     var spritesPerRow = 5;

     // The width and height of each sprite
     //var spriteWidth = 720 / 6 - spriteSpacing; // Replace with the actual width of your sprite
     //var spriteHeight = 478 / 4 - spriteSpacing; // Replace with the actual height of your sprite
     var spriteWidth = 1032 / spritesPerRow - spriteSpacing; // Replace with the actual width of your sprite
     var spriteHeight = 460 / 2 - spriteSpacing; // Replace with the actual height of your sprite

     var startingPosY = 450

     const JUMP_HEIGHT = 200
     const JUMP_SPEED = 20
     const WALK_HEIGHT = 40; // how much height difference it can walk up
     const BOTTOM_POS = 575;

     // Define the range of sprites to cycle through
     var startSpriteIndex = 0; // Index of the first sprite in the cycle
     var endSpriteIndex = 9; // Index of the last sprite in the cycle (one less than the total number of sprites if cycling through all)


     // Variables for the JUMP movement
     var jumpingInProgress = false;
     var time = 0;
     var fullCycle = Math.PI; // Complete cycle in radians
     var isMovingLeft = false;

     // Starting sprite index
     var currentSprite = startSpriteIndex;


     // Set canvas size for a single sprite
     canvas.attr('width', spriteWidth);
     canvas.attr('height', spriteHeight);
     canvas.css('top', startingPosY + 'px');

     // Set the canvas background to transparent
     context.clearRect(0, 0, canvas.width, canvas.height);


     function moveLeft() {
         startSpriteIndex = 10 //6;
         currentSprite = endSpriteIndex = 19 //11
         isMovingLeft = true
     }

     function moveRight() {
         currentSprite = startSpriteIndex = 0 //12;
         endSpriteIndex = 9 //17
         isMovingLeft = false
     }

     function stop() {
         currentSprite = endSpriteIndex = startSpriteIndex;
     }

     function setX(deltaX) {
         let posX = parseInt(canvas.css('left'))
         canvas.css('left', (posX + deltaX) + 'px');
     }

     function canMove(moveLeft) {
         if (currentPosY == platformPosY) return true; // on a platform can move freely
         if (currentPosY > platformPosY + WALK_HEIGHT) {
             if (isMovingLeft && moveLeft) return false;
             if (!isMovingLeft && !moveLeft) return false;
         }
         return true
     }

     // Update the frame - called every frame of the animation
     function updateFrame(platformPosY) {
         //sprintPos = platformPosY;
         now = Date.now();
         elapsed = now - then;

         doJump(platformPosY)
         redrawSprinte()

     }

     var fallingTime = null; // Initialize outside the function
     var currentPosY = startingPosY;
     var fallingToBottom = false;

     function doJump(platformPosY) {
         if (fallingToBottom) platformPosY = BOTTOM_POS;

         if (jumpingInProgress && (elapsed > fpsInterval / 2)) {
             let falling = (time >= fullCycle / 2);
             let jumpPeak = startingPosY - JUMP_HEIGHT

             time += 0.1;

             // Rising and falling phase - use sinusoidal function
             if (time < fullCycle) {
                 currentPosY = startingPosY - JUMP_HEIGHT * Math.sin(Math.PI * time / fullCycle);
             } else {
                 // Falling phase - linear descent
                 if (fallingTime === null) {
                     fallingTime = time; // Capture the time when the sprite starts falling
                 }
                 currentPosY += JUMP_SPEED;
             }

             // Check if landed on the platform
             if (falling && (((currentPosY >= platformPosY) && (jumpPeak <= platformPosY)) || (currentPosY >= BOTTOM_POS))) {
                 //console.log("Landed", (currentPosY >= platformPosY), (jumpPeak <= platformPosY), (currentPosY >= startingPosY), "JPK=", jumpPeak, "PPY", platformPosY, "CPY", currentPosY, "SPY", startingPosY, "FALLING", falling)
                 if (jumpPeak <= platformPosY) currentPosY = platformPosY; // Land on the platform
                 jumpingInProgress = false; // Stop jumping
                 fallingToBottom = false
                 startingPosY = currentPosY; // Update the starting position
                 fallingTime = null; // Reset the falling time
                 time = 0;
             }

             currentPosY = Math.round(currentPosY)
                 //if ((currentPosY != platformPosY) && (currentPosY != BOTTOM_POS))
                 //    console.log("Time=", time.toFixed(2), "pos=", currentPosY, "platform=", platformPosY, "dif=", currentPosY - parseInt(canvas.css("top")), "cycle", (time <= fullCycle), fallingTime ? time - fallingTime : 0)


             canvas.css('top', currentPosY + 'px');

             // End the jump if the full cycle is completed
             /*
             if ((time >= fullCycle) && (fallingTime == null)) {
                 console.log("Completed")
                 jumpingInProgress = false;
                 time = 0;
                 fallingTime = null;
                 if (jumpPeak <= platformPosY) currentPosY = platformPosY;
                 startingPosY = currentPosY
                 canvas.css('top', startingPosY + 'px'); // Reset to original or platform position
                 fallingToBottom = false;
             }*/

             currentSprite = startSpriteIndex + 8;
         } else if (!jumpingInProgress) {
             if (currentPosY < platformPosY) {
                 //console.log("Slipped")
                 time = fullCycle / 2 + 0.1
                 jumpingInProgress = true
                 startingPosY = currentPosY + JUMP_HEIGHT
             } else if (currentPosY - WALK_HEIGHT < platformPosY) {
                 currentPosY = startingPosY = platformPosY
                 canvas.css('top', currentPosY + 'px');
             } else if (currentPosY < BOTTOM_POS) {
                 // i am under the platform
                 //console.log("Bottom")
                 fallingToBottom = true
                 time = fullCycle / 2 + 0.1
                 jumpingInProgress = true
                 startingPosY = currentPosY + JUMP_HEIGHT
             }
         }
     }


     function redrawSprinte() {

         // if enough time has elapsed, draw the next frame
         if (elapsed > fpsInterval) {

             // Get ready for next frame by setting then=now, but also adjust for your
             // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
             then = now - (elapsed % fpsInterval);
             // Calculate the row and column of the current sprite
             var row = Math.floor(currentSprite / spritesPerRow);
             var col = currentSprite % spritesPerRow;

             // Clear the canvas
             context.clearRect(0, 0, spriteWidth, spriteHeight);

             // Draw the current frame
             context.drawImage(
                 spriteSheet,
                 spriteSpacing + (col * (spriteWidth + spriteSpacing)), // Start clipping x
                 spriteSpacing + (row * (spriteHeight + spriteSpacing)), // Start clipping y
                 spriteWidth - spriteSpacing, spriteHeight - spriteSpacing, // Clipping width and height
                 0, 0, // Canvas x, y to start drawing
                 spriteWidth - spriteSpacing, spriteHeight - spriteSpacing // Canvas width and height to draw the image
             );

             if (!jumpingInProgress) currentSprite++;
             if (currentSprite > endSpriteIndex) {
                 currentSprite = startSpriteIndex;
             }
         }


     }

     function startAnimating(fps) {
         fpsInterval = 1000 / fps;
         then = Date.now();
         startTime = then;
         console.log("Viking animation started")

     }

     startAnimating(20)
     stop()


     return {

         updateFrame: updateFrame,

         height: () => spriteHeight - 15,
         width: () => spriteWidth - (isMovingLeft ? -30 : 20),
         positionY: () => currentPosY,
         positionX: () => parseInt(canvas.css('left')),
         setX: setX,

         moveLeft: moveLeft,
         moveRight: moveRight,
         stop: stop,
         setJumpInProgress: (inProgress) => {
             jumpingInProgress = inProgress
         },
         jumpInProgress: () => jumpingInProgress,

         alignY: (platformPosY) => {
             currentPosY = startingPosY = platformPosY
             canvas.css('top', currentPosY + 'px');
         }
     }

 }