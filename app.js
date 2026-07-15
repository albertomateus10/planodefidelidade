// LÓGICA PRINCIPAL DO APLICATIVO (FIREBASE VERSION)

// Estado da Aplicação
let db = null; // Banco de dados do Firestore
let currentVehicle = null;
let isAdmin = true;
let managerVehiclesList = []; // Cache local de veículos para o dashboard do gestor
let currentFilteredVehiclesList = []; // Lista filtrada de veículos em exibição no dashboard

// Configurações ativas
let activeConfig = {
    firebaseConfig: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    },
    adminPin: "1234"
};

// Elementos do DOM
const elements = {
    // Formulários e painéis
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    registerForm: document.getElementById('register-form'),
    regPlaca: document.getElementById('reg-placa'),
    regChassi: document.getElementById('reg-chassi'),
    regConcessionaria: document.getElementById('reg-concessionaria'),
    regConsultor: document.getElementById('reg-consultor'),
    
    // Autocomplete
    searchSuggestions: document.getElementById('search-suggestions'),

    // Info do Veículo
    vehicleDetails: document.getElementById('vehicle-details'),
    infoPlaca: document.getElementById('info-placa'),
    infoChassi: document.getElementById('info-chassi'),
    infoConcessionaria: document.getElementById('info-concessionaria'),
    infoConsultor: document.getElementById('info-consultor'),
    infoData: document.getElementById('info-data'),
    
    // Modais
    configModal: document.getElementById('config-modal'),
    configForm: document.getElementById('config-form'),
    cfgApiKey: document.getElementById('cfg-api-key'),
    cfgAuthDomain: document.getElementById('cfg-auth-domain'),
    cfgProjectId: document.getElementById('cfg-project-id'),
    cfgStorageBucket: document.getElementById('cfg-storage-bucket'),
    cfgMessagingSenderId: document.getElementById('cfg-messaging-sender-id'),
    cfgAppId: document.getElementById('cfg-app-id'),
    cfgPin: document.getElementById('cfg-pin'),
    closeConfig: document.getElementById('close-config'),
    
    logoMain: document.querySelector('.logo-main'),
    userMenu: document.getElementById('user-menu'),
    
    // Grid e Revisões
    mainBoard: document.getElementById('main-fidelity-board'),
    voucherBoard: document.getElementById('voucher-fidelity-board'),
    
    // Voucher
    btnGerarVoucher: document.getElementById('btn-gerar-voucher'),
    voucherModal: document.getElementById('voucher-modal'),
    closeVoucher: document.getElementById('close-voucher'),
    btnPrintVoucher: document.getElementById('btn-print-voucher'),
    voucherPlaca: document.getElementById('voucher-placa'),
    voucherChassi: document.getElementById('voucher-chassi'),
    voucherConcessionaria: document.getElementById('voucher-concessionaria'),
    voucherConsultor: document.getElementById('voucher-consultor'),
    voucherData: document.getElementById('voucher-data'),
    
    // Dashboard do Gestor
    btnManagerDashboard: document.getElementById('btn-manager-dashboard'),
    managerModal: document.getElementById('manager-dashboard-modal'),
    closeManagerDashboard: document.getElementById('close-manager-dashboard'),
    managerTableBody: document.getElementById('manager-table-body'),
    managerTableEmpty: document.getElementById('manager-table-empty'),
    kpiTotalVehicles: document.getElementById('kpi-total-vehicles'),
    kpiTotalRevisions: document.getElementById('kpi-total-revisions'),
    kpiTopConcessionaria: document.getElementById('kpi-top-concessionaria'),
    kpiTopConsultor: document.getElementById('kpi-top-consultor'),
    filterPlaca: document.getElementById('filter-placa'),
    filterChassi: document.getElementById('filter-chassi'),
    filterConcessionaria: document.getElementById('filter-concessionaria'),
    filterConsultor: document.getElementById('filter-consultor'),
    btnExportExcel: document.getElementById('btn-export-excel'),
    
    // Toast de notificação
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-message'),
    toastIcon: document.getElementById('toast-icon')
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadConfiguration();
    setupEventListeners();
    initFirebase();
    setupLandingScreen();
});

