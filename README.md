# Universo Juliette Psicose - Estúdio Criativo Digital

## Visão Geral

Bem-vindo ao repositório oficial do **Estúdio Criativo Digital do Universo Juliette Psicose**. Esta plataforma é uma ferramenta de software sob medida, desenvolvida para ser o centro nevrálgico de toda a criação de conteúdo relacionada à saga "Juliette Psicose e os Psiconautas".

O objetivo é fornecer um ambiente integrado onde a criatividade humana é amplificada pelo poder da Inteligência Artificial generativa do Google (Gemini), permitindo a geração, organização e produção de todos os materiais criativos da saga de forma coesa e eficiente.

---

## Uma Criação de Julio Campos Machado

Este projeto e todo o universo narrativo são uma criação de **Julio Campos Machado**. A plataforma serve como uma ferramenta para expandir e dar vida à sua visão para a personagem Juliette Psicose, suas múltiplas versões e o mundo surreal que ela habita.

---

## Módulos e Funcionalidades Implementadas

A plataforma é estruturada em módulos, cada um focado em um aspecto diferente do processo criativo:

### 🧠 Módulo de Narrativa
- **Criação Interativa via Chat:** Desenvolva HQs, roteiros e contos através de uma conversa com a IA.
- **Geração Multimodal:** A IA não apenas escreve o texto para uma cena, mas também gera esboços visuais correspondentes em tempo real.
- **Gerenciamento de Projetos:** Salve e continue múltiplos projetos narrativos, que são exibidos em formato de cards para fácil acesso.

### 🎨 Módulo de Artes Visuais
- **Gerador de Arte Conceitual:** Crie artes, pôsteres e capas com prompts de texto.
- **Estilo Único da Saga:** A IA é instruída a seguir a identidade visual do universo: surrealismo psicológico, dark, poético e com toques de horror.

### 👥 Módulo de Personagens
- **Fichas de Personagem Guiadas por IA:** Gere fichas completas com aparência, psicologia, poderes e contradições internas.
- **Criação Colaborativa:** Adicione suas próprias ideias e comentários para guiar a IA na criação de personagens que se alinhem com sua visão.

### 🎬 Módulo de Vídeos e Filme
- **Editor de Timeline Interativo:** Crie e organize cenas de vídeo em uma timeline inspirada em editores profissionais.
- **Geração de Clipes com IA (Veo):** Descreva uma cena e a IA gera um clipe de vídeo correspondente.
- **Consistência Visual:** Utilize frames de clipes já criados como referência para manter a consistência de personagens e cenários nas cenas seguintes.
- **Reordenação com Drag-and-Drop:** Organize sua narrativa visualmente arrastando e soltando os clipes na timeline.

### ✨ Funcionalidades Transversais
- **Persistência Local:** Todo o seu trabalho é salvo automaticamente no `localStorage` do navegador, permitindo que você continue de onde parou.
- **Exportação de Conteúdo:** Baixe o histórico de suas narrativas e as fichas de seus personagens em formatos `.txt` e `.json`.

---

## Pilha Tecnológica (Tech Stack)

- **Frontend:** React com TypeScript, estilizado com Tailwind CSS.
- **Inteligência Artificial:** Google Gemini API
  - **Modelos Utilizados:**
    - `gemini-2.5-flash` para geração de texto e JSON.
    - `imagen-4.0-generate-001` para geração de imagens e artes visuais.
    - `veo-3.1-fast-generate-preview` para geração de segmentos de vídeo.

---

## Como Executar o Projeto

1.  **Clone o Repositório:**
    ```bash
    git clone [URL_DO_REPOSITÓRIO]
    cd [NOME_DA_PASTA]
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configure sua Chave de API:**
    - Para a maioria das funcionalidades, a chave de API do Google Gemini deve ser configurada como uma variável de ambiente. Crie um arquivo `.env` na raiz do projeto e adicione:
      ```
      API_KEY=SUA_CHAVE_API_AQUI
      ```
    - Para o módulo de vídeo, a plataforma pedirá que você selecione a chave diretamente na interface, devido aos custos mais elevados de processamento.

4.  **Inicie a Aplicação:**
    ```bash
    npm start
    ```

O aplicativo estará disponível em `http://localhost:3000` (ou outra porta, dependendo da sua configuração).
