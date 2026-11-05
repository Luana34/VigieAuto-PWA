#!/usr/bin/env python3
"""Tests isolés de l'archivage ; ne touchent pas au vrai workspace."""
import json
import io
import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "creer-archive.py"


def project_zip_bytes(stream, payload=b"source fictive"):
    output = io.BytesIO()
    markers = (["app/build.gradle.kts", "app/src/main/AndroidManifest.xml"] if stream == "android"
               else ["index.html", "manifest.webmanifest", "sw.js"])
    with ZipFile(output, "w") as archive:
        for marker in markers:
            archive.writestr(f"VigieAuto/{marker}", payload)
    return output.getvalue()


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="vigie-archive-test-")
        self.workspace = Path(self.tmp.name)
        self.project = self.workspace / "cq-auto"
        paths = [
            "README.md", "INSTALLER.md", "index.html", "css/style.css", "css/themes.css", "js/app.js", "js/db.js",
            "js/gps.js", "js/precise-json.js", "js/maintenance.js", "tests/maintenance.test.js", "tests/carnet-enrichi.cjs",
            "tests/depenses.test.js", "tests/depenses-interface.cjs", "docs/DEPENSES-BETA28.md",
            "tests/precise-json.test.js", "tests/precision-interface.cjs", "docs/PRECISION-SAUVEGARDES.md",
            "docs/CARNET-PWA-BETA2.md", "docs/CARNET-ANDROID-BETA27.md", "docs/ENTRETIEN-FORMULAIRE-SPECIFICATION.md", "docs/PLAN-PRIORITES-APRES-BETA16.md",
            "js/catalogue.js", "data/brands_models_fr.json",
            "assets/logo-original.png", "icons/icon.png", "icons/apple-touch-icon.png", "tests/logo-interface.cjs", "docs/HISTORIQUE.md",
            "docs/CAHIER-DES-CHARGES.md", "docs/FEUILLE-DE-ROUTE.md", "docs/RECAPITULATIF-FONCTIONS.md",
            "docs/FEUILLE-DE-ROUTE-ANDROID.md", "docs/PERFORMANCES.md", "docs/MIGRATION-V2-V3.md",
        ]
        for rel in paths:
            path = self.project / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(b"fixture")
        (self.project / "scripts").mkdir()
        shutil.copy2(SCRIPT, self.project / "scripts" / "creer-archive.py")
        shutil.copy2(SCRIPT.parent / "gestion_archives.py", self.project / "scripts" / "gestion_archives.py")
        self.set_version("2.0.0")
        current = project_zip_bytes("web", b"current-old")
        older = project_zip_bytes("web", b"older")
        self.old = {
            "VigieAuto-v1.3.1.zip": current, "CQ-Auto-v1.2.0.zip": older,
            "CQ-Auto-v1.1.1.zip": project_zip_bytes("web", b"oldest"), "VigieAuto.zip": current,
            "CQ-Auto.zip": older, "mes-sauvegardes.zip": b"user data",
        }
        for name, content in self.old.items():
            (self.workspace / name).write_bytes(content)

    def tearDown(self):
        self.tmp.cleanup()

    def set_version(self, version):
        (self.project / "js/app.js").write_text(f'const APP_VERSION = "{version}";')
        (self.project / "package.json").write_text(json.dumps({"version": version}))
        (self.project / "package-lock.json").write_text(json.dumps({"version": version, "packages": {"": {"version": version}}}))
        icon = f"./icons/icon.png?v=vigie-{version}"
        (self.project / "manifest.webmanifest").write_text(json.dumps({"icons": [{"src": icon}]}))
        (self.project / "index.html").write_text(f'<link href="{icon}"><dialog id="category-picker"></dialog>')
        (self.project / "sw.js").write_text(f'const CACHE = "cq-auto-app-v{version}"; const FILES = ["./js/maintenance.js", "{icon}"];')

    def run_script(self, *args):
        return subprocess.run(["python3", str(self.project / "scripts/creer-archive.py"), *args],
                              text=True, capture_output=True, check=False)

    def test_dry_run_is_non_destructive(self):
        result = self.run_script("--dry-run")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.workspace / "VigieAuto-v2.0.0.zip").exists())
        for name, content in self.old.items():
            self.assertEqual((self.workspace / name).read_bytes(), content)

    def test_verified_release_keeps_three_versions_and_personal_zip(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        archive = self.workspace / "VigieAuto-v2.0.0.zip"
        with ZipFile(archive) as z:
            self.assertIsNone(z.testzip())
            self.assertIn("VigieAuto/docs/HISTORIQUE.md", z.namelist())
            self.assertIn("VigieAuto/assets/logo-original.png", z.namelist())
        self.assertEqual(sorted(p.name for p in self.workspace.glob("*.zip")), sorted([
            "VigieAuto-v2.0.0.zip", "VigieAuto-v1.3.1.zip", "CQ-Auto-v1.2.0.zip", "mes-sauvegardes.zip",
        ]))
        self.assertEqual((self.workspace / "mes-sauvegardes.zip").read_bytes(), b"user data")
        first = archive.read_bytes()
        repeat = self.run_script()
        self.assertNotEqual(repeat.returncode, 0)
        self.assertEqual(archive.read_bytes(), first)

    def test_archive_bytes_are_compared_with_all_sources(self):
        result = self.run_script("--sans-nettoyage")
        self.assertEqual(0, result.returncode, result.stderr)
        original = self.workspace / "VigieAuto-v2.0.0.zip"
        modified = self.workspace / "controle-interne.tmp"
        with ZipFile(original) as src, ZipFile(modified, "w") as dst:
            for info in src.infolist():
                dst.writestr(info, b"different" if info.filename == "VigieAuto/README.md" else src.read(info.filename))
        sys.path.insert(0, str(SCRIPT.parent))
        try:
            spec = importlib.util.spec_from_file_location("pack_web_test", SCRIPT)
            module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
            module.PROJECT = self.project
            files = module.project_files()
            module.verify_source_archive(original, files)
            with self.assertRaisesRegex(RuntimeError, "différente"):
                module.verify_source_archive(modified, files)
        finally: sys.path.pop(0)

    def test_candidate_and_deferred_retention_preserve_all_old_archives(self):
        version = "2.0.0-beta.1"
        self.set_version(version)
        before = {p.name: p.read_bytes() for p in self.workspace.glob("*.zip")}
        result = self.run_script("--sans-nettoyage")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertTrue((self.workspace / f"VigieAuto-v{version}.zip").exists())
        self.assertIn("Rétention différée", result.stdout)
        for name, data in before.items(): self.assertEqual((self.workspace / name).read_bytes(), data)

    def test_candidate_is_not_newer_than_a_stable_release_of_same_version(self):
        version = "2.0.0-beta.1"
        self.set_version(version)
        (self.workspace / "VigieAuto-v2.0.0.zip").write_bytes(project_zip_bytes("web"))
        result = self.run_script("--sans-nettoyage")
        self.assertNotEqual(0, result.returncode)
        self.assertFalse((self.workspace / f"VigieAuto-v{version}.zip").exists())

    def test_candidate_keeps_family_stable_and_latest_android_in_three_places(self):
        version = "2.0.0-beta.1"
        self.set_version(version)
        stable = self.workspace / "VigieAuto-Android-v0.3.0.zip"
        latest = self.workspace / "VigieAuto-Android-v0.4.0-beta.20.zip"
        stable.write_bytes(project_zip_bytes("android", b"stable"))
        latest.write_bytes(project_zip_bytes("android", b"beta"))
        result = self.run_script()
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertTrue(latest.exists())
        self.assertTrue((self.workspace / "VigieAuto-v1.3.1.zip").exists())
        self.assertTrue((self.workspace / f"VigieAuto-v{version}.zip").exists())
        self.assertFalse(stable.exists())
        self.assertTrue((self.workspace / "mes-sauvegardes.zip").exists())

    def test_failed_validation_never_prunes(self):
        (self.project / "docs/HISTORIQUE.md").unlink()
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.workspace / "VigieAuto-v2.0.0.zip").exists())
        self.assertFalse((self.workspace / ".VigieAuto-v2.0.0.tmp").exists())
        for name, content in self.old.items():
            self.assertEqual((self.workspace / name).read_bytes(), content)

    def test_missing_enriched_carnet_files_never_prunes(self):
        for rel in ("js/maintenance.js", "js/db.js", "tests/maintenance.test.js", "tests/carnet-enrichi.cjs",
                    "tests/depenses.test.js", "tests/depenses-interface.cjs", "docs/DEPENSES-BETA28.md",
                    "docs/CARNET-PWA-BETA2.md", "docs/CARNET-ANDROID-BETA27.md", "docs/ENTRETIEN-FORMULAIRE-SPECIFICATION.md",
                    "docs/PLAN-PRIORITES-APRES-BETA16.md"):
            with self.subTest(missing=rel):
                p = self.project / rel
                data = p.read_bytes(); p.unlink()
                try:
                    result = self.run_script()
                    self.assertNotEqual(result.returncode, 0, rel)
                    self.assertIn("indispensables", result.stderr)
                    self.assertFalse((self.workspace / "VigieAuto-v2.0.0.zip").exists())
                    self.assertFalse((self.workspace / ".VigieAuto-v2.0.0.tmp").exists())
                    for name, content in self.old.items():
                        self.assertEqual((self.workspace / name).read_bytes(), content)
                finally:
                    p.write_bytes(data)

    def test_versions_selector_and_offline_cache_are_checked(self):
        mutations = (
            ("sw.js", lambda s: s.replace('"./js/maintenance.js"', '"./js/autre.js"'), "cache"),
            ("index.html", lambda s: s.replace('category-picker', 'autre-dialogue'), "Sélecteur"),
            ("index.html", lambda s: s.replace('vigie-2.0.0', 'vigie-1.0.0'), "version"),
            ("manifest.webmanifest", lambda s: s.replace('vigie-2.0.0', 'vigie-1.0.0'), "version"),
            ("sw.js", lambda s: s.replace('./icons/icon.png', './icons/autre.png'), "icône"),
        )
        for rel, mutate, message in mutations:
            with self.subTest(file=rel, message=message):
                self.set_version("2.0.0")
                p = self.project / rel; p.write_text(mutate(p.read_text()))
                result = self.run_script()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message.lower(), result.stderr.lower())
                self.assertFalse((self.workspace / "VigieAuto-v2.0.0.zip").exists())
                for name, content in self.old.items():
                    self.assertEqual((self.workspace / name).read_bytes(), content)

    def test_different_alias_is_not_removed(self):
        (self.workspace / "VigieAuto.zip").write_bytes(b"not an identical copy")
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.workspace / "VigieAuto.zip").read_bytes(), b"not an identical copy")

    def test_identical_duplicate_of_a_kept_version_is_removed(self):
        (self.workspace / "CQ-Auto-v1.3.1.zip").write_bytes(self.old["VigieAuto-v1.3.1.zip"])
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.workspace / "VigieAuto-v1.3.1.zip").exists())
        self.assertFalse((self.workspace / "CQ-Auto-v1.3.1.zip").exists())

    def test_nonidentical_duplicate_of_a_kept_version_is_preserved(self):
        duplicate = self.workspace / "CQ-Auto-v1.3.1.zip"
        different = project_zip_bytes("web", b"different content")
        duplicate.write_bytes(different)
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(duplicate.read_bytes(), different)
        self.assertIn("Attention", result.stdout)

    def test_version_mismatch_and_unclassified_files_stop_safely(self):
        (self.project / "sw.js").write_text('const CACHE = "cq-auto-app-v1.0.0";')
        self.assertNotEqual(self.run_script().returncode, 0)
        self.set_version("2.0.0")
        (self.project / "js/app.js").write_text('const APP_VERSION = "1.0.0";')
        self.assertNotEqual(self.run_script().returncode, 0)
        (self.project / "js/app.js").write_text('const APP_VERSION = "2.0.0";')
        (self.project / "new-unreviewed-folder").mkdir()
        self.assertNotEqual(self.run_script().returncode, 0)
        for name, content in self.old.items():
            self.assertEqual((self.workspace / name).read_bytes(), content)

    def test_two_branches_keep_three_releases_not_highest_semver(self):
        android = self.workspace / "VigieAuto-Android-v0.1.0.zip"
        android.write_bytes(project_zip_bytes("android", b"android project"))
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(android.exists())
        self.assertTrue((self.workspace / "VigieAuto-v2.0.0.zip").exists())
        self.assertTrue((self.workspace / "VigieAuto-v1.3.1.zip").exists())
        self.assertFalse((self.workspace / "CQ-Auto-v1.2.0.zip").exists())
        self.assertTrue((self.workspace / "mes-sauvegardes.zip").exists())


    def test_web_release_keeps_android_beta_and_stable(self):
        stable = self.workspace / "VigieAuto-Android-v0.3.0.zip"
        beta = self.workspace / "VigieAuto-Android-v0.4.0-beta.1.zip"
        stable.write_bytes(project_zip_bytes("android", b"stable"))
        beta.write_bytes(project_zip_bytes("android", b"beta"))
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(stable.exists()); self.assertTrue(beta.exists())
        self.assertTrue((self.workspace / "VigieAuto-v2.0.0.zip").exists())
        self.assertFalse((self.workspace / "VigieAuto-v1.3.1.zip").exists())

    def test_unknown_project_named_zip_and_its_alias_are_preserved(self):
        suspicious = self.workspace / "VigieAuto-Android-v0.0.1.zip"
        suspicious.write_bytes(b"not an archive")
        alias = self.workspace / "VigieAuto.zip"
        alias.write_bytes(b"not an archive")
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(suspicious.exists()); self.assertTrue(alias.exists())
        self.assertIn("non identifiable", result.stdout)

    def test_release_version_must_be_newer(self):
        (self.workspace / "VigieAuto-v2.1.0.zip").write_bytes(b"newer")
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.workspace / "VigieAuto-v2.0.0.zip").exists())
        for name, content in self.old.items():
            self.assertEqual((self.workspace / name).read_bytes(), content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
