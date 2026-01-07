const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Route pour lister les commentaires d'un article
router.get('/articles/:id/comments', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM comments WHERE article_id = ?';

  try {
    const [results] = await req.db.execute(sql, [id]);
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des commentaires :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// Route pour récupérer un commentaire spécifique
router.get('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM comments WHERE id = ?';
  try {
    const [results] = await req.db.execute(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du commentaire :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du commentaire' });
  }
});

// Route pour ajouter un commentaire
router.post('/articles/:id/comments', authenticate, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  // Validation des entrées
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
  }

  // user_id récupéré automatiquement depuis le token
  const user_id = req.user.id;
  const sql = 'INSERT INTO comments (content, user_id, article_id) VALUES (?, ?, ?)';
  try {
    const [results] = await req.db.execute(sql, [content, user_id, id]);
    const newComment = {
      id: results.insertId,
      content,
      user_id,
      article_id: id
    };
    res.status(201).json({ message: "Commentaire ajouté à l'article", comment: newComment });
  } catch (err) {
    console.error('Erreur lors de la création du commentaire :', err);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
});

// Route pour supprimer un commentaire (admin ou auteur du commentaire)
router.delete('/comments/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  // Vérifier que l'utilisateur est l'auteur du commentaire ou un admin
  const checkSql = 'SELECT user_id FROM comments WHERE id = ?';
  try {
    const [comment] = await req.db.execute(checkSql, [id]);
    if (comment.length === 0) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }
    
    if (comment[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' });
    }

    const sql = 'DELETE FROM comments WHERE id = ?';
    await req.db.execute(sql, [id]);
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du commentaire :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
});

module.exports = router;
