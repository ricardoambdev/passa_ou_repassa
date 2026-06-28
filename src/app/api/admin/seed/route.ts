import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const categoriasChallenge = [
  "Habilidade", "Equilíbrio", "Memória", "Conhecimento", "Coordenação", "Humor",
];

const niveis = ["Fácil", "Médio", "Difícil"];

const tempos = ["15 segundos", "30 segundos", "45 segundos", "60 segundos", "90 segundos", "120 segundos"];

const provas = [
  { nome: "Boca do Palhaço", descricao: "Acertar bolas dentro da boca do palhaço.", instrucao: "Cada participante terá 3 bolas para acertar na boca do palhaço a uma distância de 3 metros." },
  { nome: "Dança da Cadeira", descricao: "Dançar ao redor das cadeiras e sentar quando a música parar.", instrucao: "Ao som da música, os participantes dançam ao redor das cadeiras. Quando a música parar, todos devem sentar. Quem ficar de fora é eliminado." },
  { nome: "Prova do Balão", descricao: "Estourar balões sentando em cima.", instrucao: "Cada participante deve estourar o máximo de balões possível sentando em cima deles dentro do tempo limite." },
  { nome: "Torre de Copos", descricao: "Empilhar copos plásticos formando uma torre.", instrucao: "Com 20 copos plásticos, monte a torre mais alta possível sem deixar cair." },
  { nome: "Mímica Musical", descricao: "Fazer mímicas de cantores ou músicas.", instrucao: "O participante sorteia uma música ou cantor e deve fazer mímica para o time adivinhar. Não pode falar ou emitir sons." },
  { nome: "Cabo de Guerra", descricao: "Puxar a equipe adversária pela corda.", instrucao: "Duas equipes puxam a corda em direções opostas. A equipe que ultrapassar a marcação vence." },
  { nome: "Corrida do Sapo", descricao: "Pular como sapo até a linha de chegada.", instrucao: "Os participantes devem se agachar e pular como sapo até a linha de chegada. O primeiro a chegar vence." },
  { nome: "Encaixe Perfeito", descricao: "Encaixar formas geométricas no lugar certo.", instrucao: "Com blocos de formas variadas, encaixe cada um no seu respectivo lugar no menor tempo possível." },
  { nome: "Prova do Espelho", descricao: "Repetir os movimentos do companheiro.", instrucao: "Dupla: um faz movimentos e o outro deve repetir exatamente como se fosse um espelho." },
  { nome: "Estoura Balão", descricao: "Estourar balões com os pés.", instrucao: "Balões são espalhados pelo chão. Os participantes devem estourar o máximo possível usando apenas os pés." },
  { nome: "Gincana da Memória", descricao: "Memorizar objetos e responder perguntas.", instrucao: "Mostra-se uma bandeja com 15 objetos por 30 segundos. Depois, os participantes devem listar quantos lembrarem." },
  { nome: "Prova da Farinha", descricao: "Encontrar objetos escondidos na farinha.", instrucao: "Objetos pequenos são escondidos em uma bacia com farinha. Os participantes devem encontrá-los usando apenas a boca." },
  { nome: "Corrida do Ovo", descricao: "Correr com um ovo na colher sem deixar cair.", instrucao: "Cada participante segura uma colher com um ovo e precisa percorrer o trajeto sem deixar o ovo cair." },
  { nome: "Prova do Limão", descricao: "Empurrar um limão com o nariz até a meta.", instrucao: "Os participantes devem empurrar um limão usando apenas o nariz até a linha de chegada." },
  { nome: "Dança Imitando", descricao: "Imitar a coreografia do dançarino na tela.", instrucao: "Uma coreografia é exibida na tela. Os participantes devem imitar os passos corretamente." },
  { nome: "Prova da Bexiga d'Água", descricao: "Jogar bexigas d'água sem estourar.", instrucao: "Duplas se posicionam frente a frente e jogam bexigas d'água uma para a outra, dando um passo para trás a cada pegada." },
  { nome: "Jogo dos 7 Erros Humano", descricao: "Identificar diferenças em uma cena ao vivo.", instrucao: "Uma cena é montada com participantes. Depois de 30 segundos, algo é alterado. A equipe deve identificar o que mudou." },
  { nome: "Prova do Elástico", descricao: "Passar por dentro de um elástico sem encostar.", instrucao: "Duas pessoas seguram um elástico. Os participantes devem passar por dentro sem encostar, com o elástico descendo a cada rodada." },
  { nome: "Corrida do Saco", descricao: "Pular dentro de um saco até a linha de chegada.", instrucao: "Cada participante entra em um saco e precisa pular até a linha de chegada. O primeiro a chegar vence." },
  { nome: "Prova do Bigode", descricao: "Desenhar bigode no colega vendado.", instrucao: "Um participante é vendado e precisa desenhar um bigode no rosto do colega seguindo instruções da plateia." },
  { nome: "Desafio das Cores", descricao: "Falar a cor da palavra, não o texto escrito.", instrucao: "Palavras de cores são escritas em cores diferentes. O participante deve falar a cor da tinta, não a palavra lida." },
  { nome: "Prova do Abacaxi", descricao: "Descascar um abacaxi no menor tempo.", instrucao: "Cada participante recebe um abacaxi e deve descascá-lo completamente no menor tempo possível." },
  { nome: "Telefone Sem Fio", descricao: "Passar uma mensagem sussurrando de ouvido a ouvido.", instrucao: "Uma mensagem é sussurrada para o primeiro participante, que repete para o próximo, e assim por diante. O último deve dizer a mensagem em voz alta." },
  { nome: "Prova do Lábio", descricao: "Ler lábios do companheiro.", instrucao: "Um participante fala algo sem som, apenas mexendo os lábios. O outro deve adivinhar o que foi dito." },
  { nome: "Corrida de Três Pernas", descricao: "Dupla com pernas amarradas correndo.", instrucao: "Duas pessoas têm uma perna amarrada à outra e precisam correr juntas até a linha de chegada." },
  { nome: "Prova da Laranja", descricao: "Passar a laranja de pescoço a pescoço.", instrucao: "A laranja deve ser passada de um participante para outro usando apenas o pescoço, sem usar as mãos." },
  { nome: "Desafio do Bambolê", descricao: "Passar o bambolê pelo corpo sem usar as mãos.", instrucao: "O bambolê deve passar da cabeça aos pés e vice-versa sem usar as mãos, apenas com movimentos do corpo." },
  { nome: "Prova do Dedo", descricao: "Equilibrar uma vara no dedo.", instrucao: "Uma vara longa deve ser equilibrada na palma da mão ou dedo pelo maior tempo possível." },
  { nome: "Quiz Rápido", descricao: "Responder perguntas de conhecimento geral.", instrucao: "Perguntas de diversas áreas do conhecimento são feitas e o participante tem 10 segundos para responder cada uma." },
  { nome: "Prova do Globo", descricao: "Equilibrar um globo terrestre na cabeça.", instrucao: "Os participantes devem equilibrar um globo ou bola grande na cabeça enquanto andam por um trajeto." },
  { nome: "Dança da Laranja", descricao: "Dançar com uma laranja entre as testas.", instrucao: "Duplas dançam com uma laranja pressionada entre suas testas sem deixar cair." },
  { nome: "Prova da Corda", descricao: "Pular corda sem errar.", instrucao: "Cada participante deve pular corda sem errar. Ganha quem pular mais vezes consecutivas." },
  { nome: "Mestre Cuca", descricao: "Preparar um sanduíche vendado.", instrucao: "Vendado, o participante deve preparar um sanduíche com os ingredientes disponíveis. O mais completo e bem-feito vence." },
  { nome: "Prova do Sapato", descricao: "Encontrar e calçar os sapatos vendado.", instrucao: "Os sapatos de todos são misturados. Vendado, cada participante deve encontrar e calçar seus próprios sapatos." },
  { nome: "Estátua", descricao: "Congelar em uma posição quando a música parar.", instrucao: "Os participantes dançam livremente. Quando a música para, todos congelam. Quem se mexer é eliminado." },
  { nome: "Prova do Jornal", descricao: "Dançar em cima de um jornal dobrando-o.", instrucao: "Duplas dançam em cima de um jornal aberto. A cada rodada o jornal é dobrado ao meio. Quem pisar fora é eliminado." },
  { nome: "Corrida do Carrinho", descricao: "Um participante empurra o outro de carrinho.", instrucao: "Um segura as pernas do outro que anda com as mãos. A dupla precisa percorrer o trajeto." },
  { nome: "Prova do Canudo", descricao: "Passar bolinhas de papel com canudo.", instrucao: "Cada participante recebe um canudo e deve sugar bolinhas de papel e transportá-las até um recipiente." },
  { nome: "Desafio do Nó", descricao: "Desatar nós em uma corda.", instrucao: "Uma corda com vários nós apertados deve ser desatada completamente no menor tempo possível." },
  { nome: "Prova do Chinês", descricao: "Falar frutas em ordem alfabética.", instrucao: "Os participantes devem dizer nomes de frutas em ordem alfabética sem repetir e sem demorar mais de 3 segundos." },
  { nome: "Prova do Refrigerante", descricao: "Beber refrigerante com canudo curly.", instrucao: "Cada participante deve beber uma lata de refrigerante usando um canudo curly (ondulado) no menor tempo possível." },
  { nome: "Dança do Carrinho", descricao: "Dançar imitando um carrinho de compras.", instrucao: "Coreografia engraçada imitando um carrinho de compras desgovernado deve ser executada." },
  { nome: "Prova da Bolha", descricao: "Fazer a maior bolha de chiclete.", instrucao: "Cada participante recebe chicletes e deve fazer a maior bolha possível. A maior bolha vence." },
  { nome: "Gol Olímpico", descricao: "Fazer gol de cabeça no gol de handebol.", instrucao: "De uma distância determinada, o participante deve fazer gol de cabeça. Cada acerto vale um ponto." },
  { nome: "Prova da Colher", descricao: "Equilibrar colher no nariz.", instrucao: "Uma colher deve ser equilibrada na ponta do nariz pelo maior tempo possível." },
  { nome: "Desafio do Desenho", descricao: "Desenhar algo com os olhos vendados.", instrucao: "Vendado, o participante deve desenhar algo solicitado pela plateia. O desenho mais parecido vence." },
  { nome: "Prova do Dicionário", descricao: "Explicar palavras sem dizer sinônimos.", instrucao: "Uma palavra sorteada deve ser explicada para o time sem usar sinônimos ou palavras da mesma família." },
  { nome: "Corrida do Desentortar", descricao: "Desentortar palitos de sorvete molhados.", instrucao: "Palitos de sorvete foram molhados e entortados. Os participantes devem desentortá-los no menor tempo." },
  { nome: "Prova da Garrafa", descricao: "Virar garrafa pet com água e pousá-la.", instrucao: "Jogar a garrafa pet com um pouco de água para cima e fazê-la pousar em pé no chão." },
  { nome: "Prova da Massinha", descricao: "Modelar um objeto com massinha no escuro.", instrucao: "Com as luzes apagadas, os participantes devem modelar um objeto específico usando massinha de modelar." },
  { nome: "Boliche Maluco", descricao: "Derrubar pinos com uma bola diferente.", instrucao: "Usando uma bola de futebol americano ou bola irregular, derrubar o máximo de pinos possível." },
  { nome: "Prova do Palhaço", descricao: "Fazer o maior número de caretas.", instrucao: "Em 30 segundos, fazer o maior número possível de caretas diferentes. A plateia julga a melhor." },
  { nome: "Desafio da Pirâmide", descricao: "Formar uma pirâmie humana.", instrucao: "A equipe deve formar uma pirâmide humana e manter por 10 segundos." },
  { nome: "Prova do Fantasma", descricao: "Envolver o colega em papel higiênico.", instrucao: "Um participante deve enrolar completamente o colega em papel higiênico, formando uma múmia, no menor tempo." },
  { nome: "Corrida do Gole", descricao: "Beber água e assobiar.", instrucao: "Cada participante deve beber um copo de água e assobiar em seguida. Quem assobiar primeiro vence." },
  { nome: "Prova da Cadeira", descricao: "Girar ao redor da cadeira e sentar.", instrucao: "O participante gira 10 vezes ao redor da cadeira e tenta sentar. Quem sentar mais reto vence." },
  { nome: "Desafio da Meia", descricao: "Tirar a meia do outro usando apenas os pés.", instrucao: "Duplas sentadas frente a frente tentam tirar a meia do outro usando apenas os pés." },
  { nome: "Prova do Pijama", descricao: "Vestir pijama por cima da roupa.", instrucao: "Cada participante deve vestir um pijama completo por cima da roupa no menor tempo possível." },
  { nome: "Prova do Suco", descricao: "Fazer um suco e servir vendado.", instrucao: "Vendado, o participante deve preparar um copo de suco a partir de frutas e servir sem derramar." },
  { nome: "Dança do Ventre", descricao: "Dançar com moedas na barriga sem deixar cair.", instrucao: "Moedas são colocadas na barriga do participante que deve dançar sem deixar nenhuma cair no chão." },
  { nome: "Prova do Travesseiro", descricao: "Batalha de travesseiro em cima de um banco.", instrucao: "Duas pessoas se enfrentam em cima de um banco usando travesseiros. Quem cair primeiro perde." },
  { nome: "Corrida do Pneuzinho", descricao: "Rolar pneu até a linha de chegada.", instrucao: "Cada participante deve rolar um pneu por um trajeto sinuoso até a linha de chegada." },
  { nome: "Prova do Pirata", descricao: "Andar em linha reta com tapa-olho.", instrucao: "Com um tapa-olho, o participante deve andar em linha reta sobre uma fita no chão sem sair dela." },
  { nome: "Desafio do Ritmo", descricao: "Repetir sequência de palmas.", instrucao: "Uma sequência de palmas é executada e o participante deve repeti-la exatamente igual." },
  { nome: "Prova da Voz", descricao: "Reconhecer a voz do colega.", instrucao: "Vendado, o participante deve reconhecer a voz de cada membro da equipe falando uma frase." },
  { nome: "Prova do Dado", descricao: "Falar um tema conforme o número do dado.", instrucao: "Joga-se um dado. Cada número corresponde a um tema sobre o qual o participante deve falar por 30 segundos sem parar." },
  { nome: "Prova do Cabelo", descricao: "Fazer um penteado maluco no colega.", instrucao: "Com grampos, elásticos e gel, fazer o penteado mais criativo possível no colega." },
  { nome: "Corrida do Vento", descricao: "Soprar bolinha de pingue-pongue até a meta.", instrucao: "Uma bolinha de pingue-pongue deve ser soprada por um labirinto até a saída." },
  { nome: "Prova do Siri", descricao: "Andar como siri (de costas).", instrucao: "Os participantes devem percorrer o trajeto andando de costas como um siri. O primeiro a chegar vence." },
  { nome: "Desafio da Escultura", descricao: "Virar estátua imitando uma escultura famosa.", instrucao: "Uma imagem de escultura famosa é mostrada. O participante deve imitar a pose exatamente." },
  { nome: "Prova do Chapéu", descricao: "Acertar chapéu na cabeça do colega.", instrucao: "De uma distância determinada, o participante deve arremessar chapéus para acertar na cabeça do colega." },
  { nome: "Prova da Gaita", descricao: "Tocar uma música na gaita de boca.", instrucao: "Cada participante deve tentar tocar uma música conhecida na gaita de boca. A plateia julga." },
  { nome: "Corrida do Saco de Batata", descricao: "Correr com um saco de batata nas costas.", instrucao: "Cada participante carrega um saco de batata nas costas e precisa correr até a linha de chegada." },
  { nome: "Prova do Ioiô", descricao: "Fazer manobras com ioiô.", instrucao: "Cada participante deve executar o maior número de manobras diferentes com um ioiô." },
  { nome: "Prova do Objeto Escondido", descricao: "Encontrar objeto escondido na sala.", instrucao: "Um objeto é escondido na sala enquanto o participante espera fora. Ele deve encontrá-lo no menor tempo." },
  { nome: "Prova do Riso", descricao: "Fazer o outro rir primeiro.", instrucao: "Duplas frente a frente. Um tenta fazer o outro rir sem tocar. Quem rir primeiro perde." },
  { nome: "Desafio do Tênis", descricao: "Amarrar o tênis com uma mão só.", instrucao: "Com uma das mãos amarrada para trás, o participante deve amarrar o próprio tênis." },
  { nome: "Prova do Patinho", descricao: "Andar agachado feito pato.", instrucao: "Os participantes devem andar agachados imitando patos até a linha de chegada." },
  { nome: "Prova do Ventríloquo", descricao: "Falar sem mexer os lábios.", instrucao: "O participante deve falar uma frase sem mexer os lábios para o time adivinhar o que foi dito." },
  { nome: "Corrida do Balão nos Pés", descricao: "Estourar balão amarrado no pé do outro.", instrucao: "Cada participante tem um balão amarrado no tornozelo. Devem estourar o balão dos outros protegendo o seu." },
  { nome: "Prova da Banana", descricao: "Comer banana sem usar as mãos.", instrucao: "Uma banana pendurada em um barbante deve ser comida sem usar as mãos." },
  { nome: "Prova do Cotovelo", descricao: "Tocar o nariz com o cotovelo.", instrucao: "O participante precisa conseguir tocar a ponta do nariz com o cotovelo do mesmo braço." },
  { nome: "Desafio do Palito", descricao: "Tirar palitos de uma pilha sem derrubar.", instrucao: "Uma pilha de palitos é montada. Cada participante tira um palito por vez sem derrubar os outros." },
  { nome: "Prova do Pintor", descricao: "Pintar um quadro vendado.", instrucao: "Vendado, o participante deve pintar uma paisagem simples em uma tela. A melhor pintura vence." },
  { nome: "Prova do Hambúrguer", descricao: "Montar um hambúrguer gigante.", instrucao: "Com diversos ingredientes disponíveis, montar o hambúrguer mais alto possível sem derrubar." },
  { nome: "Corrida do Gato", descricao: "Andar de quatro como gato.", instrucao: "Os participantes devem percorrer o trajeto andando de quatro como gatos. O mais rápido vence." },
  { nome: "Prova do Pé de Cabra", descricao: "Desvirar uma bota com os pés.", instrucao: "Uma bota está virada. O participante deve desvirá-la usando apenas os pés." },
  { nome: "Prova da Perna de Pau", descricao: "Andar de perna de pau.", instrucao: "Cada participante deve percorrer um trajeto curto usando pernas de pau sem cair." },
  { nome: "Prova dos Palitos Chineses", descricao: "Pegar objetos com hashis.", instrucao: "Usando hashis (palitos chineses), pegar o maior número de objetos pequenos e transferi-los para outro recipiente." },
  { nome: "Desafio do Gelo", descricao: "Derreter cubo de gelo na mão.", instrucao: "Cada participante recebe um cubo de gelo e deve derretê-lo usando apenas o calor das mãos." },
  { nome: "Prova da Bolinha de Gude", descricao: "Soprar bolinha de gude até o buraco.", instrucao: "Com um canudo, soprar a bolinha de gude até fazê-la cair no buraco no menor número de sopros." },
  { nome: "Prova do Malabarista", descricao: "Fazer malabarismo com 3 bolas.", instrucao: "Cada participante deve fazer malabarismo com 3 bolas pelo maior tempo possível sem derrubar." },
  { nome: "Prova do Mímico de Animais", descricao: "Imitar animal para o time adivinhar.", instrucao: "Sorteia-se um animal e o participante deve imitá-lo com sons e movimentos para o time adivinhar." },
  { nome: "Dança do Robô", descricao: "Dançar como robô.", instrucao: "Coreografia robótica deve ser executada. A plateia julga o robô mais convincente." },
  { nome: "Prova do Grito", descricao: "Gritar sem desafinar.", instrucao: "Cada participante deve dar um grito agudo mantendo a nota por pelo menos 10 segundos sem desafinar." },
  { nome: "Prova do Chocolate", descricao: "Comer chocolate com garfo e faca.", instrucao: "Usando garfo e faca, comer uma barra de chocolate no menor tempo possível." },
  { nome: "Prova do Cigarro", descricao: "Apagar velas com sopro forte.", instrucao: "Uma fileira de 10 velas deve ser apagada com um único sopro. Quantas mais apagar, melhor." },
  { nome: "Desafio do Dominó", descricao: "Montar fileira de dominós e derrubar.", instrucao: "Com 30 peças de dominó, montar uma fileira e derrubar todas de uma só vez." },
  { nome: "Prova da Fruta na Corda", descricao: "Comer maçã pendurada na corda.", instrucao: "Maçãs são penduradas em cordas. Os participantes devem comê-las sem usar as mãos." },
  { nome: "Prova do Pé na Lata", descricao: "Andar com latas nos pés.", instrucao: "Latas são amarradas nos pés como pernas de pau improvisadas. Percorrer o trajeto sem cair." },
];

export async function POST() {
  try {
    const existingAdmin = await prisma.userAdmin.findFirst();
    if (!existingAdmin) {
      const passwordHash = await hashPassword("admin123");
      await prisma.userAdmin.create({
        data: {
          nome: "Administrador",
          email: "admin@jogo.com",
          passwordHash,
        },
      });
    }

    const existingCount = await prisma.challenge.count();
    if (existingCount === 0) {
      for (const prova of provas) {
        const cat = categoriasChallenge[Math.floor(Math.random() * categoriasChallenge.length)];
        const nivel = niveis[Math.floor(Math.random() * niveis.length)];
        const tempo = tempos[Math.floor(Math.random() * tempos.length)];
        await prisma.challenge.create({
          data: {
            nome: prova.nome,
            descricao: prova.descricao,
            instrucao: prova.instrucao,
            categoria: cat,
            nivel,
            tempo,
          },
        });
      }
    }

    return NextResponse.json({ message: "Seed executado com sucesso!" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
