# CampaignCore — Marketing Campaign Analytics Dashboard

A portfolio project that analyzes digital advertising campaign data through an interactive Streamlit dashboard. It includes campaign filters, KPI calculations, interactive charts, CSV validation, exportable reports, and transparent rule-based optimization insights.

> **Note:** This project uses illustrative demo data. The insight engine is rule-based, not a trained machine-learning model or a generative AI service.

## Features

- Dark navy SaaS-style dashboard
- KPI cards for impressions, clicks, CTR, CPM, spend, conversions, CPA, and ROAS
- Platform filters and campaign search
- Interactive CTR and ROAS charts using Plotly
- CSV upload with required-column and numeric validation
- Campaign-level CPC, CPA, CPM, CTR, and ROAS calculations
- Rule-based performance observations
- Download filtered campaign reports
- Basic automated tests with pytest

## Tech stack

- Python
- Streamlit
- Pandas
- Plotly
- Pytest

## Project structure

```text
3-marketing-campaign-analytics/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── data/
│   └── sample_campaigns.csv
└── tests/
    └── test_metrics.py
```

## Run locally on Windows

### 1. Create and open the project folder

Open the folder in VS Code, then open **Terminal → New Terminal**.

### 2. Create a virtual environment

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this for the current terminal only, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 3. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 4. Start the dashboard

```powershell
streamlit run app.py
```

Streamlit will print a local URL, usually `http://localhost:8501`.

### 5. Run tests

```powershell
python -m pytest -q
```

## CSV format

Upload a CSV with these required columns:

| Column | Description |
|---|---|
| `Campaign` | Campaign name |
| `Platform` | Advertising platform |
| `Impressions` | Number of impressions |
| `Clicks` | Number of clicks |
| `Spend` | Campaign spend, in the same currency across rows |
| `Conversions` | Number of attributed conversions |
| `Revenue` | Attributed revenue, in the same currency as spend |

A sample file is included at `data/sample_campaigns.csv`.

## Metrics

- **CTR (%)** = Clicks / Impressions × 100
- **CPM** = Spend / Impressions × 1,000
- **CPC** = Spend / Clicks
- **CPA** = Spend / Conversions
- **ROAS** = Revenue / Spend

For aggregate KPIs, rates are calculated from the totals rather than averaging row-level rates.

## Insight rules

The initial insight rules flag low CTR (under 1%), ROAS below 2x, CPM above ₹100, and strong performance when ROAS is at least 4x and CTR at least 1.5%. These are illustrative thresholds only; actual benchmarks depend on objective, format, geography, audience, attribution window, and campaign context.

## Limitations and future improvements

- No authentication or hosted database; intended as a local portfolio demo.
- Currency is displayed in INR; ensure input rows use a consistent currency.
- Conversion count is validated as no greater than clicks for this demo's simplified data model. Adapt this rule if your attribution model permits different definitions.
- Insight thresholds are rule-based, not predictive.
- Future ideas: date-range filtering, campaign budget pacing, anomaly detection, richer attribution, and deployment.

## Portfolio disclaimer

All included campaign rows are illustrative and do not represent real client data.
