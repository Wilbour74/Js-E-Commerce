document.addEventListener("DOMContentLoaded", () => {
    const topBar = document.getElementById("top-bar");
    if (!topBar) return;

    topBar.innerHTML = `
        <div class="navbar-logo">
            <a href="products.html"><img src="Assets/homeFootball.png" alt="Accueil" class="navbar-icon"></a>
        </div>
        <div class="navbar-actions">
            <button class="topbar-btn panier" id="panier-btn" style="position:relative;">
                Panier
                <span class="panier-badge" id="panier-badge" style="display:none;">0</span>
            </button>
            <button class="topbar-btn account" id="account-btn">Compte</button>
            <button class="topbar-btn logout" id="logout-btn">Déconnexion</button>
        </div>
    `;

    // Redirection bouton panier
    document.getElementById("panier-btn").onclick = () => {
        window.location.href = "panier.html";
    };

    document.getElementById("account-btn").onclick = () => {
        window.location.href = "userAccount.html";
    };

    document.getElementById("logout-btn").onclick = () => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    };

    function updatePanierBadge() {
        let user = JSON.parse(localStorage.getItem("currentUser"));
        let pseudo = user && user.pseudo ? user.pseudo : null;
        let panier = pseudo ? JSON.parse(localStorage.getItem(`panier_${pseudo}`)) : [];
        console.log("navbar.js badge debug", {pseudo, panier});
        let total = panier ? panier.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        const badge = document.getElementById("panier-badge");
        badge.textContent = total;
        badge.style.display = total > 0 ? "inline-block" : "none";
    }

    updatePanierBadge();

    window.updatePanierBadge = updatePanierBadge;
});