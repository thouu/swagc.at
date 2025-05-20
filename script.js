// idk javascript dawg i used chatgpt for this
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    const swagcat_clickable_elements = document.querySelectorAll('.swagcat-image');
    // We don't strictly need to get the <audio> element anymore if we create new ones,
    // but it's good to know its src.
    const originalAudioElement = document.getElementById('iloveswagcat');
    let audioSrc = '';

    if (originalAudioElement) {
        audioSrc = originalAudioElement.src; // Get the source from your existing audio tag
        console.log("Audio source identified:", audioSrc);
    } else {
        console.error("Could not find the original audio element with ID 'iloveswagcat' to get the src. Please ensure it exists or hardcode the audioSrc.");
        // Fallback or hardcode if necessary, ensure this path is correct:
        // audioSrc = "iloveswagcat.mp3"; // Or "/iloveswagcat.mp3" or "audio/iloveswagcat.mp3"
    }


    if (swagcat_clickable_elements.length > 0 && audioSrc) {
        const swagcat_clickable_div = swagcat_clickable_elements[0];
        console.log("Using this div for click:", swagcat_clickable_div);

        swagcat_clickable_div.addEventListener('click', function() {
            console.log("Div clicked! Creating and playing new audio instance.");

            // Create a new Audio object each time
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
});