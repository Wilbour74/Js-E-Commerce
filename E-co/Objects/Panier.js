export class Panier {
    produit;
    userEmail;

    constructor(userEmail) {
        this.userEmail = userEmail;
        this.produit = [];
    }

    static load(userEmail) {
        const data = JSON.parse(localStorage.getItem(`panier_${userEmail}`) || "[]");
        const panier = new Panier(userEmail);
        panier.produit = data;
        return panier;
    }

    save() {
        localStorage.setItem(`panier_${this.userEmail}`, JSON.stringify(this.produit));
    }

    addProduct(productId, quantity = 1) {
        const existing = this.produit.find(p => p.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.produit.push({ id: productId, quantity });
        }
        this.save();
    }

    quantity(productId, quantity) {
        const existing = this.produit.find(p => p.id === productId);
        if (existing) {
            if (quantity > 0) {
                existing.quantity = quantity;
            } else {
                this.produit = this.produit.filter(p => p.id !== productId);
            }
            this.save();
        }
    }   

    removeProduct(productId) {
        this.produit = this.produit.filter(p => p.id !== productId);
        this.save();
    }

    clear(){
        this.produit = [];
        this.save();
    }

    async fetchProduitsDetails() {
        const response = await fetch("../Data/products.json");
        if (!response.ok) throw new Error("Erreur de chargement du fichier JSON.");
        const allProducts = await response.json();

        const panierIds = this.produit.map(item => item.id);
        const produitsFiltres = allProducts.filter(prod => panierIds.includes(prod.id));

        return produitsFiltres.map(prod => {
            const itemPanier = this.produit.find(p => p.id === prod.id);
            return {
                ...prod,
                quantity: itemPanier.quantity
            };
        });
    }
    
}
