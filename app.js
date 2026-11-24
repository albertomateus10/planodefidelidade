// LÓGICA PRINCIPAL DO APLICATIVO (FIREBASE VERSION)

// Estado da Aplicação
let db = null; // Banco de dados do Firestore
let currentVehicle = null;
let isAdmin = true;
let currentUserRole = 'Consultor'; // 'Gestor' ou 'Consultor'
let managerVehiclesList = []; // Cache local de veículos para o dashboard do gestor
let currentFilteredVehiclesList = []; // Lista filtrada de veículos em exibição no dashboard

function normalizeUserRole(cargo) {
    if (!cargo) return 'Consultor';
    const c = String(cargo).trim().toLowerCase();
    if (c === 'gestor' || c === 'administrador' || c === 'admin') {
        return 'Gestor';
    }
    return 'Consultor';
}

function isCurrentUserGestor() {
    return currentUserRole === 'Gestor';
}

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
    btnEditVehicle: document.getElementById('btn-edit-vehicle'),
    btnDeleteVehicle: document.getElementById('btn-delete-vehicle'),

    // Modal de Edição de Veículo
    editVehicleModal: document.getElementById('edit-vehicle-modal'),
    editVehicleForm: document.getElementById('edit-vehicle-form'),
    editVehId: document.getElementById('edit-veh-id'),
    editVehPlaca: document.getElementById('edit-veh-placa'),
    editVehChassi: document.getElementById('edit-veh-chassi'),
    editVehConcessionaria: document.getElementById('edit-veh-concessionaria'),
    editVehConsultor: document.getElementById('edit-veh-consultor'),
    closeEditVehicle: document.getElementById('close-edit-vehicle'),
    cancelEditVehicle: document.getElementById('cancel-edit-vehicle'),
    
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
    userRoleBadge: document.getElementById('user-role-badge'),
    
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
    toastIcon: document.getElementById('toast-icon'),

    // Painel de Aprovação e Gestão de Usuários
    btnUsersPanel: document.getElementById('btn-users-panel'),
    badgePendingIndicator: document.getElementById('badge-pending-indicator'),
    usersModal: document.getElementById('users-management-modal'),
    closeUsersModal: document.getElementById('close-users-modal'),
    btnCloseUsersFooter: document.getElementById('btn-close-users-footer'),
    tabBtnPending: document.getElementById('tab-btn-pending'),
    tabBtnRegistered: document.getElementById('tab-btn-registered'),
    countPendingTab: document.getElementById('count-pending-tab'),
    countRegisteredTab: document.getElementById('count-registered-tab'),
    panePending: document.getElementById('pane-pending'),
    paneRegistered: document.getElementById('pane-registered'),
    listPendingUsers: document.getElementById('list-pending-users'),
    listRegisteredUsers: document.getElementById('list-registered-users'),
    emptyPendingUsers: document.getElementById('empty-pending-users'),
    emptyRegisteredUsers: document.getElementById('empty-registered-users'),

    // Cadastro e Seleção de Consultores (apenas Gestor)
    btnConsultantsPanel: document.getElementById('btn-consultants-panel'),
    btnManageConsultants: document.getElementById('btn-manage-consultants'),
    btnManageConsultantsEdit: document.getElementById('btn-manage-consultants-edit'),
    consultantsModal: document.getElementById('consultants-modal'),
    closeConsultantsModal: document.getElementById('close-consultants-modal'),
    btnCloseConsultantsFooter: document.getElementById('btn-close-consultants-footer'),
    consultantForm: document.getElementById('consultant-form'),
    newConsultantName: document.getElementById('new-consultant-name'),
    consultantsListContainer: document.getElementById('consultants-list'),
    emptyConsultantsList: document.getElementById('empty-consultants-list')
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadConfiguration();
    setupEventListeners();
    initFirebase();
    setupLandingScreen();
});

// 0. Controle da Tela de Entrada (Landing Screen)
let isGoogleLoginInProgress = false;

function isSameOriginFirebaseHosting() {
    const host = window.location.hostname;
    const authDomain = (activeConfig.firebaseConfig && activeConfig.firebaseConfig.authDomain) || '';
    return Boolean(host && authDomain && host === authDomain);
}

function showLandingLoginBox() {
    const loginBox = document.getElementById('login-auth-box');
    const pendingBox = document.getElementById('pending-approval-box');
    if (loginBox) loginBox.style.display = 'block';
    if (pendingBox) pendingBox.style.display = 'none';
}

function showLandingPendingBox(user, nome) {
    const loginBox = document.getElementById('login-auth-box');
    const pendingBox = document.getElementById('pending-approval-box');
    const nameEl = document.getElementById('pending-user-name');
    const emailEl = document.getElementById('pending-user-email');
    const photoEl = document.getElementById('pending-user-photo');

    if (nameEl) nameEl.textContent = nome || user.displayName || 'Usuário';
    if (emailEl) emailEl.textContent = user.email || '';
    if (photoEl) {
        photoEl.src = user.photoURL || 'logobranca.png';
    }
    if (loginBox) loginBox.style.display = 'none';
    if (pendingBox) pendingBox.style.display = 'flex';
}

function setupLandingScreen() {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const btnPendingLogout = document.getElementById('btn-pending-logout');
    const btnCheckApproval = document.getElementById('btn-check-approval');

    if (btnPendingLogout) {
        btnPendingLogout.addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
                showLandingLoginBox();
            } catch (e) {
                console.error("Erro ao sair:", e);
            }
        });
    }

    if (btnCheckApproval) {
        btnCheckApproval.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) {
                showLandingLoginBox();
                return;
            }
            btnCheckApproval.disabled = true;
            try {
                await validateAuthenticatedUser(user, true);
            } finally {
                btnCheckApproval.disabled = false;
            }
        });
    }

    if (!googleLoginBtn) return;

    googleLoginBtn.addEventListener('click', async () => {
        if (isGoogleLoginInProgress) return;

        if (!firebase.apps.length) {
            showToast("Firebase não está conectado ou inicializado corretamente.", "error");
            return;
        }

        if (window.location.protocol === 'file:') {
            showToast("Abra o sistema via servidor (http://localhost ou URL publicada).", "error");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        isGoogleLoginInProgress = true;
        googleLoginBtn.disabled = true;

        try {
            // Chama signInWithPopup imediatamente no clique para manter a ativação do usuário intacta
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            console.error("Erro ao autenticar com o Google:", error);

            if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
                if (isSameOriginFirebaseHosting()) {
                    try {
                        await firebase.auth().signInWithRedirect(provider);
                        return;
                    } catch (redirectError) {
                        console.error("Erro no redirecionamento Google:", redirectError);
                    }
                }
                showToast("Pop-up bloqueado pelo navegador. Permita pop-ups na barra de endereço para entrar com o Google.", "error");
            } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                // Usuário fechou a janela ou clicou novamente; restaura sem erro
            } else {
                let msg = "Erro ao autenticar com o Google. Tente novamente.";
                if (error.code === 'auth/operation-not-allowed') {
                    msg = "O provedor Google Sign-In está desativado no Console do Firebase (Authentication).";
                } else if (error.code === 'auth/unauthorized-domain') {
                    msg = "Este domínio (" + window.location.hostname + ") não está autorizado no Console do Firebase (Authorized Domains).";
                } else if (error.message) {
                    msg = error.message;
                }
                showToast(msg, "error");
            }
        } finally {
            isGoogleLoginInProgress = false;
            googleLoginBtn.disabled = false;
        }
    });
}

// 1. Carregamento das Configurações (config.js ou localStorage)
function loadConfiguration() {
    const defaultCfg = (typeof CONFIG !== 'undefined' && CONFIG.FIREBASE_CONFIG) ? CONFIG.FIREBASE_CONFIG : {};
    const defaultPin = (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_PIN) ? CONFIG.ADMIN_PIN : "1234";

    // Prioridade 1: LocalStorage (configurações salvas pela UI), usando config.js como fallback por campo
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
            authDomain: localAuthDomain || defaultCfg.authDomain || `${localProjectId}.firebaseapp.com`,
            projectId: localProjectId,
            storageBucket: localStorageBucket || defaultCfg.storageBucket || "",
            messagingSenderId: localMessagingSenderId || defaultCfg.messagingSenderId || "",
            appId: localAppId || defaultCfg.appId || ""
        };
        activeConfig.adminPin = localPin || defaultPin;
    } else if (defaultCfg.apiKey) {
        // Prioridade 2: Variáveis definidas no config.js
        activeConfig.firebaseConfig = { ...defaultCfg };
        activeConfig.adminPin = defaultPin;
    }

    // Se estiver hospedado no próprio Firebase Hosting (.web.app / .firebaseapp.com do projeto),
    // usa o próprio host como authDomain para manter o login mesma-origem sem bloqueio de cookies.
    const currentHost = window.location.hostname;
    const pid = activeConfig.firebaseConfig.projectId;
    if (pid && (currentHost === `${pid}.web.app` || currentHost === `${pid}.firebaseapp.com`)) {
        activeConfig.firebaseConfig.authDomain = currentHost;
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

async function validateAuthenticatedUser(user, isManualCheck = false) {
    const landingScreen = document.getElementById('landing-screen');
    const mainApp = document.getElementById('main-app');

    if (!user) return;

    if (db) {
        try {
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            if (!userDoc.exists) {
                const nome = user.displayName || formatNameFromEmail(user.email);
                await db.collection('usuarios').doc(user.uid).set({
                    uid: user.uid,
                    nome,
                    email: user.email,
                    cargo: 'Consultor',
                    aprovado: false,
                    fotoUrl: user.photoURL || '',
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                mainApp.style.display = 'none';
                landingScreen.style.display = 'flex';
                landingScreen.classList.remove('hide');
                showLandingPendingBox(user, nome);
                showToast("Cadastro realizado! Aguarde a liberação de um Gestor.", "success");
                return;
            }

            const userData = userDoc.data();
            if (!userData.aprovado) {
                mainApp.style.display = 'none';
                landingScreen.style.display = 'flex';
                landingScreen.classList.remove('hide');
                showLandingPendingBox(user, userData.nome);
                if (isManualCheck) {
                    showToast("Seu cadastro ainda está aguardando aprovação do Gestor.", "error");
                }
                return;
            }

            currentUserRole = normalizeUserRole(userData.cargo);
            applyUserPermissions();
        } catch (error) {
            console.error("Erro ao verificar liberação de usuário:", error);
            if (error.code === 'permission-denied') {
                showToast("Erro de permissão no Firestore para a coleção 'usuarios'.", "error");
            } else {
                showToast("Erro de conexão ao validar sua conta.", "error");
            }
            return;
        }
    }

    showLandingLoginBox();
    document.getElementById('user-email-display').textContent = user.email;

    // Iniciar listener de novos usuários pendentes e consultores em tempo real
    setupPendingUsersBadgeListener();
    setupConsultantsListener();

    // Transição suave para o App
    landingScreen.classList.add('hide');
    setTimeout(() => {
        landingScreen.style.display = 'none';
        mainApp.style.display = 'block';
        document.body.style.overflow = '';
    }, 600);
}

let authListenerUnsubscribe = null;
function setupAuthListener() {
    if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
    }

    sessionStorage.removeItem('sm_google_redirect_pending');

    firebase.auth().getRedirectResult().catch((error) => {
        if (!error) return;
        console.error("Erro no retorno do login Google (redirect):", error);
        if (error.code === 'auth/unauthorized-domain') {
            showToast("Este domínio (" + window.location.hostname + ") não está autorizado no Console do Firebase (Authorized Domains).", "error");
        } else if (error.code === 'auth/operation-not-allowed') {
            showToast("O provedor Google Sign-In está desativado no Console do Firebase.", "error");
        } else if (error.code !== 'auth/popup-closed-by-user') {
            showToast("Erro ao concluir login com Google: " + (error.message || error.code), "error");
        }
    });

    authListenerUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        const landingScreen = document.getElementById('landing-screen');
        const mainApp = document.getElementById('main-app');

        if (user) {
            console.log("Usuário autenticado:", user.email);
            await validateAuthenticatedUser(user, false);
        } else {
            console.log("Usuário não autenticado");
            document.getElementById('user-email-display').textContent = "-";
            
            if (pendingUsersUnsubscribe) {
                pendingUsersUnsubscribe();
                pendingUsersUnsubscribe = null;
            }
            if (consultantsUnsubscribe) {
                consultantsUnsubscribe();
                consultantsUnsubscribe = null;
            }
            consultantsList = [];
            populateConsultantSelects();

            if (elements.badgePendingIndicator) {
                elements.badgePendingIndicator.style.display = 'none';
            }

            // Exibir a tela de login
            mainApp.style.display = 'none';
            landingScreen.style.display = 'flex';
            landingScreen.classList.remove('hide');
            showLandingLoginBox();

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
            const clickX = (e.clientX - rect.left) / rect.width * 100;
            const clickY = (e.clientY - rect.top) / rect.height * 100;

            // Encaixa o check na revisão mais próxima do clique
            const rev = findNearestRevision(clickX, clickY);
            if (rev === -1) {
                showToast("Clique sobre uma revisão para marcá-la.", "error");
                return;
            }
            if (marcacoes.some(m => m.rev === rev)) {
                showToast(`A ${rev + 1}ª revisão já está marcada. Clique no check para remover.`, "error");
                return;
            }

            const pos = getRevisionCheckPos(rev);
            marcacoes.push({ x: pos.x, y: pos.y, rev });
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
                jsPDF:       { unit: 'mm', format: 'a4', orientation: 'landscape' }
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

    // Event Listeners do Painel de Aprovação e Gestão de Usuários
    if (elements.btnUsersPanel) {
        elements.btnUsersPanel.addEventListener('click', () => {
            openUsersManagementPanel();
        });
    }

    if (elements.closeUsersModal) {
        elements.closeUsersModal.addEventListener('click', () => {
            hideModal(elements.usersModal);
        });
    }

    if (elements.btnCloseUsersFooter) {
        elements.btnCloseUsersFooter.addEventListener('click', () => {
            hideModal(elements.usersModal);
        });
    }

    if (elements.tabBtnPending) {
        elements.tabBtnPending.addEventListener('click', () => {
            switchUsersTab('pending');
        });
    }

    if (elements.tabBtnRegistered) {
        elements.tabBtnRegistered.addEventListener('click', () => {
            switchUsersTab('registered');
        });
    }

    // Event Listeners de Edição e Exclusão de Veículo
    if (elements.btnEditVehicle) {
        elements.btnEditVehicle.addEventListener('click', () => {
            if (!currentVehicle) return;
            openEditVehicleModal(currentVehicle);
        });
    }

    if (elements.btnDeleteVehicle) {
        elements.btnDeleteVehicle.addEventListener('click', async () => {
            if (!currentVehicle) return;
            await deleteVehicleFromDb(currentVehicle);
        });
    }

    if (elements.closeEditVehicle) {
        elements.closeEditVehicle.addEventListener('click', () => {
            hideModal(elements.editVehicleModal);
        });
    }

    if (elements.cancelEditVehicle) {
        elements.cancelEditVehicle.addEventListener('click', () => {
            hideModal(elements.editVehicleModal);
        });
    }

    if (elements.editVehicleForm) {
        elements.editVehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveEditedVehicle();
        });
    }

    // Event Listeners de Cadastro e Gestão de Consultores (apenas Gestor)
    [elements.btnConsultantsPanel, elements.btnManageConsultants, elements.btnManageConsultantsEdit].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => openConsultantsModal());
        }
    });

    if (elements.closeConsultantsModal) {
        elements.closeConsultantsModal.addEventListener('click', () => hideModal(elements.consultantsModal));
    }

    if (elements.btnCloseConsultantsFooter) {
        elements.btnCloseConsultantsFooter.addEventListener('click', () => hideModal(elements.consultantsModal));
    }

    if (elements.consultantForm) {
        elements.consultantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleConsultantCreate();
        });
    }
}

