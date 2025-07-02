import { Panier } from "../Objects/Panier.js";
import { User } from "../Objects/User.js";

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = User.load();
    // Recupération des produits
    fetch("Data/products.json")
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
                    <img src="Assets/${produit.image}" alt="${produit.nom}" class="panier-img">
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

            // if connected
            if (currentUser) {
                // add basket
                container.addEventListener("click", async (event) => {
                    if (event.target.classList.contains("add-to-cart")) {
                        const button = event.target;
                        const productId = parseInt(button.dataset.id);
                        const qtyInput = button.previousElementSibling;
                        const quantity = parseInt(qtyInput.value) || 1;
                        const panier = Panier.load(currentUser.email);
                        
                        try {
                            await panier.addProduct(productId, quantity);
                            alert("Produit ajouté au panier !");
                            if (window.updatePanierBadge) window.updatePanierBadge();
                        } catch (error) {
                            alert(error.message);
                        }
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
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
});
