#!/usr/bin/env python3
"""Rétention prudente des projets Web/Android, jamais des sauvegardes personnelles.

Trois versions de projet au plus lorsque tous les ZIP sont identifiables. Avec une
candidate Web, priorité à la candidate, à la PWA familiale stable et au dernier
Android ; sinon, on privilégie la nouvelle version, la PWA stable et un repli
Android stable pendant sa bêta. Un ZIP inconnu, corrompu ou sans marqueurs de
projet est conservé avec avertissement.
"""
from __future__ import annotations

import hashlib
import re
from pathlib import Path
from zipfile import ZipFile

_VERSION = r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta)\.(0|[1-9]\d*))?"
WEB = re.compile(r"^(?:VigieAuto|CQ-Auto)-v" + _VERSION + r"\.zip$")
ANDROID = re.compile(r"^VigieAuto-Android-v" + _VERSION + r"\.zip$")


def identity(path: Path):
    for stream, pattern in (("web", WEB), ("android", ANDROID)):
        m = pattern.fullmatch(path.name)
        if m:
            major, minor, patch, stage, number = m.groups()
            stage_order = {"alpha": 0, "beta": 1, None: 2}[stage]
            return stream, (int(major), int(minor), int(patch), stage_order, int(number or 0))
    return None


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def is_project_archive(path: Path) -> bool:
    """Ne pas supprimer un fichier seulement parce que son nom ressemble à un projet."""
    key = identity(path)
    if key is None:
        return False
    try:
        with ZipFile(path) as archive:
            infos = archive.infolist()
            if len(infos) > 100_000 or sum(info.file_size for info in infos) > 512 * 1024 * 1024:
                return False  # Un ZIP anormalement grand reste à examiner manuellement.
            names = {info.filename for info in infos}
            if archive.testzip() is not None:
                return False
            if key[0] == "android":
                return any({f"{root}/app/build.gradle.kts", f"{root}/app/src/main/AndroidManifest.xml"} <= names
                           for root in ("VigieAuto", "VigieAuto-Android"))
            return any({f"{root}/index.html", f"{root}/manifest.webmanifest", f"{root}/sw.js"} <= names
                       for root in ("VigieAuto", "CQ-Auto"))
    except Exception:
        return False


def ordered_groups(paths: list[Path]):
    groups = {}
    for p in paths:
        key = identity(p)
        if key is not None:
            groups.setdefault(key, []).append(p)
    streams = {}
    for key in groups:
        streams.setdefault(key[0], []).append(key)
    for keys in streams.values():
        keys.sort(key=lambda k: k[1], reverse=True)
    result = []
    while any(streams.values()):
        heads = [keys[0] for keys in streams.values() if keys]
        winner = max(heads, key=lambda k: (max(p.stat().st_mtime_ns for p in groups[k]), k[0] == "android"))
        result.append(winner)
        streams[winner[0]].pop(0)
    return groups, result


def prune_known_archives(workspace: Path, preferred: Path, limit: int = 3):
    if limit < 1:
        raise ValueError("Il faut conserver au moins une version.")
    named = [p for p in workspace.iterdir() if p.is_file() and identity(p) is not None]
    candidates = [p for p in named if not p.is_symlink() and is_project_archive(p)]
    warnings = [f"ZIP non identifiable ou corrompu, conservé : {p.name}" for p in named if p not in candidates]
    groups, ordered = ordered_groups(candidates)
    preferred_key = identity(preferred)
    if preferred_key not in groups or preferred not in candidates:
        raise ValueError("La nouvelle archive doit être un projet ZIP vérifié avant rétention.")
    selected = []
    def choose(key):
        if key is not None and key not in selected and len(selected) < limit:
            selected.append(key)
    def newest(stream, stable=False):
        keys = [k for k in groups if k[0] == stream and (not stable or k[1][3] == 2)]
        return max(keys, key=lambda k: k[1]) if keys else None
    choose(preferred_key)
    # Tant qu'une PWA candidate plus récente n'est pas validée sur iPhone,
    # conserver à la fois la version familiale stable, la candidate et la
    # dernière branche Android. Avec trois places, cela prime sur un ancien
    # repli Android stable ; les ZIP personnels ne sont jamais concernés.
    web_stable = newest("web", stable=True)
    web_head = newest("web")
    android_head = newest("android")
    candidate = (web_head if web_head and web_stable and web_head[1][3] < 2
                 and web_head[1] > web_stable[1] else None)
    choose(web_stable or web_head)
    if candidate:
        choose(android_head)
        choose(candidate)
    else:
        # Sans candidate Web, garder le repli Android stable pendant la bêta.
        if android_head and android_head[1][3] < 2:
            choose(newest("android", stable=True))
        choose(android_head)
    for key in ordered:
        choose(key)
    keep = set(selected)
    removed = []
    for key, files in groups.items():
        if key not in keep:
            if len(files) > 1 and len({sha256(p) for p in files}) > 1:
                warnings.append(f"Versions contradictoires pour {key} : toutes conservées pour examen.")
                continue
            for p in files:
                p.unlink(); removed.append(p.name)
            continue
        files.sort(key=lambda p: (p != preferred, not p.name.startswith("VigieAuto-"), p.name))
        first_hash = sha256(files[0])
        for duplicate in files[1:]:
            if sha256(duplicate) == first_hash:
                duplicate.unlink(); removed.append(duplicate.name)
            else:
                warnings.append(f"Deux archives différentes pour {key} : {duplicate.name} conservée.")
    kept = [p for key in ordered if key in keep for p in groups[key] if p.exists()]
    return kept, removed, warnings
