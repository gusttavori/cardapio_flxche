$(document).ready(function () {
  cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_PEDIDO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 9.00;

var CELULAR_EMPRESA = "5577988838862";

cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
  },
};

cardapio.metodos = {
  // obtem a lista de itens do cardápio
  obterItensCardapio: (categoria = "burgers", vermais = false) => {
    var filtro = MENU[categoria];
    console.log(filtro);

    if (!vermais) {
      $("#itensCardapio").html("");
      $("#btnVerMais").removeClass("hidden");
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${name}/g, e.name)
        .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${id}/g, e.id);

      // botão ver mais foi clicado (12 itens)
      if (vermais && i >= 8 && i < 12) {
        $("#itensCardapio").append(temp);
      }

      // paginação inicial (8 itens)
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
      }
    });

    // remove o ativo
    $(".container-menu a").removeClass("active");

    // seta o menu para ativo
    $("#menu-" + categoria).addClass("active");
  },

  // clique no botão de ver mais
  verMais: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];
    cardapio.metodos.obterItensCardapio(ativo, true);

    $("#btnVerMais").addClass("hidden");
  },

  // diminuir a quantidade do item no cardapio
  diminuirQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1);
    }
  },

  // aumentar a quantidade do item no cardapio
  aumentarQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    $("#qntd-" + id).text(qntdAtual + 1);
  },

  // adicionar ao carrinho o item do cardápio
  adicionarAoCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      // obter a categoria ativa
      var categoria = $(".container-menu a.active")
        .attr("id")
        .split("menu-")[1];

      // obtem a lista de itens
      let filtro = MENU[categoria];

      // obtem o item
      let item = $.grep(filtro, (e, i) => {
        return e.id == id;
      });

      if (item.length > 0) {
        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => {
          return elem.id == id;
        });

        // caso já exista o item no carrinho, só altera a quantidade
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
          MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
        }
        // caso ainda não exista o item no carrinho, adiciona ele
        else {
          item[0].qntd = qntdAtual;
          MEU_CARRINHO.push(item[0]);
        }

        cardapio.metodos.mensagem("Item adicionado ao carrinho", "green");
        $("#qntd-" + id).text(0);

        cardapio.metodos.atualizarBadgeTotal();
      }
    }
  },

  // atualiza o badge de totais dos botões "Meu carrinho"
  atualizarBadgeTotal: () => {
    var total = 0;

    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qntd;
    });

    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }

    $(".badge-total-carrinho").html(total);
  },

  // abrir a modal de carrinho
  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("#modalCarrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
    } else {
      $("#modalCarrinho").addClass("hidden");
    }
  },

  // altera os texto e exibe os botões das etapas
  carregarEtapa: (etapa) => {
    // Esconde todas as seções
    $("#itensCarrinho, #dadosCliente, #resumoCarrinho").addClass("hidden");

    // Remove a classe ativa de todas as etapas
    $(".etapa").removeClass("active");
    $("#btnEtapaPedido, #btnEtapaDados, #btnEtapaResumo, #btnVoltar, #btnEtapaEndereco").addClass("hidden");

    // Controle das etapas
    if (etapa === 1) {
        $("#lblTituloEtapa").text("Seu carrinho:");
        $("#itensCarrinho").removeClass("hidden");

        $(".etapa1").addClass("active");
        $("#btnEtapaPedido").removeClass("hidden"); // Botão "Continuar" visível na Etapa 1
    } 

    if (etapa === 2) {
        $("#lblTituloEtapa").text("Dados do Cliente:");
        $("#dadosCliente").removeClass("hidden");

        $(".etapa1, .etapa2").addClass("active");
        $("#btnEtapaDados").removeClass("hidden");
        $("#btnVoltar").removeClass("hidden");
        $("#btnEtapaEndereco").removeClass("hidden"); // Botão "Revisar pedido" visível na Etapa 2
    } 

    if (etapa === 3) {
        $("#lblTituloEtapa").text("Resumo do pedido:");
        $("#resumoCarrinho").removeClass("hidden");

        $(".etapa1, .etapa2, .etapa3").addClass("active");
        $("#btnEtapaResumo").removeClass("hidden");
        $("#btnVoltar").removeClass("hidden");
    }
},


  // botão de voltar etapa
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  // carrega a lista de itens do carrinho
  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#itensCarrinho").html("");

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho
          .replace(/\${img}/g, e.img)
          .replace(/\${name}/g, e.name)
          .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd);

        $("#itensCarrinho").append(temp);

        // último item
        if (i + 1 == MEU_CARRINHO.length) {
          cardapio.metodos.carregarValores();
        }
      });
    } else {
      $("#itensCarrinho").html(
        '<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>'
      );
      cardapio.metodos.carregarValores();
    }
  },

  // diminuir quantidade do item no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  // aumentar quantidade do item no carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  // botão remover item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
      return e.id != id;
    });
    cardapio.metodos.carregarCarrinho();

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();
  },

  // atualiza o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qntd = qntd;

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();

    // atualiza os valores (R$) totais do carrinho
    cardapio.metodos.carregarValores();
  },

  // carrega os valores de SubTotal, Entrega e Total
  carregarValores: () => {
    VALOR_CARRINHO = 0;

    $("#lblSubTotal").text("R$ 0,00");
    $("#lblValorEntrega").text("+ R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qntd);

      if (i + 1 == MEU_CARRINHO.length) {
        $("#lblSubTotal").text(
          `R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorEntrega").text(
          `+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorTotal").text(
          `R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`
        );
      }
    });
  },

  // carregar a etapa enderecos
  carregarPedido: () => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho está vazio.");
      return;
    }

    cardapio.metodos.carregarEtapa(2);
  },

  // validação antes de prosseguir para a etapa 3
  resumoPedido: () => {
    let cliente = $("#txtCliente").val().trim();
    let mesa = $("#txtNumeroMesa").val().trim();
    let comanda = $("#txtNumeroComanda").val().trim();

    if (!cliente) {
        cardapio.metodos.mensagem("Informe o Nome do Cliente, por favor.");
        $("#txtCliente").focus();
        return;
    }

    if (!mesa) {
        cardapio.metodos.mensagem("Informe o Número da Mesa, por favor.");
        $("#txtNumeroMesa").focus();
        return;
    }

    if (!comanda) {
        cardapio.metodos.mensagem("Informe o Número da Comanda, por favor.");
        $("#txtNumeroComanda").focus();
        return;
    }

    MEU_PEDIDO = {
        cliente: cliente,
        mesa: mesa,
        comanda: comanda,
    };

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();
},