// 0. Controle da Tela de Entrada (Landing Screen)
function setupLandingScreen() {
    const landingForm = document.getElementById('landing-form');
    const emailInput = document.getElementById('landing-email-input');
    const passwordInput = document.getElementById('landing-password-input');
    const confirmPasswordInput = document.getElementById('landing-confirm-password-input');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.querySelector('#landing-btn i');

    let authMode = 'login';

    // Alternar para Login
    tabLogin.addEventListener('click', () => {
        authMode = 'login';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        confirmPasswordGroup.style.display = 'none';
        confirmPasswordInput.required = false;
        btnText.textContent = "Acessar";
        if (btnIcon) {
            btnIcon.className = "fas fa-sign-in-alt";
        }
    });

    // Alternar para Cadastro
    tabRegister.addEventListener('click', () => {
        authMode = 'register';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        confirmPasswordGroup.style.display = 'block';
        confirmPasswordInput.required = true;
        btnText.textContent = "Cadastrar";
        if (btnIcon) {
            btnIcon.className = "fas fa-user-plus";
        }
    });

    // Submissão do Formulário
    landingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        console.log("Formulário submetido. Modo ativo:", authMode);
        const isLocalFile = window.location.protocol === 'file:' || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

        // Bypass/Simulação offline para ambiente local apenas se o Firebase não estiver inicializado
        const useLocalSimulation = !db && isLocalFile;
        if (useLocalSimulation) {
            if (authMode === 'login') {
                if (email.includes('@') && password.length >= 6) {
                    showToast("Login local de teste realizado!", "success");
                    document.getElementById('user-email-display').textContent = email + " (Local)";
                    const landingScreen = document.getElementById('landing-screen');
                    const mainApp = document.getElementById('main-app');
                    landingScreen.classList.add('hide');
                    setTimeout(() => {
                        landingScreen.style.display = 'none';
                        mainApp.style.display = 'block';
                        document.body.style.overflow = '';
                    }, 600);
                } else {
                    showToast("Para testes locais, use um e-mail válido e senha de no mínimo 6 caracteres.", "error");
                }
            } else {
                // Cadastro local simulado
                const confirmPassword = confirmPasswordInput.value;
                if (!email.includes('@')) {
                    showToast("Insira um e-mail válido para o cadastro.", "error");
                    return;
                }
                if (password !== confirmPassword) {
                    showToast("As senhas não coincidem.", "error");
                    return;
                }
                if (password.length < 6) {
                    showToast("A senha deve conter no mínimo 6 caracteres.", "error");
                    return;
                }
                showToast("Conta de teste criada localmente!", "success");
                document.getElementById('user-email-display').textContent = email + " (Local)";
                const landingScreen = document.getElementById('landing-screen');
                const mainApp = document.getElementById('main-app');
                landingScreen.classList.add('hide');
                setTimeout(() => {
                    landingScreen.style.display = 'none';
                    mainApp.style.display = 'block';
                    document.body.style.overflow = '';
                }, 600);
            }
            return;
        }

        if (!firebase.apps.length) {
            showToast("Firebase não está conectado ou inicializado corretamente.", "error");
            return;
        }

        if (authMode === 'login') {
            // Login convencional
            try {
                showToast("Efetuando login...", "success");
                await firebase.auth().signInWithEmailAndPassword(email, password);
                showToast("Login realizado com sucesso!", "success");
            } catch (error) {
                console.error("Erro no login:", error);
                let msg = "Erro ao fazer login. Verifique suas credenciais.";
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    msg = "E-mail ou senha inválidos.";
                } else if (error.code === 'auth/invalid-email') {
                    msg = "Formato de e-mail inválido.";
                } else if (error.code === 'auth/operation-not-allowed') {
                    msg = "O provedor E-mail/Senha está desativado no Console do Firebase (Authentication).";
                } else if (error.message) {
                    msg = error.message;
                }
                showToast(msg, "error");
            }
        } else {
            // Cadastro convencional
            const confirmPassword = confirmPasswordInput.value;

            // Validação de e-mail
            if (!email.includes('@')) {
                showToast("Por favor, insira um e-mail válido.", "error");
                return;
            }

            // Validação de confirmação de senha
            if (password !== confirmPassword) {
                showToast("As senhas não coincidem.", "error");
                return;
            }

            if (password.length < 6) {
                showToast("A senha deve conter no mínimo 6 caracteres.", "error");
                return;
            }

            try {
                showToast("Criando conta...", "success");
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            } catch (error) {
                console.error("Erro no cadastro:", error);
                let msg = "Erro ao criar conta. Tente novamente.";
                if (error.code === 'auth/email-already-in-use') {
                    msg = "Este e-mail já está em uso.";
                } else if (error.code === 'auth/invalid-email') {
                    msg = "Formato de e-mail inválido.";
                } else if (error.code === 'auth/weak-password') {
                    msg = "A senha escolhida é muito fraca.";
                } else if (error.code === 'auth/operation-not-allowed') {
                    msg = "O provedor E-mail/Senha está desativado no Console do Firebase (Authentication).";
                } else if (error.message) {
                    msg = error.message;
                }
                showToast(msg, "error");
            }
        }
    });

    // Login com Google
    googleLoginBtn.addEventListener('click', async () => {
        if (window.location.protocol === 'file:') {
            showToast("O login com Google exige que a aplicação esteja rodando em um servidor local (ex: http://localhost:8000). Use e-mail de teste no formulário.", "error");
            return;
        }

        if (!firebase.apps.length) {
            showToast("Firebase não está conectado ou inicializado corretamente.", "error");
            return;
        }

        try {
            showToast("Conectando com o Google...", "success");
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
            showToast("Login com Google realizado!", "success");
        } catch (error) {
            console.error("Erro ao autenticar com o Google:", error);
            let msg = "Erro ao autenticar com o Google. Tente novamente.";
            if (error.code === 'auth/operation-not-allowed') {
                msg = "O provedor Google Sign-In está desativado no Console do Firebase (Authentication).";
            } else if (error.code === 'auth/unauthorized-domain') {
                msg = "Este domínio não está autorizado no Console do Firebase (Authorized Domains). Adicione-o.";
            } else if (error.message) {
                msg = error.message;
            }
            showToast(msg, "error");
        }
    });
}

