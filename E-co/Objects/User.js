import { Panier } from "./Panier.js";

export class User {
    name;
    pseudo;
    email;
    password;
    favoris;

    constructor(Name, Pseudo, Email, Password) {
        this.name = Name;
        this.pseudo = Pseudo;
        this.email = Email;
        this.password = Password;
        this.favoris = [];
    }

    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async register() {
        const users = JSON.parse(localStorage.getItem('users') || "[]");
        const emailExists = users.some(u => u.email === this.email);
        if (emailExists) return "Cet email est déjà utilisé.";
        this.password = await User.hashPassword(this.password);
        users.push(this);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify({ email: this.email }));
        const panier = new Panier(this.pseudo);
        localStorage.setItem(`panier_${this.pseudo}`, JSON.stringify(panier.produit));
        return `Inscription validée ${this.name}`;
    }

    static async login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || "[]");
        const hashed = await User.hashPassword(password);
        const foundUser = users.find(user => user.email === email && user.password === hashed);
        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify({ email: foundUser.email }));
            return `Connexion réussie, bienvenue ${foundUser.name}`;
        } else {
            return "Email ou mot de passe incorrect.";
        }
    }

    static logout() {
        localStorage.removeItem("currentUser");
        return "Déconnexion réussie.";
    }

    static load() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return null;
        const users = JSON.parse(localStorage.getItem('users') || "[]");
        return users.find(u => u.email === currentUser.email) || null;
    }

    static save(user) {
        if (!user || !user.email) return;
        const users = JSON.parse(localStorage.getItem('users') || "[]");
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users[index] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify({ email: user.email }));
    }

    static toggleFavori(productId) {
        const currentUser = User.load();
        if (!currentUser) return "Aucun utilisateur connecté";
        const index = currentUser.favoris.indexOf(productId);
        let message = "";
        if (index === -1) {
            currentUser.favoris.push(productId);
            message = "Ajout du produit en favoris";
        } else {
            currentUser.favoris.splice(index, 1);
            message = "Suppression du produit des favoris";
        }
        User.save(currentUser);
        return message;
    }

    static getByEmail(email) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        return users.find(u => u.email === email) || null;
    }
}