// Carrega a etapa de Resumo do pedido
carregarResumo: () => {
  // Limpar a lista de itens do resumo
  $("#listaItensResumo").html(""); // Limpa os itens antes de adicionar novos

  $.each(MEU_CARRINHO, (i, e) => {
    let temp = cardapio.templates.itemResumo
      .replace(/\${img}/g, e.img)
      .replace(/\${name}/g, e.name)
      .replace(/\${price}/g, e.price.toFixed(2).replace(".", ","))
      .replace(/\${qntd}/g, e.qntd);

    $("#listaItensResumo").append(temp);
  });

  // Exibir as informações do cliente
  $("#resumoPedido").html(
      `Nome do Cliente: ${MEU_PEDIDO.cliente} <br> Número da Mesa: ${MEU_PEDIDO.mesa} <br> Número da Comanda: ${MEU_PEDIDO.comanda}`
  );

  cardapio.metodos.finalizarPedido();
},


// Atualiza o link do botão do WhatsApp
finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_PEDIDO != null) {
        let texto = "Olá! Gostaria de fazer um pedido:";
        texto += `\n*Itens do pedido:*\n\n\${itens}`;
        texto += "\n*Mesa de entrega:*";
        texto += `\nNome do Cliente: ${MEU_PEDIDO.cliente} \nNúmero da Mesa: ${MEU_PEDIDO.mesa} \nNúmero da Comanda: ${MEU_PEDIDO.comanda}`;
        texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA)
          .toFixed(2)
          .replace(".", ",")}*`;
  
        var itens = "";

        $.each(MEU_CARRINHO, (i, e) => {
          itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price
            .toFixed(2)
            .replace(".", ",")} \n`;
  
          // último item
          if (i + 1 == MEU_CARRINHO.length) {
            texto = texto.replace(/\${itens}/g, itens);
                // Converte a URL
                let encode = encodeURI(texto);
                let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                $("#btnEtapaResumo").attr("href", URL);
            }
        });
    }
},

  // mensagens
  mensagem: (texto, cor = "red", tempo = 3500) => {
    let id = Math.floor(Date.now() * Math.random()).toString();

    // Cria a mensagem com o ID único
    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;


    // Adiciona a mensagem ao container
    $("#container-mensagens").append(msg);

    // Após o tempo de exibição, inicia a animação de desaparecer
    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDown");
      $("#msg-" + id).addClass("fadeOutUp");

      // Depois de a animação terminar, remove a mensagem e verifica se deve esconder o container
      setTimeout(() => {
        $("#msg-" + id).remove();

        // Verifica se não há mais mensagens no container
        if ($("#container-mensagens").children().length === 0) {
          $("#container-mensagens").hidden(); // Esconde o container se não houver mensagens
        }
      }, 800); // Espera o tempo da animação de saída
    }, tempo); // Tempo que a mensagem permanece visível
  },
};


cardapio.templates = {
  item: `<div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto-cardapio">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos-cardapio" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens-cardapio" id="qntd-\${id}">0</span>
                    <span class="btn-mais-cardapio" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

  itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${name}</b></p>
                <p class="price-produto"><b>R$ \${price}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

  itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${name}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${price}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
};