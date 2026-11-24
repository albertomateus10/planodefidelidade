po# 🏎️ Plano de Fidelidade San Marino Nota 10

Aplicação web para gerenciamento do Plano de Fidelidade San Marino, com trilha interativa de revisões e banco de dados Firebase Firestore em tempo real.

---

## 🚀 Deploy Rápido

### Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Projeto no [Firebase Console](https://console.firebase.google.com)

---

## 🔥 1. Configurar o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie ou selecione um projeto
3. Vá em **Firestore Database** → Criar banco de dados → Modo de produção
4. Em **Configurações do Projeto** → **Seus aplicativos** → Adicione um **App Web**
5. Copie as credenciais do SDK:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Cole essas credenciais no arquivo `config.js` do projeto

### Regras do Firestore

No console do Firebase, vá em **Firestore → Regras** e cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /veiculos/{veiculoId} {
      allow read: if true;
      allow write: if true; // Ajuste conforme necessário para produção
    }
  }
}
```

---

## 💻 2. Enviar para o GitHub

### Primeira vez (novo repositório)

```bash
# Na pasta do projeto
git init
git add .
git commit -m "feat: inicial - Plano de Fidelidade San Marino"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/plano-fidelidade-sanmarino.git
git push -u origin main
```

### Atualizações futuras

```bash
git add .
git commit -m "feat: descrição da alteração"
git push
```

---

## ▲ 3. Deploy no Vercel

### Opção A — Via Interface Web (Recomendado)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Conecte sua conta GitHub e selecione o repositório `plano-fidelidade-sanmarino`
4. Configurações de Build:
   - **Framework Preset:** `Other`
   - **Build Command:** *(deixe vazio)*
   - **Output Directory:** `.` (ponto)
   - **Install Command:** *(deixe vazio)*
5. Clique em **Deploy** ✅

### Opção B — Via CLI do Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ⚙️ Estrutura do Projeto

```
planodefidelidade/
├── index.html          # Página principal
├── style.css           # Estilos e animações
├── app.js              # Lógica da aplicação e Firebase
├── config.js           # Configurações (Firebase + PIN Admin)
├── firestore.rules     # Regras de segurança do Firestore
├── vercel.json         # Configuração do deploy Vercel
├── package.json        # Dependências do projeto
└── .gitignore          # Arquivos ignorados pelo Git
```

---

## 🔐 Segurança

- O arquivo `config.js` contém as credenciais do Firebase. As credenciais do Firebase **Web SDK são públicas por design** (protegidas pelas Firestore Rules), mas certifique-se que as regras do Firestore estão configuradas corretamente.
- O PIN de administrador é salvo no `config.js`. Para maior segurança em produção, considere usar Firebase Authentication.

---

## 🛠️ Desenvolvimento Local

```bash
npm start
# Acesse: http://localhost:3000
```

---

## 📝 Funcionalidades

- 🔍 Busca de veículo por placa ou chassi
- 📝 Cadastro de novos veículos
- ✅ Marcação de revisões (modo administrador com PIN)
- 🗺️ Trilha interativa com 10 revisões e descontos progressivos
- 🔥 Banco de dados Firebase Firestore em tempo real
- 📱 Design responsivo (mobile-friendly)
