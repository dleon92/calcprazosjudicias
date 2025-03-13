console.log('Desenvolvido por Jivago Delleon Göergen, OAB/RS 114.387.');
console.log('Contato: j.delleon.g@gmail.com');

// Feriados Fixos (data no formato "MM-DD" com motivo)
const feriadosFixos = [
    { data: "01-01", motivo: "Ano Novo" },
    { data: "04-21", motivo: "Tiradentes" },
    { data: "05-01", motivo: "Dia do Trabalho" },
    { data: "09-07", motivo: "Independência" },
    { data: "10-12", motivo: "Nossa Senhora Aparecida" },
    { data: "11-02", motivo: "Finados" },
    { data: "11-15", motivo: "Proclamação da República" },
    { data: "12-25", motivo: "Natal" }
];

// Feriados adicionados pelo usuário (formato { data: "YYYY-MM-DD", motivo: "texto" })
let feriadosUsuario = [];

// Função para converter "MM-DD" para "DD/MM"
function formatarDataFixa(data) {
    const [mes, dia] = data.split("-");
    return `${dia}/${mes}`;
}

// Função para gerar todas as datas do recesso forense (20/12 a 20/01) para um ano específico
function gerarRecessoForense(ano) {
    const feriadosRecesso = [];
    let dataAtual = new Date(ano, 11, 20); // 20/12 (mês 11 é dezembro)
    const dataFim = new Date(ano + 1, 0, 20); // 20/01 do próximo ano

    while (dataAtual <= dataFim) {
        feriadosRecesso.push(dataAtual.toISOString().split("T")[0]);
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    return feriadosRecesso;
}

// Função para calcular a data da Páscoa (algoritmo de Gauss simplificado)
function calcularPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
}

// Função para gerar feriados móveis para um ano específico
function gerarFeriadosMoveis(ano) {
    const pascoa = calcularPascoa(ano);
    const feriadosMoveis = [];
    
    // Sexta-feira Santa (2 dias antes da Páscoa)
    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    feriadosMoveis.push({ data: sextaSanta.toISOString().split("T")[0], motivo: "Sexta-feira Santa" });

    // Carnaval (47 dias antes da Páscoa)
    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    feriadosMoveis.push({ data: carnaval.toISOString().split("T")[0], motivo: "Carnaval" });

    return feriadosMoveis;
}

function desativarOutrasDatas(event, inputAtivo) {
    const teclasNaoDesativam = [
        "Tab", "Shift", "Control", "Alt", "ArrowLeft", "ArrowRight", 
        "ArrowUp", "ArrowDown", "Enter", "Escape"
    ];

    if (!teclasNaoDesativam.includes(event.key)) {
        const inputs = [
            document.getElementById("dataDisponibilizacao"),
            document.getElementById("dataPublicacao"),
            document.getElementById("dataInicioPrazo")
        ];

        inputs.forEach(input => {
            if (input !== inputAtivo) {
                input.disabled = true;
            }
        });
    }
}

