/**
 * Função para calcular as medidas do corpo
 * @param {number} personHeight Altura da pessoa em cm
 * @param {object} image Elemento de imagem
 * @param {object} net Modelo PoseNet
 * @returns Medidas do corpo
 */
async function calculateMeasurements(personHeight, image, net) {
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
 * Função para carregar e usar o PoseNet
 * @param {object} image Elemento de imagem
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
 * Função para desenhar o canvas
 * @param {array} poseKeypoints PoseNet keypoints
 * @param {number} personHeightCm Altura da pessoa em cm
 * @param {number} videoHeightPixels Altura do vídeo em pixels
 * @returns Medidas do corpo
 */
function calculateBodyMeasurements(
  poseKeypoints,
  personHeightCm,
  videoHeightPixels
) {
  const scaleCmPerPixel = personHeightCm / videoHeightPixels;
  function distanceBetweenPoints(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }
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
  // 1. Calcular a distância entre os ombros em pixels
  const shoulderDistancePixels = distanceBetweenPoints(
    leftShoulder,
    rightShoulder
  );
  // 2. Calcular a distância entre os quadris em pixels
  const hipDistancePixels = distanceBetweenPoints(leftHip, rightHip);
  // 3. Calcular a estimativa da cintura em pixels (esse calculo é uma estimativa)
  const waistEstimatePixels = hipDistancePixels * 2 + hipDistancePixels * 0.4;
  // 4. Calcular as medidas em cm
  const shoulderDistanceCm = shoulderDistancePixels * scaleCmPerPixel;
  const waistEstimateCm = waistEstimatePixels * scaleCmPerPixel;
  const hipDistanceCm = hipDistancePixels * scaleCmPerPixel;
  return {
    shoulders: shoulderDistanceCm.toFixed(2),
    waist: waistEstimateCm.toFixed(2),
    hips: hipDistanceCm.toFixed(2),
  };
}
