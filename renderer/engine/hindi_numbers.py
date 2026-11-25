"""Figures read aloud in Hindi, in Devanagari, for a channel whose language is "hi" (India Maps, 2026-11-24).

`voice.spoken` sends a figure here when the channel speaks Hindi; every other channel never comes here.
Hindi's 0-99 are irregular (no tens-and-ones rule), so they are one table; above that the Indian
grouping: सौ, हज़ार, लाख, करोड़. Years are read the Hindi way (1956 → उन्नीस सौ छप्पन, 2014 → दो हज़ार
चौदह), decimals with दशमलव and each digit after it, and the units the channel shows (km → किलोमीटर,
km² → वर्ग किलोमीटर, % → प्रतिशत, people → लोग).
"""
from __future__ import annotations

import re
from decimal import Decimal

_TO_99 = (
    "शून्य एक दो तीन चार पाँच छह सात आठ नौ "
    "दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस "
    "बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस "
    "तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस छत्तीस सैंतीस अड़तीस उनतालीस "
    "चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस उनचास "
    "पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ "
    "साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर "
    "सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उन्यासी "
    "अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी "
    "नब्बे इक्यानवे बानवे तिरानवे चौरानवे पचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे"
).split()
assert len(_TO_99) == 100

_GROUPS = ((10_000_000, "करोड़"), (100_000, "लाख"), (1_000, "हज़ार"), (100, "सौ"))
_SCALE = {"K": 10**3, "thousand": 10**3, "M": 10**6, "million": 10**6, "B": 10**9, "billion": 10**9,
          "T": 10**12, "trillion": 10**12}
_INDIAN = {"L": "लाख", "Lakh": "लाख", "lakh": "लाख", "Cr": "करोड़", "Crore": "करोड़", "crore": "करोड़"}
_MONEY = {"₹": ("रुपया", "रुपये"), "$": ("डॉलर", "डॉलर"), "£": ("पाउंड", "पाउंड"), "€": ("यूरो", "यूरो")}
_UNITS = {"km²": "वर्ग किलोमीटर", "km2": "वर्ग किलोमीटर", "sq km": "वर्ग किलोमीटर", "km": "किलोमीटर",
          "m³/s": "घन मीटर प्रति सेकंड", "m": "मीटर", "ft": "फ़ुट", "s": "सेकंड", "min": "मिनट",
          "tonnes/s": "टन प्रति सेकंड", "t/s": "टन प्रति सेकंड", "tonnes": "टन", "%": "प्रतिशत",
          "×": "गुना", "x": "गुना", "people": "लोग", "years": "साल", "year": "साल"}
_FIGURE = re.compile(
    r"([₹$£€])?\s*(\d[\d,]*(?:\.\d+)?)\s*(K|M|B|T|L|Lakh|Cr|Crore|thousand|million|billion|trillion|lakh|crore)?"
    r"\s*(km²|km2|sq km|km|m³/s|tonnes/s|t/s|tonnes|min|ft|m|s|%|×|x|people|years|year)?")


def hindi_number_words(n: int) -> str:
    """0 → शून्य, 56 → छप्पन, 100 → एक सौ, 999 → नौ सौ निन्यानवे, 1,00,000 → एक लाख, 1,00,00,000 → एक करोड़."""
    if n < 0:
        return "माइनस " + hindi_number_words(-n)
    if n < 100:
        return _TO_99[n]
    for size, name in _GROUPS:
        if n >= size:
            head, rest = divmod(n, size)
            return f"{hindi_number_words(head)} {name}" + ("" if rest == 0 else " " + hindi_number_words(rest))
    raise AssertionError("unreachable")


def hindi_year(y: int) -> str:
    """1956 → उन्नीस सौ छप्पन, 1900 → उन्नीस सौ, 2014 → दो हज़ार चौदह, 2000 → दो हज़ार."""
    if 2000 <= y <= 2099 or y < 1100:
        return hindi_number_words(y)
    head, tail = divmod(y, 100)
    return f"{_TO_99[head]} सौ" + ("" if tail == 0 else " " + _TO_99[tail])


def hindi_decimal(num: str) -> str:
    """'12.5' → बारह दशमलव पाँच, '2.30' → दो दशमलव तीन, '1,500' → एक हज़ार पाँच सौ."""
    whole, _, frac = num.replace(",", "").partition(".")
    frac = frac.rstrip("0")
    out = hindi_number_words(int(whole))
    return out + (" दशमलव " + " ".join(_TO_99[int(d)] for d in frac) if frac else "")


def _indian_amount(value: Decimal) -> str:
    """A K/M/B count re-read the Indian way: 1.2M → बारह लाख, 2.5B → दो सौ पचास करोड़, 4,300 → चार हज़ार तीन सौ."""
    if value >= 10_000_000:
        return f"{hindi_decimal(f'{value/10_000_000:.2f}')} करोड़"
    if value >= 100_000:
        return f"{hindi_decimal(f'{value/100_000:.2f}')} लाख"
    return hindi_decimal(f"{value:.2f}")


def say_numbers_hindi(text: str) -> str:
    """Every number in `text` written out in Hindi words."""
    return re.sub(r"\d[\d,]*(?:\.\d+)?", lambda m: hindi_decimal(m.group(0)), text)


def spoken_hindi(display: str) -> str:
    """An on-screen figure read aloud in Hindi: '1956' → उन्नीस सौ छप्पन, '4,300 km' → चार हज़ार तीन सौ
    किलोमीटर, '12.5%' → बारह दशमलव पाँच प्रतिशत, '₹12.4 L' → बारह दशमलव चार लाख रुपये,
    '3.2 Cr people' → तीन दशमलव दो करोड़ लोग, '$1.2M' → बारह लाख डॉलर. Anything else: its digits in words."""
    s = display.strip()
    if re.fullmatch(r"(1[1-9]|20)\d\d", s):
        return hindi_year(int(s))
    if s[:1] in "-−" and len(s) > 1:
        return "माइनस " + spoken_hindi(s[1:])
    m = _FIGURE.fullmatch(s)
    if not m:
        return say_numbers_hindi(s.replace("₹", "रुपये ").replace("%", " प्रतिशत"))
    sym, num, scale, unit = m.groups()
    if scale in _SCALE:
        words = _indian_amount(Decimal(num.replace(",", ""))*_SCALE[scale])
    else:
        words = hindi_decimal(num) + (f" {_INDIAN[scale]}" if scale else "")
    if sym:
        one, many = _MONEY[sym]
        words += " " + (one if words == "एक" else many)
    return words + (f" {_UNITS[unit]}" if unit else "")
