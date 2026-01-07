# ⚠️ VULNÉRABILITÉS TEMPORAIREMENT RÉACTIVÉES POUR CAPTURES D'ÉCRAN

**ATTENTION** : Ce fichier liste toutes les vulnérabilités qui ont été temporairement réactivées pour permettre la prise de captures d'écran. **NE PAS UTILISER EN PRODUCTION !**

## 📋 Liste des vulnérabilités réactivées

### 1. 🔴 Injection SQL - Recherche d'articles
**Fichier :** `backend/routes/articles.js`  
**Route :** `POST /api/articles/search`  
**Ligne :** ~25

**Vulnérabilité :**
- Concaténation directe de l'entrée utilisateur dans la requête SQL
- Utilisation de `query()` au lieu de `execute()`
- Validation désactivée

**Test d'exploitation :**
```json
POST /api/articles/search
{
  "title": "' OR '1'='1' --"
}
```

---

### 2. 🔴 Injection SQL - Création d'articles
**Fichier :** `backend/routes/articles.js`  
**Route :** `POST /api/articles`  
**Ligne :** ~62

**Vulnérabilité :**
- Concaténation directe dans la requête SQL
- Authentification désactivée
- `author_id` peut être manipulé depuis le body

**Test d'exploitation :**
```json
POST /api/articles
{
  "title": "Test",
  "content": "Test content",
  "author_id": 1
}
```

---

### 3. 🔴 Injection SQL - Modification d'articles
**Fichier :** `backend/routes/articles.js`  
**Route :** `PUT /api/articles/:id`  
**Ligne :** ~99

**Vulnérabilité :**
- Concaténation directe dans la requête SQL
- Authentification désactivée
- Vérification de propriété désactivée

---

### 4. 🔴 Injection SQL - Ajout de commentaires
**Fichier :** `backend/routes/comments.js`  
**Route :** `POST /api/articles/:id/comments`  
**Ligne :** ~46

**Vulnérabilité :**
- Concaténation directe dans la requête SQL
- Authentification désactivée
- `user_id` peut être manipulé depuis le body

**Test d'exploitation :**
```json
POST /api/articles/1/comments
{
  "content": "test'); DROP TABLE comments; --",
  "user_id": 1
}
```

---

### 5. 🔴 Injection SQL - Suppression de commentaires
**Fichier :** `backend/routes/comments.js`  
**Route :** `DELETE /api/comments/:id`  
**Ligne :** ~78

**Vulnérabilité :**
- Concaténation directe dans la requête SQL
- Authentification désactivée
- Vérification de propriété désactivée

---

### 6. 🔴 Mots de passe en clair - Inscription
**Fichier :** `backend/routes/auth.js`  
**Route :** `POST /api/auth/register`  
**Ligne :** ~39

**Vulnérabilité :**
- Hachage bcrypt désactivé
- Mots de passe stockés en clair dans la base de données
- Validation désactivée

**Test :**
1. Créer un utilisateur via l'API
2. Vérifier dans phpMyAdmin que le mot de passe est en clair

---

### 7. 🔴 Mots de passe en clair - Connexion
**Fichier :** `backend/routes/auth.js`  
**Route :** `POST /api/auth/login`  
**Ligne :** ~64

**Vulnérabilité :**
- Comparaison en clair au lieu de bcrypt
- Validation désactivée

---

### 8. 🟠 Exposition de données sensibles - Liste utilisateurs
**Fichier :** `backend/routes/users.js`  
**Route :** `GET /api/users`  
**Ligne :** ~8

**Vulnérabilité :**
- Utilisation de `SELECT *` au lieu de projection
- Mots de passe exposés dans la réponse JSON
- Authentification désactivée

**Test :**
```bash
GET /api/users
# Devrait retourner les mots de passe en clair
```

---

### 9. 🟠 Exposition de données sensibles - Profil utilisateur
**Fichier :** `backend/routes/users.js`  
**Route :** `GET /api/users/:id`  
**Ligne :** ~27

**Vulnérabilité :**
- Utilisation de `SELECT *` au lieu de projection
- Mots de passe exposés
- Authentification et vérification d'accès désactivées

---

### 10. 🟠 Absence d'authentification
**Fichiers :** Tous les fichiers de routes  
**Routes affectées :**
- `POST /api/articles` - Création sans authentification
- `PUT /api/articles/:id` - Modification sans authentification
- `DELETE /api/articles/:id` - Suppression sans authentification
- `POST /api/articles/:id/comments` - Commentaires sans authentification
- `DELETE /api/comments/:id` - Suppression sans authentification
- `GET /api/users` - Liste sans authentification
- `GET /api/users/:id` - Profil sans authentification
- `DELETE /api/users/:id` - Suppression sans authentification
- `PUT /api/users/:id` - Modification sans authentification

---

### 11. 🟡 Absence de validation des entrées
**Fichiers :** `backend/routes/auth.js`, `backend/routes/articles.js`, `backend/routes/comments.js`, `backend/routes/users.js`

**Vulnérabilité :**
- Toutes les validations sont commentées
- Permet des valeurs nulles, vides, ou de types incorrects

---

## 🎯 Scénarios de capture d'écran suggérés

1. **Injection SQL** : Capture de la requête malveillante et du résultat
2. **Mots de passe en clair** : Capture de phpMyAdmin montrant les mots de passe non hachés
3. **Exposition de données** : Capture de la réponse API avec les mots de passe visibles
4. **Absence d'authentification** : Capture d'une requête DELETE réussie sans token
5. **Absence de validation** : Capture d'une inscription avec des données invalides acceptées

---

## ⚠️ IMPORTANT : Réactiver les corrections après les captures

Après avoir pris toutes les captures d'écran, il faudra :
1. Restaurer les fichiers depuis Git, OU
2. Décommenter toutes les protections
3. Réactiver bcrypt
4. Réactiver les authentifications
5. Réactiver les validations

**Ne jamais commiter ces changements en production !**

