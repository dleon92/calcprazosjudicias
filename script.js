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

    const dataInicial = dataDisponibilizacao || dataPublicacao || dataInicioPrazo;

    // Validação de entrada
    if (isNaN(prazoDias) || prazoDias < 1) {
        resultadoSpan.textContent = "Informe um prazo válido (número maior que 0).";
        return;
    }

    if (!dataInicial) {
        resultadoSpan.textContent = "Preencha uma data para calcular o prazo.";
        return;
    }

    const dataTeste = new Date(dataInicial);
    if (isNaN(dataTeste.getTime())) {
        resultadoSpan.textContent = "A data informada é inválida ou incompleta.";
        return;
    }

    let dataAtual = new Date(dataInicial);
    const feriados = [
        "2025-01-01", // Ano Novo
        "2025-04-21", // Tiradentes
    ];

    if (diasUteis) {
        let diasContados = 0;
        while (diasContados < prazoDias) {
            const diaDaSemana = dataAtual.getDay();
            const dataFormatada = dataAtual.toISOString().split("T")[0];

            // Conta o dia se for útil
            if (diaDaSemana !== 0 && diaDaSemana !== 6 && !feriados.includes(dataFormatada)) {
                diasContados++;
            }
            dataAtual.setDate(dataAtual.getDate() + 1); // Avança para o próximo dia
        }
        // Volta um dia porque o loop avança além do último dia útil
        dataAtual.setDate(dataAtual.getDate() - 1);
    } else {
        // Dias corridos: Exclui o dia inicial e soma o prazo completo
        dataAtual.setDate(dataAtual.getDate() + prazoDias);
    }

    resultadoSpan.textContent = dataAtual.toLocaleDateString("pt-BR");
}

function configurarFeriados() {
    alert("Funcionalidade de configurar feriados ainda não implementada. Adicione feriados manualmente no código por enquanto.");
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

// Capturar teclas "Enter" e "Escape"
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
            "dataDisponibilizacao",
            "dataPublicacao",
            "dataInicioPrazo",
            "diasUteis",
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