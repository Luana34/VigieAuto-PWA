#!/usr/bin/env python3
"""Créer une archive VigieAuto vérifiée et garder trois versions de projet.

Utilisation : python3 scripts/creer-archive.py [--dry-run | --sans-nettoyage]
L'option --sans-nettoyage diffère la rétention afin de vérifier les deux nouvelles
archives avant de retirer une ancienne. Aucune donnée personnelle n'est touchée.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from gestion_archives import identity, is_project_archive, prune_known_archives

PROJECT = Path(__file__).resolve().parent.parent
WORKSPACE = PROJECT.parent
ROOT_NAME = "VigieAuto"
ALLOWED_FILES = {
    "README.md", "INSTALLER.md", "index.html", "manifest.webmanifest",
    "sw.js", "package.json", "package-lock.json",
}
ALLOWED_DIRS = {"assets", "css", "data", "docs", "icons", "js", "scripts", "tests"}
IGNORED_DIRS = {"node_modules", ".git", ".cache", "__pycache__", "coverage", "dist", "build"}
ALIASES = ("VigieAuto.zip", "CQ-Auto.zip")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def archive_version(path: Path) -> tuple[int, int, int, int, int] | None:
    key = identity(path)
    return key[1] if key is not None and key[0] == "web" else None


def project_files() -> list[Path]:
    unknown = [p.name for p in PROJECT.iterdir() if p.name not in ALLOWED_FILES | ALLOWED_DIRS | IGNORED_DIRS]
    if unknown:
        raise RuntimeError("Éléments non classés dans le projet : " + ", ".join(sorted(unknown)))
    files: list[Path] = []
    for path in PROJECT.rglob("*"):
        rel = path.relative_to(PROJECT)
        if any(part in IGNORED_DIRS for part in rel.parts):
            continue
        if path.is_symlink():
            raise RuntimeError(f"Lien symbolique non inclus sans vérification : {rel}")
        if not path.is_file():
            continue
        if rel.parts[0] not in ALLOWED_DIRS and str(rel) not in ALLOWED_FILES:
            raise RuntimeError(f"Fichier non classé : {rel}")
        if path.name.startswith(".env") or path.suffix.lower() in {".pem", ".key", ".p12", ".pfx"}:
            raise RuntimeError(f"Fichier potentiellement sensible à exclure : {rel}")
        files.append(path)
    return sorted(files)


def verify_source_archive(path: Path, source: list[Path]) -> None:
    expected = {f"{ROOT_NAME}/{p.relative_to(PROJECT).as_posix()}": p for p in source}
    with ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise RuntimeError("Archive corrompue ; anciennes archives conservées.")
        names = archive.namelist()
        if len(names) != len(set(names)) or set(names) != set(expected):
            raise RuntimeError("Contenu, racine ou doublons inattendus ; anciennes archives conservées.")
        for name, source_path in expected.items():
            digest = hashlib.sha256()
            with archive.open(name) as data:
                for block in iter(lambda: data.read(1024 * 1024), b""):
                    digest.update(block)
            if digest.hexdigest() != sha256(source_path):
                raise RuntimeError(f"Archive différente des sources : {name} ; aucune ancienne archive supprimée.")


def main() -> None:
    if sys.argv[1:] not in ([], ["--dry-run"], ["--sans-nettoyage"]):
        raise RuntimeError("Usage : python3 scripts/creer-archive.py [--dry-run | --sans-nettoyage]")
    dry_run = sys.argv[1:] == ["--dry-run"]
    defer_pruning = sys.argv[1:] == ["--sans-nettoyage"]
    package = json.loads((PROJECT / "package.json").read_text(encoding="utf-8"))
    version = package.get("version", "")
    if not isinstance(version, str) or archive_version(Path(f"VigieAuto-v{version}.zip")) is None:
        raise RuntimeError("Version attendue au format x.y.z, x.y.z-alpha.n ou x.y.z-beta.n dans package.json.")
    lock = json.loads((PROJECT / "package-lock.json").read_text(encoding="utf-8"))
    if lock.get("version") != version or lock.get("packages", {}).get("", {}).get("version") != version:
        raise RuntimeError("La version de package-lock.json ne correspond pas à package.json.")
    app_js = (PROJECT / "js/app.js").read_text(encoding="utf-8")
    if not re.search(r'const APP_VERSION\s*=\s*"' + re.escape(version) + r'"', app_js):
        raise RuntimeError("La version affichée dans js/app.js ne correspond pas à package.json.")
    sw = (PROJECT / "sw.js").read_text(encoding="utf-8")
    if not re.search(r'const CACHE\s*=\s*"[^"]+-v' + re.escape(version) + r'"', sw):
        raise RuntimeError("La version du cache de sw.js ne correspond pas à package.json.")
    if '"./js/maintenance.js"' not in sw:
        raise RuntimeError("Le module du carnet enrichi manque au cache hors ligne.")
    if '"./js/expense-receipt.js"' not in sw:
        raise RuntimeError("Le module des justificatifs manque au cache hors ligne.")
    index = (PROJECT / "index.html").read_text(encoding="utf-8")
    if 'id="category-picker"' not in index or f"?v=vigie-{version}" not in index:
        raise RuntimeError("Sélecteur de catégories ou version des icônes absent de index.html.")
    manifest_source = json.loads((PROJECT / "manifest.webmanifest").read_text(encoding="utf-8"))
    icons = manifest_source.get("icons", [])
    if not icons or any(not icon.get("src", "").endswith(f"?v=vigie-{version}") for icon in icons):
        raise RuntimeError("La version des icônes du manifest ne correspond pas à package.json.")
    if any(json.dumps(icon["src"], ensure_ascii=False) not in sw for icon in icons):
        raise RuntimeError("Une icône du manifest manque au cache hors ligne.")
    destination = WORKSPACE / f"VigieAuto-v{version}.zip"
    temporary = WORKSPACE / f".VigieAuto-v{version}.tmp"
    if destination.exists():
        raise RuntimeError(f"Archive déjà présente, aucune modification : {destination.name}")
    existing_versions = [archive_version(p) for p in WORKSPACE.iterdir() if p.is_file() and archive_version(p) is not None]
    if existing_versions and archive_version(destination) <= max(existing_versions):
        raise RuntimeError("La nouvelle version doit être supérieure aux archives existantes.")
    files = project_files()
    print(f"Archive prévue : {destination.name} ({len(files)} fichiers).")
    if dry_run:
        print("Simulation seulement : aucune archive créée, aucun fichier supprimé.")
        return
    if temporary.exists():
        raise RuntimeError(f"Fichier temporaire déjà présent : {temporary.name}")
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as z:
            for p in files:
                z.write(p, f"{ROOT_NAME}/{p.relative_to(PROJECT).as_posix()}")
        with ZipFile(temporary) as z:
            if z.testzip() is not None:
                raise RuntimeError("Archive corrompue : aucune ancienne version ne sera supprimée.")
            names = set(z.namelist())
            required = {
                f"{ROOT_NAME}/index.html", f"{ROOT_NAME}/sw.js", f"{ROOT_NAME}/package.json",
                f"{ROOT_NAME}/package-lock.json", f"{ROOT_NAME}/manifest.webmanifest",
                f"{ROOT_NAME}/js/app.js", f"{ROOT_NAME}/js/db.js", f"{ROOT_NAME}/js/gps.js", f"{ROOT_NAME}/js/precise-json.js",
                f"{ROOT_NAME}/docs/FONDS-SOMBRES-BETA39.md", f"{ROOT_NAME}/tests/themes.test.js", f"{ROOT_NAME}/tests/themes-interface.cjs", f"{ROOT_NAME}/tests/mise-a-jour-beta10.cjs",
                f"{ROOT_NAME}/tests/mise-a-jour-beta9.cjs", f"{ROOT_NAME}/tests/fixtures/pwa-v5-operations.json",
                f"{ROOT_NAME}/docs/DEVISES-ANDROID-BETA36.md", f"{ROOT_NAME}/docs/MIGRATION-V16-V17.md",
                f"{ROOT_NAME}/tests/devises-operations-interface.cjs", f"{ROOT_NAME}/docs/DEVISES-OPERATIONS-BETA8.md", f"{ROOT_NAME}/docs/DEVISES-ANDROID-BETA35.md",
                f"{ROOT_NAME}/js/maintenance.js", f"{ROOT_NAME}/js/currency.js", f"{ROOT_NAME}/tests/devises.test.js", f"{ROOT_NAME}/tests/devises-interface.cjs", f"{ROOT_NAME}/docs/DEVISES-PWA-BETA7.md", f"{ROOT_NAME}/css/style.css", f"{ROOT_NAME}/css/themes.css",
                f"{ROOT_NAME}/js/catalogue.js", f"{ROOT_NAME}/data/brands_models_fr.json",
                f"{ROOT_NAME}/tests/maintenance.test.js", f"{ROOT_NAME}/tests/carnet-enrichi.cjs",
                f"{ROOT_NAME}/tests/depenses.test.js", f"{ROOT_NAME}/tests/depenses-interface.cjs", f"{ROOT_NAME}/docs/DEPENSES-BETA28.md", f"{ROOT_NAME}/docs/KILOMETRAGE-DEPENSES-BETA30.md", f"{ROOT_NAME}/docs/TRI-DEPENSES-BETA31.md",
                f"{ROOT_NAME}/js/expense-receipt.js", f"{ROOT_NAME}/tests/justificatifs.test.js", f"{ROOT_NAME}/tests/justificatifs-interface.cjs", f"{ROOT_NAME}/docs/JUSTIFICATIFS-BETA29.md",
                f"{ROOT_NAME}/tests/fixtures/justificatif.png", f"{ROOT_NAME}/tests/fixtures/justificatif-gps-fictif.jpg",
                f"{ROOT_NAME}/tests/precise-json.test.js", f"{ROOT_NAME}/tests/precision-interface.cjs", f"{ROOT_NAME}/docs/PRECISION-SAUVEGARDES.md",
                f"{ROOT_NAME}/docs/CARNET-PWA-BETA2.md", f"{ROOT_NAME}/docs/CARNET-ANDROID-BETA27.md", f"{ROOT_NAME}/docs/ENTRETIEN-FORMULAIRE-SPECIFICATION.md",
                f"{ROOT_NAME}/docs/PLAN-PRIORITES-APRES-BETA16.md",
                f"{ROOT_NAME}/assets/logo-original.png", f"{ROOT_NAME}/README.md",
                f"{ROOT_NAME}/icons/apple-touch-icon.png", f"{ROOT_NAME}/tests/logo-interface.cjs",
                f"{ROOT_NAME}/docs/HISTORIQUE.md", f"{ROOT_NAME}/docs/CAHIER-DES-CHARGES.md",
                f"{ROOT_NAME}/docs/FEUILLE-DE-ROUTE.md", f"{ROOT_NAME}/docs/RECAPITULATIF-FONCTIONS.md",
                f"{ROOT_NAME}/docs/FEUILLE-DE-ROUTE-ANDROID.md", f"{ROOT_NAME}/docs/PERFORMANCES.md",
                f"{ROOT_NAME}/docs/MIGRATION-V2-V3.md", f"{ROOT_NAME}/INSTALLER.md",
                f"{ROOT_NAME}/scripts/creer-archive.py", f"{ROOT_NAME}/scripts/gestion_archives.py",
            }
            if not required <= names:
                raise RuntimeError("Fichiers indispensables absents de l’archive.")
            manifest = json.loads(z.read(f"{ROOT_NAME}/manifest.webmanifest"))
            for icon in manifest.get("icons", []):
                icon_path = icon["src"].removeprefix("./").split("?", 1)[0]
                if f"{ROOT_NAME}/{icon_path}" not in names:
                    raise RuntimeError(f"Icône absente de l’archive : {icon_path}")
        verify_source_archive(temporary, files)
        temporary.replace(destination)
    finally:
        if temporary.exists():
            temporary.unlink()

    if defer_pruning:
        print(f"Archive vérifiée : {destination.name} · SHA-256 {sha256(destination)}")
        print("Rétention différée : aucune ancienne archive ni aucun alias n’a été supprimé.")
        return

    # Les branches Web et Android ont des numéros indépendants. Une candidate
    # Web est protégée avec la PWA familiale et le dernier Android dans trois places.
    candidates = [p for p in WORKSPACE.iterdir() if p.is_file() and identity(p) is not None and is_project_archive(p)]
    hashes = {sha256(p) for p in candidates}
    kept, removed, warnings = prune_known_archives(WORKSPACE, destination)
    for warning in warnings:
        print("Attention : " + warning)
    for name in ALIASES:
        path = WORKSPACE / name
        if path.is_file() and sha256(path) in hashes:
            path.unlink()
            removed.append(name)
    print(f"Archive vérifiée : {destination.name} · SHA-256 {sha256(destination)}")
    print("Archives de versions conservées : " + ", ".join(p.name for p in kept))
    print("Anciennes archives/doublons supprimés : " + (", ".join(removed) if removed else "aucun"))
    print("Les autres fichiers ZIP, notamment les sauvegardes personnelles, ne sont pas touchés.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError) as exc:
        print(f"Erreur : {exc}", file=sys.stderr)
        sys.exit(1)
