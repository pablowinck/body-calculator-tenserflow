const accuracyGoal = 0.8;
let personHeightCm; // Global variable to store the person's height
let sizes; // Variable to store the sizes
let net; // Variable to store the PoseNet model
let started = false; // Variable to store whether the measurements have started
let videoVisible = false; // Variable to store whether the video is visible
let moreThan80Scores = [];