// Aplicar permissões visuais de acordo com o nível do usuário (Gestor vs Consultor)
function applyUserPermissions() {
    const gestor = isCurrentUserGestor();

    if (elements.userRoleBadge) {
        elements.userRoleBadge.textContent = currentUserRole;
        elements.userRoleBadge.className = `user-role-badge ${gestor ? 'role-gestor' : 'role-consultor'}`;
        elements.userRoleBadge.style.display = 'inline-flex';
    }

    if (elements.btnDeleteVehicle) {
        elements.btnDeleteVehicle.style.display = (gestor && currentVehicle) ? 'inline-flex' : 'none';
    }

    // Botões de cadastro de consultor visíveis apenas para Gestores
    if (elements.btnConsultantsPanel) {
        elements.btnConsultantsPanel.style.display = gestor ? 'flex' : 'none';
    }
    if (elements.btnManageConsultants) {
        elements.btnManageConsultants.style.display = gestor ? 'inline-flex' : 'none';
    }
    if (elements.btnManageConsultantsEdit) {
        elements.btnManageConsultantsEdit.style.display = gestor ? 'inline-flex' : 'none';
    }

    // Se o modal do relatório geral estiver aberto, re-renderiza a tabela para refletir o botão de excluir
    if (elements.managerModal && elements.managerModal.classList.contains('active')) {
        renderManagerDashboardTable(currentFilteredVehiclesList);
    }
}

// Abrir modal de edição de veículo (disponível para Gestor e Consultor)
function openEditVehicleModal(vehicle) {
    if (!vehicle || !elements.editVehicleModal) return;
    elements.editVehId.value = vehicle.id || '';
    elements.editVehPlaca.value = vehicle.placa || '';
    elements.editVehChassi.value = vehicle.chassi || '';
    elements.editVehConcessionaria.value = vehicle.concessionaria || '';
    populateConsultantSelects(vehicle.consultor || '');
    elements.editVehConsultor.value = vehicle.consultor || '';
    showModal(elements.editVehicleModal);
}

