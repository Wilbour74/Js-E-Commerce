# Projet E-commerce

## Description
Application simple de gestion de panier d'un site e-commerce en JavaScript vanilla.

## Fonctionnalités
- Inscription et connexion utilisateur
- Liste des produits avec gestion du stock
- Ajout/suppression de favoris
- Gestion du panier (ajout, modification, suppression)
- Système de réductions (10% si > 100€, code promo "ESGI10")
- Interface responsive

## Technologies utilisées
- HTML5
- CSS3
- JavaScript ES6+ (classes, modules)
- LocalStorage pour la persistance

## Structure du projet
```
E-co/
├── index.html          # Page d'accueil
├── products.html       # Liste des produits
├── panier.html         # Panier utilisateur
├── login.html          # Connexion
├── register.html       # Inscription
├── userAccount.html    # Compte utilisateur
├── Assets/             # Images des produits
├── Data/               # Données JSON
├── Objects/            # Classes JavaScript
├── Scripts/            # Scripts JavaScript
└── style/              # Feuilles de style
```

## Installation et utilisation
1. Cloner le repository
2. Ouvrir `index.html` dans un navigateur
3. Naviguer vers la page produits pour commencer

## Auteurs
**Le-Savio NGUYEN**
**Mehdi Rezgui**
**Willfried Bourguignon**

## Notes techniques
- Utilisation de classes JavaScript
- Hachage des mots de passe (SHA-256)
- Gestion des modules ES6
- Validation côté client
- Persistance avec localStorage
