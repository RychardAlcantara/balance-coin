# 💰 Balance Coin

**Balance Coin** é um sistema de gerenciamento financeiro pessoal desenvolvido com **Next.js**, que permite o controle de contas, cadastro de usuários e gerenciamento de transações de forma prática e moderna.

---

## 🚀 Tecnologias Utilizadas

* **Next.js (App Router)**
* **React**
* **TypeScript**
* **Firebase Authentication**
* **Firebase Realtime Database**
* **Bootstrap 5**
* **Font Awesome**
* **CSS Modules / Estilos globais**

---

## 📂 Estrutura do Projeto

```
balance-coin/
│
├── app/
│   ├── classes/              # Classes responsáveis pelas operações (Usuário, Transações, etc.)
│   ├── dashboard/            # Área logada do sistema
│   ├── minhaconta/           # Página de informações da conta
│   ├── page.tsx              # Página inicial (login)
│   └── layout.tsx            # Layout principal do App Router
│
├── lib/
│   └── firebase.ts           # Configurações do Firebase (Auth e Database)
│
├── public/
│   └── images/               # Imagens utilizadas no sistema
│
├── styles/
│   ├── globals.css           # Estilos globais
│
├── package.json
└── tsconfig.json
```

---

## ⚙️ Instalação e Execução

Siga os passos abaixo para executar o projeto localmente:

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seuusuario/balance-coin.git
```

### 2️⃣ Acessar o diretório

```bash
cd balance-coin
```

### 3️⃣ Instalar dependências

```bash
npm install
```

### 4️⃣ Executar o servidor de desenvolvimento

```bash
npm run dev
```

Após isso, o sistema estará disponível em:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔥 Integração com Firebase

Os arquivos de configuração do **Firebase** estão localizados na pasta:

```
/lib/firebase.ts
```

> Lá são inicializados os serviços de **Autenticação** e **Banco de Dados Realtime** utilizados em todo o sistema.

---

## 🧩 Funcionalidades Principais

### 👤 Usuário

* Registro de novos usuários (Firebase Authentication + Database)
* Atualização de dados do perfil
* Proteção de rotas para usuários autenticados

### 💸 Transações

* Criação de novas transações financeiras
* Edição e exclusão de transações existentes
* Exibição do histórico de movimentações
* Cálculo do saldo total

> Toda a lógica de cadastro, atualização e manipulação de dados é implementada nas **classes dentro de `app/classes`**.

---

## 🧠 Estrutura de Classes (`app/classes`)

As principais classes implementadas são:

* **`Usuario.ts`** – responsável pelo registro, autenticação e atualização dos dados do usuário.
* **`Transacao.ts`** – responsável pelas operações de criação, edição e listagem de transações.

Essas classes interagem diretamente com o **Firebase**, mantendo a lógica de negócio separada da camada de apresentação.

---

## 🎨 Estilos

O projeto utiliza **Bootstrap 5** para componentes visuais e **CSS personalizado** para estilizações específicas.
Os arquivos CSS estão localizados em `/styles`, e são importados globalmente no `app/layout.tsx`.

---

## 🧪 Scripts Disponíveis

| Comando         | Descrição                                  |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Executa o servidor de desenvolvimento      |
| `npm run build` | Gera a build de produção                   |
| `npm run start` | Inicia o servidor em modo produção         |
| `npm run lint`  | Executa a verificação de código com ESLint |

---

## 🧾 Licença

Este projeto foi desenvolvido para fins de estudo e demonstração técnica por [**Rychard Gabriell Santana de Alcantara**](https://www.linkedin.com/in/rychard-alcantara-2870121b1/).
Todos os direitos reservados © 2025.

---

## 💬 Contato

📧 **Email:** [rychardgabriell32@gmail.com](mailto:rychardgabriell32@gmail.com)
💼 **LinkedIn:** [linkedin.com/in/rychard-alcantara-2870121b1](https://www.linkedin.com/in/rychard-alcantara-2870121b1)
💻 **GitHub:** [github.com/RychardAlcantara](https://github.com/RychardAlcantara)

---
