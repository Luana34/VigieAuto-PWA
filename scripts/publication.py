#!/usr/bin/env python3
"""Sélection sûre des seuls fichiers PWA à publier, à partir du cache applicatif.

Le dossier généré dans l'archive est une copie des sources, jamais un déplacement.
Aucun test, document, sauvegarde ou fichier non cité par le cache n'y est ajouté.
"""
from __future__ import annotations

from html.parser import HTMLParser
import json
import posixpath
from pathlib import Path, PurePosixPath
import re
from urllib.parse import unquote, urlsplit

PUBLICATION_DIR = "A-METTRE-SUR-GITHUB"
ROOT_FILES = {"index.html", "manifest.webmanifest", "sw.js"}
ALLOWED_EXTENSIONS = {
    "js": {".js"}, "css": {".css"}, "data": {".json"},
    "icons": {".png", ".svg", ".webp"},
    "assets": {".png", ".jpg", ".jpeg", ".svg", ".webp"},
}

class PublicationError(RuntimeError):
    pass


def safe_cache_path(url: str) -> str | None:
    if not isinstance(url, str):
        raise PublicationError("Une ressource du cache n'est pas du texte.")
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc or parsed.fragment or not parsed.path.startswith("./"):
        raise PublicationError(f"Chemin de cache non local : {url}")
    path = unquote(parsed.path)
    if path == "./":
        return None
    if "\\" in path or "\x00" in path:
        raise PublicationError(f"Chemin de cache interdit : {url}")
    parts = path[2:].split("/")
    if not parts or any(part in ("", ".", "..") or part.startswith(".") for part in parts):
        raise PublicationError(f"Chemin de cache interdit : {url}")
    rel = "/".join(parts)
    p = PurePosixPath(rel)
    if rel not in ROOT_FILES and not (len(parts) >= 2 and parts[0] in ALLOWED_EXTENSIONS and p.suffix.lower() in ALLOWED_EXTENSIONS[parts[0]]):
        raise PublicationError(f"Ce fichier ne peut pas être publié : {url}")
    if re.search(r"(?:sauvegarde|backup|export)", p.name, re.I):
        raise PublicationError(f"Une sauvegarde ne peut pas être publiée : {url}")
    return rel


def local_reference(value: str, parent: str = "") -> str | None:
    parsed = urlsplit(value)
    if parsed.scheme == "data":
        return None
    if parsed.scheme or parsed.netloc:
        raise PublicationError(f"Ressource distante non incluse dans le site hors ligne : {value}")
    if not parsed.path:
        return None
    if parsed.path.startswith("/") or "\\" in parsed.path:
        raise PublicationError(f"Référence locale non relative : {value}")
    rel = posixpath.normpath(posixpath.join(parent, unquote(parsed.path)))
    if rel == ".." or rel.startswith("../"):
        raise PublicationError(f"Référence hors du site : {value}")
    return rel


class HtmlResources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs: list[str] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        key = "href" if tag == "link" else "src" if tag in {"script", "img", "source"} else None
        if key and values.get(key):
            self.refs.append(values[key])


def publication_sources(project: Path) -> dict[str, Path]:
    """Retourne {chemin public relatif: source} après validation, sans écrire."""
    project = project.resolve()
    sw = project / "sw.js"
    if sw.is_symlink() or not sw.is_file():
        raise PublicationError("Service worker absent ou symbolique.")
    match = re.search(r"\bconst\s+FILES\s*=\s*(\[[\s\S]*?\])\s*;", sw.read_text(encoding="utf-8"))
    if not match:
        raise PublicationError("Liste des ressources hors ligne absente.")
    try:
        urls = json.loads(re.sub(r",\s*]$", "]", match.group(1)))
    except (ValueError, TypeError) as exc:
        raise PublicationError("La liste du cache doit être un tableau littéral JSON.") from exc
    if not isinstance(urls, list):
        raise PublicationError("Liste du cache invalide.")
    cached = {rel for url in urls if (rel := safe_cache_path(url)) is not None}
    if not {"index.html", "manifest.webmanifest", "js/app.js"}.issubset(cached):
        raise PublicationError("L'accueil, le manifeste ou le script principal manque au cache.")
    rels = cached | ROOT_FILES
    result: dict[str, Path] = {}
    for rel in sorted(rels):
        path = project.joinpath(*rel.split("/"))
        if any(project.joinpath(*rel.split("/")[:i]).is_symlink() for i in range(1, len(rel.split("/")) + 1)):
            raise PublicationError(f"Lien symbolique interdit : {rel}")
        if not path.is_file():
            raise PublicationError(f"Ressources indispensables à la publication manquantes : {rel}")
        result[rel] = path

    def require_reference(value: str, parent: str, owner: str):
        rel = local_reference(value, parent)
        if rel and rel not in result:
            raise PublicationError(f"Ressource de {owner} absente du cache : {rel}")

    html = HtmlResources(); html.feed(result["index.html"].read_text(encoding="utf-8"))
    for ref in html.refs:
        require_reference(ref, "", "index.html")
    try:
        manifest = json.loads(result["manifest.webmanifest"].read_text(encoding="utf-8"))
        icons = manifest.get("icons", [])
        if not isinstance(icons, list):
            raise ValueError("icons")
        for icon in icons:
            if not isinstance(icon, dict) or not isinstance(icon.get("src"), str):
                raise ValueError("icon.src")
            require_reference(icon["src"], "", "manifest.webmanifest")
    except (ValueError, TypeError) as exc:
        raise PublicationError("Manifeste de publication invalide.") from exc

    for rel, path in result.items():
        if rel.startswith("js/") and rel.endswith(".js"):
            text = path.read_text(encoding="utf-8")
            refs = re.findall(r"\b(?:from\s*|import\s*\(|import\s+)[\"'](\.[^\"']+)[\"']", text)
            refs += re.findall(r"new\s+URL\s*\(\s*[\"'](\.[^\"']+)[\"']\s*,\s*import\.meta\.url", text)
            for ref in refs:
                require_reference(ref, posixpath.dirname(rel), rel)
        if rel.startswith("css/") and rel.endswith(".css"):
            for ref in re.findall(r"url\(\s*[\"']?([^\"')]+)", path.read_text(encoding="utf-8"), re.I):
                require_reference(ref.strip(), posixpath.dirname(rel), rel)
    return result
