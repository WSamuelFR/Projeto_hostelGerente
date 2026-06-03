# hostelGerente - Sistema de Gestão de Hostel

O **hostelGerente** é uma aplicação desktop desenvolvida em **Electron**, **Vue 3** e **TypeScript**, projetada para otimizar e centralizar a administração de hostels de forma rápida, segura e off-line.

O sistema gerencia o ciclo completo de estadia dos hóspedes, cobrindo o controle de quartos, o cadastro de clientes (Pessoa Física e Pessoa Jurídica), o fluxo de usuários (funcionários e administradores) e o registro de entrada e saída (Check-in / Check-out).

---

## 🛠️ Requisitos e Funcionalidades Atuais

1. **Autenticação Segura & Níveis de Acesso:**
   - Controle de permissões baseado em perfil: **Administrador** (acesso irrestrito) e **Recepcionista** (acesso básico às operações).
   - Armazenamento criptografado de credenciais locais (geradas e validadas através de criptografia via PBKDF2/SHA256).

2. **Cadastro e Gerenciamento de Quartos:**
   - Registro de quartos indicando número (único), modelo (simples ou suíte), capacidade de leitos e situação operacional (`'limpo'`, `'sujo'` ou `'manutenção'`).

3. **Cadastro Unificado de Hóspedes:**
   - **Pessoa Física (PF):** Cadastro baseado em nome, RG, CPF (com validação matemática ativa no backend) e contatos.
   - **Pessoa Jurídica (PJ):** Cadastro baseado em Razão Social, CNPJ (com validador básico), Nome Fantasia e contatos.

4. **Gerenciamento de Check-in e Check-out:**
   - Registro de estadias associando um hóspede principal, um quarto livre/limpo e acompanhantes adicionais (salvos na tabela secundária `ocupantes_checkin`).
   - **Fluxo de Saída (Check-out):** Encerramento com preenchimento automático da data/hora de saída e transição automática da situação do quarto para `'sujo'`, liberando-o para a equipe de limpeza.

---

## 🏗️ Organização da Arquitetura Atual (Vite + Electron)

O projeto segue o modelo clássico de divisão de processos do Electron para garantir desempenho nativo e isolamento de privilégios de segurança:

```mermaid
graph TD
    subgraph Renderer Process (Frontend Vue 3)
        UI[Views & Components] -->|Chama Métodos Expostos| API_Bridge[window.api]
    end

    subgraph Preload Script (Ponte de Segurança)
        API_Bridge -->|ipcRenderer.invoke| IPC_Bridge[Preload Secure Bridge]
    end

    subgraph Main Process (Backend Node.js)
        IPC_Bridge -->|ipcMain.handle| Electron_Main[Processo Principal]
        Electron_Main -->|Importa| Controllers[Controllers e Lógicas]
        Controllers -->|Consultas SQL| DB[(Banco SQLite Nativo)]
    end
```

* **Processo Principal (Main Process - `src/main.ts`):** Roda em um ambiente Node.js completo, gerencia o ciclo de vida da janela do aplicativo e atua como intermediário exclusivo com o banco de dados SQLite local.
* **Script de Preload (`src/preload.ts`):** Atua como uma ponte segura de comunicação. Expõe APIs específicas para o frontend (`contextBridge.exposeInMainWorld`) sem dar acesso direto ao Node.js ou ao protocolo IPC para mitigar ataques XSS.
* **Processo de Renderização (Renderer Process - `src/renderer.ts` + Vue 3):** Renderiza a interface reativa da aplicação, servida localmente pelo Vite no modo de desenvolvimento e empacotada como arquivos estáticos para produção.

---

## 📈 Proposta de Evolução, Escalabilidade e Nuvem

Atendendo às diretrizes para expansão do sistema para o ambiente de nuvem corporativa e atendimento Web/Mobile em larga escala, propomos a seguinte arquitetura de destino:

