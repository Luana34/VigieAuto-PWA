#!/usr/bin/env python3
"""Tests isolés de la sélection à publier : jamais de vraie sauvegarde manipulée."""
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("vigie_publication", ROOT / "scripts/publication.py")
pub = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pub)


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="vigie-publication-test-")
        self.root = Path(self.tmp.name)
        self.files = {
            "index.html": '<link rel="manifest" href="./manifest.webmanifest"><link rel="stylesheet" href="./css/style.css"><script type="module" src="./js/app.js"></script>',
            "manifest.webmanifest": json.dumps({"icons": [{"src": "./icons/logo.png?v=42"}]}),
            "js/app.js": 'import { x } from "./module.js"; const u = new URL("../data/catalogue.json", import.meta.url);',
            "js/module.js": "export const x=1;",
            "css/style.css": 'body{background-image:url(../icons/logo.png)}',
            "data/catalogue.json": "{}",
            "icons/logo.png": "image fictive",
            "docs/HISTORIQUE.md": "historique fictif",
            "tests/exemple.js": "test fictif",
            "data/sauvegarde-personnelle.json": "ne jamais copier",
        }
        for rel, value in self.files.items():
            p = self.root / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(value)
        self.urls = ["./", "./index.html", "./manifest.webmanifest", "./js/app.js", "./js/module.js", "./data/catalogue.json", "./css/style.css", "./icons/logo.png?v=42"]
        self.write_sw(self.urls)

    def tearDown(self):
        self.tmp.cleanup()

    def write_sw(self, urls):
        (self.root / "sw.js").write_text("const FILES = " + json.dumps(urls) + ";")

    def test_only_cached_runtime_and_sw_are_selected_without_mutating_sources(self):
        before = {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        site = pub.publication_sources(self.root)
        self.assertEqual(set(site), {"index.html", "manifest.webmanifest", "sw.js", "js/app.js", "js/module.js", "data/catalogue.json", "css/style.css", "icons/logo.png"})
        self.assertNotIn("docs/HISTORIQUE.md", site); self.assertNotIn("tests/exemple.js", site)
        self.assertNotIn("data/sauvegarde-personnelle.json", site)
        after = {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(before, after)

    def test_query_strings_and_duplicate_urls_map_to_one_file(self):
        self.write_sw(self.urls + ["./icons/logo.png?v=another"])
        self.assertEqual(1, sum(x == "icons/logo.png" for x in pub.publication_sources(self.root)))

    def test_cache_is_required_and_must_be_a_literal_array(self):
        for content in ('const OTHER = [];', 'const FILES = getFiles();', 'const FILES = ["./index.html", evil];'):
            with self.subTest(content=content):
                (self.root / "sw.js").write_text(content)
                with self.assertRaises(pub.PublicationError): pub.publication_sources(self.root)

    def test_missing_runtime_file_is_refused(self):
        (self.root / "js/module.js").unlink()
        with self.assertRaisesRegex(pub.PublicationError, "indispensables"): pub.publication_sources(self.root)

    def test_traversal_absolute_and_remote_cache_entries_are_refused(self):
        for value in ("../outside.js", "./%2e%2e/outside.js", "./js/../../outside.js", "./js/%2fsecret.js", "https://example.com/file.js", "/index.html", "./js\\x.js"):
            with self.subTest(value=value):
                self.write_sw(self.urls + [value])
                with self.assertRaises(pub.PublicationError): pub.publication_sources(self.root)

    def test_tests_docs_and_backups_cannot_be_added_to_publication(self):
        for value in ("./docs/HISTORIQUE.md", "./tests/exemple.js", "./data/sauvegarde-personnelle.json", "./data/backup.json"):
            with self.subTest(value=value):
                self.write_sw(self.urls + [value])
                with self.assertRaises(pub.PublicationError): pub.publication_sources(self.root)

    def test_uncached_html_asset_is_refused(self):
        (self.root / "index.html").write_text('<link rel="stylesheet" href="./css/autre.css">')
        with self.assertRaisesRegex(pub.PublicationError, "absente du cache"): pub.publication_sources(self.root)

    def test_remote_html_asset_is_refused(self):
        (self.root / "index.html").write_text('<script src="https://example.com/x.js"></script>')
        with self.assertRaisesRegex(pub.PublicationError, "distante"): pub.publication_sources(self.root)

    def test_manifest_icon_must_be_cached(self):
        (self.root / "manifest.webmanifest").write_text(json.dumps({"icons": [{"src":"./icons/not-cached.png"}]}))
        with self.assertRaisesRegex(pub.PublicationError, "absente du cache"): pub.publication_sources(self.root)

    def test_javascript_module_must_be_cached(self):
        self.write_sw([u for u in self.urls if u != "./js/module.js"])
        with self.assertRaisesRegex(pub.PublicationError, "js/module.js"): pub.publication_sources(self.root)

    def test_dynamic_catalogue_resource_must_be_cached(self):
        self.write_sw([u for u in self.urls if u != "./data/catalogue.json"])
        with self.assertRaisesRegex(pub.PublicationError, "data/catalogue.json"): pub.publication_sources(self.root)

    def test_css_resource_must_be_cached(self):
        (self.root / "css/style.css").write_text('body{background:url(../icons/absent.png)}')
        with self.assertRaisesRegex(pub.PublicationError, "icons/absent.png"): pub.publication_sources(self.root)

    def test_data_uri_in_css_is_not_a_network_dependency(self):
        (self.root / "css/style.css").write_text('body{background:url(data:image/svg+xml;base64,AAAA)}')
        self.assertIn("css/style.css", pub.publication_sources(self.root))

    def test_symbolic_runtime_file_is_refused(self):
        target = self.root / "js/module.js"; target.unlink(); target.symlink_to(self.root / "js/app.js")
        with self.assertRaisesRegex(pub.PublicationError, "symbolique"): pub.publication_sources(self.root)


if __name__ == "__main__":
    unittest.main(verbosity=2)