// 1. Carregamento das Configurações (config.js ou localStorage)
function loadConfiguration() {
    // Prioridade 1: LocalStorage (configurações salvas pela UI)
    const localApiKey = localStorage.getItem('sm_fb_apiKey');
    const localAuthDomain = localStorage.getItem('sm_fb_authDomain');
    const localProjectId = localStorage.getItem('sm_fb_projectId');
    const localStorageBucket = localStorage.getItem('sm_fb_storageBucket');
    const localMessagingSenderId = localStorage.getItem('sm_fb_messagingSenderId');
    const localAppId = localStorage.getItem('sm_fb_appId');
    const localPin = localStorage.getItem('sm_fb_pin');

    if (localApiKey && localProjectId) {
        activeConfig.firebaseConfig = {
            apiKey: localApiKey,
            authDomain: localAuthDomain || "",
            projectId: localProjectId,
            storageBucket: localStorageBucket || "",
            messagingSenderId: localMessagingSenderId || "",
            appId: localAppId || ""
        };
        activeConfig.adminPin = localPin || "1234";
    } else if (typeof CONFIG !== 'undefined' && CONFIG.FIREBASE_CONFIG) {
        // Prioridade 2: Variáveis definidas no config.js
        activeConfig.firebaseConfig = { ...CONFIG.FIREBASE_CONFIG };
        activeConfig.adminPin = CONFIG.ADMIN_PIN || "1234";
    }

    // Se estiver vazio, exibir modal de configuração inicial
    if (!activeConfig.firebaseConfig.apiKey || !activeConfig.firebaseConfig.projectId) {
        showModal(elements.configModal);
    }
}

// 2. Inicialização do Firebase
function initFirebase() {
    if (!activeConfig.firebaseConfig.apiKey || !activeConfig.firebaseConfig.projectId) {
        showToast("Configure as credenciais do Firebase para conectar o banco de dados.", "error");
        return;
    }

    try {
        // Reinicializa o app se ele já existir (para atualizar as configurações)
        if (firebase.apps.length > 0) {
            // Deleta o app anterior para reinicializar com novas credenciais
            firebase.app().delete().then(() => {
                firebase.initializeApp(activeConfig.firebaseConfig);
                db = firebase.firestore();
                console.log("Firebase reinicializado com sucesso.");
                setupAuthListener();
            });
        } else {
            firebase.initializeApp(activeConfig.firebaseConfig);
            db = firebase.firestore();
            console.log("Firebase inicializado com sucesso.");
            setupAuthListener();
        }
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
        showToast("Erro ao conectar ao Firebase. Verifique suas credenciais.", "error");
    }
}

let authListenerUnsubscribe = null;
function setupAuthListener() {
    if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
    }
    authListenerUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        const landingScreen = document.getElementById('landing-screen');
        const mainApp = document.getElementById('main-app');
        
        if (user) {
            console.log("Usuário autenticado:", user.email);
            
            // Verificar se o usuário está liberado no banco de dados
            if (db) {
                try {
                    console.log("Verificando documento do usuário no Firestore para o UID:", user.uid);
                    const userDoc = await db.collection('usuarios').doc(user.uid).get();
                    if (!userDoc.exists) {
                        console.log("Documento não existe. Criando novo usuário pendente no Firestore...");
                        // Novo cadastro ou usuário sem registro no Firestore
                        await db.collection('usuarios').doc(user.uid).set({
                            uid: user.uid,
                            email: user.email,
                            aprovado: false,
                            created_at: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        console.log("Documento de usuário pendente criado com sucesso no Firestore.");
                        showToast("Cadastro realizado! Aguardando liberação do administrador.", "success");
                        await firebase.auth().signOut();
                        return;
                    }
                    
                    const userData = userDoc.data();
                    console.log("Documento encontrado no Firestore. Status aprovado:", userData.aprovado);
                    if (!userData.aprovado) {
                        showToast("Sua conta está aguardando liberação do administrador.", "error");
                        await firebase.auth().signOut();
                        return;
                    }
                } catch (error) {
                    console.error("Erro ao verificar liberação de usuário:", error);
                    if (error.code === 'permission-denied') {
                        showToast("Erro de permissão no Firebase. Configure as Regras do Firestore para a coleção 'usuarios'.", "error");
                    } else {
                        showToast("Erro de conexão ao validar sua conta.", "error");
                    }
                    await firebase.auth().signOut();
                    return;
                }
            }
            
            document.getElementById('user-email-display').textContent = user.email;
            
            // Transição suave para o App
            landingScreen.classList.add('hide');
            setTimeout(() => {
                landingScreen.style.display = 'none';
                mainApp.style.display = 'block';
                document.body.style.overflow = '';
            }, 600);
        } else {
            console.log("Usuário não autenticado");
            document.getElementById('user-email-display').textContent = "-";
            
            // Exibir a tela de login
            mainApp.style.display = 'none';
            landingScreen.style.display = 'flex';
            landingScreen.classList.remove('hide');
            
            resetVehicleDisplay();
        }
    });
}

