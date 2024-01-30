$(window).on("load", function() {

    let viking = animateCharacter()
    let background = animateBackground(viking)

    viking.alignY(background.platformPosY())

    const INITIAL_SPEED = 4;

    (function startAnimation() {

        function animate() {
            requestAnimationFrame(animate)

            background.updateFrame();
            viking.updateFrame(background.platformPosY());
        }

        requestAnimationFrame(animate)

    })()



    // Keyup event to clear the flag
    $(document).on('keydown', function(e) {
        if ((e.code === 'Space') && !viking.jumpInProgress()) {
            viking.setJumpInProgress(true);
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {

            if (!background.isMoving())
                if (e.key === 'ArrowRight') viking.moveRight()
                else viking.moveLeft();
            background.setMoving(true,
                (e.key === 'ArrowRight') ? -INITIAL_SPEED : INITIAL_SPEED);;

        }
    });

    // Keyup event to clear the flag
    $(document).on('keyup', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            background.setMoving(false)
        }
    });


})