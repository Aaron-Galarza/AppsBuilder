#!/bin/bash
# sync-master.sh — generado por AppsBuilder al crear el ZIP
# NO modificar manualmente

MASTER_REMOTE="appsbuilder"
MASTER_URL="https://github.com/tuuser/appsbuilder.git"
MASTER_BRANCH="main"

# Agregar remote si no existe todavía
if ! git remote get-url $MASTER_REMOTE > /dev/null 2>&1; then
  git remote add $MASTER_REMOTE $MASTER_URL
fi

# Fetchear contenido del master
git fetch $MASTER_REMOTE

# Base siempre completa
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/ui/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/utils/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/types/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/hooks/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/configs/

# Bloques seleccionados para este cliente
# (esta lista la genera AppsBuilder según la selección del wizard)
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/hero/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/menu/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/about/
git checkout $MASTER_REMOTE/$MASTER_BRANCH -- packages/blocks/cta/

git add packages/
git commit -m "sync: update packages from appsbuilder master"
git push origin main
