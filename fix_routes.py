"""
Script pour réorganiser les routes dans audits.py
Place /stats avant /{audit_id} pour éviter les conflits de routing
"""

# Lire le fichier
with open('backend/routers/audits.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver et extraire le bloc /stats
stats_start = content.find('@router.get("/stats")')
if stats_start == -1:
    print("ERROR: /stats route not found")
    exit(1)

# Trouver la fin du bloc /stats (prochaine fonction ou fin de fichier)
stats_end = content.find('\n@router.', stats_start + 1)
if stats_end == -1:
    stats_end = len(content)

stats_block = content[stats_start:stats_end]

# Trouver le bloc /{audit_id}
audit_id_start = content.find('@router.get("/{audit_id}")')
if audit_id_start == -1:
    print("ERROR: /{audit_id} route not found")
    exit(1)

# Construire le nouveau contenu
# Tout avant /{audit_id}
before_audit_id = content[:audit_id_start]

# Tout après /stats
after_stats = content[:stats_start] + content[stats_end:]

# Trouver où insérer /stats (juste avant /{audit_id})
audit_id_pos_in_new = after_stats.find('@router.get("/{audit_id}")')

# Construire le fichier final
new_content = (
    after_stats[:audit_id_pos_in_new] +
    stats_block + '\n\n' +
    after_stats[audit_id_pos_in_new:]
)

# Écrire le nouveau fichier
with open('backend/routers/audits.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Routes réorganisées avec succès!")
print("   /stats est maintenant avant /{audit_id}")
