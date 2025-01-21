document.addEventListener('DOMContentLoaded', () => {
    const noteButtons = document.querySelectorAll('.note-button');
    const currentFrequency = document.getElementById('current-frequency');
    const semitoneSlider = document.getElementById('semitone-slider');
    let audioContext; // Declare AudioContext but don't create it yet
    let sourceNode; // To hold the source node for playback
    let currentNote = ''; // Track the currently playing note
    let originalFrequency; // Store the original frequency of the currently selected note
    let semitoneAdjustment = 0; // Track the semitone adjustment
    let audioBuffer; // To hold the audio buffer

    // Frequencies for each note (in Hz)
    const frequencies = {
        'ni': 293.66, // D
        'pa': 329.63, // E
        'vu': 349.23, // F
        'ga': 392.00, // G
        'di': 440.00, // A
        'ke': 493.88, // B
        'zo': 523.25  // C
    };

    // Load audio file into the buffer
    function loadAudio(note) {
        const audioSrc = `${note}.mp3`; // Assuming files are named "note.mp3"
        fetch(audioSrc)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.arrayBuffer();
            })
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                audioBuffer = buffer; // Store the loaded audio buffer
                playDynamicNote(); // Play the note when loaded
            })
            .catch(error => console.error(`Error loading audio: ${error}`));
    }

    // Function to play the selected note
    function playDynamicNote() {
        if (sourceNode) {
            sourceNode.stop(); // Stop the previous audio
        }
        sourceNode = audioContext.createBufferSource(); // Create a new source node
        sourceNode.buffer = audioBuffer; // Set the audio buffer
        const playbackRate = Math.pow(2, semitoneAdjustment / 12); // Calculate playback rate based on pitch adjustment
        sourceNode.playbackRate.value = playbackRate; // Adjust playback rate
        sourceNode.connect(audioContext.destination); // Connect to output

        // Loop the audio
        sourceNode.loop = true;

        sourceNode.start(0); // Start playback
    }

    // Function to update the displayed frequency
    function updateFrequency(note) {
        const adjustedFrequency = frequencies[note] * Math.pow(2, semitoneAdjustment / 12);
        currentFrequency.innerText = adjustedFrequency.toFixed(2);
    }

    // Add event listeners to note buttons
    noteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const note = button.dataset.note; // Get the note from button data attribute

            if (currentNote === note) {
                // If the same note is clicked, stop playback
                if (sourceNode) {
                    sourceNode.stop();
                }
                currentNote = ''; // Reset current note
                semitoneAdjustment = 0; // Reset adjustment for the stopped note
                semitoneSlider.value = semitoneAdjustment; // Reset slider
            } else {
                // Load and play the new note
                currentNote = note; // Update current note
                originalFrequency = frequencies[note]; // Store the original frequency
                semitoneAdjustment = 0; // Reset adjustment for the new note
                semitoneSlider.value = semitoneAdjustment; // Reset slider value
                updateFrequency(note); // Update frequency display
                loadAudio(note); // Load and play the new note
            }
        });
    });

    // Handle slider input for semitone adjustment
    semitoneSlider.addEventListener('input', () => {
        if (currentNote) {
            semitoneAdjustment = parseInt(semitoneSlider.value, 10); // Get the current value of the slider
            updateFrequency(currentNote); // Update frequency for the currently playing note
            playDynamicNote(); // Replay the updated note
        }
    });

    // Initialize frequency display
    updateFrequency('ni'); // Start with the default note

    // Add an event listener to start the AudioContext on the first click
    document.addEventListener('click', () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create the AudioContext
        } else {
            audioContext.resume(); // Resume the audio context if it was suspended
        }
    });
});