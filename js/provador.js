function mostrarProvador(tamanhos) {
  if (started) {
    stopMeasurements();
    document.getElementById("action-button").innerText = "Iniciar Medições";
  }
  document.getElementById("provador").classList.remove("invisible");
  document.getElementById("action-button").innerText = "Iniciar Medições";
  document.getElementById("best-score-value").innerText = "";
  document.getElementById("personHeightCm").value = "";
  document.querySelector(".provador").classList.remove("invisible");
  sizes = tamanhos;
}

async function handleStartStop() {
  if (started) {
    stopMeasurements();
    document.getElementById("action-button").innerText = "Iniciar Medições";
  } else {
    startMeasurements();
    document.getElementById("action-button").innerText = "Parar Medições";
  }
}

// Start the measurements when the button is clicked
async function startMeasurements() {
  personHeightCm = parseFloat(document.getElementById("personHeightCm").value);
  if (isNaN(personHeightCm) || personHeightCm <= 0) {
    alert("Por favor, insira uma altura válida em cm.");
    return;
  }
  // Load the PoseNet model
  net = await posenet.load();
  // Start the webcam
  await setupCamera();
  // Start the measurement loop
  started = true;
  measureLoop();
}

function stopMeasurements() {
  started = false;
  document.querySelector(".go-back-alert").classList.add("invisible");
}

async function setupCamera() {
  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  video.srcObject = stream;
  document.getElementById("video").classList.remove("invisible");
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// The measurement loop
async function measureLoop() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  async function poseDetectionFrame() {
    if (!started) {
      return;
    }
    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: false,
    });
    if (pose.score < accuracyGoal) {
      document.getElementById("canvas").classList.add("invisible");
      document.getElementById("video").classList.remove("invisible");
      document.querySelector(".go-back-alert").classList.remove("invisible");
      setTimeout(poseDetectionFrame, 100);
      return;
    }

    document.querySelector(".go-back-alert").classList.add("invisible");
    document.getElementById("video").classList.add("invisible");
    document.getElementById("canvas").classList.remove("invisible");
    drawCanvas(pose, video, canvas, ctx);
    const measurements = calculateBodyMeasurements(
      pose.keypoints,
      personHeightCm,
      video.videoHeight
    );
    if (pose.score > accuracyGoal) {
      moreThan80Scores.push(measurements);
      let average = moreThan80Scores.reduce(
        (acc, curr) => {
          return {
            shoulders: +acc.shoulders + +curr.shoulders,
            waist: +acc.waist + +curr.waist,
            hips: +acc.hips + +curr.hips,
          };
        },
        { shoulders: 0, waist: 0, hips: 0 }
      );
      average.shoulders = (average.shoulders / moreThan80Scores.length).toFixed(
        2
      );
      average.waist = (average.waist / moreThan80Scores.length).toFixed(2);
      average.hips = (average.hips / moreThan80Scores.length).toFixed(2);
      const tamanhosQueServem = sizes.filter((tamanho) => {
        const margemErro = 2;
        const isOmbroMenorOuIgual =
          average.shoulders <= tamanho.medidas.ombro + margemErro;
        const isCinturaMenorOuIgual =
          average.waist <= tamanho.medidas.cintura + margemErro;
        const isQuadrilMenorOuIgual =
          average.hips <= tamanho.medidas.quadril + margemErro;
        return (
          isOmbroMenorOuIgual && isCinturaMenorOuIgual && isQuadrilMenorOuIgual
        );
      });
      const melhorTamanho = tamanhosQueServem.reduce((acc, curr) => {
        const accDist = Math.abs(
          acc.medidas.ombro +
            acc.medidas.cintura +
            acc.medidas.quadril -
            (average.shoulders + average.waist + average.hips)
        );
        const currDist = Math.abs(
          curr.medidas.ombro +
            curr.medidas.cintura +
            curr.medidas.quadril -
            (average.shoulders + average.waist + average.hips)
        );
        return accDist < currDist ? acc : curr;
      }, tamanhosQueServem[0]);
      if (tamanhosQueServem.length > 0) {
        let result = melhorTamanho.tamanho;
        if (tamanhosQueServem.length > 1) {
          result +=
            " (melhor) ou " +
            tamanhosQueServem
              .filter(({ tamanho }) => tamanho !== melhorTamanho.tamanho)
              .map(({ tamanho }) => tamanho);
        }
        document.getElementById("best-score-value").innerText = result;
      } else {
        document.getElementById("best-score-value").innerText =
          "Não foi possível encontrar um tamanho";
      }
    }
    setTimeout(poseDetectionFrame, 50); // Wait for 5 seconds before the next measurement
  }
  poseDetectionFrame();
}

// Draw the detected pose onto the canvas
function drawCanvas(pose, video, canvas, ctx) {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the video
  ctx.save();
  ctx.scale(-1, 1); // Mirrors the canvas
  ctx.translate(-canvas.width, 0); // Adjust for the mirrored translation
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Use canvas dimensions
  ctx.restore();
  // Draw the pose
  pose.keypoints.forEach((keypoint) => {
    if (keypoint.score > accuracyGoal) {
      const { y, x } = keypoint.position;
      ctx.beginPath();
      const mirroredX = canvas.width - x; // Mirror the keypoint's x position
      ctx.arc(mirroredX, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }
  });
}
window.onload = setupCamera();
