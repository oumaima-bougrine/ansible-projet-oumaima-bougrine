#!/bin/bash

# Démarrer SSH
service ssh start

# Démarrer PostgreSQL
service postgresql start

# Garder le conteneur actif
tail -f /dev/null
