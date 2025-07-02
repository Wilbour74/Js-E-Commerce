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
	const cartSummary = document.getElementById("cart-summary");
	const validateBtn = document.getElementById("validate-order-btn");
	
	promoBar.innerHTML = `
        <h3>Code Promo</h3>
        <div class="promo-input-group">
            <input type="text" id="promo-input" placeholder="Code promo" class="promo-input">
            <button type="button" id="promo-submit" class="promo-btn">Valider</button>
        </div>
        <div id="promo-message" style="text-align:center;margin-top:0.5rem;color:#007bff;font-weight:600;"></div>
    `;
	
	cartSummary.innerHTML = `
        <h3>Résumé de la commande</h3>
        <div id="summary-content">
            <p>Votre panier est vide</p>
        </div>
    `;

	const promoInput = document.getElementById("promo-input");
	const promoSubmit = document.getElementById("promo-submit");
	const promoMsg = document.getElementById("promo-message");

	promoSubmit.addEventListener("click", (e) => {
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

	// Function to update cart summary
	function updateCartSummary() {
		const summaryContent = document.getElementById("summary-content");
		const panierData = userPanier.produit;
		
		if (panierData.length === 0) {
			summaryContent.innerHTML = `<p>Votre panier est vide</p>`;
			validateBtn.disabled = true;
			return;
		}

		// Calculate totals (simplified version for summary)
		let totalGeneral = 0;
		panierData.forEach(item => {
			// This is a simplified calculation - in real app you'd fetch product details
			totalGeneral += item.quantity * 50; // Assuming average price for summary
		});

		let totalFinal = totalGeneral;
		let discountText = "";
		
		if (totalGeneral > 100) {
			totalFinal = totalGeneral * 0.9;
			discountText += "<br><small>Réduction automatique -10%</small>";
		}
		
		if (promoActive) {
			totalFinal = Math.max(0, totalFinal - promoValue);
			discountText += "<br><small>Code promo -10€</small>";
		}
		
		summaryContent.innerHTML = `
			<p><strong>Articles: ${panierData.length}</strong></p>
			<p>Sous-total: ${totalGeneral.toFixed(2)} €</p>
			<p><strong>Total: ${totalFinal.toFixed(2)} €</strong></p>
			${discountText}
		`;
		
		validateBtn.disabled = false;
	}

	function updateCartSummaryWithRealData(produitsDetails, totalGeneral) {
		const summaryContent = document.getElementById("summary-content");
		
		if (produitsDetails.length === 0) {
			summaryContent.innerHTML = `<p>Votre panier est vide</p>`;
			validateBtn.disabled = true;
			return;
		}

		let totalFinal = totalGeneral;
		let discountText = "";
		
		if (totalGeneral > 100) {
			totalFinal = totalGeneral * 0.9;
			discountText += "<br><small style='color: #43a047;'>Réduction automatique -10%</small>";
		}
		
		if (promoActive) {
			totalFinal = Math.max(0, totalFinal - promoValue);
			discountText += "<br><small style='color: #43a047;'>Code promo -10€</small>";
		}
		
		summaryContent.innerHTML = `
			<p><strong>Articles: ${produitsDetails.length}</strong></p>
			<p>Sous-total: ${totalGeneral.toFixed(2)} €</p>
			<p><strong>Total: ${totalFinal.toFixed(2)} €</strong></p>
			${discountText}
		`;
		
		validateBtn.disabled = false;
	}

	validateBtn.addEventListener("click", () => {
		if (userPanier.produit.length === 0) {
			alert("Votre panier est vide !");
			return;
		}
		userPanier.clear();
		if (window.updatePanierBadge) window.updatePanierBadge();
		alert("Commande validée, merci !");
		window.location.href = "products.html";
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
                        <input type="number" min="1" value="${quantity}" max="${produit.stock}" class="qty-input" data-product-id="${produit.id}">
                        <button class="update-qty-btn panier-btn">Modifier</button>
                    </p>
                    <p class="panier-total-produit">Total : ${totalProduit.toFixed(2)} €</p>
                    <button class="remove-btn panier-btn">Supprimer</button>
                `;

				container.appendChild(itemDiv);
			});

			updateCartSummaryWithRealData(produitsDetails, totalGeneral);

		} catch (error) {
			console.error("Erreur lors de la récupération des produits :", error);
		}

		if (produitsDetails.length === 0) {
			updateCartSummary();
		}

		if (window.updatePanierBadge) window.updatePanierBadge();
	}

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

	container.addEventListener("input", async (e) => {
		if (e.target.classList.contains("qty-input")) {
			const productId = parseInt(e.target.dataset.productId);
			const newQty = parseInt(e.target.value);
			
			if (newQty && newQty > 0) {
				try {
					await userPanier.quantity(productId, newQty);
					renderPanier();
					if (window.updatePanierBadge) window.updatePanierBadge();
				} catch (error) {
					console.error("Error updating quantity:", error);
					renderPanier();
				}
			}
		}
	});

	await renderPanier();
});
