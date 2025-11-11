document.addEventListener("DOMContentLoaded", () => {
    // Verificar se é dispositivo móvel
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    // Mostrar mensagem móvel se necessário
    if (isMobileDevice()) {
        document.getElementById('mobileMessage').style.display = 'flex';
        document.getElementById('loginContainer').style.display = 'none';
        return; // Parar execução do resto do código em dispositivos móveis
    }

    // O restante do seu código JavaScript original continua aqui...
    const loginBtn = document.getElementById("loginBtn");
    const msgErro = document.getElementById("msgErro");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // Sistema de ícones rotativos
    const foodIcons = ['🍕', '🍔', '🍟', '🌭', '🥗', '🍣', '🍜', '🍦', '🥤','🥨'];
    let currentIconIndex = 0;
    let iconInterval;

    // Inicializar ícones rotativos
    function initRotatingIcons() {
        const iconContainer = document.querySelector('.icon-container');
        
        foodIcons.forEach((icon, index) => {
            const iconElement = document.createElement('div');
            iconElement.className = `rotating-icon ${index === 0 ? 'icon-active' : ''}`;
            iconElement.textContent = icon;
            iconElement.setAttribute('data-icon', icon);
            iconContainer.appendChild(iconElement);
        });

        iconInterval = setInterval(rotateIcons, 2000);
    }

    function rotateIcons() {
        const icons = document.querySelectorAll('.rotating-icon');
        const currentIcon = icons[currentIconIndex];
        const nextIconIndex = (currentIconIndex + 1) % icons.length;
        const nextIcon = icons[nextIconIndex];

        currentIcon.classList.remove('icon-active');
        currentIcon.classList.add('icon-next');

        setTimeout(() => {
            nextIcon.classList.remove('icon-next');
            nextIcon.classList.add('icon-active');
            
            setTimeout(() => {
                currentIcon.classList.remove('icon-next');
                currentIcon.style.opacity = '0';
            }, 800);
        }, 100);

        currentIconIndex = nextIconIndex;
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            clearInterval(iconInterval);
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            iconInterval = setInterval(rotateIcons, 3000);
        }
    }

    function showError(message) {
        msgErro.textContent = message;
        msgErro.style.opacity = '1';
        msgErro.style.color = '#f39c12';
        
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'shake 0.5s ease';
        }, 10);
        
        setTimeout(() => {
            msgErro.style.opacity = '0';
        }, 5000);
    }

    // ✅ VERIFICAÇÃO CORRIGIDA DO FIREBASE
    function checkFirebaseReady() {
        return typeof firebase !== 'undefined' && 
               firebase.app && 
               typeof AuthManager !== 'undefined';
    }

    // ✅ LOGIN SEGURO SEM CREDENCIAIS EXPOSTAS
   // NO login.js - ATUALIZE A FUNÇÃO handleLogin
async function handleLogin() {
    // Verifica se Firebase está pronto - AGORA MAIS ROBUSTO
    if (typeof AuthManager === 'undefined' || !AuthManager.checkFirebase()) {
        showError("❌ Sistema carregando... Aguarde alguns segundos.");
        return;
    }

    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();
    const userType = document.querySelector('input[name="userType"]:checked').value;

    if (!email || !senha) {
        showError("⚠️ Preencha todos os campos!");
        return;
    }

    if (!AuthManager.validateEmail(email)) {
        showError("📧 Por favor, insira um e-mail válido!");
        return;
    }

    if (!AuthManager.validatePassword(senha)) {
        showError("🔒 A senha deve ter pelo menos 6 caracteres!");
        return;
    }

    setLoading(true);

    try {
        const result = await AuthManager.loginWithFirebase(email, senha, userType);
        
        if (result.success) {
            const user = result.user;
            
            const userSessionData = {
                uid: user.uid,
                email: user.email,
                role: userType,
                displayName: user.displayName || user.email.split('@')[0]
            };
            
            AuthManager.setUserSession(userSessionData);
            
            msgErro.textContent = "✅ Login realizado com sucesso!";
            msgErro.style.color = '#2ecc71';
            
            document.querySelector('.login-card').style.animation = 'successPulse 0.6s ease';
            
            setTimeout(() => {
                window.location.href = "pages/painel.html";
            }, 1000);
            
                } else {
                    showError(result.error);
                }
                
            } catch (error) {
                showError("❌ Erro inesperado. Tente novamente.");
                console.error("Erro no login:", error);
            }

            setLoading(false);
        }

    // Event Listeners
    loginBtn.addEventListener("click", handleLogin);

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    });

    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // CSS para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }
        @keyframes successPulse {
            0% { box-shadow: 0 20px 60px rgba(41, 128, 185, 0.3); }
            50% { box-shadow: 0 20px 60px rgba(46, 204, 113, 0.6); }
            100% { box-shadow: 0 20px 60px rgba(41, 128, 185, 0.3); }
        }
    `;
    document.head.appendChild(style);

    // Inicializar
    initRotatingIcons();

    window.addEventListener('beforeunload', () => {
        clearInterval(iconInterval);
    });
});