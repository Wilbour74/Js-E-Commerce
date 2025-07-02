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

    async addProduct(productId, quantity = 1) {
        const response = await fetch("../Data/products.json");
        if (!response.ok) throw new Error("Erreur de chargement du fichier JSON.");
        const allProducts = await response.json();
        const product = allProducts.find(p => p.id === productId);
        
        if (!product) {
            throw new Error("Produit non trouvé");
        }
        
        const existing = this.produit.find(p => p.id === productId);
        const currentQuantityInCart = existing ? existing.quantity : 0;
        const totalQuantity = currentQuantityInCart + quantity;
        
        if (totalQuantity > product.stock) {
            throw new Error(`Stock insuffisant. Stock disponible: ${product.stock}, quantité dans le panier: ${currentQuantityInCart}`);
        }
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.produit.push({ id: productId, quantity });
        }
        this.save();
    }

    async quantity(productId, quantity) {
        const existing = this.produit.find(p => p.id === productId);
        if (existing) {
            if (quantity > 0) {
                const response = await fetch("../Data/products.json");
                if (!response.ok) throw new Error("Erreur de chargement du fichier JSON.");
                const allProducts = await response.json();
                const product = allProducts.find(p => p.id === productId);
                
                if (!product) {
                    throw new Error("Produit non trouvé");
                }
                
                if (quantity > product.stock) {
                    throw new Error(`Stock insuffisant. Stock disponible: ${product.stock}`);
                }
                
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