// 3. Configuração dos Ouvintes de Eventos (Event Listeners)
function setupEventListeners() {
    // Form de Busca
    elements.searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = elements.searchInput.value.trim().toUpperCase();
        if (!query) return;
        hideSuggestions();
        await searchVehicle(query);
    });

    // ===== AUTOCOMPLETE: Busca em tempo real ao digitar =====
    let autocompleteTimer = null;
    let autocompleteActiveIndex = -1;

    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toUpperCase();
        clearTimeout(autocompleteTimer);
        autocompleteActiveIndex = -1;

        if (query.length < 1) {
            hideSuggestions();
            return;
        }

        // Debounce de 300ms para não sobrecarregar o Firestore
        autocompleteTimer = setTimeout(() => {
            searchVehiclesAutocomplete(query);
        }, 300);
    });

    // Navegação por teclado no autocomplete
    elements.searchInput.addEventListener('keydown', (e) => {
        const dropdown = elements.searchSuggestions;
        if (!dropdown.classList.contains('active')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            autocompleteActiveIndex = Math.min(autocompleteActiveIndex + 1, items.length - 1);
            updateActiveItem(items, autocompleteActiveIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            autocompleteActiveIndex = Math.max(autocompleteActiveIndex - 1, 0);
            updateActiveItem(items, autocompleteActiveIndex);
        } else if (e.key === 'Enter' && autocompleteActiveIndex >= 0) {
            e.preventDefault();
            items[autocompleteActiveIndex].click();
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!elements.searchInput.contains(e.target) && !elements.searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });

    // Form de Cadastro
    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const placa = elements.regPlaca.value.trim().toUpperCase();
        const chassi = elements.regChassi.value.trim().toUpperCase();
        const concessionaria = elements.regConcessionaria.value.trim();
        const consultor = elements.regConsultor.value.trim();

        if (!placa || !chassi || !concessionaria || !consultor) {
            showToast("Preencha todos os campos do veículo.", "error");
            return;
        }

        await registerVehicle(placa, chassi, concessionaria, consultor);
    });



    // Salvar Configurações do Firebase
    elements.configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const apiKey = elements.cfgApiKey.value.trim();
        const authDomain = elements.cfgAuthDomain.value.trim();
        const projectId = elements.cfgProjectId.value.trim();
        const storageBucket = elements.cfgStorageBucket.value.trim();
        const messagingSenderId = elements.cfgMessagingSenderId.value.trim();
        const appId = elements.cfgAppId.value.trim();
        const pin = elements.cfgPin.value.trim() || "1234";

        localStorage.setItem('sm_fb_apiKey', apiKey);
        localStorage.setItem('sm_fb_authDomain', authDomain);
        localStorage.setItem('sm_fb_projectId', projectId);
        localStorage.setItem('sm_fb_storageBucket', storageBucket);
        localStorage.setItem('sm_fb_messagingSenderId', messagingSenderId);
        localStorage.setItem('sm_fb_appId', appId);
        localStorage.setItem('sm_fb_pin', pin);

        activeConfig.firebaseConfig = {
            apiKey,
            authDomain,
            projectId,
            storageBucket,
            messagingSenderId,
            appId
        };
        activeConfig.adminPin = pin;

        hideModal(elements.configModal);
        showToast("Configurações salvas e aplicadas!", "success");
        initFirebase();
    });

    // Fechar modais
    elements.closeConfig.addEventListener('click', () => hideModal(elements.configModal));

    // Abrir modal de configuração ao clicar com botão direito no menu do usuário ou no logotipo principal
    const configTrigger = elements.userMenu || elements.logoMain;
    if (configTrigger) {
        configTrigger.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            elements.cfgApiKey.value = activeConfig.firebaseConfig.apiKey;
            elements.cfgAuthDomain.value = activeConfig.firebaseConfig.authDomain;
            elements.cfgProjectId.value = activeConfig.firebaseConfig.projectId;
            elements.cfgStorageBucket.value = activeConfig.firebaseConfig.storageBucket;
            elements.cfgMessagingSenderId.value = activeConfig.firebaseConfig.messagingSenderId;
            elements.cfgAppId.value = activeConfig.firebaseConfig.appId;
            elements.cfgPin.value = activeConfig.adminPin;
            showModal(elements.configModal);
        });
    }

    // Clique livre no tabuleiro principal para adicionar/remover checks
    if (elements.mainBoard) {
        elements.mainBoard.addEventListener('click', async (e) => {
            // Se clicou em um check existente, remove
            const existing = e.target.closest('.check-mark-free');
            if (existing) {
                if (!currentVehicle) return;
                const idx = parseInt(existing.dataset.index);
                const marcacoes = [...(currentVehicle.marcacoes || [])];
                marcacoes.splice(idx, 1);
                await saveCheckmarks(marcacoes);
                return;
            }

            if (!currentVehicle) {
                showToast("Busque ou cadastre um veículo antes de marcar as revisões.", "error");
                return;
            }

            const marcacoes = [...(currentVehicle.marcacoes || [])];
            if (marcacoes.length >= 10) {
                showToast("Máximo de 10 revisões atingido. Clique em um check para remover.", "error");
                return;
            }

            const rect = elements.mainBoard.getBoundingClientRect();
            const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2));
            const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(2));

            marcacoes.push({ x, y });
            await saveCheckmarks(marcacoes);
        });
    }

    // Event Listener do Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
                showToast("Sessão encerrada!", "success");
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
                showToast("Erro ao deslogar.", "error");
            }
        });
    }

    // Event Listeners do Voucher
    if (elements.btnGerarVoucher) {
        elements.btnGerarVoucher.addEventListener('click', () => {
            if (!currentVehicle) {
                showToast("Busque ou cadastre um veículo antes para gerar o voucher.", "error");
                return;
            }
            
            // Preenche os dados no voucher
            elements.voucherPlaca.textContent = currentVehicle.placa;
            elements.voucherChassi.textContent = currentVehicle.chassi;
            elements.voucherConsultor.textContent = currentVehicle.consultor || '-';
            
            const hoje = new Date();
            elements.voucherData.textContent = hoje.toLocaleDateString('pt-BR');
            
            // Renderiza as marcações (bolas de check) no tabuleiro do voucher
            renderCheckmarks(currentVehicle.marcacoes || [], elements.voucherBoard);
            
            showModal(elements.voucherModal);
        });
    }

    if (elements.closeVoucher) {
        elements.closeVoucher.addEventListener('click', () => {
            hideModal(elements.voucherModal);
        });
    }

    if (elements.btnPrintVoucher) {
        elements.btnPrintVoucher.addEventListener('click', async () => {
            showToast("Gerando PDF em alta definição...", "success");

            const element = document.getElementById('voucher-print-area');

            // 1. Aplica classe que fixa as dimensões A4 Paisagem
            element.classList.add('exporting-pdf');

            // 2. Aguarda o browser recalcular o layout com as novas dimensões CSS
            await new Promise(r => setTimeout(r, 150));

            const opt = {
                margin:      0,
                filename:    `voucher_${currentVehicle.placa || 'san_marino'}.pdf`,
                image:       { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', imageTimeout: 0, logging: false },
                jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // 3. Gera e baixa o PDF
            html2pdf().set(opt).from(element).save()
                .then(() => {
                    element.classList.remove('exporting-pdf');
                    showToast("PDF baixado com sucesso!", "success");
                    setTimeout(() => hideModal(elements.voucherModal), 1000);
                })
                .catch(err => {
                    element.classList.remove('exporting-pdf');
                    console.error("Erro ao gerar PDF:", err);
                    showToast("Erro ao gerar o PDF do voucher.", "error");
                });
        });
    }

    // Event Listeners do Dashboard do Gestor
    if (elements.btnManagerDashboard) {
        elements.btnManagerDashboard.addEventListener('click', () => {
            openManagerDashboard();
        });
    }

    if (elements.closeManagerDashboard) {
        elements.closeManagerDashboard.addEventListener('click', () => {
            hideModal(elements.managerModal);
        });
    }

    if (elements.btnExportExcel) {
        elements.btnExportExcel.addEventListener('click', () => {
            exportManagerDataToExcel();
        });
    }

    // Filtros em tempo real
    const filterInputs = [elements.filterPlaca, elements.filterChassi, elements.filterConcessionaria, elements.filterConsultor];
    filterInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                filterManagerDashboardTable();
            });
        }
    });
}