// Salvar edição das informações do veículo no Firestore (permitido para Gestor e Consultor)
async function saveEditedVehicle() {
    if (!db) {
        showToast("Banco de dados Firebase não inicializado.", "error");
        return;
    }

    const id = elements.editVehId.value.trim();
    const placa = elements.editVehPlaca.value.trim().toUpperCase();
    const chassi = elements.editVehChassi.value.trim().toUpperCase();
    const concessionaria = elements.editVehConcessionaria.value.trim();
    const consultor = elements.editVehConsultor.value.trim();

    if (!id || !placa || !chassi || !concessionaria || !consultor) {
        showToast("Preencha todos os campos do veículo.", "error");
        return;
    }

    try {
        await db.collection('veiculos').doc(id).update({
            placa,
            chassi,
            concessionaria,
            consultor,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Atualiza veículo ativo na tela principal se for o mesmo
        if (currentVehicle && currentVehicle.id === id) {
            currentVehicle = {
                ...currentVehicle,
                placa,
                chassi,
                concessionaria,
                consultor
            };
            displayVehicleData(currentVehicle);
        }

        // Atualiza lista local do relatório geral se carregada
        const idx = managerVehiclesList.findIndex(v => v.id === id);
        if (idx !== -1) {
            managerVehiclesList[idx] = {
                ...managerVehiclesList[idx],
                placa,
                chassi,
                concessionaria,
                consultor
            };
            updateManagerKpisFromList();
            filterManagerDashboardTable();
        }

        invalidateVehiclesCache();
        hideModal(elements.editVehicleModal);
        showToast("Informações do veículo atualizadas com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao editar veículo:", error);
        showToast("Erro ao salvar alterações do veículo.", "error");
    }
}

// Excluir veículo do banco de dados (PERMITIDO APENAS PARA GESTOR)
async function deleteVehicleFromDb(vehicle) {
    if (!isCurrentUserGestor()) {
        showToast("Apenas usuários com nível Gestor podem excluir veículos do banco de dados.", "error");
        return;
    }

    if (!db || !vehicle || !vehicle.id) return;

    const confirmed = confirm(`Tem certeza que deseja excluir permanentemente o veículo de placa "${vehicle.placa || '-'}" do banco de dados?`);
    if (!confirmed) return;

    try {
        await db.collection('veiculos').doc(vehicle.id).delete();

        if (currentVehicle && currentVehicle.id === vehicle.id) {
            resetVehicleDisplay();
        }

        managerVehiclesList = managerVehiclesList.filter(v => v.id !== vehicle.id);
        updateManagerKpisFromList();
        filterManagerDashboardTable();
        invalidateVehiclesCache();

        showToast(`Veículo ${vehicle.placa || ''} excluído do banco de dados!`, "success");
    } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        showToast("Erro ao excluir veículo do Firebase.", "error");
    }
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

// Centro (em %) do círculo de cada uma das 10 revisões na imagem nota10.png
const REVISION_CENTERS = [
    { x: 38.4, y: 26.2 }, // 1ª
    { x: 55.3, y: 26.2 }, // 2ª
    { x: 71.4, y: 26.2 }, // 3ª
    { x: 82.2, y: 40.0 }, // 4ª
    { x: 63.5, y: 48.4 }, // 5ª
    { x: 46.2, y: 48.4 }, // 6ª
    { x: 29.2, y: 54.7 }, // 7ª
    { x: 41.2, y: 68.9 }, // 8ª
    { x: 55.6, y: 68.9 }, // 9ª
    { x: 71.0, y: 68.9 }  // 10ª
];
// Deslocamento vertical (em % da altura) do check em relação ao centro do círculo (0 = centralizado)
const CHECK_OFFSET_Y = 0;
// Proporção da imagem (largura/altura) para calcular distâncias reais
const BOARD_RATIO = 2480 / 1748;

// Posição do check (em %) acima do círculo da revisão informada
function getRevisionCheckPos(revIndex) {
    const c = REVISION_CENTERS[revIndex];
    return { x: c.x, y: parseFloat((c.y - CHECK_OFFSET_Y).toFixed(2)) };
}

// Retorna o índice da revisão mais próxima de um ponto (em %) ou -1 se estiver longe demais
function findNearestRevision(x, y, maxDist = 9) {
    let best = -1;
    let bestDist = Infinity;
    REVISION_CENTERS.forEach((c, i) => {
        const dx = (x - c.x) * BOARD_RATIO; // normaliza para a mesma escala do eixo Y
        const dy = (y - c.y);
        const d = Math.hypot(dx, dy);
        if (d < bestDist) { bestDist = d; best = i; }
    });
    return bestDist <= maxDist ? best : -1;
}

const CHECK_ICON_FALLBACK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEuSSURBVHhe7V0HmBRF017izSwoZr/v9zOROeBgZ+YAEcUAZhQz5ggocFycDXfAkXPOCAhKzqKiRFFAgiBBggQJgiA553D1P1UzszfXu5dn7/Z2++3nfTh2Zyf0dFV3V1dX2WwcHBwcHBwcHBwcHBwcHBwcHBwcHBxFGKm24rbEqDI3uaNvtydL/41IrPMg0p4UXVtUoxW7W5KRouqgvyOSpAoRKXUeFONr3VM2Qb7DltqwrG366yXY03JwcAQByiRG3VXWUzvSnuR4xu6UmgtuOUVwSiMEp/SNqErLBae8SVSl3YJTOiKo0hlRla4RnTKILj9Upev692cFVT4qqvJewSltFp3SckGVvhec0mjRJXcUVfkzMdHRpIxTqmlPiv4PKRoODo7AoJy7wa12VZIE1fGe6FK6ooALTnmD4JSOkTAnR4O9Q12wp9bV/u1QB8T2dUBsF03fiR6kAqLbRJcfGt/hsUj8bUo0ncuONK6RWlf73CWDoMonRaf0h+iU5oluuXeEU/5EdMp1yiQ+dBf7HBwcHNkhNbV4aVWpIrild0S30ldUpaWCSz5IAopCiAJoCLch1Nh7oyIoSNKoQVcUKdGagiAFVIfuiZSTKq8UXPKwCLfyUZkkR5QttaHAPi4HR9gjwu2oGJEc/aHolseJLnmL6JSuewUKhR17YhQ2VgiDlagcUDG0MykF7budokuZLDrllmUSlRp86sARnmgVWTZCjX5SdMq9BZe0RnTJl1FIvENr7NVZoSrqxGfCkYI+jRCd8g20LwiqNMTujn4BDZVsNXFwhAxuS61zs+iSXxJdyhjRKe8jYUBBaKcNmX0EJtRpKAS9DgSX/C+ODgSP9Da3H3CEBlIjS0d45MaCWxotqPIBY0isDen9CEW4EutCN2SKHUgZHBVd8hTRJb1sU+vfxFYrB0dQA4149mSpveiWt3h7OS70OadHSR8dOeW9okfph34KbD1zcAQPUiNLiy7lVcElfye6lcvmpTKfBs6Zc+LIAOvSraSJHnmR4JQ+sLnkcmz1Z4W0tLTKaWlpn6elpX2RlpY2LS0tbUBaWprCHsfBkWugI4zglhMEt7yZhvj6MphPQ+bMH12K1xdBdMn7RLfcCb0a2fdhRlpa2kNpaWmL0tLSLgID/TM+quDIG3DpTvRE9xHcyhFtuBrt22g5A0NjVOCSz4seZbTdpTjM7wZ797S0tJFpaWnnTQJ/w8Tr+mcTzb/j4MgWpT1yVdEjjxJdygV7R31uzzZQzoKhbiso6ax93dbininq1NTn0tLShqGQZyL4Xurf7QKAUuw75uDwQWmno5qYrIwRXfIl6n3Q0YVtkJwFRrtLgRKJtcDWqjxEJEVBwtwucPLSCUPu/Qk+glUA2wCgJPuuOTi8EBId9wseeYDoVi7oxiifxshZ8LTFVoU7PHWh+49DYO3eDV7Bv5F2g5iWlobMFLoC6Mu+bw4ODTF1bra7otsJHuUYDfV5jx8ULK06wNamAlTp9CSs2rUmvceHNE3w/RX/wn81LS2tCvvaOThstBHHo+zwrt/7aYicBc+SOORvWwUSpneEE2ePZRB8b8+fVcmoADqw750jzIFbbkWP8iN6o3GrfjBRAVtcJBRvWwWGLhnr7fWzFXg/RRf+Gey75whnqFVuEt1KD9GjXNbXmf00Qs7Coi2mClTv+jQs3rI038K/+9geeKDT4xNtn9x1N9sMOMIQdqf0vOhWttI8nxv4gooRqgS2zx+AJwe9A8fPHNV676zm+lkU7cc34KnB74EtqSoIHuUgeRVyhCfKuWveKriVkeSuq/mccwYJ7TjfT6pFxr4WE11w+vwpb6+fZ+EHgP4LR4CtTUWMYqRvTa4DgluZEZEYlaVHIUeIISJJekp0K3/yXj/4aHcqUDyhJpSIrQb9Fgz3Cm9ehR8LYtyKKVA8tiqUSqqdfj2XbOwzOCqo0jtsO+EINbSQS4luuRtZ9nmvH3RE4bfFVwcxoSZMWjXTR/hzqwDweMT2g9vhZtUBxeJr0DXY6xohzUSPPLZcbK1b2GbDEQIoHeuoJrqVZbzXD06S8MdVg9tdCszftIgE1xDi/Aj/mfMnIbp3U7C1repf+A3iZiNy7Va2Cknyw2z74SjCEFT5LdGjnCQLP/viOQud6NaL6/v3tX8U1u5epwl/Wkbhz40CMIQfblyH10a1JFtCjld2aCSgXBVdcjzbjjiKHooLTqU/vVTu0BOkVMAWWw2qd3mahur5GfKbC6LrvIFga10eBJ9rZkMjIIlLmXhbTJ2b2UbFUQQgqo7/E93RC/mQP3hJPX9sJNyiOmC97s9vlfBvPbAVIuKr02oCe90cEQ2EHeth29lQKq5WdbZ9cQQxxMTa0aJH2alHn+UMQmrCXxUe6NAQ1u753VLhP3bmKDzS/00aWbDXzS1pqTBZOY6ZkNh2xhGEEFX5dTFZOUtWXT8vlLPwScIfUxnubdcAth3YSkJrnvOzQp1dMX6HuHr1EjQa/C7YWleg6QV77TwRfUVwCqlKsWx74wgiCE45wfuy2JfIGRwkg19lqNKpEfxu0bDf+J133t/qwdzP+7Mj2gU61EUnogFsu+MIAghupT9Z+fm23aAmCmfVzo1h7+Hdlgg/FW2DH3y7/geIiK+R0dnHShpLhW5lui2mYgTbBjkKA6kNS4pOeSK9mKKUPivMKDglsMVUgueGfgh/McLvI9C5LIgZv82FMglR5EWIrsTs9a2krgSW3BwfeRvbHDkKEi1kO4bhtnfiO/iCmTgcxzn5R18l0dq8VcJvzPt/270OxIQaYMvM0y8ARCUguJW1Ynyte9hmyVEQcMnlRLfyE2ljPy+IMzhIwt/qQXh2yPtw7dplr/CzwpyXgkBPP6XXS+RIVFDCb1DfR7AtIrbWA2zz5AgkPq95q+iRV3LhD26S8LepBO9+GQtnL5y2rOfHgrh85SI8M+QDmlqw1y4oUh4Ij7ILs0GxzZQjEIjBJJvKCi78wU2t5y8Pzwx5H25cu2q58CM8s3tQvADLLf65pJYMRt4TEe+oyDZXDiuRGFVGdMq/cOEPbpLwx1SGxoPehRN6IA8rhN84B+L7jfOhRFxk4Cz+uaSeEWonnw4ECi1ku+iSF3PhD3Yq1PO/MOxjuHT5QkCEf/2e9XCrKhWIxT831JehtwkJyr1s8+XIDzDxplP+kQt/sFOhiDvRPV+EI6f+zSD8eVEA5t8awn/uwmmo1/vlQjH65YR6TMnNNnf07Wwz5sgjRKc0iZb6/FQ4Z7AQ3XsrwZMD34ajpw5b0vOzwo/48KtE2uFnmZtvAKjnLVxmS5XtbFvmyCUEVRpk71SPr/MHM3X33ppdn4WjpzMKv5UKYNTPX5FtobQq+d5DkJH8BJzSHFuqrTjbpjlyCEGVXbo29algzuAgRfKJrQYVUx+H3Yf/Cpjwz/9jMZSMrUbJQdh7CFbidmJBlYaz7ZojBxASHc0obh/37Q9aajH8asDNSQ5Ytm2ZV/hZYc5rMYT/6tXLoPR8MWjn/ZlSDzqKHRnbvjmygOiU64ie6At8V19wE63wYmItmP/HEk34b1z3EeL8FkTijM6F6uyTL2IwGuzIVPl1tp1z+IEWyUfeT2G82MrkDApiL0ypuWMqwaRVM0hIMeO2lb0/FsTwpePI6IdJQtj7KDLELeoe5Zw9qVZttr1zmIFhu53yzzyST3AT5+El4yJh/IopmvDnMVtPVgWBYb1u1fMEsPdQ5Kh1aLts8fX4DsLMIKjSYIrDxlZeGBC950om1QZbXHUKlYXzXfo3LpLi2hW2u6tB9LxDR5+RP4/XhT//y31sQRw9cwSiuj1HdVCk5v1ZkFYGVOl7tt1zoPAn1X6f3CnDbE8/5btHYW9TCW51R4PUuym8OPwTaDa6Fbw44hNQ+rwCd3jq0fIXCkOEs/CGwqWSHDTs7zi3DwkpIhDCj3hvXBztIgy19kDObImOjmz7D2uUSlRq4BwpfIx+itaTxlSGkvHVoenIFvD1yumw69+dFNPOjOvXrsDfR/fChJXT4akh7+sjg/wHu8wtS2Cuvtbloev3/b33ZqXgYzGAowv0KCzS8/7M6FbAnhINEQnS06wchCfi64mCU94QLkk7KCAmpr9SJXhy8HsUxoqFP6HQvkiDscsmQa0eTSjTTUEICA6/SyZGQam4SGg7vaP3VqwWfiyIlbvWwC20whDlcy8hw5RoEFzKoTKeGjxFuZCkDAkXH38jFPY9yfVh0ZafTZLtK1BmRxizQwzi2tVL0GZKO4qyE6E6fK5jJdH+gAa/qatnZXqvVhTEih2roExCTd3oF1pDf5a6PeBbVh7CChhr3Y5rpGGQuIOcZtpWhcqdnoTN+zfnSZhYRUDr463Lkx2BvZ4VpDn/5w9Azx+HZLjf3NxzTgriypWLeg6/Kj73EZI0MhMnOWJYuQgLlE2Q78BhEK2RspUTcsTEl9Xh/vaPwo6DO/ItSGYlEDe9E82XrfaPJ+NkbFXo9F2/gAs/ovXkZHoO9j5Cmh7yD7hYxhkdfpmHRFWaFC5DfzT4lY6vDkv0Yb8VgmRWArFTO+jTAWuUAAX0+PwBSJrR2XsNK+7Zt2gYtOgLWlq06v6LEmnlyymvtIGtGCsjIQvR6XiFMveEwSYfLTpOJej+w2Bq7PnJgGMuGaYDaTd0m0AeEmH6IZ6n6cjmcEVfkcjvvWZWEJv3b4FyqgQlEkPY6JcNyR6QJLtZOQlJ3Bxf7zbBJR/ApRC2IkKRaNB6sOMTcO7iGct7UrMSuH7tKrwztm0+Y+QpYGtdEZqOaJ7hftnr5qcY50NcvnIB6gRxcI8CI254cyuXSzsd1Vh5CTmISdLocBn6I9HBp9XkFK2jDoDLrFkJXLh0Dt4a04bm0rlXAlq+Prnni3Di7LGACb9ZAbhnd6OpS+7vNfSou78vZuUlpBCRKD9GRj+3bwWEIikbTtvKMO23b7wKIFDFUAI3rl+D1774PFcGNWNPP65QoNNRIITfKMZ9jgiFTT4WE5VAhFP5iJWb0EBqw5KCKm0Mp11+2LhLJdSEVX/9ViAKwBCuwycPQaWOT+pLalkPrVH4i2FwzcQoWP7nCq/wB0oBIDCZx/0dHgVbXA2f+wlrooOQUz6MK2Ss+BR5iKojPpyG/khcR79ZdcDW/VsKTAEYSmDvkT1Qq/tzmhLIwp8ed/aViq8Os9Z9r92jbqRkz5+fYr4vxKcTnDTdYO+F0wglJg9j5adIw54U/R/BJZ8UkzNviKHIUqoDyiTVhk37NgVcAWBhlcDfR/eR7wFOQ9AL0ef+9J19OBwP1P2l35PW+w9ZPAZsMdb7LYQM0SnOo1y3q5LEylGRhaBKI8Ot90cKqgTFYqvB/M1axBxWOAJVzEpg5c41cH/7BtoGIpMSIEefmErQZ/5QvV8OzP2Z72X93g1QNjEqrJf8ckLaF6NKi1g5KpIo5apdS3Qr18LB3dcf0RjXWd9BxwpHoIsheNv/+RPua/8IxRbAOT/aJrDnbzenZ0CFH4txDxcvndOTeIbO/v6AEd2E29cBuyq9wMpTkYOQJH0fzhF+UOge7v8GOesgrJ5fZ1XMve/CLT+BgMFG4iLB1qYCvDmmDToPFMg9IVLn9rHMUSks2L4OriJtQuM5K1NFBt5lvzDw+MuM2NsWa1sVputLgYZQskISqELX0uffCzYvgTtUB7w/Ph5uXE9P2Mn+xsqCGLd8MhRvWyVgm5ZCldhx2p2OorssKKrSL7qvc1izWHwNeDD1MThw7O8CETq/RVcCOB04f+lswO/DGHkcOvEP3OGuQ+HD2XrhzIbtojGa8C5bakOBla2gh90pPW3HBwjj3t9LPXPOo/1eJ2+9QAufv2KeDhjXD+Q9ENLS4K2xMfqSH5/354Wa8Vz6nJWvoIeoSr/y3j8j0e0VY92hYBS0EjAEniV7nFUF0fm7/nl0S+b0EqfQqrS7SI0CItzSUxTog/f+GUiuwW0qQusp7TL0xKzwBKKwgh9IBYBYuu0XLZVXUm2feuDMHTVbgPwJK2dBCzFJWhwuMf5yS3SAwWi32DvmRAlYLaxWnosteF4EpvCu1uUp8j3gS34WEDtTp7TdFlMxgpW1oIPolOqJHiUtK/fTcGfpJAcUi60Kyd/0wnxaWSoBqxVAIIpxf4gz50/Bs0M/AltM9vsQOHNO7FAFp/Q2K29BB1GVp4Xzun9OiUoA9+4nTO9EgmMIEitcWX0eDMWsnBAffZWYz5gEnP6IjkGCKv1mswVx5KAIt6Oi6JIvh6vXX26JewXQQj5p5XRNCQRgI04gi3l0gvh+w3woxtf7A0O0p6XUgTKq40lW7oIGoir3CUef//wQ/eLtibVg1tpvs5wKBGMxC/+RU/9ChY6PU/BT9hk5rSFNA5KkOazcBQdS69wsqNLh8Mnukzfi0Bi9A41AGBSMI74G3JxYC3Yd3O5VAkVBEZiH/p9+nUQuxuy8H58TMwljfoHSGBxVddBnfIqQB+LI2iVfudntqMiKX6HDriof87l/RmLSDkqjHVeNdt7hEiD+iwZA9MlHYbDrx6LFvG7vlzOE4wp2JWD0/l8un0xTGTa6Dz5/qcQo+G+7BnBbcj3c3AKlE2rSDknKdYj10aaSVjeY8iwuEoonRlG9cAXhnzTCVuXurPwVOtDxJ5yi/fgjbbGNr+4V9pIJNeGu5IfgiYFvQcK0VOj+41D48tepsGjzYhi/YjIJBwbk0H6v0G8w/x/unCsKSgCx49AOiurLpvDGJKbo+NR3wXA4euYo7Dm6Dzb+vQlWbP8VFmxaSHsjRiybCN1+GAyxU9tBs7FtoEH/ZnB/h4aYLCNdQcRWIyXK1nXYUnMM+tuWKttZGSw02N2STJFNw9LxRwuphY21VEINkHo1hZip7WHULxNgxY6VsB/9//WNNyy0HXIVMhjNcJtuy4kuWhdAmA1trAAWVjF6fow/+PLIFqTw2DrB+miGOw5vXGeeOgtcvwpHTx2GDXs3wrQ1c8Azuwc0HvweKVEaKcRWI2cq33cQXtQ9bF9j5bDQIDiV/uFm/KOkmRhRp3V5uD/1Mej4XX9Y89daytvnD2ZBvpF2nQQJkfptXxIgY8hLe/VbVwDP7O4+v2UFsTCKed4fO629T1RfnNJgRqH6fV+Dixf1TUc3rjPPn5FpRH3/gB9gZKOxyyfDk4Pe0acK4W1oRAUgqHKQ5BVMjCojqPKBcDP+YSPHcF9xU9vDweMHMjRYtoFnRkJaGjQZ/gkJkmFAM6L1jFw6XjukEHwBMruecd+LN/9Ew3SMe2iuFwwzVjKuGvy6Y5VWF9kIf3bMgLQ0+HL5JKjSqbE24kqqHZ6ehpox8KLgku9jxbHAIbocTSjLD3uTIUot009lkHo0gZU7V3vbJttwsyIKkhnoPfdwvzeguGnLLNoGMI6AEVLc+F1Oivk6eS3+zoH/Rxw/cxSqd32GjHYZ60aCEnGR0OGb3hmej4X5/LmhgdPnTlDOwtLxNbRl1DBUAmRwV6VYVh4LHKLqmBQu1n8S/tblodno1uTvTo3ZlOqLZZZIuwEXL56Bw6cOk51g1OLRICRGmZYHZbIt3JRUi2Lp0U9yWIzrs5/ntJifwfyZcd+YOUjLO5BR8NAQ6Oj6LCxcPw9W71oDf/y9Gf4+9jcJLE4Hbly7nLEOsgB7H/7qdeLKGeR4RGHNw8z1nDpdVfqVlccCRTl3zVsFVTpOBkA/NxlqxHXuN0a3gstXLlIDZBumuXHS99euwIHjB0gYZq77DoYsHQeumV3gvfHx0HjoBxS2+94ODaGcGz28JJ9GTD4CcdWgUscn4A89pTgrrP4KK7y5KezzsM82dMlYSh+GVn62fpA3uRQQEmtBREJNKOuU4a6UhynhSFS3Z2mU8/Swj+HNsTHQdko76PRtX6qTaWvnwuLNS2Djvo3wz4mDcPXKhYz1qD8Ley8INBaWw5FHQpgFGtWmAdfKJtaOZOWywCAkKs3CY88/ps2qBE8OfNtniY5tkIhf/lwO8dM7Qr0+r8LdKfWhdGKUvqylr3nj3+gLEF+D1r1xLsuuoRtEpYDBRNDL7vCpf73XZgXXisI+E/t82w5sg5uT0Lchc2EzHJ3QjoHPhUt4tEoSX0OLR4jPjc9PS6U6YypDcdw5qDrgPykPg9TzRXh/XBxMXT0Lrl9NHzWw94T3jJi1di6dL9xckHHkXahJRUWnPDX0t/1i2qyqULPbs7RE5a8hGpj/xyJ4fthHUBKDb7auQA0eBSD/ji24rFYJmgz/2LvKYAiAWRisKv6e7/zFs/D4gGYBSeTpVRqkXGppvhS6Yoju1RQGLBwFlzJRvHi/CNesbmD7/MF81nPRorZBSF7FymXBIIZcf4+EuvUfe6473NHe7D5sA0ScOndCS8qJPVuANsOQ/aFNRXhzdCu4qveKrCBYWVgBaz7RRXEM2PsKJOmZcdTQ6kGI7vUSrDFSrDF2F60yrkHzr1U/PgkhTJoGSFcj3PUK3jXYnlj72VCP+oO+6xjNdsLKaT4CZzQ8dN19fugHtAU20NluSCA+fwDaYxwBHflVAP5+zz7jos0/0YpEIBRbTomK9RbVAT9uWpjpu7h0+TzU7vECjdisHqUEK7XVAKUVK58Bh+B0DAxl67+23FcJ+i8YQY3LX6/z78lDlE4bh6vs7wNFw0dg+E9favelCywr2Dkt5mdiP0McO30YKnZ8otCdb4xNU2JCTVioZ1rypwR+270OyiTWytJOEUrUnIKk71n5DCxSbcUFp7SZ/JL93FRRJzW2NhXh6SEfZEjoYW5oiDdHty7wYTESfQRKtK0KU9fM0u/NGiWQ8W8Nb2NU31ykGg8ktVWRSLgnpT7sPLjD570Y3oQ9fxxKLtWZrVSEFD3RqABO2OLr3caKacBQtp2jmuiSr4dm2C+tkd3f/hH4699dGRoZiYveyIbhclhb3x1wBUGvj4DqgOXbV3rvkRXs3BZWyY38eTwJf2E8Y2YkJdBWMw6aQ6yb3xEq7eaYgdjP9uSQI07B29XBenmWldOAQVTlz0J1+I9Dx1ucMqzf87v/xkVrz7OhGLnBFl7EW6M3vDu5Hvzx9x+WKAHzM27evxnK0jJecA6lcZWl9eQUule8Y1Z5nbt4Bhw9mwRk1SLYqMtib1ZOAwZRlaeEogIwwnZ759d+5v1b/9kGt7uiKduPsZe/sEhKILYa3NuuAWzcpykBVqjNwp2VgjA/48lzJ+Chvq8GtfBQdOWYyjDh18wNtOt2ryNPyuIh7iSExnjBKa1m5TQwiKkYgYkKQm7+jw43rcvDq6M+oyGkv14FPfse6fcGNbxgEQxSAjGVoXrXp+HU2eOZKoHMFAD7jIg3x7Smugjm4TMqXxqdxNeAlTv1jUd+lMDMtd/QqkBhrmAEnBSDU7ooJCj3suJqOcok1Y0SXfKNUJv/43C6Rtdn4OAJbWefuSGhoOBOtNaTkzNs3Q0eakbLl0e2pKUw4/5ZAc9KAdAzAsDwpePoGYNp3p8ZNXtAFVB6NYVzxtZj9r0BwOf43oLEkBkQ6nYAUVVeZOXVcmCGklBz/y2t1qZNJZjNhm1ESAQONdHiH+i1/vwQ58VNRzaHNFPab39kFYCB2Wu/hVJxkaYoRcFPWq5tVR5cs7rSM7BKD3HizDG4r/0jpOSDZeRmNbUpudSDlVfLIajSmFCb/+NwV53ZRWtAfub9mNX3f+0aZNiuG4w0fBdeH90K/j661yvYrFBoTN+SfP3aFejxwxAQEmrq22t9zx3MRGOsEF+DFBiCfVbEt+t/JB+CwjTcBpLalnzpJ1ZeLYfglDaEzvxfG0LivN48dDY3HOxNKWBHTEWyE/ieI7hoxCv4T3I96LdgOG3FzQzXrlyEHzYthEf6v6HFMCyiATYMJ6HbXIpX8ZnfY7p/wBAaLQTfFM4CJiu4L+CIzSWXY2XWMtjjpP+KTulMqGz/RUv+XZ66sPvwX76NRp8/tv+mN40QilqjKZYQRcqtcudG8ObYNtB7/jCYsmYOzPx9HoxaOh5ip6XS3LlYLO7Qw1h7vucoakTF99LI5t44hKwyx23cj/R/k45jf1vkiXYANAaq0Qort5ahjCo9Tr1/CPj/41AQBWT2uqyHjegDz4a9Kiqk0QBuxcU4ehhht622Wcm7FTe+epEw9uWU9LytK0CvH4fQ+2OnPoiN+zZBWdxxmIDLuKHRkRlE21yEU/mIlVvLIDqltqGw/ZcCb8ZUhj5Z+Pnj0hIOKTHKTVGbE2dGFBD0dQiF3j4zUs7FtlWg94Lhmb7bRVt+gptVqUgZO3NCig+gSoNYubUMglMaXfQNgLjeXwHeGhtDjQHBNpDT505SFB5b2/DZVRZKJMefhCjYdmCrz/s1pnbd5w0qlH0cgaQem3MJK7eWQXRKK2gLsJ+LFySxF0PHDkw3hS+bAkjERZJ/fHZx43He/2CHx+DgiX8ybRytJqeE9rpxGBBHAY2HvAfX9DiErJJHo+/DfV/PkbcjtjOtjVWnKRWOHDCxa9BNnzA2hyrvtcXXE1nZzT9SI8sWRPhvHJ5i5WqRYWqQgcqbJcaURgpjzt3qrgv3pT4OdXs3hScGvAUVqNeuQi+Lja+HpK20rR6EmVksF+F+84ILL+V7j5zW0LAHeJd3/dgD1u/ZAGUTo/y6CuO0T9t6XRlu99SDOr2bwsN9X4XKnZ+CO1LqU0j49BRn6WnfzKHecFWlQJUEGQGla5ilmxXffKO0O7oynjxQqb9J4NFIFVOZKvfudg2gRrdnodGgd+CNL2OhzdQO0O37/jBm+WSYu3EBBdrE3XrHzhzTwmTduAYnzx6DCSunQ7Wuz0Cx+Iz716lBtK0CSTM6k1efvwax58heqNTpSZ/fchZNoj0AHbzmrv8hU4U/efVMikfIOnhhMJhSCTWh3Te9Ye+RvXD92mWKanz2wmlKVLJh73pYsvVnmLhmDgxcOAqSZ/eADyY44bnhH4PUswnck/oY3OquA8UwLyQqiIQC8CFB43xyNJRxyo1Z+c03Ity1GwVqBQAF8w5PPXhjTGv4asVU2Lh3A/xz4h+4iGvzWWSMyQw7D+2A21zRNHTD8xsuo7gEZJzP3BBo6J+WBi8M+5h6jeyGhJxFhzg1rNjpSdodaLx3Q/kbU76PMbOxae+D1llUhn66kTi3uHLlAhw5fQR2HdpJBkd1Zleo2uUpUgSB9rXQbXQtWfnNN+yq0iIQLsC22CrkvvrXv9pavD+wvTUrvObvDacPChKpx4fDJb8ySbVg1a419F2G3+rHYxYefEERfu6Rs2gT32vbqR20TV5+VgUOnfiHoh4V13vpYnGRUL/fGzSqNLeX7GgoFH84c/4k9Jg3CG7SRxfsPVpFTQE4rN8aLKpSD6tXAFA7O7o/D5cuaRs5WEFnhZul8T17DGLxlqWUhhsFGuPofTbJ43MN44X9c2wf3OWu45PhljM0qOVbLA/TVhsRlDK2I8R363/0Bj/BjiNlTs8Mx/prZ7mhga7f9dfTwPnepxXUQ4TNYOU33xCd8kQrRwCUOz6+BgWc9PdSzMLtr/g7xlzZOI0oo6eZrt7laUrQwV6H/n/9Gjw/9COaIrD3WJDU1uj1dXpVIzZGNIjisBGJdhI0LqHRqlhCDT3WvrYCgglEyGBKjj6aLUWjkYvARCMePxlWTcZV9v96lGM6L5KuU52MrHh9XHXB+8H7KpFUi+4RnabQeIb3bjyH4XtQmP4HaNfBXv6IKbdChrZ24zplM6Zw7jGVYeDi0XRcZm0sL0ScPHMMKnVuFLjOhnYFytZnDBKc0lIrcwBiY3q43+uYPdL7QtjKzmtBbP57M5SMrwF3e+rCzkM7fV66gRYT3dTorWqcZiHWliprQ3Hd88xYriRLsSGoXqHTrcgkcFXpuJIJNWnqghGKMDT5f1Pqw/86PAoPdHwCKnV9Gmr2bAL1+74Kjw94E54e/C68OPxjylz0wfh4+GSCE1pO8tCSZvz0TuCa2ZUMoMmzukGHOT2h4ze9odPcPtD5277gmd0NEmd0hnZzekLynB4QO70jfDY5hc6BcQ9fHPYRPD34HXi8/5vwUJ9XIKpnE6jc9Rmo0LkxPJD6OPxfuwZwl+chCpRSDldPUCH4TQRiflaTcsHjSKngZiRNkWRQIn7qOffU7ECPD3wbrvrJ7IQ4e+EMNOj3Otg+uRtGLZ9En7FtK6eFFX7zdTDzc8CWmdFOp8q7bKn3C6wM5x2pDUsKTnmrlZuA0MnmpRGfegXRagWwad8m2vgx4mctw66/FzFx5XR6ETld8jOEGxsmpQY3lilx9cLce1IK60hazbjdpcA97RqQwDh6N4VGg94mgcL4/p9OdEHszK7Q4dt+0H/BcPji5/EwadUM+Gb9D7Bw2zL4dddvsGHvBvjzwFb469BOOHBsH/x78iAl50Rr9KUrF8g6Ddev6v7vmc9B8wW0k+D5r1+lTD2XLl+g62M+hKOnD8M/x/bDviN7YNehHbBl/2ZYu+d3WLZzNSzY+gvM/v172ko9cumX0Hf+MGj/XT9oO7MLfPh1EtUB1gUKXVSvl6Bil6fg/1Lqwx2uaLBT/VandpJBeRhZleKq0+iDkq7kUEloS4MVofWUdvQ82FbYNvH7ng1gj6kEg5d+Rf83vmPbWE4K2+aMa/SbPyxwCsCj4HOeKuupfScrxnkG5QB0Soes9AHAlyv3eomi7BgVzVZgXopRyat2roZ3x7SGtBvXvJ+bX8Jvf/0GZRPTY95h46Ahd5JD67GNHszrO5/eQ5dIwGQhdaBGt+fgmcHvURqruJldIfW7/jDipy9hxpo5sHDrL7Bh3yYSikPH98PZ86e0hB6m0UegYK4P7f/aZ+bvMjbMjHXI/j7QSLt+lTbq4M7FA0f3wa6DO2D9vo2wdPtKmLX2Wxjz81fQ7YfBkDCrO3wyQYWXhn8MD/V9Be7r0BAiMO0arccza/G6Y1gJfTSBSgLfM83xW5WHMb98rV3bj1Gw9/zhXldi83ds3WRXMtZxuoE6ZlqHwCkAzRfgeukEuSorx3kG5iHHkENW7gKkIV5iFKzaabLMQ+4rmS3GS/zn2N9w5ORBn5eIwJ6zbp9XwNbif+nDcPw3rjrcpEq0979at+fg0QHNoNnoz6E1+iD8MBhG//wVTFs9G37Z/ivsOrgdzp0/lWeBNoTSCOnNkn2mvJKtH7ZkdmyG85hsLuz580IUBKPkddSCI5HDJ/6hPADfbvgRxv7yNXT9YTC0mOQhBVG372tQvtOTcLenHog4mkCloKcbQwVwu7sO7D++n85lvjcExkRcq2chynDfmZTMvmefG3H58gXqOAIWWwId4NwKCAlyA1aO84xSTqkmrf/78a7LD7ESqnVuDDsObve+WH8VyFZsZsU41qhsvy8wLQ0GzB8K96bUh6eGvA8tJ7qh6w9D4KsVU2Dx1l9gy4Gt8O+JA5QLL6fCzd5DVmTvOZQK+6w5eeacHmcuOcGN61fJMWz/0b2wft8mmLt+HoxYOg7iZ3SCl0c2h8qdGkHi1PZw5doVOqdxffzXe44c3Bf7rCyNXt8AJo3FKWNOpix5IoUHQzuAw7rwYIIr+lHq/S12AtIy31aBqp0bw4rtv3r3cWcF9gWYXwL7Ofs98vqN67D3yB44c+5kjpyM6AyZ9NJZXTOcS27rxYq6NJ8jJ7hy5SKNEnHqYbxff+djP8/s++yAUaVaTnBRew+0e7CeNfh9Vo7zDNQmgfICpGi88dUppzxGpmk+yQ29fhwKU1bPghU7V5PxC41N2SmHzF6UvxeWjqyFOyuy5+cleAr7rjK8N6ZXNr9/f783f4b/Zo40OH/xDCmVdXvWw+x138PgRaMhdnonMnbjSglOPwIt/Eg9PmBbVo7zDEGV3rFyCdAfaeMFGt28xpzKUDIBwzxFQ8XOjaFh/zcp1p1zVjcYt2wirN61Gg4dP0DW6POXzsEN3aqbVWEbg78XzUtoFfY9s0LNfpbZ5/g3ThfQkHvq3HHYeXA7zNvwI+0VeHdcPDQe9C5U7fYs/DflYRDQMImrF8aqUGxVWt5k23ygiDE77G6pPSvHeQb6Fhd0IBDzchtac70Wed2QIyZG0WaLe1Mehi+XjvcO580vkhdesLACnpeC2LJvEzwzoBncmfwQ3OqKhuLYJg3DIq5ExNcgQadVh0IMvEKy6lJ6sXKcZ4iqHG/vWLAKICvSem6binCLKsOwpePg0tVLGSzLvPBidSElknYD1uxeRw5stpb3QbEC7NVzQ1QAQpI8ipXjPENwys5gUAC4iwqdP3AZ5/EBb8H2f/70zsCs0PK88JJVMUKpX7h0FpJndycPzcJ2IfdHUgCq/AUrx3mGmCR3s3ojUO6JefCqwq0uBXr9MITWgQ3B58LPS06Lv/l9TovxOwNb928h12LskIIpcCxNAVR5CivHeYaoKl0LUwFou7kqQGTnxrBy5+oMvX5eXiQv4VusUADGbxGXLp2HVpM8UALDq2PCWIt9ZfJCGgE45dmsHOcZhakA0KBSPK46fPJVIpw4czSD4Of1RfISvsXKdmMeDWDUIdzHgEvabBsuaOpTgFmsHOcZhaUAKHZ/y3shZXb3Auv1A3luXkKrpLdFDb/vXge3Yor52GqFOhIICQWAwo/x1DDWGm2iKQBDX6CVCy+hV7xtRjcQrt71GzzQ4TFSAla7zueURV4BGNFYh/80LkPPz1Y+L7wEW0Fs/Wcb/C+lQaFlI7beBuAsuFUAWuNv9SDldDcLP1cAvAR7MdopYvHmn+BmjOLkJ+R4oKk57SmTWTnOMwRVdhWUHwD2/O+Ni4MrfJmPlyJYzEpg2po5UBzjUhaA/7+Z+gjAOkeggvAEpNDdcZHwv3aPeFNaG5XJFQAvBVGsameGAkDg/hUMSluQ9gDNBqCMZOU4z4hwRje3MiCoP2ISBzG+Ju2i4j0/L4VRrGpz5lHAniN7oGa3Z6F4AS4P6lOAnqwc5xkFsRsQffs/+iqRKs2oRLZiA10K45q8BE+xesRpKIFVO1ZBybjIHMeezC9pN6BL6cDKcZ5hV6UXAhYPQE8L9p/kh2Dv4d3e3p+tTLZi2c+sKIE6bzgXKwUq0MWsAFiyx+amYGSpZ4d+WGD7Bshg75JjWDnOMwRPnUcCERHIIMYA+OjrpCx7f0Ob5gTG8Tl5ecb3OTk21Eq4PS8W83tm37m5zfhrP9mBPd44J2Ly6lm0dbggtghTRCCX8i4rx3lGqUSlRiBiAiJx3zRqRoz+ml0lXr16Cdbt2UBbMjGs18kzR+HSpXO5iN2XdSBO9rq8FN3CvlP2PadTOz5nSKOgnqfPHYf9R/dRrMGf/lwBf5piWrJtCP+PwHT0d6XUD3xgEJRTHK0nOpqwcpxnBCIqsEHMKIMBFg4eyxih1fzSEL/8uQLq9HoJSiXUgFKJUXCnpy5U6PQkRPVoAo8MaAZNR3wKn36tQtLsHtB74QiYtHIaLNj8E2zev5nysuVUSZhhvoeMzSv0SrA+p1lY2e/8FfOxucX1a1codh9uOJuz7nsY88sE6DxvMLSe2h7eHtManhj0DtTq9RKlCL87uR4Ieu6CMom14NVRLSmaMMJ8r0b7RTw3DDNQVfWRAUtpRAVOkh9m5TjPKBdb6xbBKf9jZV4Ag5jS6vGB71CKLqPyzERsP7SDEmzgVAENKUbGHYoUhMkjKDmHnoEGwzDp6Z1wWRHDfGNm1oYDmsFro1pSthzXN71g4KLRMOHXqfDDH4th3d4NZH/AEQUGi8wM7L2xjS9Yi/l+2Wdgaf4Ne57CKP7uzd93mSLtBkV4PnzyIGXrXfXXWpi3aSG9+74LR1Jb+HSCkzqQun1epexLmBZcCyPOZmzCqD/VwUb5BrTIP94kMS3vheYTnNol/dQzovePQ2kawMqApQxEXgDb9NdLWJ0ZyCBWMMZVQ7CVhhWJ+GB8Qob0zTmhkZ4L92njC6PceeYkH95cAJEQkVgL7nTXoTjyqOGfH/YhJftoMy0Ves0fCpNWTocDegx5vKPMGmRWxd+zsSWz7/x9ltPCXtcfsguMaXzOHlMQhb0Hf58TblyDX/5cDsN/+hJS5vaBzyYnk1A36P8GRHZ/Hu5t/yjc6lR04cZEIthZVEhvB9iBxEXSEB3zVuY025BBVAYlYqvC4i3+c10itv+zDco5UWEEcDUAR+mqfLpsjIWZgRARTulnq5cCye03phKMXTYx00rD2O73tH+EIgGxv88vKdWXKYdf+ogCc/dhA0FlUYFGFJje64eNCwyZ8blXtuFm1liz+g37fVbH5rQYvzcD03ntOfwXDXfNIx72mlnR3zXYz9mS1XHs+TOlWRHpG3AuXjoHb4+NyZjw1JQhCPfpY/vBd5wX4c4J7Xpn9v74eLon9pkQGN26fKdG1M7Y31tGIzfgB1bmBqT9ANLXVjsD4fAJAyvO37zEbwNEYNYX1M4RzoJ1p2RJjSi2KrT/phdcv3bV7/0GKzVBSaOcg02GfwL/a/8o2VDuTqkPUd2fB3VGZzh88pDlz8QKgZU0sG737xQxGoWvdAG73LLEBLDVuj5N4cHZukSgjaF+39dIKbG/tYzYSavSclZ+8w1Rlbpa7Q6Mqa/LJNamBJhshWHjQXz8dRJpc/a3hUGKT9DqQWg2ujVcvHDa2wgLGsZqhrdktaqhN75Bi74A22f303CXUnrr6cZpxPP5A1CtcyM4cHQvHcueI/1cbL9tlMIBTs3sOGoroPX17IjTTbsq0W5AhLnutLcGlMEZRybsb60iddKqPI2V33zDriotrB4B4JAM4/7v0IN7ZqwwLXtL7Z5NgiLKikEKTxZXDRw9mkCn7/rBrHXfw3ebFsL3mxbBgi1LYemfy2H5jpWw5q/f4I+/N1HcOJz7/fXvLsqgi8PuQycOUp76E2ePw+nzJ+HcxTM0jMXnxWy/aTjCMDL+mhpPXoFWbQxgmVVOelQM9fq8TFMuS4D3feMaJX+9evUiPR/mcDhz/hScOncSjp05CodP/Qv/HN8P+47uhT2Hd1OQ1037NsLvu3+HVbvWwIodK2Hx1p/hu40LYca672HKb3Ng/PIp0OOHwfDq6FZQBkeQ9Ew5tw0Fkmh3Kta2Ko1aERmUp/4O38KpSgAVlp4UxDo3YAMRSbUb0SqAhc5A2AP9t10DWlNlKwyx/eB2uNml9bzsbwuTZLvAnpNSgVfVjEp6nvsS8dWhZHx1iEioCWWTapPR5xanAre768JdyQ/Bf9o1gP9r/yj8r8Nj8ECnJ6FSl6egWtdnIarH8yD3fBHq9n4Z6vd9FRr0fR0e698MGg96B54d8gEN3ZuObAmvfvE5vDk2Bt4ZnwAffO2EFpOSodWU9hA3vRO4Z3eHlDk9ocPc3tD5u37Qfd5ASJnTg2woeL/Z7U1HuwcmRO0xbxD9Hqc7eD5k0swu0HZ6R2gxOQU+mOCEd79KpHt4a1wcvD6mDbw8qiW8OKI5vDD8E3h26AfQaODb0LD/G1C/zyug9HqRphpVuz4Dlbo8DRU6N4b7Oj4B93RoSPVxV3J9uNNTjwK+Yp1hzofSuNwbXx2K4RzeWOUhI66+0tO2SlAF4jSI99Z13iCf9mzYK5pPTgnoSgC5ATul5qz85hsRbkdF0SlfoWUGPxfOC3Eoem+Hx/zOPxHzNi4okFxq+aGWAEJbccD7NIjzUZzioPLCkQ4SFR4SnxuJxiAyPCbU0NKRo1JBxiEjNRrKhQyTuhAYgkDExBRo/DIZwDKwEqVAz1mIKtyRiYqNPUf6ubTrGdfWadwT3iMRlaGmEOl89Fw1tOfUn7l4glYHRp3gshrWEdaZttSbXpfeOtaVr+99Bw+xPj5m9rRoCkBr021ndA6cAsDOOTkayqjRT7Lym3+kynZRlf620hcAGwL2gP62/yL6LBgeuMri5AwAUQE2GvqhN1MVqwASZnYlZcr+zhJS5yxdjXAr5VnxtQRikrzMyqVA7BXknk00d14/CiB+aoegMQBycuaEOPp5ZODbXs/T9DatKQTn7O6BUwDkpyPtscXXE1nZtQSCKo20MjQYDg0f7vMKXNPXolkF0HfBCFqDZ3/HyRmsROFuPtFF7Rd7fbZNe+b0DJgC0DpnaRErt5ZBTJJjLFUAcdXhkb6vwfWrl7QK04tRWWg5vwk9+QK5bsrJaRHJ1tG2CqzetcanQzPatDuQCgB3AaqOAazcWoYIl/yYlSsBWGEP9X4Zrl6+4KMADKvpzLVzyWkF0y9pVvcqmnEpoSYZjdBYVJiGIXIzNrsXmw1l6E3oNY75GsXIGEYearXIWKgZwFjDV9Ewfhn3mM50w6hhEDUMoYYB1Gv4NBs7zdZ+f8bNuEg6N3v9giA+Fz4L+f7jvdP9YsbqitQ+73BHw6ifv9J7f1/fDE0B9AicAuhQByJU5WNWbi2DPSn6P+hnbNWuQHz5uMPvyuXzPgrAXGm4fj5w4Sj4dKIbmo5qCY/1fxOqdG5EKZpL4Yvwuu0aft26kkDvPdy4kYgCpm3cIDdQM/PYmKgRtKkIlTs1oiFfp2/70LJZ/PRO8MlEN7w7PgHeGBtD69UvjvgUnh78Hjwx8C14qM8rZPeo1f15qNSpEdzbAb3y6sHNqgR2TC1tNCyv5R8t7Dm1+GdhqWfps5rAXCPDtTK7nv4dez3vqkA1KIF7LRJq0PIeLofenfwQ3NehIZTv+CTU6PYsLXs+2u8NaKQvd740sjnVGy4xfjzRTTvx1JldIHVuL1BnddVy8envNy9K0aycDGK7QAWFKxG4OkHCbaSj9yp3rfPB9naHuy7U7vECNB70Lrw2ujW0mpICAxaOgj1HtIA2bBs2t+WUb3oFRgHouwDtbklm5dZSCE55rdjOmpUATQG86KMA2Ar0wfWr5LCCDkS/bFsGE1fNgAELRoBrdnd4/6skePWLz+CJAc2gVo8X4P6OT9B245uSalOKsXThMnoc00vGf03KQ8v1nq4osIFoGr8SlE1yQOy0VDh++l/27vwDnXquX4NrVy/BlcsX4MLFs3Di9BE4eHw//HVoB2zetwnW/bWWngeXP7/5fR7MWvcdTFkzByasmgFfLp8MI376EgYuHAl9fhwKPeYNhC64Vj+3F7Sbg+v1PSBxZhf4fGp7aDmlHXwy0UV18eHXKnw80UX84GsV3vsqEd76MpZ8CZqNbUt/vz0unr77aIILPp3kgc+mtCPiuVpPS4XY6Z0gcWZXcM7uRtdBRYd+Augv0G/+MBi6eDTt5xi/Ygp89etUmLh6Fkz/bS58u/4HWLh5Maz4cwWs3/M7/HlgK+z59y84dPwAHDt1GM5dOK0lec3g9JQNrl+FMcsmQlS35zRlg4KZUMOr3EmYkxzaCINGFqZdokjziExnsThtSy8q4ntTH4fq3Z+Dx3H36OhW0GJyMrSf2xsGLRxFQT2W/bmc3hcZrvGeGdy4cT1D22WntXiugCiA5Ghso4dsav2bWJm1FKIqf2GVHSArBcAqA/pLnxbkCGk34PLVi+RthyOIzX//Act3rYHFO1YRl+xcBfO3LYMZ676jBpz6bV9oPjkZXvvic1IeqOH/k1KfHHqM3vgOdx14Y3QrmL72W/jz4I70S5nXe/PptcehwevuzAylDaACXbDlZ0iY0QmqdXnKK8zoiIWjqfIdn4AG/V6HJsM/hnfHx4M6uxv0+XEITFg5HeZt/gkWo5eh3hawXWzctxH2HtlNHooXsT3mRBnpML9/s9BnKHrb7TC3T0CWtnUD4GJWXi1HhNPxkRZ11PcmcktUAPV6NaUeEZFp5enFXMmZEY/LN25ch0uXz8PfR/bAqp2r4buNC+CHTQth97+7MhzG3l9mhb3HHNHnLBnPxX5ulJzfl0nI/BXD758E0PcZ8Lvs7sV8DPtsGcicN8vf6jTj9NnjsGTrL/Selm5bBlv3b4bjp4+QK3J+YNQPe+3M7jerYtxzcoCmANQpq3J3Vl4tRymnVFN0yTesCA9GCqB3U7hqWgZkK46tRH80vsvJsb7UGqFRsgMeYb5uTgt7Xfb7QBT2mlaSvVZWJTfHZ3csex/I7KC9M/+/ze7c7DF5LcZ9JgdiFQCN8u1wE5DyIiuv1iM1srSoSrutCA6SbgTM2QjAqpLddcy9UobP/XxWlAv7PNk9m9VC4a/k9dzsfZnfYU7vO6fH5anoU4CA2AA09/zzour4P1ZcAwLRKU+0wg7A2gACUvH5KMF2P7zkvgTLO8T7QKR8EwAFQDEA5JWsnAYMEar0qRVbg9NtAMGpAHjhxapiKADPHOttAAHbApwZSqtKFdEpX8vvzsC8KICADdF44SWAJX0EYLEC0Of/dqf0NCungUOqrbigyhvz6w/g9QS8knMbQEEpgIK6Di/hUQwFoC0DWqgAPAqu/x8rl1rrFlZMAwpRlfrl1w6QvgqQcwXAS+EVrhTzVox6Q7S3WAFoqcCluax8BhwRztqN7fnMF8gaAdmK4yW4ClcAeSsZFYC1RkC9E27Jymfg0SqyrOCU/s1PgBBUAHW5AuAlDEpARgBog3PJlyOSpAqseBYIRFWekJ9pAPrbR5sCgrCVxgsvOS3BPjIJhA2A3H+T5GWsXBYYxCTHq/mJEEQRgXo0oYixuVUAwf7Cc1NC6VkKqwR7HQZEAeD+f6ecwMplgYFyBqry0bxOA1ABKD1fhMthPgUI9sbLS/6LoQDaWWUDoOG/dLW0O6oyK5cFCsoYlMdpAOsKzFYaL7yEQjEbAZMtcgTSR96FN/w3YFfl5+y4ESEPqwHGMiBXALyEcgnEKgB1ui6pNSuPBY/4eqKYJP2dl81BqAC0oKAZYwJmV/iQmZeiVMwKoOO3ffOvADTr/3kxud49rDgWCkRV7pOXvIEYH48UABMUlBdeQqmYFYAVRkBy/lHl2awcFhrKJDmiKEZALvcGeBVALkcAvPBSVIoh/JYqAJz/u+SXWDksVIhJjmW53SGIUwDMHWfkBWArjxdeinphFUC+HYFwqq1Ke22pDQVWBgsVgqq8l9tQYbQZqNfL3AjIS8gWVgHkdwSgT7U7sfJX+EhtWFZQpUO5MQZ6NwNxBcBLkBSrDcyWKgAMx4+uv4l1HmTFLyiAQQlzYwxEBRDdK/QcgYwXzn7OS3gWq6YAeuDP6azcBQ3KpdR5UHTJl3KaOAQ9ATFBBoZ4DkUFwBUBL0bJ9wgA/WxSokHwSI+wchdUyM0GIVQAtUNMAbDCn07rRga+5875OdnfmX/r77OsSlbH+vvc3/m1//s5HsOS66HJzd+bf+/zm2AuelDQ1G/zpgDI8q9KBRf3L68QVYciepS0nIQNRwVQpwjuBeAIHuD7KBKKwBsVOI8KAFfY3PLrrLwFJQRV+jEnKwJFzRUYGxriwIkDMHX1TBi0+AsYsGgU9Fs4Cnpjyi7kghHQd+EIGLBwJAxaPBoGLPqCvh+w+AsYvGQ0DFsyFob/9CVxyJIxXg5c/AURjxmsf2YcO+ynsRl+N3DRF/Q9fad/jr/rv2gUXQ//HrpkLAxdMob+xpRiI5eOo2Pxd/iZcf7082rf0feLje/H0DmQw/Rrj1g6jv7VPteugefA8xvPhOfHvzFRJh6v3Y92HuNvrDt6Xr2O8P9IfAb8HOuwx/xh0GvBCOhHn40m4t+9F4yg+12/d0MGRRDUJUNmoNwpAHK1V6WtttSGJVlZC0oILsejOYkWVNT8ABCY7+4udx16iUWLmSX4DCSzu2Z232fB1hUokWrSjC5w7dqV4G8/hgLIwxQAp9R2Z3RzVs6CGqLqWJKdY5CmADAoaPArAMSxM0fggQ4NKcGkORU2+1xIf9/5ptD2PY79PDe04hyFTbYesyJlaG75v/SU3EFeEJoNIBe5ATXHn92454aVsaBGhEt6gm4+i1FAURoBIGgjR+vyPs/BWXjEpK2P9H8Dbuh5ANn3FkwFkdt4ANj7R7iUj1n5KhIQVGlRVqMAzQaQHhacrbBgKQZeGdmcen/2OTgLj5gavELnp+DshdNB24aMlQtEruIBtIvGlOc7bDEVI1jZKhIQXHIDihaUyYoArgI4ejwPFy8F9zKggTdHt+IKIMhYLKEmVOzyFJw5fypo25BZAbTLRWowbdef9A4rV0UKguqYnZlfQFHyBEQ04wog6IgKoELnxnD63ImgbENm3wdETlcBcN1fUOV1mISHlakihdKJdSJFt3LF31ZhVABKzyZeBRCM67nGPfERQHBSUwCN4NS540VCAeQoNZhLUwARBZruK4AQVGmwvz0C+PIqdUnX3kZFsZVY+EXD6198Bra2VX2eg7PwSAqgUyM4dTa4FYCxDBg7s0u2CoB8aJKkeawcFVmU9dS+U3BJx9jowbiMc5u7Duz596+gVQCG5sam9eSgd8AWG+nzwjgLjyUSa8F/U+rDweP7vW2IfYfBUhBvfxkLtraVfZ7DSxwpu+VrpRKVGqwcFWmISdLnrC0gQpWgeNuq8O2GH4NeARw7fQT+16EhFE+M8n1pnIVGbEOl4qvDsu0rgloBIDD0Xc3uz0Ox+Bo+z2EQR8pCkjyQlZ+iD8ooLK1hlwVRG741NkbvYzNu9giGYiiAiatmgi2mUq6dVTgDT3wvbad20NqQv41FQVAQX/86DYrHViWlxT4DEXf7ueSD5dw1b2XFJyQgJNSuLyYraWaDYGnVAaXjq8OCPxbrGrzwX6ChhAzhx92KtXq8AMXiq/u+NM5CZ6mk2lA2qTbM/2ORdxRgJvt+C7IYbWj/sX3wn5T6UDyhps/9E9HwFwrLftlBUB1DzQZBu1OG4vE14J6U+rB4y89UWeaXyFaov5LdC8/qe/Y7MxHoYPLqyBZgi8F5m+9KBmfh0+5UyKfkDnc0rP1rrU8b8sfM2oi/z/x9l1UxH4/A6eNDfV/TV5D8tyFK86XK81l5CTlgOjHRKe8XcYeT8fAuBWxxkXCT6oDZ677zvsDCxt4je+CpIe9x998iQFICsZFwX/tHYPGWpeyrLDT8vmc9RPduStOUzIRfTEbDn3Ku0LL8FjREVXlRD22c4QWWSIiCYnGR8PKoFjBp1UzYeWgnHD9zlNZ4DZ48e4yIyz7+Pj9Jf/t+zv4fecL0N/4G/7//2H5Y+ucyUGd2oSEbX/cvOqSOJKEGlIivDi8M/wTm/P497DmyB07obQjfsbft6G0El6D9tQ3tuIzHZkVqc3ob2n14N3y/cT58NskDN6kS2GKrZS78uuFPVKVYVk5CGqLqGGfvWM+nMtBAgkKHQ+5b3NHwQGpDqNjxcajY8Qmo0PFxKJ+KfAwq0P8Nap8/mPoYUfv+cdPx2t/m/6cfm/Gzu5IfguJx1WnHlmbxz/zFcQYn0a6E/hq4Ueg2T114MLVhhveM7QDblPEv/a23q3Smtxmt7WntjGg6h3EeOl5vQ3hNun5MZVrqxmkue48GtZUxaanNZivGykhIAy2dokvZhxse2EpBorUdjTsohMVwZGAQ/89+Zv6c/T6z/2fCkom1MrfSchYpCqpEAuh9/2xbYMm2B/b7rGi6Bl4Tr83ejw/RL8atnC+dUMgZfgsLEU65MW0Z9uMmzMkZ0tSt/hGJUgtWLsIKYpLU199UgJMzlKk5/EizWHkIP6RGlhac0m+slyAnZ8gSV8Dcyt83uaNvZ8UhLIFzINGjnGb3CnByhhwxZ4Yn+oagKg1ZOQhrCInSG7Q0yO0BnCFMGvonSh62/XPQ0qDUy9+2YU7OUCDaugRVmsG2ew4DqbbiIsYR5EqAM9SoJfbYYnPJ5dhmz2FC2QT5DtEl7xZxOsBWIidnUSTl9FNOlXFGV2fbO4cf2BMUh+hRzuYm1TgnZ1DSo4A9ORpKJ0rPs+2cIwuICXJTyi6Uw0zDnJxBR5eiufomhJmfv1UQk6Q4eypuGuJKgLOIET390OiXJPVn2zVHLuBdGcgiwxAnZ7CRvFtd8hS2PXPkAaIqf8ndhTmLCmmt3yUvKrIZfYIOr79eQnQr0/nyIGewUxN+ZQ0GvmGbMUd+8HpkadGpLOFKgDNYSWG93MrvuJTNNl8OK6DWv0l0Ksu5EuAMNlK0a7fyp5BQ/V622XJYCIop6JJ/5rsHOYOF1Bbd8mYxvtY9bHvlCARayHbRLfPpAGehk5ap3co2oa18H9tMOQKJxKgygkv+wd6Jrw5wFg7J4OdWfuc9f2EhpmKE4JRn6muuPi+IkzNQpNGnW1leNqb2nWyz5ChI4A5CpzRafyE+L4qT01LqHn6iS5lnaxVZlm2OHIUE0aV0pS2XfO8AZ6DoVrSe36WMt6U2LMm2QY5ChqhKrUSPksZ3EXJaTszeoyW27ca2O44ggl2VXhCTlRNsFmJOzjwTg3h6lGt2NcxDeBcVlIqXamL0Fb5MyJlfUsbe5OiDEUlKI7adcQQxbmodfbvgkudy4yBnnkjGvroYwffXsEnaGYoQVakr2QS4XYAzp0xWyLVXcEujbR/cL7BtiqOIQXRJLwse+V/uPsyZHSk0vUe+KCZJn7PtiKMIIyKuZnnRrSzUhnV8SsDJEMN3oWefR15vT5Rktv1whAgEp9QeLbo86jCnl5ihuh1F7h2CLuZsm+EIMQiJjkcFj7KRGwjDnF5Dn7JXVOWmbDvhCGHc2SqyrOhW+qLjEM372MbBGdpsF63N913y12Xa1r2bbR8cYYIIVXpc8CjruG0gTGi483rk3aIqv862B45wREzFCLs7Gm0D52mlgO8sDEmSdyiO+FzKEB62i8MHpZy1qgseZTa6ftrR/dNPI+IsgkyJ1qL2JEf/LLjkBux75+DIANGpvCK6lT/0RuPboDiLBjEtl2bo3WdPjv6Ufc8cHJkjvp4ouuR4waMc5PaBIkac56Py9iincZv4Te7o29nXy8GRI5Tx1L1bdMq9BbdySm9Uvg2OMzhoCL5buSq4lS+4Dz+HZYhIjHpQcMkDRI98lo8IgoyG4LvkG6JH/toeX7sW+/44OCxBRLyjophM/gMnuY2gkGnM8V3yJdEjj7UnRddm3xcHR0AguOT7RI/cUXTL+0kR4KoBXz4sGOpWfcElHxc80QNKq0oV9v1wcBQIbo6PvE10Ka3tnujfvMtNfHpgPXGYj+v47eugz/42wSM7xWQejpsjeFAswhn9tOiSpwou+RwfFVhArDtDqbqUK5gHQnArb9pSG/I9+hzBiwhX3QcEj5Ro98i/0TwVGzAGJOHKIGdM1oVeq7Ntoie6Y2ln3WpsPXNwBD0Ej/yw4JQHik55l7c3o4bNpwleomI0hL5dHRCc0iHRKY+NcEtP2VIjS7N1ysFR9BBfT8QGLbiVwaJT+tMYGWgRaMJQGeA2bHS5Tl9J2YdCL3rkpuXcDW5lq4+DI3TQQi4lJDkesrul9pjpWHTJZ9C45bUbhGKMAnwmYwSExjyXfElwSqtFp9IzwiU9wbPscIQthBTlXsET/YbglIcKTnmd6JLPG70jjRCwh0QBKio2BJze4JDeUGoUb0G6KqjSFtGtjIlwRX8YkcK99Dg4/CLCVesBHAqLTkc3wSXPF13yHlGVb3iVQgd9pFCYigGvidfGe8D76mBSWPidS94vOqWlokvug5b70glRlW1gK8Y+KwcHR3ZIjCpT2umoJjodrwhOR4rolCcIKg6fSciukg1B7201BVFHE0RUEmhwRCHFY5AotFnROA5/g79F4cZzGwLe0TQqcUrXBad8UHBKv4tOeXqES+4oOJVmZZIcUbe65HLsY3BwcFgIFDLc8EIrDar0jqBKidjjik55oqhKCwVVWiOq8jZRlfcJqnxUcMqnRKd8mUYT/ojDdKd8SlCl46Iq/Y3GSsEprxVVeYnolKfiaoagyq6IJOlDjKRUWq1bqZy7JjfYcXAELUbJpW5X699U1lP7Tnuy9F+cXkS4HRX9UymPx5RJjLrrtpg6N/MlOA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OjqKI/wcEAGaTJVTRvgAAAABJRU5ErkJggg==';
// Renderiza os checks acima dos círculos das revisões em um board
function renderCheckmarks(marcacoes, boardEl) {
    if (!boardEl) return;
    // Remove checks antigos
    boardEl.querySelectorAll('.check-mark-free').forEach(el => el.remove());

    const lista = marcacoes || [];
    // Revisões já ocupadas por marcações novas (com campo rev)
    const usadas = new Set(lista.filter(m => typeof m.rev === 'number').map(m => m.rev));

    lista.forEach((pos, idx) => {
        let rev = pos.rev;
        // Marcações antigas (posição livre) são encaixadas na revisão mais próxima disponível
        if (typeof rev !== 'number') {
            let bestDist = Infinity;
            REVISION_CENTERS.forEach((c, i) => {
                if (usadas.has(i)) return;
                const d = Math.hypot((pos.x - c.x) * BOARD_RATIO, pos.y - c.y);
                if (d < bestDist) { bestDist = d; rev = i; }
            });
            if (typeof rev === 'number') usadas.add(rev);
        }
        const p = typeof rev === 'number' ? getRevisionCheckPos(rev) : pos;

        const el = document.createElement('div');
        el.className = 'check-mark-free';
        el.dataset.index = idx;
        el.style.left = p.x + '%';
        el.style.top  = p.y + '%';
        const img = document.createElement('img');
        img.src = 'check.png';
        img.alt = '';
        img.draggable = false;
        img.onerror = function() { this.onerror = null; this.src = CHECK_ICON_FALLBACK; };
        el.appendChild(img);
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
    
    if (elements.btnDeleteVehicle) {
        elements.btnDeleteVehicle.style.display = isCurrentUserGestor() ? 'inline-flex' : 'none';
    }

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

function updateManagerKpisFromList() {
    const totalVehicles = managerVehiclesList.length;
    const totalRevisions = managerVehiclesList.reduce((acc, v) => acc + (v.marcacoes ? v.marcacoes.length : 0), 0);

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

    const gestor = isCurrentUserGestor();

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
        actionsCell.style.whiteSpace = 'nowrap';
        
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

        // Botão Editar (disponível para Gestor e Consultor)
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-table-edit';
        editBtn.innerHTML = '<i class="fas fa-pen"></i> Editar';
        editBtn.title = 'Editar informações do veículo';
        editBtn.addEventListener('click', () => {
            openEditVehicleModal(vehicle);
        });
        actionsCell.appendChild(editBtn);

        // Botão Excluir (disponível APENAS para Gestor)
        if (gestor) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-table-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Excluir';
            deleteBtn.title = 'Excluir veículo do banco de dados';
            deleteBtn.addEventListener('click', async () => {
                await deleteVehicleFromDb(vehicle);
            });
            actionsCell.appendChild(deleteBtn);
        }

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

// ============================================================
// 12. PAINEL DE APROVAÇÃO E GESTÃO DE USUÁRIOS (FIRESTORE REAL)
// ============================================================

let pendingUsersUnsubscribe = null;
let currentLoadedUsers = [];

// Cores sólidas para os avatares dos usuários (idênticas ao padrão visual do painel)
const AVATAR_PALETTES = [
    '#2e7d32', // Verde
    '#0277bd', // Azul
    '#00838f', // Ciano escuro / Teal
    '#6a1b9a', // Roxo
    '#c62828', // Vermelho
    '#ef6c00'  // Laranja
];

function getAvatarColor(identifier) {
    if (!identifier) return AVATAR_PALETTES[0];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

function getUserInitials(name) {
    if (!name) return 'U';
    const trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : 'U';
}

function formatNameFromEmail(email) {
    if (!email) return 'Usuário';
    const prefix = email.split('@')[0];
    const cleaned = prefix.replace(/[._]/g, ' ');
    return cleaned.split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function formatUserDate(timestamp) {
    if (!timestamp) return 'Data não informada';
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return 'Data não informada';
    return date.toLocaleDateString('pt-BR') + ', ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Listener em tempo real para contagem de solicitações pendentes, atualização do badge e sincronia de cargo
function setupPendingUsersBadgeListener() {
    if (!db) return;
    if (pendingUsersUnsubscribe) {
        pendingUsersUnsubscribe();
    }

    try {
        pendingUsersUnsubscribe = db.collection('usuarios').onSnapshot(snapshot => {
            let pendingCount = 0;
            const currentUser = firebase.auth().currentUser;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data && !data.aprovado) {
                    pendingCount++;
                }
                if (currentUser && doc.id === currentUser.uid && data) {
                    const updatedRole = normalizeUserRole(data.cargo);
                    if (updatedRole !== currentUserRole) {
                        currentUserRole = updatedRole;
                        applyUserPermissions();
                    }
                }
            });

            if (elements.badgePendingIndicator) {
                elements.badgePendingIndicator.textContent = pendingCount;
                elements.badgePendingIndicator.style.display = pendingCount > 0 ? 'inline-block' : 'none';
            }
            if (elements.countPendingTab) {
                elements.countPendingTab.textContent = pendingCount;
                elements.countPendingTab.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
            }
        }, error => {
            console.warn("Aviso ao escutar novos cadastros pendentes:", error);
        });
    } catch (e) {
        console.warn("Erro ao configurar listener do badge:", e);
    }
}

// Abrir Modal de Gestão de Usuários
async function openUsersManagementPanel() {
    showModal(elements.usersModal);
    await loadUsersList();
    
    // Se houver pendências, abre direto na aba de aprovação; caso contrário, na aba de cadastrados
    const pendingCount = parseInt(elements.countPendingTab ? elements.countPendingTab.textContent : '0') || 0;
    if (pendingCount > 0) {
        switchUsersTab('pending');
    } else {
        switchUsersTab('registered');
    }
}

// Alternar Abas no Modal
function switchUsersTab(tabName) {
    if (tabName === 'pending') {
        if (elements.tabBtnPending) elements.tabBtnPending.classList.add('active');
        if (elements.tabBtnRegistered) elements.tabBtnRegistered.classList.remove('active');
        if (elements.panePending) {
            elements.panePending.style.display = 'block';
            elements.panePending.classList.add('active');
        }
        if (elements.paneRegistered) {
            elements.paneRegistered.style.display = 'none';
            elements.paneRegistered.classList.remove('active');
        }
    } else {
        if (elements.tabBtnRegistered) elements.tabBtnRegistered.classList.add('active');
        if (elements.tabBtnPending) elements.tabBtnPending.classList.remove('active');
        if (elements.paneRegistered) {
            elements.paneRegistered.style.display = 'block';
            elements.paneRegistered.classList.add('active');
        }
        if (elements.panePending) {
            elements.panePending.style.display = 'none';
            elements.panePending.classList.remove('active');
        }
    }
}

// Carregar lista de usuários diretamente da coleção 'usuarios' do Firestore
async function loadUsersList() {
    if (!db) {
        showToast("Firebase não está conectado.", "error");
        return;
    }

    try {
        const snapshot = await db.collection('usuarios').get();
        const users = [];

        snapshot.forEach(doc => {
            const data = doc.data() || {};
            users.push({
                id: doc.id,
                uid: data.uid || doc.id,
                email: data.email || '',
                nome: data.nome || formatNameFromEmail(data.email),
                cargo: normalizeUserRole(data.cargo),
                aprovado: data.aprovado === true,
                fotoUrl: data.fotoUrl || '',
                created_at: data.created_at || null
            });
        });

        // Ordenar os usuários por data de solicitação / cadastro (mais recentes primeiro)
        users.sort((a, b) => {
            const timeA = a.created_at ? (a.created_at.toMillis ? a.created_at.toMillis() : new Date(a.created_at).getTime()) : 0;
            const timeB = b.created_at ? (b.created_at.toMillis ? b.created_at.toMillis() : new Date(b.created_at).getTime()) : 0;
            return timeB - timeA;
        });

        currentLoadedUsers = users;
        renderUsersPanel(users);
    } catch (error) {
        console.error("Erro ao carregar lista de usuários:", error);
        showToast("Erro ao carregar usuários do Firebase: " + (error.message || error), "error");
    }
}

// Renderizar os cards nas abas correspondentes
function renderUsersPanel(users) {
    const pending = users.filter(u => !u.aprovado);
    const registered = users.filter(u => u.aprovado);

    if (elements.countPendingTab) {
        elements.countPendingTab.textContent = pending.length;
        elements.countPendingTab.style.display = pending.length > 0 ? 'inline-flex' : 'none';
    }
    if (elements.countRegisteredTab) {
        elements.countRegisteredTab.textContent = registered.length;
    }
    if (elements.badgePendingIndicator) {
        elements.badgePendingIndicator.textContent = pending.length;
        elements.badgePendingIndicator.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }

    // 1. Renderiza lista de Pendentes
    if (elements.listPendingUsers && elements.emptyPendingUsers) {
        if (pending.length === 0) {
            elements.listPendingUsers.innerHTML = '';
            elements.emptyPendingUsers.style.display = 'flex';
        } else {
            elements.emptyPendingUsers.style.display = 'none';
            elements.listPendingUsers.innerHTML = pending.map(u => {
                const initials = getUserInitials(u.nome);
                const avatarBg = getAvatarColor(u.email || u.uid);
                const dateStr = formatUserDate(u.created_at);
                const safeName = escapeHtml(u.nome);
                const safeEmail = escapeHtml(u.email);
                const role = normalizeUserRole(u.cargo);

                const avatarHtml = u.fotoUrl 
                    ? `<img src="${escapeHtml(u.fotoUrl)}" alt="${safeName}">` 
                    : initials;

                return `
                    <div class="user-card-item" id="user-card-${u.uid}">
                        <div class="user-card-left">
                            <div class="user-avatar-circle" style="background: ${avatarBg};">
                                ${avatarHtml}
                            </div>
                            <div class="user-card-info">
                                <div class="user-card-name">${safeName}</div>
                                <div class="user-card-email">${safeEmail}</div>
                                <div class="user-card-date">Solicitado em: ${dateStr}</div>
                            </div>
                        </div>
                        <div class="user-card-actions">
                            <select class="user-role-select" id="role-select-${u.uid}" title="Definir Nível de Acesso">
                                <option value="Consultor" ${role === 'Consultor' ? 'selected' : ''}>Consultor</option>
                                <option value="Gestor" ${role === 'Gestor' ? 'selected' : ''}>Gestor</option>
                            </select>
                            <button class="btn-user-approve" onclick="handleUserApprove('${u.uid}')" title="Aprovar Acesso">
                                <i class="fas fa-check"></i> Aprovar
                            </button>
                            <button class="btn-user-reject" onclick="handleUserReject('${u.uid}', '${safeName}')" title="Recusar Cadastro">
                                <i class="fas fa-times"></i> Recusar
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 2. Renderiza lista de Cadastrados
    if (elements.listRegisteredUsers && elements.emptyRegisteredUsers) {
        if (registered.length === 0) {
            elements.listRegisteredUsers.innerHTML = '';
            elements.emptyRegisteredUsers.style.display = 'flex';
        } else {
            elements.emptyRegisteredUsers.style.display = 'none';
            elements.listRegisteredUsers.innerHTML = registered.map(u => {
                const initials = getUserInitials(u.nome);
                const avatarBg = getAvatarColor(u.email || u.uid);
                const dateStr = formatUserDate(u.created_at);
                const safeName = escapeHtml(u.nome);
                const safeEmail = escapeHtml(u.email);
                const role = normalizeUserRole(u.cargo);

                const avatarHtml = u.fotoUrl 
                    ? `<img src="${escapeHtml(u.fotoUrl)}" alt="${safeName}">` 
                    : initials;

                return `
                    <div class="user-card-item" id="user-card-${u.uid}">
                        <div class="user-card-left">
                            <div class="user-avatar-circle" style="background: ${avatarBg};">
                                ${avatarHtml}
                            </div>
                            <div class="user-card-info">
                                <div class="user-card-name">${safeName}</div>
                                <div class="user-card-email">${safeEmail}</div>
                                <div class="user-card-date">Cadastrado em: ${dateStr}</div>
                            </div>
                        </div>
                        <div class="user-card-actions">
                            <select class="user-role-select" onchange="handleUserRoleChange('${u.uid}', this.value)" title="Alterar Nível de Acesso">
                                <option value="Consultor" ${role === 'Consultor' ? 'selected' : ''}>Consultor</option>
                                <option value="Gestor" ${role === 'Gestor' ? 'selected' : ''}>Gestor</option>
                            </select>
                            <button class="btn-user-delete" onclick="handleUserDelete('${u.uid}', '${safeName}')" title="Excluir Usuário">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Ação: Aprovar Usuário
async function handleUserApprove(uid) {
    if (!db) {
        showToast("Firebase não está conectado.", "error");
        return;
    }

    const selectElem = document.getElementById(`role-select-${uid}`);
    const selectedRole = normalizeUserRole(selectElem ? selectElem.value : 'Consultor');

    showToast("Aprovando usuário...", "info");

    try {
        await db.collection('usuarios').doc(uid).update({
            aprovado: true,
            cargo: selectedRole
        });
        showToast("Usuário aprovado com sucesso!", "success");
        await loadUsersList();
    } catch (error) {
        console.error("Erro ao aprovar usuário:", error);
        showToast("Erro ao aprovar: " + (error.message || error), "error");
    }
}

// Ação: Recusar Usuário (Remove solicitação)
async function handleUserReject(uid, userName) {
    if (!db) {
        showToast("Firebase não está conectado.", "error");
        return;
    }

    const confirmed = confirm(`Deseja realmente recusar e remover a solicitação de "${userName || 'este usuário'}"?`);
    if (!confirmed) return;

    showToast("Removendo solicitação...", "info");

    try {
        await db.collection('usuarios').doc(uid).delete();
        showToast("Solicitação de usuário recusada.", "info");
        await loadUsersList();
    } catch (error) {
        console.error("Erro ao recusar usuário:", error);
        showToast("Erro ao recusar: " + (error.message || error), "error");
    }
}

// Ação: Alterar Cargo de Usuário já Cadastrado
async function handleUserRoleChange(uid, newRole) {
    if (!db) {
        showToast("Firebase não está conectado.", "error");
        return;
    }

    const normalizedRole = normalizeUserRole(newRole);

    try {
        await db.collection('usuarios').doc(uid).update({
            cargo: normalizedRole
        });

        const currentUser = firebase.auth().currentUser;
        if (currentUser && currentUser.uid === uid) {
            currentUserRole = normalizedRole;
            applyUserPermissions();
        }

        showToast(`Nível de acesso atualizado para "${normalizedRole}".`, "success");
    } catch (error) {
        console.error("Erro ao atualizar cargo:", error);
        showToast("Erro ao atualizar nível de acesso: " + (error.message || error), "error");
    }
}

// Ação: Excluir Usuário
async function handleUserDelete(uid, userName) {
    if (!db) {
        showToast("Firebase não está conectado.", "error");
        return;
    }

    const currentUser = firebase.auth().currentUser;
    if (currentUser && currentUser.uid === uid) {
        const sure = confirm("Atenção: Você está excluindo o seu próprio usuário logado! Seu acesso será revogado. Deseja continuar?");
        if (!sure) return;
    } else {
        const confirmed = confirm(`Tem certeza de que deseja excluir o usuário "${userName || 'selecionado'}"? O acesso será revogado imediatamente.`);
        if (!confirmed) return;
    }

    showToast("Excluindo usuário...", "info");

    try {
        await db.collection('usuarios').doc(uid).delete();
        showToast("Usuário excluído com sucesso.", "success");
        await loadUsersList();
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        showToast("Erro ao excluir: " + (error.message || error), "error");
    }
}

// Exporta funções para o escopo global para que os atributos inline onclick/onchange funcionem
window.handleUserApprove = handleUserApprove;
window.handleUserReject = handleUserReject;
window.handleUserRoleChange = handleUserRoleChange;
window.handleUserDelete = handleUserDelete;
window.openUsersManagementPanel = openUsersManagementPanel;
window.switchUsersTab = switchUsersTab;

// ============================================================
// 13. CADASTRO E SELEÇÃO DE CONSULTORES (APENAS GESTOR)
// ============================================================

let consultantsList = [];
let consultantsUnsubscribe = null;

/**
 * Escuta em tempo real a coleção 'consultores' no Firestore
 * e mantém os selects e o modal sincronizados.
 */
function setupConsultantsListener() {
    if (!db) return;
    if (consultantsUnsubscribe) {
        consultantsUnsubscribe();
    }

    try {
        consultantsUnsubscribe = db.collection('consultores').onSnapshot(snapshot => {
            const list = [];
            snapshot.forEach(doc => {
                const data = doc.data() || {};
                const nome = String(data.nome || '').trim();
                if (nome) {
                    list.push({ id: doc.id, nome });
                }
            });

            list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
            consultantsList = list;
            populateConsultantSelects();
            renderConsultantsModalList();
        }, error => {
            console.warn("Aviso ao escutar consultores no Firestore:", error);
        });
    } catch (e) {
        console.warn("Erro ao configurar listener de consultores:", e);
    }
}

/**
 * Preenche um elemento <select> com os consultores cadastrados.
 */
function fillConsultantSelect(selectEl, preserveValue) {
    if (!selectEl) return;
    const currentValue = preserveValue !== undefined ? preserveValue : selectEl.value;
    const placeholder = consultantsList.length > 0
        ? 'Selecione um consultor...'
        : 'Nenhum consultor cadastrado';

    selectEl.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = placeholder;
    selectEl.appendChild(defaultOpt);

    let hasCurrentInList = false;
    consultantsList.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nome;
        opt.textContent = c.nome;
        if (currentValue && c.nome === currentValue) {
            hasCurrentInList = true;
        }
        selectEl.appendChild(opt);
    });

    // Preserva nome legado caso o veículo já tenha sido cadastrado antes da lista definida
    if (currentValue && !hasCurrentInList) {
        const legacyOpt = document.createElement('option');
        legacyOpt.value = currentValue;
        legacyOpt.textContent = currentValue;
        selectEl.appendChild(legacyOpt);
    }

    if (currentValue) {
        selectEl.value = currentValue;
    }
}

function populateConsultantSelects(editCurrentValue) {
    fillConsultantSelect(elements.regConsultor);
    fillConsultantSelect(elements.editVehConsultor, editCurrentValue);
}

function openConsultantsModal() {
    if (!isCurrentUserGestor()) {
        showToast("Apenas gestores podem cadastrar consultores.", "error");
        return;
    }
    if (!elements.consultantsModal) return;

    renderConsultantsModalList();
    showModal(elements.consultantsModal);
    if (elements.newConsultantName) {
        elements.newConsultantName.value = '';
        setTimeout(() => elements.newConsultantName.focus(), 100);
    }
}

function renderConsultantsModalList() {
    const listEl = elements.consultantsListContainer;
    const emptyEl = elements.emptyConsultantsList;
    if (!listEl || !emptyEl) return;

    listEl.innerHTML = '';

    if (consultantsList.length === 0) {
        emptyEl.style.display = 'flex';
        return;
    }

    emptyEl.style.display = 'none';

    consultantsList.forEach(c => {
        const card = document.createElement('div');
        card.className = 'user-card-item';
        card.style.padding = '10px 14px';

        const left = document.createElement('div');
        left.className = 'user-card-left';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar-circle';
        avatar.style.width = '34px';
        avatar.style.height = '34px';
        avatar.style.fontSize = '0.88rem';
        avatar.style.background = getAvatarColor(c.nome);
        avatar.textContent = getUserInitials(c.nome);

        const info = document.createElement('div');
        info.className = 'user-card-info';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'user-card-name';
        nameDiv.textContent = c.nome;
        info.appendChild(nameDiv);

        left.appendChild(avatar);
        left.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'user-card-actions';

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-user-delete';
        delBtn.title = `Excluir consultor ${c.nome}`;
        delBtn.innerHTML = `
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `;
        delBtn.addEventListener('click', () => handleConsultantDelete(c.id, c.nome));

        actions.appendChild(delBtn);
        card.appendChild(left);
        card.appendChild(actions);
        listEl.appendChild(card);
    });
}

async function handleConsultantCreate() {
    if (!isCurrentUserGestor()) {
        showToast("Apenas gestores podem cadastrar consultores.", "error");
        return;
    }
    if (!db) {
        showToast("Banco de dados Firebase não inicializado.", "error");
        return;
    }

    const rawName = elements.newConsultantName ? elements.newConsultantName.value : '';
    const nome = rawName.replace(/\s+/g, ' ').trim();

    if (!nome) {
        showToast("Informe o nome do consultor.", "error");
        return;
    }

    const duplicate = consultantsList.some(
        c => c.nome.localeCompare(nome, 'pt-BR', { sensitivity: 'base' }) === 0
    );
    if (duplicate) {
        showToast("Este consultor já está cadastrado.", "error");
        return;
    }

    try {
        const user = firebase.auth().currentUser;
        await db.collection('consultores').add({
            nome,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            created_by: user ? user.email : ''
        });

        if (elements.newConsultantName) {
            elements.newConsultantName.value = '';
            elements.newConsultantName.focus();
        }
        showToast(`Consultor "${nome}" cadastrado com sucesso!`, "success");
    } catch (error) {
        console.error("Erro ao cadastrar consultor:", error);
        if (error.code === 'permission-denied') {
            showToast("Permissão negada no Firestore para a coleção 'consultores'.", "error");
        } else {
            showToast(`Erro ao cadastrar consultor no Firebase: ${error.message || error.code || 'tente novamente.'}`, "error");
        }
    }
}

async function handleConsultantDelete(id, nome) {
    if (!isCurrentUserGestor()) {
        showToast("Apenas gestores podem excluir consultores.", "error");
        return;
    }
    if (!db || !id) return;

    const confirmed = confirm(`Deseja excluir o consultor "${nome}" da lista de seleção?`);
    if (!confirmed) return;

    try {
        await db.collection('consultores').doc(id).delete();
        showToast(`Consultor "${nome}" removido.`, "info");
    } catch (error) {
        console.error("Erro ao excluir consultor:", error);
        if (error.code === 'permission-denied') {
            showToast("Permissão negada no Firestore para excluir da coleção 'consultores'.", "error");
        } else {
            showToast(`Erro ao excluir consultor: ${error.message || error.code || 'tente novamente.'}`, "error");
        }
    }
}

