# Projet Final – Déploiement d'une Application Web 3-Tiers avec Ansible

## Description

Ce projet déploie une application web en **3 couches** (frontend, backend, base de données) en utilisant **Ansible** : playbooks, rôles, Ansible Vault pour les secrets, templates Jinja2 et handlers. Les cibles sont des conteneurs Docker accessibles en SSH (web1, web2, db1).

## Architecture

Architecture **3-tiers** :

- **Frontend** : Nginx sur web1 et web2 (ports SSH 2221, 2222), sert la page d’accueil et proxyfie `/api/` vers le backend.
- **Backend** : API Node.js (Express) sur db1 (port SSH 2223), endpoints `/` et `/users`, connexion à PostgreSQL.
- **Database** : PostgreSQL sur db1, base `appdb`, table `users`.

```
                    Utilisateurs (navigateur)
                              │
                              │ HTTP (port 80)
                              ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND – Nginx (web1, web2)                          │
│  Pages HTML / proxy /api/ → backend                     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP (port 3000)
                            ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND – Node.js / Express (db1)                      │
│  API REST : / , /users                                  │
└───────────────────────────┬─────────────────────────────┘
                            │ PostgreSQL (port 5432)
                            ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE – PostgreSQL (db1)                             │
│  Base appdb, table users                                 │
└─────────────────────────────────────────────────────────┘
```

## Prérequis

- **Ansible** >= 2.9
- **Docker** et Docker Compose (pour lancer les conteneurs web1, web2, db1)
- **sshpass** (connexion SSH par mot de passe)  
  - Debian/Ubuntu : `sudo apt-get install -y sshpass`  
- **Conteneurs** démarrés avec accès SSH :
  - Hôte : `127.0.0.1`
  - Utilisateur : `root`
  - Mot de passe : `ansible`
  - Ports SSH : **2221** (web1), **2222** (web2), **2223** (db1)

## Installation

1. **Démarrer les conteneurs** (depuis le répertoire contenant `docker-compose.yml`) :
   ```bash
   cd /chemin/vers/3IASC-ansible
   docker compose build
   docker compose up -d
   ```

2. **Se placer dans le projet Ansible** :
   ```bash
   cd projet-ansible-final
   ```

3. **Créer le fichier de mot de passe Vault** :
   ```bash
   echo 'ansible123' > .vault_pass
   chmod 600 .vault_pass
   ```

4. **Vérifier la syntaxe du playbook** :
   ```bash
   ansible-playbook playbooks/site.yml --syntax-check
   ```

5. **Déployer l’application** :
   ```bash
   ansible-playbook playbooks/site.yml
   ```

6. **Démarrage de l’API Node.js** (conteneurs sans systemd) :  
   - Soit l’entrypoint du conteneur db1 lance Node une fois `/opt/app` déployé (attente automatique).  
   - Soit démarrer manuellement :  
     `docker exec -d ansible-db1 bash -c 'cd /opt/app && ./start-nodejs.sh >> /var/log/nodejs-app.log 2>&1'`  

## Utilisation

- **Frontend (Nginx)** : depuis l’hôte, si les ports 80 sont mappés (ex. 8081, 8082), ouvrir `http://127.0.0.1:8081` ou `http://127.0.0.1:8082`. Depuis un conteneur web : `http://localhost`.
- **API (Node.js)** :  
  - Depuis l’hôte (si le port 3000 est mappé) : `http://localhost:3000/` et `http://localhost:3000/users`.  
  - Depuis le conteneur db1 : `curl http://localhost:3000/` et `curl http://localhost:3000/users`.

## Tests

- **Vérifier la syntaxe des playbooks** :
  ```bash
  ansible-playbook playbooks/site.yml --syntax-check
  ansible-playbook playbooks/tests.yml --syntax-check
  ```

- **Lancer les tests automatisés** :
  ```bash
  ansible-playbook playbooks/tests.yml
  ```

- **Tests manuels** :
  ```bash
  ansible webservers -m uri -a "url=http://localhost status_code=200"
  ansible appservers -m uri -a "url=http://localhost:3000/ status_code=200"
  ansible appservers -m uri -a "url=http://localhost:3000/users status_code=200"
  ansible webservers -m shell -a "pgrep -x nginx >/dev/null"
  ansible appservers -m shell -a "pgrep -fa postgres >/dev/null"
  ansible appservers -m shell -a "pgrep -f 'node.*app.js'"
  ```

  - **Tests ssh** :
  ```bash
  ssh root@127.0.0.1 -p 2221
  ssh root@127.0.0.1 -p 2222
  ssh root@127.0.0.1 -p 2223
  ```

## Auteur

Oumaima Bougrine
