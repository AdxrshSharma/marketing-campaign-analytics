import pandas as pd
import pytest
from app import validate_and_prepare, DEMO_DATA, build_insights

def test_demo_data_calculates_metrics():
    data = validate_and_prepare(DEMO_DATA)
    assert "CTR (%)" in data.columns
    assert "CPM" in data.columns
    assert "CPC" in data.columns
    assert "CPA" in data.columns
    assert "ROAS" in data.columns
    assert data.loc[0, "CTR (%)"] == pytest.approx(1.3)
    assert data.loc[0, "ROAS"] == pytest.approx(3.0)

def test_missing_column_is_rejected():
    bad = DEMO_DATA.drop(columns=["Revenue"])
    with pytest.raises(ValueError, match="Missing required columns"):
        validate_and_prepare(bad)

def test_clicks_cannot_exceed_impressions():
    bad = DEMO_DATA.copy()
    bad.loc[0, "Clicks"] = bad.loc[0, "Impressions"] + 1
    with pytest.raises(ValueError, match="Clicks cannot exceed impressions"):
        validate_and_prepare(bad)

def test_insights_return_list():
    data = validate_and_prepare(DEMO_DATA)
    assert isinstance(build_insights(data), list)
