"""
Module de chiffrement symétrique AES-256 (Fernet).

POURQUOI CHIFFREMENT ET NON HACHAGE ?
  - Les mots de passe et secrets Epic Games doivent être RÉCUPÉRABLES
    pour être utilisés lors de la connexion.
  - Le hachage est irréversible → réservé aux données de vérification
    (ex: index de déduplication des emails).
  - Le chiffrement Fernet (AES-128-CBC + HMAC-SHA256) garantit :
      • Confidentialité : illisible sans la clé maître
      • Intégrité : toute altération est détectée
      • Authenticité : signature HMAC

STOCKAGE DE LA CLÉ MAÎTRE :
  - Jamais en dur dans le code
  - Uniquement via variable d'environnement : EPIC_MASTER_KEY
  - Rotation possible : re-chiffrer la BDD avec la nouvelle clé

UTILISATION MULTI-APPS :
  - Chaque application qui a accès à EPIC_MASTER_KEY peut déchiffrer
  - La clé se partage via un gestionnaire de secrets (Vault, AWS SSM, etc.)
"""

from __future__ import annotations

import base64
import hashlib
import os
from functools import lru_cache
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken


class CryptoError(Exception):
    """Erreur de chiffrement/déchiffrement."""
    pass


class MasterKeyMissingError(CryptoError):
    """La clé maître n'est pas définie."""
    pass


@lru_cache(maxsize=1)
def _get_fernet() -> Fernet:
    """
    Instancie Fernet avec la clé maître depuis l'environnement.

    La clé doit être une URL-safe base64 de 32 bytes.
    Si EPIC_MASTER_KEY est une passphrase arbitraire, on la dérive
    en clé Fernet via SHA-256.

    Returns:
        Instance Fernet prête à l'emploi.

    Raises:
        MasterKeyMissingError: Si EPIC_MASTER_KEY n'est pas définie.
    """
    raw = os.environ.get("EPIC_MASTER_KEY", "").strip()

    if not raw:
        raise MasterKeyMissingError(
            "❌ Variable d'environnement EPIC_MASTER_KEY manquante!\n"
            "   Génère une clé avec : python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"\n"
            "   Puis exporte-la : export EPIC_MASTER_KEY=<ta_clé>"
        )

    # Si la valeur fait exactement 44 chars base64 → c'est déjà une clé Fernet
    try:
        decoded = base64.urlsafe_b64decode(raw + "==")
        if len(decoded) == 32:
            key = raw.encode()
        else:
            raise ValueError
    except Exception:
        # Passphrase arbitraire → dérivation PBKDF2-like via SHA-256
        key = base64.urlsafe_b64encode(
            hashlib.sha256(raw.encode("utf-8")).digest()
        )

    return Fernet(key)


def encrypt(plaintext: str) -> str:
    """
    Chiffre une chaîne en AES-256 et retourne le token base64.

    Args:
        plaintext: Donnée sensible en clair.

    Returns:
        Token chiffré (str base64 URL-safe).

    Raises:
        CryptoError: En cas d'erreur de chiffrement.
    """
    if not plaintext:
        return ""

    try:
        fernet = _get_fernet()
        token = fernet.encrypt(plaintext.encode("utf-8"))
        return token.decode("utf-8")
    except MasterKeyMissingError:
        raise
    except Exception as e:
        raise CryptoError(f"Erreur de chiffrement: {e}") from e


def decrypt(token: str) -> str:
    """
    Déchiffre un token Fernet et retourne la valeur en clair.

    Args:
        token: Token chiffré (base64 URL-safe).

    Returns:
        Valeur déchiffrée.

    Raises:
        CryptoError: Si le token est invalide ou la clé incorrecte.
    """
    if not token:
        return ""

    try:
        fernet = _get_fernet()
        plaintext = fernet.decrypt(token.encode("utf-8"))
        return plaintext.decode("utf-8")
    except InvalidToken:
        raise CryptoError(
            "❌ Déchiffrement impossible : token invalide ou clé incorrecte.\n"
            "   Vérifie que EPIC_MASTER_KEY est la même que celle utilisée pour chiffrer."
        )
    except MasterKeyMissingError:
        raise
    except Exception as e:
        raise CryptoError(f"Erreur de déchiffrement: {e}") from e


def hash_email(email: str) -> str:
    """
    Hache un email pour créer un index de déduplication rapide.

    Usage : détecter les doublons sans stocker l'email en clair dans
    un index séparé. SHA-256 est suffisant ici (pas de brute-force
    sur des emails, la cardinalité est trop grande).

    Args:
        email: Adresse email normalisée.

    Returns:
        Condensat SHA-256 hexadécimal (64 chars).
    """
    normalized = email.strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def generate_master_key() -> str:
    """
    Génère une nouvelle clé maître Fernet sécurisée.

    Utilitaire à exécuter une fois pour initialiser la clé.

    Returns:
        Clé base64 URL-safe (à stocker dans EPIC_MASTER_KEY).
    """
    return Fernet.generate_key().decode("utf-8")


if __name__ == "__main__":
    # Génération d'une nouvelle clé maître
    print("🔑 Nouvelle clé maître générée :")
    print(generate_master_key())
    print("\nCopie cette valeur dans ton fichier .env :")
    print("EPIC_MASTER_KEY=<la_clé_ci-dessus>")