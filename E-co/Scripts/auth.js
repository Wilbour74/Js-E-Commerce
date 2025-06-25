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


    // Gestion du formulaire de connexion
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const message = await User.login(email, password);
        window.history.replaceState(null, '', 'products.html');
        location.reload();
        loginForm.reset();
    });

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("register-name").value;
        const pseudo = document.getElementById("register-pseudo").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const newUser = new User(name, pseudo, email, password);
        const message = await newUser.register();
        window.history.replaceState(null, '', 'products.html');
        location.reload();
        registerForm.reset();
    });
}); 