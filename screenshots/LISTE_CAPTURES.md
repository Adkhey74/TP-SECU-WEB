# 📸 Liste des Captures d'Écran à Prendre

Ce document liste toutes les captures d'écran nécessaires pour le rapport de sécurité, avec des captures "avant" et "après" correction pour chaque vulnérabilité.

## 🔴 Vulnérabilités Critiques

### 1. Injection SQL - Recherche d'articles

**Fichiers à créer :**
- `sql-injection-search-before.png` - Tentative d'injection SQL réussie
- `sql-injection-search-after.png` - Injection SQL bloquée (requête sécurisée)

**Comment capturer :**
1. **Avant** : Avec les vulnérabilités réactivées, envoyer une requête POST à `/api/articles/search` avec `{"title": "' OR '1'='1' --"}` et capturer le résultat (tous les articles retournés)
2. **Après** : Avec les corrections activées, envoyer la même requête et capturer le résultat (requête traitée comme recherche normale, pas d'injection)

---

### 2. Injection SQL - Commentaires

**Fichiers à créer :**
- `sql-injection-comments-before.png` - Injection SQL dans les commentaires réussie
- `sql-injection-comments-after.png` - Injection SQL bloquée

**Comment capturer :**
1. **Avant** : POST `/api/articles/1/comments` avec `{"content": "test'); DROP TABLE comments; --", "user_id": 1}` et capturer
2. **Après** : Même requête avec corrections, capturer la réponse sécurisée

---

### 3. Mots de passe en clair

**Fichiers à créer :**
- `passwords-plaintext-before.png` - Vue phpMyAdmin montrant les mots de passe en clair
- `passwords-hashed-after.png` - Vue phpMyAdmin montrant les mots de passe hachés avec bcrypt

**Comment capturer :**
1. **Avant** : 
   - Créer un utilisateur via l'API avec les vulnérabilités réactivées
   - Ouvrir phpMyAdmin (http://localhost:4003)
   - Aller dans la table `users` et capturer la colonne `password` avec les mots de passe en clair
2. **Après** :
   - Avec les corrections activées, créer un nouvel utilisateur
   - Capturer la même vue montrant les mots de passe hachés (longues chaînes bcrypt)

---

### 4. Absence d'authentification - Routes utilisateurs

**Fichiers à créer :**
- `auth-users-before.png` - GET `/api/users` sans token (succès)
- `auth-users-after.png` - GET `/api/users` sans token (erreur 401)

**Comment capturer :**
1. **Avant** : Faire une requête GET `/api/users` sans header Authorization, capturer la réponse 200 avec la liste des utilisateurs
2. **Après** : Même requête sans token, capturer l'erreur 401 Unauthorized

---

### 5. Absence d'authentification - Routes articles

**Fichiers à créer :**
- `auth-articles-before.png` - POST `/api/articles` sans token (succès)
- `auth-articles-after.png` - POST `/api/articles` sans token (erreur 401)

**Comment capturer :**
1. **Avant** : POST `/api/articles` sans token avec `{"title": "Test", "content": "Test", "author_id": 1}`, capturer le succès
2. **Après** : Même requête, capturer l'erreur 401

---

### 6. Absence d'authentification - Routes commentaires

**Fichiers à créer :**
- `auth-comments-before.png` - POST `/api/articles/1/comments` sans token (succès)
- `auth-comments-after.png` - POST `/api/articles/1/comments` sans token (erreur 401)

**Comment capturer :**
1. **Avant** : POST `/api/articles/1/comments` sans token, capturer le succès
2. **Après** : Même requête, capturer l'erreur 401

---

## 🟠 Vulnérabilités Élevées

### 7. Exposition de données sensibles

**Fichiers à créer :**
- `exposure-passwords-before.png` - Réponse API GET `/api/users` avec mots de passe visibles
- `exposure-passwords-after.png` - Réponse API GET `/api/users` sans mots de passe

**Comment capturer :**
1. **Avant** : GET `/api/users` (avec vulnérabilités réactivées), capturer la réponse JSON montrant le champ `password` en clair
2. **Après** : GET `/api/users` (avec corrections), capturer la réponse JSON sans le champ `password`

---

### 8. Absence de validation

**Fichiers à créer :**
- `validation-before.png` - Inscription avec données invalides acceptées
- `validation-after.png` - Inscription avec erreurs de validation affichées

**Comment capturer :**
1. **Avant** : POST `/api/auth/register` avec `{"username": "ab", "email": "invalid", "password": "123"}` (données invalides), capturer le succès (ou l'erreur générique)
2. **Après** : Même requête, capturer les messages d'erreur détaillés de validation

---

## 🟡 Vulnérabilités Moyennes

### 9. Contrôle d'accès insuffisant

**Fichiers à créer :**
- `access-control-before.png` - Modification d'un article d'un autre utilisateur réussie
- `access-control-after.png` - Modification refusée (erreur 403)

**Comment capturer :**
1. **Avant** : 
   - Se connecter en tant qu'utilisateur A
   - Essayer de modifier un article créé par l'utilisateur B
   - Capturer le succès (modification non autorisée réussie)
2. **Après** : 
   - Même scénario
   - Capturer l'erreur 403 Forbidden

---

## 🧪 Tests de Validation

### 10. Test d'injection SQL

**Fichiers à créer :**
- `test-sql-injection-before.png` - Test d'injection SQL avant correction
- `test-sql-injection-after.png` - Test d'injection SQL après correction

**Comment capturer :**
1. **Avant** : POST `/api/articles/search` avec payload d'injection, capturer le résultat
2. **Après** : Même test, capturer le résultat sécurisé

---

### 11. Test d'authentification

**Fichiers à créer :**
- `test-auth-before.png` - Suppression utilisateur sans token (succès)
- `test-auth-after.png` - Suppression utilisateur sans token (erreur 401)

**Comment capturer :**
1. **Avant** : DELETE `/api/users/1` sans token, capturer le succès
2. **Après** : Même requête, capturer l'erreur 401

---

### 12. Test de permissions

**Fichiers à créer :**
- `test-permissions-before.png` - Modification article d'un autre utilisateur (succès)
- `test-permissions-after.png` - Modification refusée (erreur 403)

**Comment capturer :**
1. **Avant** : PUT `/api/articles/1` avec token d'un utilisateur qui n'est pas l'auteur, capturer le succès
2. **Après** : Même requête, capturer l'erreur 403

---

### 13. Test de validation

**Fichiers à créer :**
- `test-validation-before.png` - Données invalides acceptées
- `test-validation-after.png` - Erreurs de validation affichées

**Comment capturer :**
1. **Avant** : POST `/api/auth/register` avec données invalides, capturer
2. **Après** : Même requête, capturer les messages d'erreur

---

## 📋 Checklist

- [ ] sql-injection-search-before.png
- [ ] sql-injection-search-after.png
- [ ] sql-injection-comments-before.png
- [ ] sql-injection-comments-after.png
- [ ] passwords-plaintext-before.png
- [ ] passwords-hashed-after.png
- [ ] auth-users-before.png
- [ ] auth-users-after.png
- [ ] auth-articles-before.png
- [ ] auth-articles-after.png
- [ ] auth-comments-before.png
- [ ] auth-comments-after.png
- [ ] exposure-passwords-before.png
- [ ] exposure-passwords-after.png
- [ ] validation-before.png
- [ ] validation-after.png
- [ ] access-control-before.png
- [ ] access-control-after.png
- [ ] test-sql-injection-before.png
- [ ] test-sql-injection-after.png
- [ ] test-auth-before.png
- [ ] test-auth-after.png
- [ ] test-permissions-before.png
- [ ] test-permissions-after.png
- [ ] test-validation-before.png
- [ ] test-validation-after.png

**Total : 26 captures d'écran**

---

## 💡 Conseils

1. **Utilisez un outil comme Postman, Bruno, ou curl** pour les tests d'API
2. **Pour phpMyAdmin**, utilisez http://localhost:4003
3. **Prenez des captures claires** montrant clairement la différence avant/après
4. **Nommez les fichiers exactement** comme indiqué ci-dessus
5. **Redimensionnez si nécessaire** (largeur recommandée : 800-1200 pixels)

