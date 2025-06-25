import { Panier } from "../Objects/Panier.js";
import { User } from "../Objects/User.js";

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = User.load();
    const topBar = document.getElementById("top-bar");
    // Recupération des produits
    fetch("../Data/products.json")
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement du fichier JSON.");
            return response.json();
        })
        .then(produits => {
            const container = document.getElementById("product-list");

            produits.forEach(produit => {
                const card = document.createElement("div");
                card.classList.add("product");

                // Détermination du badge stock
                let stockBadge = "";
                if (produit.stock === 0) {
                    stockBadge = `<span class='stock-badge stock-red'>Rupture de stock</span>`;
                } else if (produit.stock < 10) {
                    stockBadge = `<span class='stock-badge stock-orange'>Il en reste plus que ${produit.stock} !</span>`;
                } else {
                    stockBadge = `<span class='stock-badge stock-green'>En stock</span>`;
                }
                // Création des cards
                card.innerHTML = `
                    <img src="../Assets/${produit.image}" alt="${produit.nom}" class="panier-img">
                    <h3>${produit.nom}</h3>
                    <div class="price">${produit.prix.toFixed(2)} €</div>
                    <div>${stockBadge}</div>
                    ${
                        currentUser
                            ? produit.stock > 0
                                ? `<div style="margin:0.7em 0;display:flex;justify-content:center;align-items:center;gap:0.5em;">
                                        <input type="number" min="1" max="${produit.stock}" value="1" class="qty-input" />
                                        <button class="add-to-cart panier-btn" data-id="${produit.id}">Ajouter 🛒</button>
                                    </div>
                                    <button class="fav-btn panier-btn" data-id="${produit.id}">
                                        ${currentUser.favoris.includes(produit.id) ? "★" : "☆"} Favoris
                                    </button>`
                                : `<button class="fav-btn panier-btn" data-id="${produit.id}">
                                        ${currentUser.favoris.includes(produit.id) ? "★" : "☆"} Favoris
                                    </button>`
                            : `<p><em>Connectez-vous pour acheter</em></p>`
                    }
                `;

                container.appendChild(card);
            });
            // Si on est connecté
            if (currentUser) {
                // Ajouter au panier
                container.addEventListener("click", (event) => {
                    if (event.target.classList.contains("add-to-cart")) {
                        const button = event.target;
                        const productId = parseInt(button.dataset.id);
                        const qtyInput = button.previousElementSibling;
                        const quantity = parseInt(qtyInput.value) || 1;
                        const panier = Panier.load(currentUser.pseudo);
                        panier.addProduct(productId, quantity);

                        alert("Produit ajouté au panier !");
                    }
                    if (event.target.classList.contains("fav-btn")) {
                        const btn = event.target;
                        const productId = parseInt(btn.dataset.id);
                        // Mettre ou supprimer l'étoile
                        const message = User.toggleFavori(productId);

                        if (btn.textContent.trim().startsWith("☆")) {
                            btn.textContent = "★ Favoris";
                        } else {
                            btn.textContent = "☆ Favoris";
                        }
                    }
                });

                // Création d'un conteneur pour les boutons de la top-bar
                const btnGroup = document.createElement("div");
                btnGroup.style.display = "flex";
                btnGroup.style.justifyContent = "flex-end";
                btnGroup.style.gap = "1rem";
                btnGroup.style.margin = "0 1rem 0 0";

                const logoutBtn = document.createElement("button");
                logoutBtn.textContent = `Déconnexion (${currentUser.pseudo})`;
                logoutBtn.id = "logout-btn";
                logoutBtn.className = "topbar-btn logout";
                logoutBtn.addEventListener("click", () => {
                    User.logout();
                    location.reload();
                });

                const panierBtn = document.createElement("button");
                panierBtn.textContent = `Panier`;
                panierBtn.id = "panier-btn";
                panierBtn.className = "topbar-btn panier";
                panierBtn.addEventListener("click", () => {
                    window.history.replaceState(null, '', 'panier.html');
                    location.reload();
                });

                btnGroup.appendChild(panierBtn);
                btnGroup.appendChild(logoutBtn);
                topBar.appendChild(btnGroup);
            } 
            // Sinon afficher un  bouton d'authentification
            else{
                const authBtn = document.createElement("button");
                authBtn.textContent = `Authentification`;
                authBtn.id = "auth-btn";
                authBtn.className = "topbar-btn home";
                authBtn.addEventListener("click", () => {
                    window.history.replaceState(null, '', 'index.html');
                    location.reload();
                })
                topBar.appendChild(authBtn);
            }
            
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
});
