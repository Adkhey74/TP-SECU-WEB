const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

// Route pour s'inscrire
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // ✅ VALIDATION RÉACTIVÉE
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
  }
  
  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  const checkSql = 'SELECT * FROM users WHERE email = ? OR username = ?';
  const insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  try {
    const [existingUsers] = await req.db.execute(checkSql, [email, username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email ou nom d\'utilisateur déjà utilisé' });
    }
    
    // ✅ HACHAGE BCRYPT RÉACTIVÉ - Mots de passe sécurisés
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [results] = await req.db.execute(insertSql, [username, email, hashedPassword]);
    res.status(201).json({ message: 'Utilisateur créé avec succès', id: results.insertId });
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Route pour se connecter
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // ✅ VALIDATION RÉACTIVÉE
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe sont requis' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await req.db.execute(sql, [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const user = results[0];
    
    // ✅ COMPARAISON BCRYPT RÉACTIVÉE - Comparaison sécurisée
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Ne pas envoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user);
    res.json({ message: 'Connexion réussie', token, user: userWithoutPassword });
  } catch (err) {
    console.error('Erreur lors de la connexion :', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
