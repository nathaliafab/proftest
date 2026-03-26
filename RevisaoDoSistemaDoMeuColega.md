**Aluno avaliado: Raphael Torres**
(https://github.com/raphaeltcf/Atividade-1-IA-codificada-)

**A revisão do sistema do seu colega deve responder as seguintes perguntas:**
1. O sistema está funcionando com as funcionalidades solicitadas?
2. Quais os problemas de qualidade do código e dos testes?

   R: As rotas listadas do backend (que aparecem em localhost:3000):
   - /api/questoes: funciona, realmente mostra as questões criadas
   - /api/provas: funciona, realmente mostra as provas criadas. Ele optou por deixar a prova inteira como potência ou como letras. No meu caso, ficou a depender da questão. Isso é algo que ficou ambíguo no requisito do PDF.
   - /api/correcao: rota não encontrada. Verifiquei um dos .md e diz que a rota certa é "/api/provas/:id/corrigir", mas essa também não funcionou. Só descobri qual era quando verifiquei na network da página ("/api/correcao/processar")
   - /api/health: funciona, e mostra se a api está acessível

     Outras não listadas:
    - /api/provas/:id/gabarito/csv: cria o csv com o gabarito. Aparentemente só para um tipo de prova (acho que não tem tipos de prova diferentes implementado)
   
    Olhando o código, vi que tem mais rotas além dessas, mas não estão listadas na documentação, então ficou ruim para eu testar/entender.
    
    O frontend não tem rotas, todas as páginas aparecem como localhost.

   Rodando, percebi algumas coisas:
   - ao criar uma questão, ela não aparece de imediato na página, é preciso atualizar e ir para a aba de questões novamente
   - não tem botão para excluir ou editar as questões, mesmo que aparentemente exista rotas para isso
   - ao criar uma prova, a página de provas quebra completamente (fica tudo branco, mesmo atualizando e voltando pra ela), então não consigo avaliar a geração do PDF e afins.
   - ao criar um relatório de notas, não aparece para selecionar dois CSVs, apenas o da resposta dos alunos. Mas, tem como selecionar qual prova se quer corrigir. Ao colocar o formato errado de questão (letras em vez de potência) no CSV, ele mostra que não tem conteúdo para usar. Colocando o formato do CSV certo ele faz a correção. Mas não sei como ele vê o tipo de prova, por exemplo. Notei que ele considerou as respostas meio certas, mesmo estando como rigoroso e completamente errado (a resposta era 20 e coloquei 2)
   - não tem persistencia dos dados ao derrubar o app e iniciar de novo (não era um requisito)
   - existem cenários mas não testes para eles

Em geral, achei o repositório confuso de navegar e rodar devido a quantidade de scripts e arquivos .md

3. Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?

   R: Gosto como ficou a estrutura do código do (frontend e backend), me parece organizado. Eu dividiria em arquivos diferentes o "client/src/services/api.ts", pois tem muita coisa lá dentro. Também deixaria rotas diferentes no frontend, para melhor navegação nas páginas. Achei que tem muitos "console.log()" que não precisavam existir. Gostaria que tivesse algum tipo de persistência dos dados.

---

**A revisão do histórico do desenvolvimento do seu colega deve resumir:**

1. Estratégias de interação utilizada
   
   R: Começou dando um "papel/role" para o agente e iniciou criando a estrutura do repositório e tecnologias que gostaria de usar. Ele quis fazer como um TDD incialmente, criando os cenários Gherkin antes de partir para o desenvolvimento em si. Também foi criando o código pedindo várias coisas/features num único prompt, em vez de prompts separados.
3. Situações em que o agente funcionou melhor ou pior

   R: O agente se saiu mal para fazer a configuração do Docker e para correção de bugs detectados pelo aluno. Ele não conseguiu consertar e introduziu erros que não existiam.
5. Tipos de problemas observados (por exemplo, código incorreto ou inconsistências)

   R: Código para gerar provas não funciona, e o aluno tentou corrigir em ao menos três prompts, mas o problema persistiu
7. Avaliação geral da utilidade do agente no desenvolvimento

   R: Acredito que o agente fez um bom trabalho, considerando os prompts extensos. Acredito que alguns detalhes seriam melhor trabalhados se a tarefa fosse quebrada em etapas menores. O modelo usado não foi dos melhores do Claude, então é um ponto a se levar em conta.
9. Comparação com a sua experiência de uso do agente
    
   R: A quantidade de arquivos .md/scripts/etc "temporários" também ocorreu comigo, mas eu fui excluíndo antes do commit. Ficaria mais simples de acompanhar as features reais do projeto. O aluno fez poucos prompts comparado comigo, o que não é por si só uma coisa ruim. A estratégia dele foi começar o back e depois partir pro front, e a minha foi algo mais gradual por feature.