function calcularPrazoFatal() {
    const prazoDias = parseInt(document.getElementById("prazoDias").value);
    const dataDisponibilizacao = document.getElementById("dataDisponibilizacao").value;
    const dataPublicacao = document.getElementById("dataPublicacao").value;
    const dataInicioPrazo = document.getElementById("dataInicioPrazo").value;
    const diasUteis = document.getElementById("diasUteis").checked;
    const resultadoSpan = document.getElementById("resultado");

    if (isNaN(prazoDias) || prazoDias < 1) {
        resultadoSpan.textContent = "Informe um prazo válido (número maior que 0).";
        return;
    }

    if (!dataDisponibilizacao && !dataPublicacao && !dataInicioPrazo) {
        resultadoSpan.textContent = "Preencha uma data para calcular o prazo.";
        return;
    }

    let dataInicial;
    if (dataDisponibilizacao) dataInicial = dataDisponibilizacao;
    else if (dataPublicacao) dataInicial = dataPublicacao;
    else dataInicial = dataInicioPrazo;

    const dataTeste = new Date(dataInicial);
    if (isNaN(dataTeste.getTime())) {
        resultadoSpan.textContent = "A data informada é inválida ou incompleta.";
        return;
    }

    let dataAtual = new Date(dataInicial);
    const ano = dataAtual.getFullYear();
    const feriadosMoveis = gerarFeriadosMoveis(ano);
    const feriadosRecesso = gerarRecessoForense(ano);
    const feriados = [
        ...feriadosFixos.map(f => `${ano}-${f.data}`),
        ...feriadosMoveis.map(f => f.data),
        ...feriadosUsuario.map(f => f.data),
        ...feriadosRecesso
    ];

    if (dataDisponibilizacao) {
        // Passo 1: Data de publicação = primeiro dia útil após disponibilização (§ 2º)
        while (true) {
            dataAtual.setDate(dataAtual.getDate() + 1);
            const diaDaSemana = dataAtual.getDay();
            const dataFormatada = dataAtual.toISOString().split("T")[0];
            if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                break; // Encontrou o dia de publicação
            }
        }
        // Passo 2: Início da contagem = primeiro dia útil após publicação (§ 3º)
        while (true) {
            dataAtual.setDate(dataAtual.getDate() + 1);
            const diaDaSemana = dataAtual.getDay();
            const dataFormatada = dataAtual.toISOString().split("T")[0];
            if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                break; // Encontrou o início da contagem
            }
        }
        // Passo 3: Contagem do prazo
        if (diasUteis) {
            let diasContados = 0;
            while (diasContados < prazoDias) {
                const diaDaSemana = dataAtual.getDay();
                const dataFormatada = dataAtual.toISOString().split("T")[0];
                if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                    diasContados++;
                    if (diasContados < prazoDias) { // Avança apenas se não for o último dia
                        dataAtual.setDate(dataAtual.getDate() + 1);
                    }
                } else {
                    dataAtual.setDate(dataAtual.getDate() + 1);
                }
            }
            // Ajuste do vencimento para o próximo dia útil, se necessário (§ 1º)
            while (true) {
                const diaDaSemana = dataAtual.getDay();
                const dataFormatada = dataAtual.toISOString().split("T")[0];
                if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                    break;
                }
                dataAtual.setDate(dataAtual.getDate() + 1);
            }
        } else {
            dataAtual.setDate(dataAtual.getDate() + (prazoDias - 1)); // Dias corridos
            // Ajuste do vencimento para o próximo dia útil, se necessário (§ 1º)
            while (true) {
                const diaDaSemana = dataAtual.getDay();
                const dataFormatada = dataAtual.toISOString().split("T")[0];
                if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                    break;
                }
                dataAtual.setDate(dataAtual.getDate() + 1);
            }
        }
    } else if (dataPublicacao) {
        while (true) {
            dataAtual.setDate(dataAtual.getDate() + 2);
            const diaDaSemana = dataAtual.getDay();
            const dataFormatada = dataAtual.toISOString().split("T")[0];
            if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                break;
            }
        }
        if (diasUteis) {
            let diasContados = 0;
            while (diasContados < prazoDias) {
                const diaDaSemana = dataAtual.getDay();
                const dataFormatada = dataAtual.toISOString().split("T")[0];
                if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                    diasContados++;
                    if (diasContados < prazoDias) {
                        dataAtual.setDate(dataAtual.getDate() + 1);
                    }
                } else {
                    dataAtual.setDate(dataAtual.getDate() + 1);
                }
            }
        } else {
            dataAtual.setDate(dataAtual.getDate() + (prazoDias - 1));
        }
    } else if (dataInicioPrazo) {
        dataAtual.setDate(dataAtual.getDate() + 1);
        if (diasUteis) {
            let diasContados = 0;
            while (diasContados < prazoDias) {
                const diaDaSemana = dataAtual.getDay();
                const dataFormatada = dataAtual.toISOString().split("T")[0];
                if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                    diasContados++;
                    if (diasContados < prazoDias) {
                        dataAtual.setDate(dataAtual.getDate() + 1);
                    }
                } else {
                    dataAtual.setDate(dataAtual.getDate() + 1);
                }
            }
        } else {
            dataAtual.setDate(dataAtual.getDate() + (prazoDias - 1));
        }
    }

    resultadoSpan.textContent = dataAtual.toLocaleDateString("pt-BR");
}

