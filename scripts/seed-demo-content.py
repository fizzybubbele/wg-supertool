#!/usr/bin/env python3
"""Realistische Demo-Inhalte für die WG Sonnenschein (4 Personen)."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta
from typing import Any


def request(
    base: str,
    anon_key: str,
    token: str,
    method: str,
    path: str,
    body: Any | None = None,
    *,
    prefer: str | None = None,
) -> Any:
    url = f"{base.rstrip('/')}{path}"
    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()
        raise RuntimeError(f"{method} {path} failed ({exc.code}): {detail}") from exc


def seed_content(
    *,
    base: str,
    anon_key: str,
    token: str,
    household_id: str,
    mitch_id: str,
    sophie_id: str,
    sebi_id: str,
    elias_id: str,
) -> None:
    today = date(2026, 6, 18)
    trash_done_at = f"{(today - timedelta(days=2)).isoformat()}T08:30:00+02:00"

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/shopping_list_items",
        [
            {"household_id": household_id, "name": "Vollkornbrot", "checked": False},
            {"household_id": household_id, "name": "Bio-Eier (10er)", "checked": False},
            {"household_id": household_id, "name": "Butter", "checked": False},
            {"household_id": household_id, "name": "Bananen", "checked": False},
            {"household_id": household_id, "name": "Spülmittel", "checked": False},
            {"household_id": household_id, "name": "Toilettenpapier (8er)", "checked": False},
            {"household_id": household_id, "name": "Müllsäcke 35L", "checked": False},
            {"household_id": household_id, "name": "Passata", "checked": False},
            {"household_id": household_id, "name": "Parmesan", "checked": False},
            {"household_id": household_id, "name": "Salat-Mix", "checked": False},
        ],
    )

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/shopping_list_completions",
        [
            {
                "household_id": household_id,
                "name": "Kaffee",
                "completed_by": sophie_id,
                "completed_at": f"{(today - timedelta(days=3)).isoformat()}T10:00:00+02:00",
            },
            {
                "household_id": household_id,
                "name": "Hafermilch",
                "completed_by": elias_id,
                "completed_at": f"{(today - timedelta(days=1)).isoformat()}T17:30:00+02:00",
            },
            {
                "household_id": household_id,
                "name": "Tomatensoße",
                "completed_by": mitch_id,
                "completed_at": f"{(today - timedelta(days=10)).isoformat()}T12:00:00+02:00",
            },
            {
                "household_id": household_id,
                "name": "Spülmaschinentabs",
                "completed_by": sebi_id,
                "completed_at": f"{(today - timedelta(days=5)).isoformat()}T09:15:00+02:00",
            },
            {
                "household_id": household_id,
                "name": "Zitronen",
                "completed_by": elias_id,
                "completed_at": f"{(today - timedelta(days=12)).isoformat()}T18:00:00+02:00",
            },
        ],
    )

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/pantry_items",
        [
            {"household_id": household_id, "name": "Reis", "quantity": 500, "unit": "g"},
            {"household_id": household_id, "name": "Pasta", "quantity": 2, "unit": "Packungen"},
            {"household_id": household_id, "name": "Hafermilch", "quantity": 1, "unit": "L"},
            {"household_id": household_id, "name": "Kaffee", "quantity": 1, "unit": "Packung"},
            {"household_id": household_id, "name": "Tomatensoße", "quantity": 2, "unit": "Gläser"},
            {"household_id": household_id, "name": "Olivenöl", "quantity": 0.25, "unit": "L"},
            {"household_id": household_id, "name": "Müsli", "quantity": 750, "unit": "g"},
            {"household_id": household_id, "name": "Tiefkühlpizza", "quantity": 1, "unit": "Stk"},
            {"household_id": household_id, "name": "Butter", "quantity": 250, "unit": "g"},
            {"household_id": household_id, "name": "Eier", "quantity": 4, "unit": "Stk"},
            {"household_id": household_id, "name": "Zwiebeln", "quantity": 3, "unit": "Stk"},
        ],
    )

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/cleaning_tasks",
        [
            {
                "household_id": household_id,
                "title": "Küche putzen",
                "sort_order": 0,
                "assigned_to": sophie_id,
                "done": False,
                "completed_by": None,
                "completed_at": None,
            },
            {
                "household_id": household_id,
                "title": "Bad reinigen",
                "sort_order": 1,
                "assigned_to": mitch_id,
                "done": False,
                "completed_by": None,
                "completed_at": None,
            },
            {
                "household_id": household_id,
                "title": "Flur & Treppenhaus",
                "sort_order": 2,
                "assigned_to": sebi_id,
                "done": False,
                "completed_by": None,
                "completed_at": None,
            },
            {
                "household_id": household_id,
                "title": "Müll rausbringen",
                "sort_order": 3,
                "assigned_to": elias_id,
                "done": True,
                "completed_by": elias_id,
                "completed_at": trash_done_at,
            },
            {
                "household_id": household_id,
                "title": "Kühlschrank auswischen",
                "sort_order": 4,
                "assigned_to": sophie_id,
                "done": False,
                "completed_by": None,
                "completed_at": None,
            },
            {
                "household_id": household_id,
                "title": "Wohnzimmer abstauben",
                "sort_order": 5,
                "assigned_to": elias_id,
                "done": False,
                "completed_by": None,
                "completed_at": None,
            },
        ],
    )

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/area_responsibilities",
        [
            {"household_id": household_id, "area": "finances", "user_id": mitch_id},
            {"household_id": household_id, "area": "cleaning", "user_id": sophie_id},
            {"household_id": household_id, "area": "organization", "user_id": sebi_id},
            {"household_id": household_id, "area": "pantry", "user_id": elias_id},
        ],
    )

    def event(
        title: str,
        day: date,
        *,
        description: str | None = None,
        all_day: bool = True,
        hour: int = 12,
        duration_hours: int = 0,
    ) -> dict[str, Any]:
        starts_at = f"{day.isoformat()}T{hour:02d}:00:00+02:00"
        ends_at: str | None = None
        if not all_day and duration_hours:
            end_hour = hour + duration_hours
            ends_at = f"{day.isoformat()}T{end_hour:02d}:00:00+02:00"

        return {
            "household_id": household_id,
            "title": title,
            "event_date": day.isoformat(),
            "starts_at": starts_at,
            "ends_at": ends_at,
            "all_day": all_day,
            "description": description,
            "sync_source": "app",
        }

    request(
        base,
        anon_key,
        token,
        "POST",
        "/rest/v1/org_events",
        [
            event(
                "Mülltonnen rausstellen",
                today + timedelta(days=1),
                description="Gelbe Tonne + Restmüll. Sebi erinnert morgens in der Gruppe.",
            ),
            event(
                "WG-Abend: Pasta Night",
                today + timedelta(days=3),
                description="Elias kocht, alle helfen beim Aufräumen. Einkauf steht auf der Liste.",
                all_day=False,
                hour=18,
                duration_hours=3,
            ),
            event(
                "Putzplan-Rotation Juli",
                today + timedelta(days=7),
                description="Kurze Runde in der Küche — Sophie moderiert.",
                all_day=False,
                hour=19,
                duration_hours=1,
            ),
            event(
                "Sophie bei den Eltern",
                today + timedelta(days=10),
                description="Sophie ist von Fr–So nicht da. Bad bitte vorher putzen.",
            ),
            event(
                "Nebenkosten Q2 überweisen",
                date(2026, 7, 1),
                description="Mitch überweist an Hausverwaltung — Betrag steht im Ordner Finanzen.",
            ),
        ],
    )

    receipts = [
        {
            "uploaded_by": mitch_id,
            "shopped_by": mitch_id,
            "store_name": "REWE",
            "purchase_date": (today - timedelta(days=4)).isoformat(),
            "total_amount": 47.21,
            "storage_suffix": "rewe",
            "items": [
                ("Vollkornbrot", 1, 2.49, 2.49),
                ("Bio-Eier 10er", 1, 4.29, 4.29),
                ("Deutsche Butter", 1, 2.19, 2.19),
                ("Hafermilch 1L", 2, 1.19, 2.38),
                ("Bananen", 1, 1.89, 1.89),
                ("Hähnchenbrust 400g", 1, 5.99, 5.99),
                ("Passata", 3, 0.93, 2.79),
                ("Parmesan gerieben", 1, 3.49, 3.49),
                ("Salat-Mix", 1, 1.99, 1.99),
                ("Knoblauch", 1, 0.89, 0.89),
                ("Zitronen", 1, 1.49, 1.49),
                ("Olivenöl 0,5L", 1, 4.99, 4.99),
                ("Spülmittel", 1, 1.95, 1.95),
                ("WC-Reiniger", 1, 2.45, 2.45),
                ("Toilettenpapier 8er", 1, 4.95, 4.95),
                ("Müllsäcke 35L", 1, 2.99, 2.99),
            ],
        },
        {
            "uploaded_by": elias_id,
            "shopped_by": elias_id,
            "store_name": "dm-drogerie markt",
            "purchase_date": (today - timedelta(days=8)).isoformat(),
            "total_amount": 19.95,
            "storage_suffix": "dm",
            "items": [
                ("Spülmittel", 1, 1.95, 1.95),
                ("WC-Reiniger", 1, 2.45, 2.45),
                ("Toilettenpapier 8er", 1, 4.95, 4.95),
                ("Müllsäcke 35L", 1, 2.99, 2.99),
                ("Duschgel", 1, 3.49, 3.49),
                ("Geschirrspültabs", 1, 3.12, 3.12),
            ],
        },
        {
            "uploaded_by": sophie_id,
            "shopped_by": sophie_id,
            "store_name": "EDEKA",
            "purchase_date": (today - timedelta(days=13)).isoformat(),
            "total_amount": 34.78,
            "storage_suffix": "edeka",
            "items": [
                ("Kaffee gemahlen", 1, 7.99, 7.99),
                ("Knuspermüsli", 1, 3.49, 3.49),
                ("Naturjoghurt", 4, 0.62, 2.48),
                ("Apfel", 6, 0.45, 2.70),
                ("Vollkornbrot", 1, 2.49, 2.49),
                ("Butter", 1, 2.19, 2.19),
                ("Milch 3,8%", 2, 1.19, 2.38),
                ("Tomatensoße", 2, 1.29, 2.58),
                ("Reis 500g", 1, 1.49, 1.49),
                ("Pasta", 2, 0.89, 1.78),
                ("Zwiebeln 1kg", 1, 1.59, 1.59),
                ("Paprika", 2, 0.79, 1.58),
                ("Gurke", 1, 0.99, 0.99),
                ("Schmand", 1, 1.05, 1.05),
            ],
        },
    ]

    confirmed_at = f"{today.isoformat()}T12:00:00+02:00"

    for index, receipt in enumerate(receipts):
        storage_path = f"{household_id}/demo/{receipt['storage_suffix']}-{index}.jpg"
        created = request(
            base,
            anon_key,
            token,
            "POST",
            "/rest/v1/receipts",
            {
                "household_id": household_id,
                "uploaded_by": receipt["uploaded_by"],
                "shopped_by": receipt["shopped_by"],
                "storage_path": storage_path,
                "store_name": receipt["store_name"],
                "purchase_date": receipt["purchase_date"],
                "total_amount": receipt["total_amount"],
                "currency": "EUR",
                "status": "confirmed",
                "confirmed_at": confirmed_at,
            },
            prefer="return=representation",
        )
        receipt_id = created[0]["id"]
        request(
            base,
            anon_key,
            token,
            "POST",
            "/rest/v1/receipt_items",
            [
                {
                    "receipt_id": receipt_id,
                    "household_id": household_id,
                    "name": name,
                    "quantity": qty,
                    "unit_price": unit,
                    "total_price": total,
                    "sort_order": item_index,
                }
                for item_index, (name, qty, unit, total) in enumerate(receipt["items"])
            ],
        )


def main() -> None:
    required = [
        "SEED_BASE",
        "SEED_ANON_KEY",
        "SEED_TOKEN",
        "SEED_HOUSEHOLD_ID",
        "SEED_MITCH_ID",
        "SEED_SOPHIE_ID",
        "SEED_SEBI_ID",
        "SEED_ELIAS_ID",
    ]
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        print(f"Fehlende Umgebungsvariablen: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    seed_content(
        base=os.environ["SEED_BASE"],
        anon_key=os.environ["SEED_ANON_KEY"],
        token=os.environ["SEED_TOKEN"],
        household_id=os.environ["SEED_HOUSEHOLD_ID"],
        mitch_id=os.environ["SEED_MITCH_ID"],
        sophie_id=os.environ["SEED_SOPHIE_ID"],
        sebi_id=os.environ["SEED_SEBI_ID"],
        elias_id=os.environ["SEED_ELIAS_ID"],
    )


if __name__ == "__main__":
    main()
