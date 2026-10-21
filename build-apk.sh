#!/bin/bash
# ==============================================================================
# Script de compilation APK Android pour NDAO'AUTO Sénégal 🇸🇳
# Propriétaire officiel : MOUHAMED NDAO
# ==============================================================================

set -e

echo "=== [1/4] Construction des fichiers web de production ==="
npm run build

echo "=== [2/4] Installation du runtime Capacitor Android ==="
npx @capacitor/cli init "NDAO'AUTO" "sn.ndaoauto.app" --web-dir dist || true
npx @capacitor/cli add android || true

echo "=== [3/4] Synchronisation des assets dans le projet Android ==="
npx @capacitor/cli sync android

echo "=== [4/4] Compilation de l'APK Android Debug / Release ==="
if command -v gradle &> /dev/null || [ -f "android/gradlew" ]; then
  cd android
  ./gradlew assembleDebug
  echo ">>> Félicitations ! Votre APK est disponible dans : android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo ">>> Note : Pour compiler l'APK final sur votre machine, ouvrez le dossier 'android' dans Android Studio ou lancez './gradlew assembleDebug'."
fi
