import { Panier } from "../Objects/Panier.js";
import { User } from "../Objects/User.js";

document.addEventListener("DOMContentLoaded", async () => {
	const currentUser = User.load();
	if (!currentUser) {
		window.location.replace("index.html");
		return;
	}

	// Gestion promotion
	let promoActive = false;
	let promoCode = "ESGI10";
	let promoValue = 10;
	const promoBar = document.getElementById("promo-bar");
	promoBar.innerHTML = `
        <form id="promo-form" style="margin:2rem auto 0 auto;max-width:350px;display:flex;gap:0.5rem;justify-content:center;">
            <input type="text" id="promo-input" placeholder="Code promo" style="flex:1;padding:0.6em 1em;border-radius:8px;border:1.5px solid #ccc;font-size:1em;">
            <button type="submit" class="topbar-btn promo">Valider</button>
        </form>
        <div id="promo-message" style="text-align:center;margin-top:0.5rem;color:#007bff;font-weight:600;"></div>
    `;

	const promoForm = document.getElementById("promo-form");
	const promoInput = document.getElementById("promo-input");
	const promoMsg = document.getElementById("promo-message");

	promoForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const inputCode = promoInput.value.trim().toUpperCase();
		
		if (inputCode === promoCode) {
			if (promoActive) {
				promoMsg.textContent = "Code promo déjà appliqué !";
				promoMsg.style.color = "#ffc107";
			} else {
				promoActive = true;
				promoMsg.textContent = "Code promo appliqué : -10€";
				promoMsg.style.color = "#43a047";
				renderPanier();
			}
		} else if (inputCode === "") {
			promoMsg.textContent = "Veuillez saisir un code promo.";
			promoMsg.style.color = "#e53935";
		} else {
			promoActive = false;
			promoMsg.textContent = "Code promo invalide.";
			promoMsg.style.color = "#e53935";
			renderPanier();
		}
	});

	const userEmail = currentUser.email;
	const panierData = JSON.parse(localStorage.getItem(`panier_${userEmail}`)) || [];
	const userPanier = new Panier(userEmail);
	userPanier.produit = panierData;

	if (window.updatePanierBadge) window.updatePanierBadge();

	const container = document.getElementById("panier-list");

	// Fonction pour afficher les éléments de notre panier
	async function renderPanier() {
		try {
			const produitsDetails = await userPanier.fetchProduitsDetails();
			container.innerHTML = "";

			// Vérifier si le panier est vide
			if (produitsDetails.length === 0) {
				container.innerHTML = `
					<div class="panier-vide">
						<div class="panier-vide-icon">🛒</div>
						<h2>Votre panier est vide</h2>
						<p>Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.</p>
						<a href="products.html" class="panier-btn continuer-achats">Continuer mes achats</a>
					</div>
				`;
				return;
			}

			let totalGeneral = 0;

			produitsDetails.forEach(produit => {
				const panierItem = userPanier.produit.find(p => p.id === produit.id);
				if (!panierItem) return;

				const quantity = panierItem.quantity;
				const prixUnitaire = produit.prix;
				const totalProduit = prixUnitaire * quantity;
				totalGeneral += totalProduit;

				const itemDiv = document.createElement("div");
				itemDiv.classList.add("panier-item");
				itemDiv.dataset.id = produit.id;

				itemDiv.innerHTML = `
                    <img src="Assets/${produit.image}" alt="${produit.nom}" class="panier-img">
                    <h4>${produit.nom}</h4>
                    <p class="panier-price">Prix unitaire : ${prixUnitaire.toFixed(2)} €</p>
                    <p>
                        Quantité : 
                        <input type="number" min="1" value="${quantity}" max="${produit.stock}" class="qty-input">
                        <button class="update-qty-btn panier-btn">Modifier</button>
                    </p>
                    <p class="panier-total-produit">Total : ${totalProduit.toFixed(2)} €</p>
                    <button class="remove-btn panier-btn">Supprimer</button>
                `;

				container.appendChild(itemDiv);
			});

			const totalDiv = document.createElement("div");
			totalDiv.classList.add("panier-total");
			let totalFinal = totalGeneral;
			let reducMsg = "";
			
			if (totalGeneral > 100) {
				totalFinal = totalGeneral * 0.9;
				reducMsg = `<span class="promo-applied">(Réduction automatique -10%)</span>`;
			}
			
			if (promoActive) {
				totalFinal = Math.max(0, totalFinal - promoValue);
				if (reducMsg) {
					reducMsg = `<span class="promo-applied">(Réduction -10% + Code promo -10€)</span>`;
				} else {
					reducMsg = `<span class="promo-applied">(Code promo -10€)</span>`;
				}
			}
			
			totalDiv.innerHTML = `<h3>Total général : ${totalFinal.toFixed(2)} € ${reducMsg}</h3>`;
			container.appendChild(totalDiv);

			const validerBtn = document.createElement("button");
			validerBtn.textContent = "Valider la commande";
			validerBtn.className = "panier-btn valider";
			container.appendChild(validerBtn);

			validerBtn.addEventListener("click", () => {
				userPanier.clear();
				if (window.updatePanierBadge) window.updatePanierBadge();
				alert("Commande validée, merci !");
				window.location.href = "products.html";
			});

		} catch (error) {
			console.error("Erreur lors de la récupération des produits :", error);
		}

		if (window.updatePanierBadge) window.updatePanierBadge();
	}

	// Supprimer les produits d'un panier
	container.addEventListener("click", async (e) => {
		const target = e.target;

		if (target.classList.contains("remove-btn")) {
			const productId = parseInt(target.closest(".panier-item").dataset.id);
			userPanier.removeProduct(productId);
			renderPanier();
			if (window.updatePanierBadge) window.updatePanierBadge();
		}

        if (target.classList.contains("update-qty-btn")) {
            const itemDiv = target.closest(".panier-item");
            const productId = parseInt(itemDiv.dataset.id);
            const qtyInput = itemDiv.querySelector(".qty-input");
            const newQty = parseInt(qtyInput.value);

            if (newQty && newQty > 0) {
                try {
                    await userPanier.quantity(productId, newQty);
                    renderPanier();
                    if (window.updatePanierBadge) window.updatePanierBadge();
                } catch (error) {
                    alert(error.message);
                    renderPanier();
                }
            } else {
                alert("Veuillez entrer une quantité valide (>=1).");
            }
        }
	});

	await renderPanier();
});