// 4. Funções do Firestore

// Busca Veículo por Placa ou Chassi
async function searchVehicle(query) {
    if (!db) {
        showToast("Banco de dados Firebase não inicializado.", "error");
        return;
    }

    showLoader(true);

    try {
        const veiculosRef = db.collection('veiculos');

        // Executa duas buscas paralelas (uma por placa e outra por chassi)
        const qPlaca = veiculosRef.where('placa', '==', query).limit(1).get();
        const qChassi = veiculosRef.where('chassi', '==', query).limit(1).get();

        const [snapshotPlaca, snapshotChassi] = await Promise.all([qPlaca, qChassi]);

        let docEncontrado = null;

        if (!snapshotPlaca.empty) {
            docEncontrado = snapshotPlaca.docs[0];
        } else if (!snapshotChassi.empty) {
            docEncontrado = snapshotChassi.docs[0];
        }

        if (docEncontrado) {
            // Mapeia o ID do documento junto com os dados
            currentVehicle = {
                id: docEncontrado.id,
                ...docEncontrado.data()
            };
            displayVehicleData(currentVehicle);
            updateRoadVisuals(currentVehicle);
            showToast("Veículo localizado com sucesso!", "success");
        } else {
            showToast("Veículo não localizado no Firebase. Verifique ou cadastre.", "error");
            resetVehicleDisplay();
        }
    } catch (error) {
        console.error("Erro na busca do Firestore:", error);
        showToast("Erro ao buscar veículo no Firebase.", "error");
    } finally {
        showLoader(false);
        hideSuggestions();
    }
}

