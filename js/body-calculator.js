/**
 * Function to calculate measurements
 * @param {number} personHeight Height of the person in cm
 * @param {object} image Image element
 * @param {object} net PoseNet model
 * @returns Measurements and PoseNet score
 */
async function calculateMeasurements(personHeight, image, net) {
  // This validation is just if you want to use the function directly
  if (isNaN(personHeight) || personHeight <= 0) {
    alert("Por favor, insira uma altura válida em cm.");
    return;
  }
  return loadAndUsePoseNet(image, net).then((pose) => {
    const measurements = calculateBodyMeasurements(
      pose.keypoints,
      personHeight,
      image.height
    );
    return { measurements, score: pose.score };
  });
}

/**
 * Function to load and use PoseNet
 * @param {object} image Image element
 * @returns PoseNet keypoints
 */
async function loadAndUsePoseNet(image) {
  const net = await posenet.load();
  const pose = await net.estimateSinglePose(image, {
    flipHorizontal: false,
  });
  return pose;
}

/**
 * Function to calculate body measurements
 * @param {array} poseKeypoints PoseNet keypoints
 * @param {number} personHeightCm Height of the person in cm
 * @param {number} videoHeightPixels Height of the video in pixels
 * @returns Body measurements
 */
function calculateBodyMeasurements(
  poseKeypoints,
  personHeightCm,
  videoHeightPixels
) {
  // Calculate the scale from pixels to centimeters
  const scaleCmPerPixel = personHeightCm / videoHeightPixels;

  // Function to calculate the distance between two points
  function distanceBetweenPoints(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  // Find keypoints
  const leftShoulder = poseKeypoints.find(
    (point) => point.part === "leftShoulder"
  ).position;
  const rightShoulder = poseKeypoints.find(
    (point) => point.part === "rightShoulder"
  ).position;
  const leftHip = poseKeypoints.find(
    (point) => point.part === "leftHip"
  ).position;
  const rightHip = poseKeypoints.find(
    (point) => point.part === "rightHip"
  ).position;

  // Calculate distances in pixels
  const shoulderDistancePixels = distanceBetweenPoints(
    leftShoulder,
    rightShoulder
  );
  const hipDistancePixels = distanceBetweenPoints(leftHip, rightHip);

  // This calc needs to be improved, but it's a start
  const waistEstimatePixels = hipDistancePixels * 2 + hipDistancePixels * 0.4;

  // Convert measurements from pixels to centimeters using the scale
  const shoulderDistanceCm = shoulderDistancePixels * scaleCmPerPixel;
  const waistEstimateCm = waistEstimatePixels * scaleCmPerPixel;
  const hipDistanceCm = hipDistancePixels * scaleCmPerPixel;

  return {
    shoulders: shoulderDistanceCm.toFixed(2),
    waist: waistEstimateCm.toFixed(2),
    hips: hipDistanceCm.toFixed(2),
  };
}
