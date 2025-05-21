/*
 _     _ _        _                                _       _       _
(_) __| | | __   (_) __ ___   ____ _ ___  ___ _ __(_)_ __ | |_    (_)
| |/ _` | |/ /   | |/ _` \ \ / / _` / __|/ __| '__| | '_ \| __|   | |
| | (_| |   <    | | (_| |\ V / (_| \__ \ (__| |  | | |_) | |_ _  | |
|_|\__,_|_|\_\  _/ |\__,_| \_/ \__,_|___/\___|_|  |_| .__/ \__( ) |_|
               |__/                                 |_|       |/
                    _                 _     _     __  __    __
 _   _ ___  ___  __| |   __ _ _ __   | |   | |   |  \/  |  / _| ___  _ __
| | | / __|/ _ \/ _` |  / _` | '_ \  | |   | |   | |\/| | | |_ / _ \| '__|
| |_| \__ \  __/ (_| | | (_| | | | | | |___| |___| |  | | |  _| (_) | |
 \__,_|___/\___|\__,_|  \__,_|_| |_| |_____|_____|_|  |_| |_|  \___/|_|

 _   _     _                        _   _            _
| |_| |__ (_)___   _ __   __ _ _ __| |_(_) ___ _   _| | __ _ _ __
| __| '_ \| / __| | '_ \ / _` | '__| __| |/ __| | | | |/ _` | '__|
| |_| | | | \__ \ | |_) | (_| | |  | |_| | (__| |_| | | (_| | |
 \__|_| |_|_|___/ | .__/ \__,_|_|   \__|_|\___|\__,_|_|\__,_|_|
                  |_|
  __ _ _
 / _(_) | ___
| |_| | |/ _ \
|  _| | |  __/
|_| |_|_|\___|
*/
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    const swagcat_clickable_elements = document.querySelectorAll('.swagcat-image');
    const originalAudioElement = document.getElementById('iloveswagcat');
    let audioSrc = '';

    if (originalAudioElement) {
        audioSrc = originalAudioElement.src;
        console.log("Audio source identified:", audioSrc);
    } else {
        console.error("Could not find the original audio element with ID 'iloveswagcat' to get the src. Please ensure it exists or hardcode the audioSrc.");
        // audioSrc = "iloveswagcat.mp3"; // Fallback if needed
    }

    if (swagcat_clickable_elements.length > 0 && audioSrc) {
        const swagcat_clickable_div = swagcat_clickable_elements[0];
        console.log("Using this div for click:", swagcat_clickable_div);

        swagcat_clickable_div.addEventListener('click', function() {
            console.log("Div clicked! Creating and playing new audio instance.");
            const newAudio = new Audio(audioSrc);
            newAudio.play()
                .then(() => {
                    console.log("I love Swagcat! :3 - New audio instance playing.");
                })
                .catch(error => {
                    console.error("Error playing new audio instance:", error);
                    console.log("Source used for this instance:", audioSrc);
                });
        });
        console.log("Event listener attached for overlapping audio playback.");
    } else {
        if (swagcat_clickable_elements.length === 0) {
            console.error("CRITICAL: No element with class 'swagcat-image' found.");
        }
        if (!audioSrc) {
            console.error("CRITICAL: Audio source (audioSrc) is not defined. Cannot play sound.");
        }
    }

    // --- Tooltip Logic ---
    const watermarkElement = document.querySelector('.watermark');
    const reasoningElement = document.querySelector('.reasoning');

    if (watermarkElement && reasoningElement) {
        const offsetX = 6; // Pixels to the right of the cursor
        const offsetY = 6; // Pixels below the cursor
        const screenPadding = 5; // Min distance from screen edge

        const positionTooltip = (event) => {
            // Get tooltip dimensions. This relies on it being visible (display: block)
            // which CSS :hover should handle before this JS runs on mouseenter/mousemove.
            const tooltipWidth = reasoningElement.offsetWidth;
            const tooltipHeight = reasoningElement.offsetHeight;

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate initial desired position
            let newX = event.clientX + offsetX;
            let newY = event.clientY + offsetY;

            // Adjust X position to stay within screen bounds
            if (newX + tooltipWidth + screenPadding > viewportWidth) {
                // If it goes off the right edge, position it to the left of the cursor
                newX = event.clientX - tooltipWidth - offsetX;
                // Or, alternatively, clamp it to the right edge:
                // newX = viewportWidth - tooltipWidth - screenPadding;
            }
            if (newX < screenPadding) {
                newX = screenPadding; // Prevent going off the left edge
            }

            // Adjust Y position to stay within screen bounds
            if (newY + tooltipHeight + screenPadding > viewportHeight) {
                // If it goes off the bottom edge, position it above the cursor
                newY = event.clientY - tooltipHeight - offsetY;
                // Or, alternatively, clamp it to the bottom edge:
                // newY = viewportHeight - tooltipHeight - screenPadding;
            }
            if (newY < screenPadding) {
                newY = screenPadding; // Prevent going off the top edge
            }

            reasoningElement.style.left = newX + 'px';
            reasoningElement.style.top = newY + 'px';
        };

        watermarkElement.addEventListener('mouseenter', function(event) {
            // CSS :hover makes it display: block. Position it.
            positionTooltip(event);
        });

        watermarkElement.addEventListener('mousemove', function(event) {
            positionTooltip(event);
        });

        // Hiding is still handled by CSS when mouse leaves .watermark
        console.log("Tooltip follow-mouse logic attached.");

    } else {
        if (!watermarkElement) {
            console.error("Tooltip JS: Could not find .watermark element.");
        }
        if (!reasoningElement) {
            console.error("Tooltip JS: Could not find .reasoning element.");
        }
    }
});