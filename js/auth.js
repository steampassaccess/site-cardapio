// js/auth.js - ATUALIZADO
const AuthManager = {
    // Verificar se Firebase está pronto
    checkFirebase() {
        return typeof firebase !== 'undefined' && 
               firebase.apps && 
               firebase.apps.length > 0 &&
               firebase.auth &&
               firebase.firestore;
    },

    // Validações
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    // LOGIN COM FIREBASE - CORRIGIDO
    async loginWithFirebase(email, password, userType) {
        try {
            // Verificar se Firebase está inicializado
            if (!this.checkFirebase()) {
                return { 
                    success: false, 
                    error: "❌ Sistema não está pronto. Recarregue a página." 
                };
            }

            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Login bem-sucedido:', user.email);
            
            return { success: true, user: user };
            
        } catch (error) {
            console.error("Erro Firebase:", error);
            let errorMessage = "Erro ao fazer login";
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "📧 E-mail inválido";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "❌ Esta conta foi desativada";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "❌ Usuário não encontrado";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "🔒 Senha incorreta";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "⚠️ Muitas tentativas. Tente novamente mais tarde";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "📡 Erro de conexão. Verifique sua internet";
                    break;
                default:
                    errorMessage = `❌ Erro: ${error.message}`;
            }
            
            return { success: false, error: errorMessage };
        }
    },

    // REGISTRO COM FIREBASE (para criar primeiros usuários)
    async registerWithFirebase(email, password, userData = {}) {
        try {
            if (!this.checkFirebase()) {
                return { 
                    success: false, 
                    error: "Sistema não está pronto" 
                };
            }

            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Atualizar perfil do usuário
            if (userData.displayName) {
                await user.updateProfile({
                    displayName: userData.displayName
                });
            }
            
            // Salvar dados adicionais no Firestore
            if (userData.role) {
                await this.saveUserData(user.uid, userData);
            }
            
            return { success: true, user: user };
            
        } catch (error) {
            let errorMessage = "Erro ao criar conta";
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "📧 Este e-mail já está em uso";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "📧 E-mail inválido";
                    break;
                case 'auth/weak-password':
                    errorMessage = "🔒 Senha muito fraca (mínimo 6 caracteres)";
                    break;
                default:
                    errorMessage = `❌ Erro: ${error.message}`;
            }
            
            return { success: false, error: errorMessage };
        }
    },

    // SALVAR DADOS DO USUÁRIO NO FIRESTORE
    async saveUserData(uid, userData) {
        try {
            await firebase.firestore().collection('users').doc(uid).set({
                email: userData.email,
                role: userData.role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                ...userData
            });
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
        }
    },

    // SESSÃO
    setUserSession(userData) {
        const sessionData = {
            uid: userData.uid,
            email: userData.email,
            role: userData.role || 'lojista',
            displayName: userData.displayName || userData.email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        console.log('Sessão criada para:', userData.email);
    },

    checkExistingSession() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    },

    logout() {
        if (this.checkFirebase()) {
            firebase.auth().signOut();
        }
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    },

    getCurrentUser() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }
};