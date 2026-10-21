GÉNÉRATEUR DE POSTS X — VERSION MODULAIRE

Fichiers :
- script.js : initialise les fonctionnalités
- utils.js : fonctions utilitaires partagées
- post.js : aperçu et génération du HTML du post
- accounts.js : chargement et menus de comptes
- clipboard.js : copie du code généré
- theme.js : mode clair / mode sombre
- accounts.json : conserve ton fichier JSON existant

MODIFICATION HTML À FAIRE :
Remplace l'inclusion actuelle de script.js par :
<script type="module" src="script.js"></script>

Ne charge pas les autres fichiers JS directement dans le HTML : ils sont importés par script.js.

IMPORTANT :
- Conserve ton fichier accounts.json actuel à côté des fichiers JS.
- Conserve ton CSS et les éléments HTML avec leurs IDs/classes actuels.
- Ouvre le projet via un serveur local (par exemple Live Server dans VS Code), car fetch("./accounts.json") et les modules ES ne fonctionnent généralement pas correctement en ouvrant directement le fichier HTML en file://.
