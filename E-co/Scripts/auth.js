import { User } from "../Objects/User.js";

document.addEventListener('DOMContentLoaded', function () {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');

    function showPanel(panelToShow, tabToActivate) {
        loginPanel.hidden = true;
        registerPanel.hidden = true;
        tabLogin.classList.remove('active');
        tabRegister.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'false');
        tabRegister.setAttribute('aria-selected', 'false');
        panelToShow.hidden = false;
        tabToActivate.classList.add('active');
        tabToActivate.setAttribute('aria-selected', 'true');
        const firstInput = panelToShow.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    tabLogin.addEventListener('click', function () {
        showPanel(loginPanel, tabLogin);
    });
    tabRegister.addEventListener('click', function () {
        showPanel(registerPanel, tabRegister);
    });

    // Message d'erreur pour la connexion
    let loginError = document.createElement('div');
    loginError.id = 'login-error';
    loginError.style.color = '#e53935';
    loginError.style.fontWeight = '600';
    loginError.style.margin = '0.5em 0 0.5em 0';
    loginPanel.insertBefore(loginError, loginPanel.querySelector('form').nextSibling);

    // Message d'erreur pour l'inscription
    let registerError = document.createElement('div');
    registerError.id = 'register-error';
    registerError.style.color = '#e53935';
    registerError.style.fontWeight = '600';
    registerError.style.margin = '0.5em 0 0.5em 0';
    registerPanel.insertBefore(registerError, registerPanel.querySelector('form').nextSibling);

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const message = await User.login(email, password);
        if (message.startsWith("Connexion réussie")) {
            const user = User.getByEmail(email);
            if (user) {
                localStorage.setItem("currentUser", JSON.stringify({
                    prenom: user.prenom,
                    nom: user.nom,
                    email: user.email
                }));
            }
            window.history.replaceState(null, '', 'products.html');
            location.reload();
            loginForm.reset();
        } else {
            loginError.textContent = message;
        }
    });

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const prenom = document.getElementById("register-prenom").value;
        const nom = document.getElementById("register-nom").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const password2 = document.getElementById("register-password2").value;
        // Vérification email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            registerError.textContent = "L'adresse email n'est pas valide.";
            return;
        }
        // Vérification robustesse du mot de passe
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            registerError.textContent = "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.";
            return;
        }
        if (password !== password2) {
            registerError.textContent = "Les mots de passe ne correspondent pas.";
            return;
        } else {
            registerError.textContent = "";
        }
        const newUser = new User(prenom, nom, email, password);
        const message = await newUser.register();
        if (message.startsWith("Inscription validée")) {
            localStorage.setItem("currentUser", JSON.stringify({
                prenom: prenom,
                nom: nom,
                email: email
            }));
            window.history.replaceState(null, '', 'products.html');
            location.reload();
            registerForm.reset();
        } else {
            registerError.textContent = message;
        }
    });
});