// Cadastra um novo veículo
async function registerVehicle(placa, chassi, concessionaria, consultor) {
    if (!db) {
        showToast("Banco de dados Firebase não inicializado.", "error");
        return;
    }

    showLoader(true);

    try {
        const veiculosRef = db.collection('veiculos');

        // Verifica duplicidade no Firestore
        const qPlaca = veiculosRef.where('placa', '==', placa).limit(1).get();
        const qChassi = veiculosRef.where('chassi', '==', chassi).limit(1).get();

        const [snapshotPlaca, snapshotChassi] = await Promise.all([qPlaca, qChassi]);

        if (!snapshotPlaca.empty || !snapshotChassi.empty) {
            showToast("Veículo com esta Placa ou Chassi já está cadastrado.", "error");
            showLoader(false);
            return;
        }

        // Dados padrão para o novo veículo
        const novoVeiculo = {
            placa: placa,
            chassi: chassi,
            concessionaria: concessionaria,
            consultor: consultor,
            marcacoes: [],
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await veiculosRef.add(novoVeiculo);
        
        // Carrega o veículo cadastrado no estado local
        currentVehicle = {
            id: docRef.id,
            ...novoVeiculo,
            created_at: new Date() // Fallback temporário até nova leitura se necessário
        };

        displayVehicleData(currentVehicle);
        updateRoadVisuals(currentVehicle);
        elements.registerForm.reset();
        invalidateVehiclesCache();
        showToast("Veículo cadastrado no Firebase com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao inserir veículo no Firestore:", error);
        showToast("Erro ao cadastrar veículo no Firebase.", "error");
    } finally {
        showLoader(false);
    }
}

// Salva marcacoes no Firestore e re-renderiza
async function saveCheckmarks(marcacoes) {
    if (!db || !currentVehicle) return;
    try {
        await db.collection('veiculos').doc(currentVehicle.id).update({
            marcacoes,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        currentVehicle.marcacoes = marcacoes;
        renderCheckmarks(marcacoes, elements.mainBoard);
        renderCheckmarks(marcacoes, elements.voucherBoard);
    } catch (error) {
        console.error('Erro ao salvar marcações:', error);
        showToast('Erro ao salvar no Firebase.', 'error');
    }
}

// Renderiza os checks livres em um board
// Mapeamento de coordenadas entre tabuleiro principal (nota10.png, paisagem)
// e tabuleiro do voucher (verticalnota10.png, retrato).
// Na imagem vertical, o tabuleiro (pista) ocupa uma sub-região:
//   X: de ~4% a ~96%  da largura  (escala ~0.92, offset ~4%)
//   Y: de ~39% a ~91% da altura   (escala ~0.52, offset ~39%)
const VOUCHER_BOARD_MAP = {
    xOffset: 4,    // % de início horizontal do tabuleiro na imagem vertical
    xScale:  0.92, // fração da largura que o tabuleiro ocupa na imagem vertical
    yOffset: 39,   // % de início vertical do tabuleiro na imagem vertical
    yScale:  0.52  // fração da altura que o tabuleiro ocupa na imagem vertical
};

function renderCheckmarks(marcacoes, boardEl) {
    if (!boardEl) return;
    // Remove checks antigos
    boardEl.querySelectorAll('.check-mark-free').forEach(el => el.remove());

    const isVoucherBoard = boardEl.id === 'voucher-fidelity-board';

    // Adiciona cada marcação
    (marcacoes || []).forEach((pos, idx) => {
        let x = pos.x;
        let y = pos.y;

        // Converte coordenadas do tabuleiro paisagem para a imagem vertical do voucher
        if (isVoucherBoard) {
            x = VOUCHER_BOARD_MAP.xOffset + (pos.x * VOUCHER_BOARD_MAP.xScale / 100) * 100;
            y = VOUCHER_BOARD_MAP.yOffset + (pos.y * VOUCHER_BOARD_MAP.yScale / 100) * 100;
        }

        const el = document.createElement('div');
        el.className = 'check-mark-free';
        el.dataset.index = idx;
        el.style.left = x + '%';
        el.style.top  = y + '%';
        el.innerHTML = '<i class="fas fa-check"></i>';
        boardEl.appendChild(el);
    });
}

// 4.1 Autocomplete - Busca veículos enquanto o usuário digita
let vehiclesCache = null;
let vehiclesCacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minuto de cache

async function searchVehiclesAutocomplete(query) {
    if (!db) return;

    try {
        let allVehicles = [];
        const now = Date.now();

        // Usa cache se disponível e válido
        if (vehiclesCache && (now - vehiclesCacheTimestamp) < CACHE_TTL) {
            allVehicles = vehiclesCache;
        } else {
            // Busca todos os veículos (para coleções pequenas/médias)
            const snapshot = await db.collection('veiculos').get();
            allVehicles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            vehiclesCache = allVehicles;
            vehiclesCacheTimestamp = now;
        }

        // Filtra localmente por placa ou chassi
        const filtered = allVehicles.filter(v => {
            const placa = (v.placa || '').toUpperCase();
            const chassi = (v.chassi || '').toUpperCase();
            return placa.includes(query) || chassi.includes(query);
        }).slice(0, 8); // Limita a 8 resultados

        renderSuggestions(filtered, query);
    } catch (error) {
        console.error('Erro no autocomplete:', error);
        hideSuggestions();
    }
}

function renderSuggestions(vehicles, query) {
    const dropdown = elements.searchSuggestions;
    dropdown.innerHTML = '';

    if (vehicles.length === 0) {
        dropdown.innerHTML = `
            <div class="autocomplete-empty">
                <i class="fas fa-car-crash"></i>
                Nenhum veículo encontrado
            </div>
        `;
        dropdown.classList.add('active');
        return;
    }

    vehicles.forEach(vehicle => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';

        const placaHighlighted = highlightMatch(vehicle.placa || '', query);
        const chassiHighlighted = highlightMatch(vehicle.chassi || '', query);

        item.innerHTML = `
            <div class="autocomplete-item-icon">
                <i class="fas fa-car"></i>
            </div>
            <div class="autocomplete-item-info">
                <span class="autocomplete-item-placa">${placaHighlighted}</span>
                <span class="autocomplete-item-chassi">Chassi: ${chassiHighlighted}</span>
            </div>
        `;

        item.addEventListener('click', async () => {
            elements.searchInput.value = vehicle.placa;
            hideSuggestions();
            await searchVehicle(vehicle.placa.toUpperCase());
        });

        dropdown.appendChild(item);
    });

    dropdown.classList.add('active');
}

function highlightMatch(text, query) {
    if (!query) return text;
    const upperText = text.toUpperCase();
    const index = upperText.indexOf(query);
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    return `${before}<span class="autocomplete-highlight">${match}</span>${after}`;
}

function hideSuggestions() {
    if (elements.searchSuggestions) {
        elements.searchSuggestions.classList.remove('active');
        elements.searchSuggestions.innerHTML = '';
    }
}

function updateActiveItem(items, activeIndex) {
    items.forEach((item, i) => {
        item.classList.toggle('active', i === activeIndex);
    });
    // Scroll into view se necessário
    if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Invalida o cache quando um novo veículo é cadastrado
function invalidateVehiclesCache() {
    vehiclesCache = null;
    vehiclesCacheTimestamp = 0;
}

// 5. Utilitários de UI e Exibição

function displayVehicleData(vehicle) {
    elements.infoPlaca.textContent = vehicle.placa;
    elements.infoChassi.textContent = vehicle.chassi;
    elements.infoConcessionaria.textContent = vehicle.concessionaria || '-';
    elements.infoConsultor.textContent = vehicle.consultor || '-';
    
    // Converte timestamp do Firebase ou data normal
    let dateStr = "-";
    if (vehicle.created_at) {
        const date = (vehicle.created_at.toDate) ? vehicle.created_at.toDate() : new Date(vehicle.created_at);
        dateStr = date.toLocaleDateString('pt-BR');
    }
    elements.infoData.textContent = dateStr;
    
    elements.vehicleDetails.style.display = 'block';
}

function resetVehicleDisplay() {
    currentVehicle = null;
    elements.vehicleDetails.style.display = 'none';
    if (elements.mainBoard) elements.mainBoard.querySelectorAll('.check-mark-free').forEach(el => el.remove());
    if (elements.voucherBoard) elements.voucherBoard.querySelectorAll('.check-mark-free').forEach(el => el.remove());
}

function updateRoadVisuals(vehicle) {
    const marcacoes = vehicle.marcacoes || [];
    renderCheckmarks(marcacoes, elements.mainBoard);
    renderCheckmarks(marcacoes, elements.voucherBoard);
}

function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

let toastTimeout;
function showToast(message, type = "success") {
    clearTimeout(toastTimeout);
    
    elements.toastMsg.textContent = message;
    elements.toast.className = `toast active ${type}`;
    
    if (type === "success") {
        elements.toastIcon.className = "fas fa-check-circle";
    } else {
        elements.toastIcon.className = "fas fa-exclamation-circle";
    }

    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 4000);
}

function showLoader(show) {
    const btn = elements.searchForm.querySelector('button');
    if (show) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search"></i> Buscar';
    }
}

// ===== LÓGICA DO DASHBOARD DO GESTOR (CONSULTA E KPI) =====

async function openManagerDashboard() {
    if (!db) {
        showToast("Banco de dados Firebase não inicializado.", "error");
        return;
    }

    // Limpa filtros antigos
    if (elements.filterPlaca) elements.filterPlaca.value = '';
    if (elements.filterChassi) elements.filterChassi.value = '';
    if (elements.filterConcessionaria) elements.filterConcessionaria.value = '';
    if (elements.filterConsultor) elements.filterConsultor.value = '';

    // Abre o modal
    showModal(elements.managerModal);

    // Mostra indicador de carregamento
    if (elements.managerTableBody) {
        elements.managerTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 10px; display: block; color: var(--brand-green);"></i>
                    Carregando dados do servidor...
                </td>
            </tr>
        `;
    }

    try {
        // Busca todos os veículos
        const snapshot = await db.collection('veiculos').get();
        managerVehiclesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calcula Métricas de KPI
        const totalVehicles = managerVehiclesList.length;
        const totalRevisions = managerVehiclesList.reduce((acc, v) => acc + (v.marcacoes ? v.marcacoes.length : 0), 0);

        // Concessionária Líder
        const concCounts = {};
        managerVehiclesList.forEach(v => {
            const conc = (v.concessionaria || 'Não informada').trim();
            if (conc) {
                concCounts[conc] = (concCounts[conc] || 0) + 1;
            }
        });

        let topConc = 'Nenhuma';
        let maxCount = 0;
        for (const [conc, count] of Object.entries(concCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topConc = conc;
            }
        }

        // Consultor Líder
        const consultorCounts = {};
        managerVehiclesList.forEach(v => {
            const consultor = (v.consultor || '').trim();
            if (consultor && consultor !== 'Não informado') {
                consultorCounts[consultor] = (consultorCounts[consultor] || 0) + 1;
            }
        });

        let topConsultor = 'Nenhum';
        let maxConsultorCount = 0;
        for (const [consultor, count] of Object.entries(consultorCounts)) {
            if (count > maxConsultorCount) {
                maxConsultorCount = count;
                topConsultor = consultor;
            }
        }

        // Atualiza elementos na tela
        if (elements.kpiTotalVehicles) elements.kpiTotalVehicles.textContent = totalVehicles;
        if (elements.kpiTotalRevisions) elements.kpiTotalRevisions.textContent = totalRevisions;
        if (elements.kpiTopConcessionaria) {
            elements.kpiTopConcessionaria.textContent = topConc;
            elements.kpiTopConcessionaria.title = topConc;
        }
        if (elements.kpiTopConsultor) {
            elements.kpiTopConsultor.textContent = topConsultor;
            elements.kpiTopConsultor.title = topConsultor;
        }

        // Renderiza a tabela
        renderManagerDashboardTable(managerVehiclesList);

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        showToast("Erro ao carregar dados do gestor.", "error");
        if (elements.managerTableBody) {
            elements.managerTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: var(--brand-red);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                        Erro ao carregar os dados do Firebase.
                    </td>
                </tr>
            `;
        }
    }
}

