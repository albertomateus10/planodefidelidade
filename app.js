// LÓGICA PRINCIPAL DO APLICATIVO (FIREBASE VERSION)

// Estado da Aplicação
let db = null; // Banco de dados do Firestore
let currentVehicle = null;
let isAdmin = false;

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
    
    // Info do Veículo
    vehicleDetails: document.getElementById('vehicle-details'),
    infoPlaca: document.getElementById('info-placa'),
    infoChassi: document.getElementById('info-chassi'),
    infoConcessionaria: document.getElementById('info-concessionaria'),
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
    
    pinModal: document.getElementById('pin-modal'),
    pinForm: document.getElementById('pin-form'),
    pinInput: document.getElementById('pin-input'),
    closePin: document.getElementById('close-pin'),
    
    // Status do Admin
    adminBtn: document.getElementById('admin-btn'),
    adminText: document.getElementById('admin-text'),
    
    // Pista e Revisões
    stops: document.querySelectorAll('.road-stop'),
    
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
    const landingScreen  = document.getElementById('landing-screen');
    const mainApp        = document.getElementById('main-app');
    const landingForm    = document.getElementById('landing-form');
    const landingInput   = document.getElementById('landing-search-input');
    const landingSkipBtn = document.getElementById('landing-skip-btn');

    function entrarNoApp(query) {
        landingScreen.classList.add('hide');
        setTimeout(() => {
            landingScreen.style.display = 'none';
            mainApp.style.display = 'block';
            document.body.style.overflow = '';

            // Se veio com uma placa/chassi, preenche e executa a busca automaticamente
            if (query) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = query;
                    searchVehicle(query.toUpperCase());
                }
            }
        }, 600);
    }

    // Submissão do formulário de busca da landing
    landingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = landingInput.value.trim();
        entrarNoApp(query);
    });

    // Botão "Entrar sem buscar"
    landingSkipBtn.addEventListener('click', () => {
        entrarNoApp('');
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
            });
        } else {
            firebase.initializeApp(activeConfig.firebaseConfig);
            db = firebase.firestore();
            console.log("Firebase inicializado com sucesso.");
        }
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
        showToast("Erro ao conectar ao Firebase. Verifique suas credenciais.", "error");
    }
}

// 3. Configuração dos Ouvintes de Eventos (Event Listeners)
function setupEventListeners() {
    // Form de Busca
    elements.searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = elements.searchInput.value.trim().toUpperCase();
        if (!query) return;
        
        await searchVehicle(query);
    });

    // Form de Cadastro
    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const placa = elements.regPlaca.value.trim().toUpperCase();
        const chassi = elements.regChassi.value.trim().toUpperCase();
        const concessionaria = elements.regConcessionaria.value.trim();

        if (!placa || !chassi || !concessionaria) {
            showToast("Preencha todos os campos do veículo.", "error");
            return;
        }

        await registerVehicle(placa, chassi, concessionaria);
    });

    // Botão Administrativo
    elements.adminBtn.addEventListener('click', () => {
        if (isAdmin) {
            // Sair do modo admin
            isAdmin = false;
            elements.adminBtn.classList.remove('logged-in');
            elements.adminText.textContent = "Modo Administrador";
            showToast("Você saiu do modo administrador.", "success");
        } else {
            // Entrar no modo admin (pedir PIN)
            showModal(elements.pinModal);
            elements.pinInput.focus();
        }
    });

    // Submissão do PIN
    elements.pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = elements.pinInput.value.trim();
        if (pin === activeConfig.adminPin) {
            isAdmin = true;
            elements.adminBtn.classList.add('logged-in');
            elements.adminText.textContent = "Admin Ativo (Sair)";
            hideModal(elements.pinModal);
            elements.pinInput.value = "";
            showToast("Acesso administrativo liberado!", "success");
        } else {
            showToast("PIN incorreto. Tente novamente.", "error");
            elements.pinInput.select();
        }
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
    elements.closePin.addEventListener('click', () => hideModal(elements.pinModal));

    // Abrir modal de configuração ao clicar com botão direito (ou segurando Shift/Ctrl)
    elements.adminBtn.addEventListener('contextmenu', (e) => {
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

    // Interatividade da Trilha de Revisões
    elements.stops.forEach(stop => {
        stop.addEventListener('click', async () => {
            const revisionNum = parseInt(stop.getAttribute('data-revision'));
            
            if (!currentVehicle) {
                showToast("Busque ou cadastre um veículo antes para marcar as revisões.", "error");
                return;
            }

            if (!isAdmin) {
                showToast("Acesso negado. Por favor, ative o Modo Administrador para alterar as revisões.", "error");
                showModal(elements.pinModal);
                elements.pinInput.focus();
                return;
            }

            await toggleRevision(revisionNum, stop);
        });
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
    }
}

// Cadastra um novo veículo
async function registerVehicle(placa, chassi, concessionaria) {
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
            revisao_1: false,
            revisao_2: false,
            revisao_3: false,
            revisao_4: false,
            revisao_5: false,
            revisao_6: false,
            revisao_7: false,
            revisao_8: false,
            revisao_9: false,
            revisao_10: false,
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
        showToast("Veículo cadastrado no Firebase com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao inserir veículo no Firestore:", error);
        showToast("Erro ao cadastrar veículo no Firebase.", "error");
    } finally {
        showLoader(false);
    }
}

// Alterna o status de uma revisão
async function toggleRevision(num, stopElement) {
    if (!db || !currentVehicle) return;

    const columnName = `revisao_${num}`;
    const newStatus = !currentVehicle[columnName];

    // Atualização Visual Otimista
    if (newStatus) {
        stopElement.classList.add('completed');
    } else {
        stopElement.classList.remove('completed');
    }

    try {
        const docRef = db.collection('veiculos').doc(currentVehicle.id);
        const updateObj = {};
        updateObj[columnName] = newStatus;
        updateObj['updated_at'] = firebase.firestore.FieldValue.serverTimestamp();

        await docRef.update(updateObj);

        // Atualiza o estado na memória local
        currentVehicle[columnName] = newStatus;
        showToast(`Revisão ${num}ª marcada com sucesso!`, "success");
    } catch (error) {
        console.error(`Erro ao atualizar revisão no Firestore:`, error);
        showToast(`Erro ao salvar revisão ${num}ª no Firebase.`, "error");
        
        // Reverte alteração visual em caso de erro
        if (!newStatus) {
            stopElement.classList.add('completed');
        } else {
            stopElement.classList.remove('completed');
        }
    }
}

// 5. Utilitários de UI e Exibição

function displayVehicleData(vehicle) {
    elements.infoPlaca.textContent = vehicle.placa;
    elements.infoChassi.textContent = vehicle.chassi;
    elements.infoConcessionaria.textContent = vehicle.concessionaria;
    
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
    elements.stops.forEach(stop => stop.classList.remove('completed'));
}

function updateRoadVisuals(vehicle) {
    elements.stops.forEach(stop => {
        const revisionNum = parseInt(stop.getAttribute('data-revision'));
        const isCompleted = vehicle[`revisao_${revisionNum}`];
        
        if (isCompleted) {
            stop.classList.add('completed');
        } else {
            stop.classList.remove('completed');
        }
    });
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
