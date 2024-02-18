const accuracyGoal = 0.8;
let personHeightCm;
let sizes; // Variável para armazenar os tamanhos da roupa selecionada
let net; // Variável para armazenar o modelo PoseNet
let started = false; // Variável para armazenar se o cálculo já começou
let videoVisible = false; // Variável para armazenar se o vídeo está visível
let moreThan80Scores = [];