function configurarFeriados() {
    const ano = new Date().getFullYear();
    const feriadosMoveis = gerarFeriadosMoveis(ano);
    const feriadosFixosFormatados = feriadosFixos.map(f => `${formatarDataFixa(f.data)} - ${f.motivo}`);
    const feriadosMoveisFormatados = feriadosMoveis.map(f => `${f.data} - ${f.motivo}`);
    const feriadosUsuarioFormatados = feriadosUsuario.map(f => `${f.data} - ${f.motivo}`);
    const feriadosRecessoFormatados = "20/12 a 20/01 - Recesso Forense";

    let mensagem = "Feriados Fixos:\n" + feriadosFixosFormatados.join("\n") + "\n" + feriadosRecessoFormatados +
                   "\n\nFeriados Móveis (" + ano + "):\n" + feriadosMoveisFormatados.join("\n") +
                   "\n\nFeriados Adicionados pelo Usuário:\n" + (feriadosUsuario.length ? feriadosUsuarioFormatados.join("\n") : "Nenhum") +
                   "\n\nEscolha uma opção:\n1. Adicionar feriado\n2. Remover feriado\n3. Sair";
    let opcao = prompt(mensagem);

    while (opcao !== "3" && opcao !== null) {
        if (opcao === "1") {
            const novoFeriadoData = prompt("Digite a data do feriado (formato YYYY-MM-DD):");
            if (novoFeriadoData && /^\d{4}-\d{2}-\d{2}$/.test(novoFeriadoData)) {
                const dataTeste = new Date(novoFeriadoData);
                if (!isNaN(dataTeste.getTime())) {
                    const novoFeriadoMotivo = prompt("Digite o motivo do feriado:");
                    if (novoFeriadoMotivo) {
                        const novoFeriado = { data: novoFeriadoData, motivo: novoFeriadoMotivo };
                        if (!feriadosUsuario.some(f => f.data === novoFeriadoData)) {
                            feriadosUsuario.push(novoFeriado);
                            alert(`Feriado ${novoFeriadoData} - ${novoFeriadoMotivo} adicionado com sucesso!`);
                        } else {
                            alert("Esse feriado já existe.");
                        }
                    } else {
                        alert("Motivo não pode ser vazio.");
                    }
                } else {
                    alert("Data inválida.");
                }
            } else {
                alert("Formato inválido. Use YYYY-MM-DD.");
            }
        } else if (opcao === "2") {
            const feriadoRemover = prompt("Digite a data do feriado a remover (formato YYYY-MM-DD):");
            if (feriadoRemover && /^\d{4}-\d{2}-\d{2}$/.test(feriadoRemover)) {
                const index = feriadosUsuario.findIndex(f => f.data === feriadoRemover);
                if (index !== -1) {
                    const removido = feriadosUsuario.splice(index, 1)[0];
                    alert(`Feriado ${removido.data} - ${removido.motivo} removido com sucesso!`);
                } else {
                    alert("Feriado não encontrado na lista de feriados adicionados.");
                }
            } else {
                alert("Formato inválido. Use YYYY-MM-DD.");
            }
        } else {
            alert("Opção inválida.");
        }
        const feriadosUsuarioFormatadosAtualizados = feriadosUsuario.map(f => `${f.data} - ${f.motivo}`);
        mensagem = "Feriados Fixos:\n" + feriadosFixosFormatados.join("\n") + "\n" + feriadosRecessoFormatados +
                   "\n\nFeriados Móveis (" + ano + "):\n" + feriadosMoveisFormatados.join("\n") +
                   "\n\nFeriados Adicionados pelo Usuário:\n" + (feriadosUsuario.length ? feriadosUsuarioFormatadosAtualizados.join("\n") : "Nenhum") +
                   "\n\nEscolha uma opção:\n1. Adicionar feriado\n2. Remover feriado\n3. Sair";
        opcao = prompt(mensagem);
    }
}

function resetarCalculadora() {
    const inputs = [
        document.getElementById("prazoDias"),
        document.getElementById("dataDisponibilizacao"),
        document.getElementById("dataPublicacao"),
        document.getElementById("dataInicioPrazo")
    ];
    inputs.forEach(input => {
        input.value = "";
        input.disabled = false;
    });
    document.getElementById("diasUteis").checked = true;
    document.getElementById("resultado").textContent = "";
    document.getElementById("prazoDias").focus();
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        resetarCalculadora();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        calcularPrazoFatal();
        return;
    }

    if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        const currentElement = document.activeElement;
        
        const fieldOrder = [
            "prazoDias",
            "diasUteis",
            "dataDisponibilizacao",
            "dataPublicacao",
            "dataInicioPrazo",
            "calcularPrazoFatal"
        ];

        const currentIndex = fieldOrder.indexOf(currentElement.id);
        if (currentIndex >= 0 && currentIndex < fieldOrder.length - 1) {
            let nextField = document.getElementById(fieldOrder[currentIndex + 1]);
            if (nextField.tagName === "BUTTON") {
                nextField = document.querySelector("button[onclick='calcularPrazoFatal()']");
            }
            if (nextField && !nextField.disabled) {
                nextField.focus();
            }
        }
    }
});