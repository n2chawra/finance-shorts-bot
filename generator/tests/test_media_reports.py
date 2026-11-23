"""Investigation report pages for the disasters channel (generator/media/reports.py) and per-channel sources."""
import pytest

from generator.media import may_use
from generator.media import licence
from generator.media.reports import agency, find_page
from generator.media.store import MediaError

DD = "disasters-and-engineering-failures-expla"


def test_disasters_channel_takes_reports_and_public_domain_photos_but_no_stock():
    for src in ("commons", "report", "nasa", "loc", "archive"):
        assert may_use(DD, src)
    for src in ("pexels", "pixabay", "edgar"):
        assert not may_use(DD, src)
    assert may_use("business-documentaries-rise-and-fall-of", "pexels")
    assert not may_use("first-channel", "report") and may_use("first-channel", "commons")


def test_only_official_investigation_bodies_are_accepted():
    assert agency("https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1001.pdf")[1].startswith("Public domain")
    assert "Open Government" in agency("https://assets.publishing.service.gov.uk/media/x/RAIB_report.pdf")[1]
    assert agency("https://www.atsb.gov.au/sites/default/files/report.pdf")[1] == "CC BY 4.0"
    with pytest.raises(MediaError):
        agency("https://example.com/report.pdf")
    with pytest.raises(MediaError):
        agency("https://ntsb.gov.evil.com/report.pdf")


def test_report_licences_classify_ok_and_need_a_credit():
    assert licence.classify("report", "Public domain (US government work)")[0] == licence.OK
    assert licence.classify("report", "Open Government Licence v3.0")[0] == licence.OK
    assert licence.classify("report", "")[0] == licence.REVIEW
    req, line = licence.attribution("report", "CC BY 4.0", "Australian Transport Safety Bureau", "AO-2019-001", "https://x", "document")
    assert req and "Australian Transport Safety Bureau" in line


def test_find_page_ignores_case_whitespace_and_the_contents_page():
    pages = ["Contents\n1. Probable Cause ..... 74", "intro", "The   probable\ncause of this accident was", "probable cause again"]
    assert find_page(pages, "probable cause") == 2
    assert find_page(pages, "probable cause", nth=2) == 3
    with pytest.raises(MediaError):
        find_page(pages, "not there")
