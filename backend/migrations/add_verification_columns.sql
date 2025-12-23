-- Migration pour ajouter la vérification d'email
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);

-- Mettre à jour les utilisateurs existants pour qu'ils soient vérifiés par défaut (sinon ils ne pourront plus se connecter)
UPDATE users SET is_verified = TRUE WHERE is_verified IS FALSE;