function renderManagerDashboardTable(vehicles) {
    if (!elements.managerTableBody) return;
    elements.managerTableBody.innerHTML = '';
    currentFilteredVehiclesList = vehicles;

    if (vehicles.length === 0) {
        if (elements.managerTableEmpty) elements.managerTableEmpty.style.display = 'flex';
        return;
    }

    if (elements.managerTableEmpty) elements.managerTableEmpty.style.display = 'none';

    vehicles.forEach(vehicle => {
        const tr = document.createElement('tr');

        const placaCell = document.createElement('td');
        placaCell.style.fontWeight = '700';
        placaCell.textContent = vehicle.placa || '-';

        const chassiCell = document.createElement('td');
        chassiCell.textContent = vehicle.chassi || '-';

        const concessionariaCell = document.createElement('td');
        concessionariaCell.textContent = vehicle.concessionaria || '-';

        const consultorCell = document.createElement('td');
        consultorCell.textContent = vehicle.consultor || '-';

        const revisoesCell = document.createElement('td');
        revisoesCell.style.textAlign = 'center';
        const numMarcacoes = vehicle.marcacoes ? vehicle.marcacoes.length : 0;
        revisoesCell.innerHTML = `<span class="badge-table-revisions">${numMarcacoes} / 10</span>`;

        const actionsCell = document.createElement('td');
        actionsCell.style.textAlign = 'center';
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-table-action';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> Ver no Tabuleiro';
        viewBtn.addEventListener('click', () => {
            // Carrega veículo no app principal
            currentVehicle = vehicle;
            displayVehicleData(vehicle);
            updateRoadVisuals(vehicle);
            hideModal(elements.managerModal);
            showToast(`Veículo ${vehicle.placa} carregado!`, "success");
        });

        actionsCell.appendChild(viewBtn);

        tr.appendChild(placaCell);
        tr.appendChild(chassiCell);
        tr.appendChild(concessionariaCell);
        tr.appendChild(consultorCell);
        tr.appendChild(revisoesCell);
        tr.appendChild(actionsCell);

        elements.managerTableBody.appendChild(tr);
    });
}

