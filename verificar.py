"""Revisa que la tarjeta esté completa antes de publicarla (sin dependencias).

Uso: python verificar.py   → sale con código 1 y explica qué falta si algo está mal.
Lo corre también GitHub Actions en cada push (.github/workflows/verificar.yml).
"""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

RAIZ = Path(__file__).resolve().parent
URL_PUBLICA = "https://vicekohler.github.io/tarjeta-vicente/"
MAX_PDF = 5 * 1024 * 1024


class Lector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.locales: list[str] = []
        self.scripts: list[str] = []
        self.claves: set[str] = set()
        self.csp = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for campo in ("href", "src"):
            valor = a.get(campo)
            if valor and not urlparse(valor).scheme and not valor.startswith(("#", "mailto:", "tel:")):
                self.locales.append(valor.split("?")[0])
        if tag == "script" and a.get("src"):
            self.scripts.append(a["src"])
        if a.get("data-t"):
            self.claves.add(a["data-t"])
        if tag == "meta" and (a.get("http-equiv") or "").lower() == "content-security-policy":
            self.csp = a.get("content") or ""


def revisar() -> list[str]:
    problemas: list[str] = []
    html = (RAIZ / "index.html").read_text(encoding="utf-8")
    lector = Lector()
    lector.feed(html)

    for ruta in lector.locales:
        if not (RAIZ / unquote(ruta)).is_file():
            problemas.append(f"index.html enlaza un archivo que no existe: {ruta}")
    for src in lector.scripts:
        if urlparse(src).scheme:
            problemas.append(f"Script externo (no permitido): {src}")
    if "script-src 'self'" not in lector.csp:
        problemas.append("Falta la política de seguridad (Content-Security-Policy) con script-src 'self'")
    if re.search(r"\son[a-z]+\s*=", html, re.I):
        problemas.append("Hay manejadores en línea (onclick=...): la política de seguridad los bloquea")

    js = (RAIZ / "js" / "lang.js").read_text(encoding="utf-8")
    bloque_en = js.split("var EN = {", 1)[1].split("};", 1)[0]
    traducidas = set(re.findall(r"^\s*([a-z0-9_]+):", bloque_en, re.M))
    for clave in sorted(lector.claves - traducidas):
        problemas.append(f"Falta la traducción al inglés de '{clave}' en js/lang.js")

    for pdf in sorted({r for r in lector.locales if r.lower().endswith(".pdf")}):
        archivo = RAIZ / unquote(pdf)
        if archivo.is_file():
            if archivo.read_bytes()[:5] != b"%PDF-":
                problemas.append(f"{pdf} no es un PDF válido")
            if archivo.stat().st_size > MAX_PDF:
                problemas.append(f"{pdf} pesa más de 5 MB (lento con mala señal)")

    vcf = (RAIZ / "assets" / "vicente-kohler.vcf").read_text(encoding="utf-8")
    for campo in ("BEGIN:VCARD", "VERSION:3.0", "FN", "TEL", "EMAIL", "END:VCARD"):
        if campo not in vcf:
            problemas.append(f"El contacto (.vcf) no tiene {campo}")
    if URL_PUBLICA not in vcf:
        problemas.append("El contacto (.vcf) no incluye el enlace a la tarjeta")
    telefonos_pagina = {re.sub(r"\D", "", t) for t in re.findall(r'data-copiar="(\+[\d ]+)"', html)}
    telefonos_vcf = {re.sub(r"\D", "", t) for t in re.findall(r"^TEL[^:]*:(.+)$", vcf, re.M)}
    if telefonos_pagina != telefonos_vcf:
        problemas.append(f"El teléfono de la página y el del contacto no coinciden: {telefonos_pagina} vs {telefonos_vcf}")
    for correo in re.findall(r'data-copiar="([^"]+@[^"]+)"', html):
        if correo not in vcf:
            problemas.append(f"El correo {correo} está en la página pero no en el contacto")
    return problemas


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # consola de Windows (cp1252)
    encontrados = revisar()
    for p in encontrados:
        print(f"✗ {p}")
    print("✓ Tarjeta lista para publicar" if not encontrados else f"\n{len(encontrados)} problema(s)")
    sys.exit(1 if encontrados else 0)