### 1. Sistema Multiplataforma (Web & Mobile)
Para migrar o sistema desktop atual para um ecossistema Web e Mobile centralizado:
* **Frontend Web:** O código do frontend escrito em **Vue 3** e **Bootstrap 5** é 100% compatível com a Web tradicional. O build do Vite pode ser servido em serviços de hospedagem estática e CDN (como *AWS CloudFront + S3*) conectando-se a uma API REST remota em vez de chamadas de ponte IPC.
* **Mobile (Android/iOS):** Utilização do framework **Capacitor** (desenvolvido pela equipe do Ionic). O Capacitor empacotará o mesmo código Vue 3 compilado em uma Webview nativa leve. Através de plugins nativos do Capacitor, a aplicação terá acesso a recursos como Câmera (para leitura de documentos de hóspedes), Notificações Push e Biometria de login.

### 2. Consumo de API (API Gateway / Integrações Externas)
* **API Externa Existente:** O sistema já consome a **BrasilAPI** no cadastro de hóspedes jurídicos (Pessoa Jurídica) para buscar informações cadastrais em tempo real na base da Receita Federal a partir do CNPJ, agilizando o preenchimento e reduzindo erros humanos.
* **Arquitetura de API Remota:** Em ambiente de produção, as comunicações serão mediadas por um **API Gateway** (ex: *AWS API Gateway* ou *Kong*), centralizando a autorização, limitação de taxa (Rate Limiting) e CORS para clientes Web e Mobile.

### 3. Banco de Dados Adequado
* **Ambiente Local (Atual):** O **SQLite** (através da nova API síncrona nativa `node:sqlite` do Node 22+) é ideal por não requerer servidor ativo, gravando todos os dados em um único arquivo portátil no diretório do usuário.
* **Ambiente Escalonado (Web/Mobile):** O **PostgreSQL** é o banco relacional recomendado para a nuvem. Ele suporta alta concorrência com transações seguras (ACID), possibilita replicação em cluster (Leitura/Escrita), integridade forte em chaves estrangeiras e recursos de busca avançados (como indexação JSONB para dados flexíveis de hóspedes).

### 4. Escalabilidade da Aplicação
Para suportar o aumento no volume de acessos globais de várias filiais de hostel:
* **Microserviços:** Separação do backend em serviços independentes e conteinerizados usando **Docker**:
  - `auth-service` (Login, Sessões e Níveis de Acesso)
  - `room-service` (Quartos e Situações)
  - `booking-service` (Reservas e Check-ins)
  - `financial-service` (Faturamento e Vendas Balcão)
* **Orquestração (Kubernetes - EKS/GKE):** Autoescalonamento horizontal (HPA) dos containers com base na utilização de memória e CPU.
* **Caching de Consultas (Redis):** Caching de quartos limpos/disponíveis e de dados estáticos para desafogar o banco de dados principal.
* **Mensageria (RabbitMQ / AWS SQS):** Processamento assíncrono para tarefas lentas, como envio de e-mails de confirmação de check-in ou emissão de notas fiscais.

### 5. Segurança e Nuvem (Cloud Security)
* **Criptografia em Trânsito:** Todo tráfego Web/Mobile operando estritamente em **HTTPS** e **WSS** (WebSockets seguros) com TLS 1.3.
* **Segurança de Acesso:** Substituição do `sessionStorage` por tokens **JWT (JSON Web Tokens)** assinados com chaves assimétricas RS256, com tempo curto de expiração e tokens de refresh armazenados em cookies HTTP-Only seguros.
* **Proteção contra Ameaças:** Implementação de cabeçalhos de segurança (CSP - Content Security Policy) e sanitização rígida contra SQL Injection (usando Prepared Statements nativos do PostgreSQL/Node) e XSS.
* **Infraestrutura em Nuvem (AWS):**
  - **RDS PostgreSQL:** Banco de dados gerenciado operando em Multi-AZ com backups automáticos e replicação ativa.
  - **AWS WAF (Web Application Firewall):** Proteção do API Gateway contra ataques comuns da OWASP Top 10 e ataques de negação de serviço (DDoS).
  - **VPC (Virtual Private Cloud):** Hosting dos microserviços e bancos de dados em sub-redes privadas isoladas do tráfego direto da internet, acessíveis somente através do Bastion Host ou do API Gateway em sub-rede pública.
  - **AWS IAM (Identity and Access Management):** Regra de privilégio mínimo para acesso a logs do sistema, credenciais de conexões e políticas de rede.
