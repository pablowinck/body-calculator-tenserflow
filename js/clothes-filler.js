const camisetNike = {
  nome: "Camiseta Nike",
  imagem:
    "https://images.tcdn.com.br/img/img_prod/1034143/camiseta_nike_masculina_sportswear_ar4993_2181_1_e493bc1bb066486bcbd03a28b9dafe3d.jpg",
  tamanhos: [
    {
      tamanho: "P",
      medidas: {
        ombro: 55,
        cintura: 85,
        quadril: 95,
      },
    },
    {
      tamanho: "M",
      medidas: {
        ombro: 70,
        cintura: 95,
        quadril: 100,
      },
    },
    {
      tamanho: "G",
      medidas: {
        ombro: 80,
        cintura: 100,
        quadril: 105,
      },
    },
  ],
};
const camisetaAdidas = {
  nome: "Camiseta Adidas",
  imagem:
    "https://www.botoli.com.br/cdn/imagens/produtos/det/camiseta-adidas-m-fr-lg-t-masculino-989d548d173548d6c1db9ac98f97763b.jpg",
  tamanhos: [
    {
      tamanho: "P",
      medidas: {
        ombro: 53,
        cintura: 78,
        quadril: 91,
      },
    },
    {
      tamanho: "M",
      medidas: {
        ombro: 65,
        cintura: 85,
        quadril: 95,
      },
    },
    {
      tamanho: "G",
      medidas: {
        ombro: 85,
        cintura: 90,
        quadril: 100,
      },
    },
  ],
};
const roupas = [...Array(10).keys()].map((_, i) => {
  return i % 2 === 0 ? camisetNike : camisetaAdidas;
});
const lista = document.querySelector(".lista");
roupas.forEach((roupa) => {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="roupa">
            <h3>${roupa.nome}</h3>
            <img src="${roupa.imagem}" alt="${roupa.nome}" />
            <div class="medidas">
                    <select>
                            ${roupa.tamanhos
                              .map(
                                (tamanho) =>
                                  `<option value="${JSON.stringify(
                                    tamanho.medidas
                                  )}">${tamanho.tamanho}</option>`
                              )
                              .join("")}
                    </select>
                    <button class="provar-button" data-tamanhos='${JSON.stringify(
                      roupa.tamanhos
                    )}'>Provar</button>
            </div>
            <button>Comprar</button>
    </div>
        `;
  div.querySelector(".provar-button").addEventListener("click", (e) => {
    const tamanhos = JSON.parse(e.target.dataset.tamanhos);
    mostrarProvador(tamanhos);
  });
  lista.appendChild(div);
});
