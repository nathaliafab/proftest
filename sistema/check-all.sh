#!/bin/bash

OUTPUT="analise_projeto.txt"

echo "--- RELATÓRIO DE ANÁLISE ESTÁTICA ---" > $OUTPUT
echo "Gerado em: $(date)" >> $OUTPUT
echo "-------------------------------------" >> $OUTPUT

run_tool() {
    echo -e "\n\n>>> Executando: $1..."
    echo -e "\n\n=====================================" >> $OUTPUT
    echo "FERRAMENTA: $1" >> $OUTPUT
    echo "=====================================" >> $OUTPUT
    
    # O segredo está no 'npx --yes', que aceita as instalações automaticamente
    eval $2 >> $OUTPUT 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Concluído sem erros."
    else
        echo "⚠️  Finalizado com alertas/erros. Verifique o .txt."
    fi
}

# --- Execução das Ferramentas com --yes ---

# 1. Biome
run_tool "Biome" "npx --yes @biomejs/biome check --write src"

# 3. TypeScript
run_tool "TypeScript" "npx --yes tsc --project . --noEmit"

# 3. Knip
run_tool "Knip" "npx --yes knip"

# 4. Semgrep
run_tool "Semgrep" "semgrep --config auto src"

echo -e "\n--- PRONTO! ---"
echo "O resultado detalhado foi salvo em: $OUTPUT"