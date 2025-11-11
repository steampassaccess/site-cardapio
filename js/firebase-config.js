// firebase-config.js - CORRIGIDO
try {
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAkP2OUBwrJVFZ2ughAayGqL35BQRG-h0M",
        authDomain: "siteca-cardapio.firebaseapp.com",
        projectId: "siteca-cardapio",
        storageBucket: "siteca-cardapio.firebasestorage.app",
        messagingSenderId: "115136207873",
        appId: "1:115136207873:web:d5a30fc69fb6de4763f400",
        measurementId: "G-TJ6JN5V8HN"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase inicializado com sucesso!");
    } else {
        firebase.app(); // if already initialized, use that one
    }
    
    // Inicializar serviços
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    console.log("Firebase Auth e Firestore prontos!");
    
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}