function filterManagerDashboardTable() {
    const valPlaca = elements.filterPlaca ? elements.filterPlaca.value.trim().toUpperCase() : '';
    const valChassi = elements.filterChassi ? elements.filterChassi.value.trim().toUpperCase() : '';
    const valConc = elements.filterConcessionaria ? elements.filterConcessionaria.value.trim().toUpperCase() : '';
    const valConsultor = elements.filterConsultor ? elements.filterConsultor.value.trim().toUpperCase() : '';

    const filtered = managerVehiclesList.filter(v => {
        const matchPlaca = !valPlaca || (v.placa && v.placa.toUpperCase().includes(valPlaca));
        const matchChassi = !valChassi || (v.chassi && v.chassi.toUpperCase().includes(valChassi));
        const matchConc = !valConc || (v.concessionaria && v.concessionaria.toUpperCase().includes(valConc));
        const matchConsultor = !valConsultor || (v.consultor && v.consultor.toUpperCase().includes(valConsultor));
        return matchPlaca && matchChassi && matchConc && matchConsultor;
    });

    renderManagerDashboardTable(filtered);
}

function exportManagerDataToExcel() {
    if (!currentFilteredVehiclesList || currentFilteredVehiclesList.length === 0) {
        showToast("Não há dados disponíveis para exportar.", "error");
        return;
    }

    // Cria os cabeçalhos
    const headers = [
        "Placa",
        "Chassi",
        "Concessionária Vendedora",
        "Consultor",
        "Revisões Realizadas",
        "Data de Cadastro"
    ];

    // Mapeia os dados dos veículos para linhas CSV
    const rows = currentFilteredVehiclesList.map(vehicle => {
        const numMarcacoes = vehicle.marcacoes ? vehicle.marcacoes.length : 0;
        
        let dateStr = "-";
        if (vehicle.created_at) {
            const date = (vehicle.created_at.toDate) ? vehicle.created_at.toDate() : new Date(vehicle.created_at);
            dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
        }

        return [
            vehicle.placa || "-",
            vehicle.chassi || "-",
            vehicle.concessionaria || "-",
            vehicle.consultor || "-",
            `${numMarcacoes} / 10`,
            dateStr
        ].map(val => `"${val.replace(/"/g, '""')}"`).join(";"); // Utiliza ponto e vírgula como separador para compatibilidade direta com Excel BR
    });

    // Concatena cabeçalho e linhas
    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n"); // Adiciona o BOM do UTF-8 para exibir acentuação corretamente no Excel

    // Cria o Blob e baixa o arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    const hoje = new Date();
    const dataFormatada = hoje.getFullYear() + 
                         "-" + String(hoje.getMonth() + 1).padStart(2, '0') + 
                         "-" + String(hoje.getDate()).padStart(2, '0') + 
                         "_" + String(hoje.getHours()).padStart(2, '0') + 
                         String(hoje.getMinutes()).padStart(2, '0');
                         
    const filename = `relatorio_fidelidade_gestor_${dataFormatada}.csv`;

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showToast("Dados exportados com sucesso!", "success");
}
