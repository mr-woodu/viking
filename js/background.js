 function animateBackground(viking) {
     const $cloudsLayer = $('#cloudsLayer');
     const $buildingsLayer = $('#buildingsLayer');

     // Define the number of images you have for clouds and buildings
     const numberOfCloudImages = 4;
     const numberOfBuildingImages = 4;
     let layersToInitialize = 2;


     // Lambda functions to generate image paths
     const generateCloudImagePath = (number) => `img/sky${1}.png`;
     const generateBuildingImagePath = (number) => `img/village-4-rbp.png`;

     // Generate arrays of image paths
     const cloudImages = Array.from({ length: numberOfCloudImages }, (_, i) => generateCloudImagePath(i + 1));
     const buildingImages = Array.from({ length: numberOfBuildingImages }, (_, i) => generateBuildingImagePath(i + 1));

     const containerWidth = Math.floor($('#container').width());
     const containerHeight = Math.floor($('#container').height());

     var speed = 0;
     var isKeyPressed = false;
     var isStarting = true;

     function initLayer($layer, images) {
         images.forEach((src, index) => {
             const flipClass = index % 2 === 1 ? 'flip-horizontal' : '';
             $layer.append(`<img src="${src}" class="layer-image ${flipClass}">`);
         });
     }


     initLayer($cloudsLayer, cloudImages);
     initLayer($buildingsLayer, buildingImages);


     const platforms = generatePlatforms(100, 3000); // Assuming container width to be 3000px for generation



     // Function to set initial position of images
     function setInitialImagePositions($layer) {
         const imageWidth = Math.round($layer.find('img').first().width());
         $layer.find('img').each(function(index) {
             $(this).css('left', (index * imageWidth - 1) + 'px');
             console.log("Set initial functions: ", imageWidth + "/" + (index * imageWidth) + 'px')
         });
     }

     // Function to move images and cycle them
     function moveAndCycleImages($layer, layerSpeed) {
         const $images = $layer.find('img');
         const imageWidth = Math.round($images.first().width());
         const totalWidth = imageWidth * $images.length;

         $images.each(function() {
             let positionX = Math.round(parseInt($(this).css('left'), 10) + layerSpeed);

             // Cycle the image when it goes off-screen
             if (positionX < -imageWidth) {
                 positionX += totalWidth;
             } else if (positionX > containerWidth) {
                 positionX -= totalWidth;
             }

             $(this).css('left', positionX + 'px');
         });
     }


     // Function to initialize layers after images are loaded
     function initializeLayers($layer) {
         console.log("Initializing layers...");
         setInitialImagePositions($layer);
         if (--layersToInitialize == 0)
             updateFrame(); // Start the animation loop
     }


     console.log("Waiting for images to load...");
     $([$cloudsLayer, $buildingsLayer]).each(function(index) {

         var layer = $(this)
         $(layer).find(("img:first")).on('load', function() {
             console.log("Window load event fired.");
             initializeLayers(layer);
         });
     })



     function generatePlatforms(numPlatforms, containerWidth) {
         let platforms = [];
         let currentX = 0;
         const minHeight = 100;
         const maxHeightDifference = 200;
         const minWidth = 100;
         const maxWidth = 500;
         const space = 0; // Space between platforms

         let lastY = Math.floor(Math.random() * (500 - minHeight)); // Initial Y position for the first platform

         for (let i = 0; i < numPlatforms; i++) {
             const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
             const x = currentX + space;

             // Generate a new Y position
             let newY = 300 + Math.floor(Math.random() * (500 - minHeight));

             // Adjust newY to ensure the height difference is no more than 200px
             if (Math.abs(newY - lastY) > maxHeightDifference) {
                 newY = lastY + (Math.random() > 0.5 ? 1 : -1) * maxHeightDifference;
                 newY = 300 + Math.max(minHeight, Math.min(500 - minHeight, newY)); // Ensure newY is within bounds
             }

             platforms.push({ x, y: newY, width, height: minHeight, idx: i });
             currentX = x + width;
             lastY = newY; // Update lastY for the next iterationmo
         }

         return platforms;
     }


     function displayPlatforms(platforms, containerWidth, scrollPosition) {
         const $platformLayer = $('#platformLayer');
         $platformLayer.empty(); // Clear previous platforms

         // Filter and display platforms based on current scroll position
         platforms.filter(rect =>
             rect.x >= scrollPosition - containerWidth && rect.x <= scrollPosition + containerWidth
         ).forEach(rect => {
             const $rect = $('<img src="img/platform.png" height="' + rect.height + '">')
                 .addClass('platform')
                 .attr('data-pid', rect.idx)
                 .css({
                     left: Math.floor(rect.x - scrollPosition) + 'px',
                     top: rect.y + 'px',
                     width: rect.width + 'px',
                     height: rect.height + 'px'
                 });
             $platformLayer.append($rect);
         });
     }


     function findPlatformYAtCenter() {
         const centerContainer = containerWidth / 2 + viking.width() / 2
         const center = scrollPosition + centerContainer;
         let closestPlatform = null;

         platforms.forEach(platform => {
             // Calculate the horizontal center position of the platform
             const platformCenterLeft = platform.x - scrollPosition;
             const platformCenterRight = platform.x + platform.width - scrollPosition;

             // Check if the platform's center is within the visible area
             if ((platformCenterLeft < centerContainer) && (platformCenterRight >= centerContainer))
                 closestPlatform = platform;
         });

         if (speed != 0 || isStarting) {
             $(".platform.current").removeClass("current")
             if (closestPlatform)
                 $(".platform[data-pid=" + (closestPlatform.idx) + "]").addClass("current ")
         }
         platformPosY = (closestPlatform ? closestPlatform.y : containerHeight) - viking.height();
         $('#dot').css('top', (platformPosY + viking.height()) + 'px').css('left', centerContainer + 'px')


         return platformPosY
     }




     let scrollPosition = 0;

     function updateFrame() {
         // Slow down gradually when no key is pressed
         if (!isKeyPressed && (speed != 0)) {
             speed *= 0.94;
             console.log("Pausing ...", speed)
             if (Math.abs(speed) < 0.7) {
                 viking.stop()
                 speed = 0; // Stop completely if speed is very low
             }
         }

         if (speed != 0 || isStarting) {
             isStarting = false;
             moveAndCycleImages($cloudsLayer, speed * 0.5, containerWidth);
             moveAndCycleImages($buildingsLayer, speed, containerWidth);

             scrollPosition -= speed * 1.6; // Update scroll position based on speed
             viking.setX(speed * -1.6)
             scrollPosition = Math.round(scrollPosition);
             displayPlatforms(platforms, containerWidth, scrollPosition);
         }

     }


     return {
         updateFrame: updateFrame,
         platformPosY: findPlatformYAtCenter,

         isMoving: () => isKeyPressed,
         setMoving: (moving, newSpeed) => {
             isKeyPressed = moving;
             if (newSpeed) speed = newSpeed
         }
     }


 };