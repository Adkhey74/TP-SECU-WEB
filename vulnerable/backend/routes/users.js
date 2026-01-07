const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Route pour lister les utilisateurs
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  const sql = 'SELECT id, username, email, role, created_at FROM users';
  try {
    const [results] = await req.db.execute(sql);
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Route pour récupérer un utilisateur spécifique
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  // Un utilisateur ne peut voir que son propre profil, sauf s'il est admin
  if (parseInt(id) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  
  const sql = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
  try {
    const [results] = await req.db.execute(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Route pour supprimer un utilisateur
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Empêcher un admin de se supprimer lui-même
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  
  const sql = 'DELETE FROM users WHERE id = ?';
  try {
    const [results] = await req.db.execute(sql, [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Route pour modifier un utilisateur
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  
  // Un utilisateur ne peut modifier que son propre profil, sauf s'il est admin
  if (parseInt(id) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  
  // Seuls les admins peuvent modifier les rôles
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent modifier les rôles' });
  }
  
  // Validation des entrées
  if (username && (typeof username !== 'string' || username.trim().length < 3)) {
    return res.status(400).json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
  }
  
  if (email && (typeof email !== 'string' || !email.includes('@'))) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  
  if (password && (typeof password !== 'string' || password.length < 6)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    // Construire la requête dynamiquement selon les champs fournis
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      // ✅ HACHAGE BCRYPT RÉACTIVÉ - Mot de passe sécurisé
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (role && req.user.role === 'admin') {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à modifier' });
    }
    
    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await req.db.execute(sql, values);
    
    // Récupérer l'utilisateur mis à jour sans le mot de passe
    const [results] = await req.db.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur modifié avec succès', user: results[0] });
  } catch (err) {
    console.error('Erreur lors de la modification de l\'utilisateur :', err);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
  }
});

module.exports = router;
