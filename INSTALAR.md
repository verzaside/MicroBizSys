# UGC OS — começar a validação

Versão **1.0.0-beta.2**, estrutura de dados **2**. Esta versão acrescenta a origem do trabalho e dicas de preenchimento nos campos de texto. Os testes locais passaram; instalação Google, autorização, implantação privada e uso em um celular real ainda precisam ser verificados. Use uma planilha de validação antes de adotar registros reais.

## Prévia para começar agora

Abra a prévia local em `http://127.0.0.1:4173/` enquanto o servidor estiver rodando. Ela usa os mesmos cálculos e formulários, com dados fictícios do guia, guardados neste navegador. Não está conectada ao Google Sheets e não sincroniza com outro aparelho. Exporte um backup antes de limpar os dados do navegador.

Para reiniciar a prévia, na pasta do projeto com Node.js instalado, execute `npm run build` e `npm run preview`. O build e os testes não dependem de bibliotecas externas em tempo de execução. O arquivo `dist/ugc-preview.html` também acompanha o pacote, mas o endereço local é o caminho recomendado para testar armazenamento e downloads.

## Instalar na sua planilha Google

### Atualização automática pelo repositório

Depois da primeira configuração, você não precisa mais copiar `Code.gs` ou `Index.html` à mão. O repositório passa a gerar o pacote e enviá-lo ao projeto Apps Script vinculado à sua planilha usando o [Google Apps Script CLI (`clasp`)](https://developers.google.com/apps-script/guides/clasp).

Faça esta configuração uma única vez:

1. Instale o CLI oficial. Neste computador, Node.js e npm já estão disponíveis:

   ```powershell
   npm install --global @google/clasp
   clasp login
   ```

   O login abre o consentimento Google no navegador. Se o CLI informar que a API está desativada, habilite a **Apps Script API** em [script.google.com/home/usersettings](https://script.google.com/home/usersettings).
2. Abra o Apps Script da planilha em **Extensões → Apps Script → Configurações do projeto** e copie o **ID do script**. Ele é diferente do ID da planilha.
3. No terminal, na pasta deste repositório, execute:

   ```powershell
   npm run deploy:google -- --script-id SEU_ID_DO_SCRIPT
   ```

   O comando cria `dist/apps-script/.clasp.json` localmente, gera os arquivos atuais e faz o primeiro `push`. Esse arquivo contém somente o identificador do projeto e fica fora do Git.
4. Para atualizar a instalação depois de qualquer alteração aprovada:

   ```powershell
   npm run deploy:google
   ```

   O `push` atualiza o menu e a interface da planilha. O projeto continua sendo o mesmo, então os dados da planilha permanecem no lugar.

Se você também usa a URL privada no celular, faça uma implantação Web App manual uma vez e copie o **ID da implantação** em **Implantar → Gerenciar implantações**. Na próxima atualização, informe-o ao comando:

```powershell
npm run deploy:google -- --deployment-id SEU_ID_DA_IMPLANTACAO
```

O ID fica salvo apenas em `dist/apps-script/.ugc-deploy.json`; as execuções seguintes fazem o `push` e atualizam essa mesma implantação, criando uma nova versão automaticamente. Para atualizar sem alterar a implantação móvel, use apenas `npm run deploy:google`.

O fluxo automatizado ainda deixa a criação da primeira implantação e o consentimento Google sob seu controle, porque são configurações da sua conta e da sua planilha. O código-fonte legível continua em `src/` e `ui/`; `dist/apps-script/` é o pacote gerado que o CLI envia.

### Instalação manual ou recuperação

1. Extraia `dist/ugc-os-v1-beta.zip`. Crie uma planilha vazia no Google Sheets com sua conta; nome sugerido: **UGC OS — Validação**. Mantenha uma aba comum visível.
2. Nessa planilha, abra **Extensões → Apps Script**. Substitua o conteúdo de `Code.gs` pelo arquivo de mesmo nome da pasta `apps-script` do pacote.
3. Crie um arquivo **HTML**, com nome **Index**, e cole o conteúdo completo de `apps-script/Index.html`.
4. Nas configurações do projeto, habilite a exibição do manifesto `appsscript.json`. Substitua seu conteúdo pelo manifesto do pacote e salve. Ele declara o serviço avançado **Google Sheets API v4**, com identificador `Sheets`.
5. Confira se **Sheets** aparece em Serviços. Com o projeto Cloud padrão, habilitar o serviço avançado também habilita a API. Se você vinculou um projeto Cloud próprio, habilite a Google Sheets API nesse projeto. [Serviços avançados do Google](https://developers.google.com/apps-script/guides/services/advanced).
6. Recarregue a planilha. Use **UGC OS → Abrir UGC OS**. Conclua pessoalmente o consentimento Google quando solicitado. O sistema solicita acesso a planilhas e à interface da planilha; o escopo de planilhas permite acesso amplo, embora este código use somente o ID da planilha vinculada. Não solicita Gmail, contatos, calendário ou Drive.
7. Preencha nome, moeda, formatos e fuso. Para seguir o guia, use **BRL**, **Brasil** e `America/Sao_Paulo`. Depois de haver registros, a moeda fica bloqueada para evitar reinterpretar valores existentes. Ao cadastrar uma campanha, use **Origem do trabalho** para registrar como você soube que aquela oportunidade estava disponível; por exemplo, uma plataforma, indicação ou contato direto. Isso não é o local onde o conteúdo será publicado.
8. Abra **Ajuda e dados** e carregue o exemplo do guia, disponível apenas numa instalação sem registros. Execute a verificação do sistema. Confira os valores no roteiro abaixo.

As abas `_ugc_*` são dados internos ocultos e protegidos com aviso. O proprietário ainda pode modificá-las; use os formulários para preservar as relações. Não é necessário abrir essas abas para trabalhar, exportar ou restaurar.

## Usar no celular

Primeiro abra o sistema pelo menu da planilha no computador, para vincular a instalação. Depois, no Apps Script:

1. Escolha **Implantar → Nova implantação → App da Web**.
2. Configure **Executar como: eu** e **Quem pode acessar: somente eu**. Esse é o modelo de proprietário único desta validação. Confira as opções antes de implantar.
3. Copie a URL da implantação, terminada em `/exec`. Abra no navegador do celular, conectado à mesma conta. A interface personalizada não depende do aplicativo móvel do Sheets.
4. Valide consulta de campanha, alteração de entrega/horas, recebimento e despesa. Reabra no computador e confira a persistência. Internet é necessária.

O manifesto define acesso `MYSELF` e execução `USER_DEPLOYING`; confirme que a implantação manteve essas opções. [Configuração oficial de aplicativos Web](https://developers.google.com/apps-script/manifest/web-app-api-executable). Um projeto Google Workspace pode ter restrições do administrador. Se não permitir o acesso privado necessário, registre o bloqueio antes de mudar a arquitetura.

## Roteiro junto dos capítulos

Leia o capítulo correspondente de `GUIA-RAPIDO.md` (no repositório: `docs/guides/ugc-guia-rapido.md`) e execute o cenário. O guia ensina o método; este documento contém os passos do produto.

| Capítulo | Exercício na ferramenta | Resultado esperado |
|---|---|---|
| 1 | Abra Marca Exemplo, a campanha e suas duas entregas | Relações claras entre marca, campanha e entregas |
| 2 | Confira o recebível e o recebimento parcial | R$ 1.200 combinado; R$ 400 recebido; R$ 800 de saldo |
| 2 | Tente receber R$ 801 | Recusa, sem gravar nem perder os campos do formulário |
| 3 | Confira despesas e horas | R$ 150; 6 h; contribuição de R$ 1.050; receita bruta de R$ 200/h |
| 4 | Crie uma entrega com prazo passado e um recebível com vencimento futuro, numa campanha de teste | Atenção separa entrega atrasada de cobrança vencida |
| 5 | Altere as horas de uma entrega de 3 para 5 | Total 8 h e R$ 150/h; depois retorne a 3 para recuperar a base |
| 6 | Veja a condição de uso e proposta de R$ 300 | Proposta não altera recebido nem saldo; datas de atenção seguem o dia atual |
| 7 | Crie campanha B da mesma marca: R$ 1.800, despesa R$ 600, entrega concluída com 12 h | Marca: contribuição R$ 2.250 e R$ 166,67/h; cálculo ponderado |
| 8 | No celular, consulte a campanha, altere status/horas e registre um recebimento e uma despesa de teste | Uma gravação por ação, valores consistentes no computador |
| 9 | Exporte e restaure numa segunda instalação vazia | IDs, relações, valores e histórico preservados; verificação sem problemas |

O exemplo contém datas fixas de outubro/novembro de 2026. Os alertas da tela usam o dia atual do fuso escolhido; não precisam reproduzir os alertas de uma data hipotética do livro. A prévia local pode conter um recebimento de R$ 100 **anulado**, criado durante o teste de interface; ele preserva o histórico e não altera os valores-base. O exemplo carregado numa nova instalação Google não contém esse teste.

Para corrigir lançamento incorreto, use **Corrigir / anular**, informe o motivo e registre o substituto. Isso preserva o histórico e não movimenta dinheiro. Para anular um recebível, anule antes seus recebimentos. Se uma campanha cancelada impedir uma correção que reabre saldo, reabra a campanha antes.

Cancelar uma campanha não apaga o valor combinado, despesas ou horas já registradas. Ajuste explicitamente o combinado se o acordo mudou, respeitando o total dos recebíveis ativos. Contribuição é combinado menos despesas vinculadas; não é lucro líquido. Despesas gerais aparecem no Financeiro e não são rateadas entre campanhas.

## Backup, recuperação e arquivo corrigido

Em **Ajuda e dados**, exporte o ZIP de CSVs. Guarde o arquivo completo em local sob seu controle. Inclui tabelas de dados, configurações e manifesto; não inclui vídeos, anexos externos nem o programa. Não há backup automático.

Para recuperar ou trocar de arquivo por uma correção: instale a versão compatível numa **nova planilha vazia**, configure-a e use **Restaurar**. Selecione o ZIP original ou todos os CSVs extraídos, incluindo `_backup.csv`. O sistema valida versão, arquivos, campos, valores e relações antes de gravar. Não mescla com dados existentes. Compare campanhas, saldos, contagens e a verificação do sistema antes de passar a usar o novo arquivo; preserve o antigo. Implante uma nova URL privada se trocar de planilha.

CSV é UTF-8, com campos entre aspas, datas ISO e decimais com ponto. Textos que poderiam ser interpretados como fórmulas recebem um apóstrofo de proteção, indicado no manifesto como `apostrophe-v1` e removido pelo restaurador. Essa informação permite usar os arquivos em outras ferramentas sem perder o significado. Backups da beta anterior são migrados para a estrutura 2; a origem fica em branco nos trabalhos antigos. Não edite os CSVs originais do backup para organizar uma importação externa; trabalhe numa cópia.

A restauração desta beta é limitada a conjuntos pequenos (até 5 milhões de caracteres nos CSVs e 6 MB de arquivos). Um ZIP recomprimido pode precisar ser extraído antes da seleção dos CSVs. Versões futuras/desconhecidas são recusadas; não há promessa de migração automática sem uma rotina específica e testada.

## Problemas e revisão

- **Dados mudaram:** feche o formulário, atualize e confira o registro antes de repetir. O sistema bloqueia gravação sobre uma revisão antiga.
- **A resposta não chegou:** mantenha os campos e tente salvar novamente; o formulário conserva o identificador da tentativa. Antes de repetir ações após recarregar a página, confira se o registro já existe.
- **Falha de instalação:** confirme os três arquivos, serviço Sheets e consentimento. Abra uma vez pelo menu da planilha antes da URL móvel.
- **Dados inconsistentes:** baixe o diagnóstico em Ajuda e dados ou na tela de falha. Ele contém códigos, versão e contagens, sem nomes ou valores financeiros. Preserve o arquivo e o backup original.

Registre capítulo, ação, resultado esperado, resultado observado, aparelho e dúvida. O acompanhamento está em `docs/guides/README.md` e `docs/quality/ugc-v1-implementation.md`. Aprovação do texto, teste técnico e sua validação de uso são etapas distintas.
