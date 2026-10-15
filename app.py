import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="CampaignCore | Marketing Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------- Theme ----------
st.markdown("""
<style>
.stApp { background: #071426; color: #E7F0FF; }
[data-testid="stSidebar"] { background: #0B1B31; border-right: 1px solid #203957; }
.block-container { padding-top: 1.35rem; padding-bottom: 2rem; }
h1, h2, h3 { color: #F2F7FF; }
p, label, .stMarkdown { color: #C8D8EF; }
div[data-testid="stMetric"] {
    background: linear-gradient(145deg, #122846, #0D1F38);
    border: 1px solid #203D62;
    border-radius: 14px;
    padding: 15px 17px;
}
div[data-testid="stMetricLabel"] { color: #9FCBFF; }
div[data-testid="stMetricValue"] { color: #F4F8FF; }
.stButton button, .stDownloadButton button {
    background: #2563EB; color: white; border: 1px solid #3B82F6;
    border-radius: 9px; font-weight: 600;
}
.stButton button:hover, .stDownloadButton button:hover { background: #1D4ED8; color: white; }
div[data-testid="stDataFrame"] { border: 1px solid #203D62; border-radius: 10px; }
hr { border-color: #203957; }
.small-muted { color: #8DA8C9; font-size: 0.88rem; }
</style>
""", unsafe_allow_html=True)

REQUIRED_COLUMNS = [
    "Campaign", "Platform", "Impressions", "Clicks",
    "Spend", "Conversions", "Revenue"
]
NUMERIC_COLUMNS = ["Impressions", "Clicks", "Spend", "Conversions", "Revenue"]

DEMO_DATA = pd.DataFrame({
    "Campaign": ["Summer Sale", "Brand Awareness", "Retargeting",
                 "Video Campaign", "Lead Generation", "Product Launch"],
    "Platform": ["DV360", "Google Ads", "The Trade Desk",
                 "YouTube", "Meta Ads", "DV360"],
    "Impressions": [250000, 400000, 120000, 300000, 180000, 220000],
    "Clicks": [3250, 3600, 2400, 2700, 3600, 1980],
    "Spend": [12500, 18000, 6000, 15000, 9000, 11000],
    "Conversions": [130, 90, 150, 75, 180, 66],
    "Revenue": [37500, 27000, 30000, 22500, 36000, 22000],
})

def validate_and_prepare(df: pd.DataFrame) -> pd.DataFrame:
    """Validate uploaded campaign data and calculate campaign-level metrics."""
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))

    data = df[REQUIRED_COLUMNS].copy()
    data["Campaign"] = data["Campaign"].astype("string").str.strip()
    data["Platform"] = data["Platform"].astype("string").str.strip()
    if data["Campaign"].isna().any() or data["Campaign"].eq("").any():
        raise ValueError("Campaign names cannot be blank.")
    if data["Platform"].isna().any() or data["Platform"].eq("").any():
        raise ValueError("Platform names cannot be blank.")

    for col in NUMERIC_COLUMNS:
        data[col] = pd.to_numeric(data[col], errors="coerce")
    if data[NUMERIC_COLUMNS].isna().any().any():
        raise ValueError("Numeric columns contain missing or invalid values.")
    if (data[NUMERIC_COLUMNS] < 0).any().any():
        raise ValueError("Numeric metrics cannot be negative.")
    if (data["Clicks"] > data["Impressions"]).any():
        raise ValueError("Clicks cannot exceed impressions.")
    if (data["Conversions"] > data["Clicks"]).any():
        raise ValueError("Conversions cannot exceed clicks in this demo dataset.")

    data["CTR (%)"] = (data["Clicks"] / data["Impressions"].replace(0, pd.NA) * 100).fillna(0)
    data["CPM"] = (data["Spend"] / data["Impressions"].replace(0, pd.NA) * 1000).fillna(0)
    data["CPC"] = (data["Spend"] / data["Clicks"].replace(0, pd.NA)).fillna(0)
    data["CPA"] = (data["Spend"] / data["Conversions"].replace(0, pd.NA)).fillna(0)
    data["ROAS"] = (data["Revenue"] / data["Spend"].replace(0, pd.NA)).fillna(0)
    return data

def build_insights(data: pd.DataFrame) -> list[dict]:
    """Generate transparent rule-based observations; not an ML model."""
    insights = []
    for _, row in data.iterrows():
        if row["CTR (%)"] < 1:
            insights.append({
                "level": "Review",
                "campaign": row["Campaign"],
                "title": "Low CTR",
                "detail": f"CTR is {row['CTR (%)']:.2f}%. Review creative relevance, audience targeting and placements."
            })
        if row["ROAS"] < 2 and row["Spend"] > 0:
            insights.append({
                "level": "Review",
                "campaign": row["Campaign"],
                "title": "ROAS below 2x",
                "detail": f"ROAS is {row['ROAS']:.2f}x. Check conversion value, attribution and campaign costs."
            })
        if row["CPM"] > 100:
            insights.append({
                "level": "Review",
                "campaign": row["Campaign"],
                "title": "High CPM",
                "detail": f"CPM is ₹{row['CPM']:.2f}. Review inventory, audience costs and placement mix."
            })
        if row["ROAS"] >= 4 and row["CTR (%)"] >= 1.5:
            insights.append({
                "level": "Positive",
                "campaign": row["Campaign"],
                "title": "Strong performance",
                "detail": f"ROAS is {row['ROAS']:.2f}x with CTR at {row['CTR (%)']:.2f}%. Consider checking scale potential and budget constraints."
            })
    return insights

def money(value: float) -> str:
    return f"₹{value:,.2f}"

# ---------- Sidebar ----------
with st.sidebar:
    st.markdown("# 📊 CampaignCore")
    st.caption("MARKETING ANALYTICS")
    st.divider()
    st.markdown("### Navigation")
    st.markdown("▦  Dashboard")
    st.markdown("➤  Campaigns")
    st.markdown("▥  Analytics")
    st.markdown("✧  Insights")
    st.markdown("▤  Reports")
    st.divider()
    st.markdown("### Campaign data")
    uploaded_file = st.file_uploader("Upload campaign CSV", type=["csv"])
    st.caption("Required columns are listed in the README.")
    st.divider()
    st.markdown('<span class="small-muted">● Ready · Local demo</span>', unsafe_allow_html=True)

st.title("Marketing Campaign Analytics")
st.caption("Analyze campaign performance, compare platforms, and discover optimization opportunities.")

# ---------- Load data ----------
if uploaded_file is not None:
    try:
        raw_data = pd.read_csv(uploaded_file)
        prepared = validate_and_prepare(raw_data)
        st.sidebar.success(f"Loaded {len(prepared)} campaign rows.")
    except (ValueError, pd.errors.ParserError, UnicodeDecodeError) as exc:
        st.error(f"Unable to use this CSV: {exc}")
        st.stop()
else:
    prepared = validate_and_prepare(DEMO_DATA)
    st.info("Showing illustrative demo data. Upload your own CSV from the sidebar to analyze a report.")

# ---------- Filters ----------
f1, f2 = st.columns([2, 2])
with f1:
    platforms = sorted(prepared["Platform"].dropna().unique().tolist())
    selected_platforms = st.multiselect("Filter platforms", platforms, default=platforms)
with f2:
    search_term = st.text_input("Search campaign", placeholder="Type a campaign name...")

filtered = prepared[prepared["Platform"].isin(selected_platforms)].copy()
if search_term.strip():
    filtered = filtered[filtered["Campaign"].str.contains(search_term.strip(), case=False, na=False)]

if filtered.empty:
    st.warning("No campaigns match these filters. Change the platform selection or search term.")
    st.stop()

# Totals must be calculated from sums; rates are not averaged.
impressions = filtered["Impressions"].sum()
clicks = filtered["Clicks"].sum()
spend = filtered["Spend"].sum()
conversions = filtered["Conversions"].sum()
revenue = filtered["Revenue"].sum()
overall_ctr = clicks / impressions * 100 if impressions else 0
overall_cpm = spend / impressions * 1000 if impressions else 0
overall_cpc = spend / clicks if clicks else 0
overall_cpa = spend / conversions if conversions else 0
overall_roas = revenue / spend if spend else 0

st.markdown("### Overall performance")
m1, m2, m3, m4 = st.columns(4)
m1.metric("Impressions", f"{impressions:,.0f}")
m2.metric("Clicks", f"{clicks:,.0f}")
m3.metric("CTR", f"{overall_ctr:.2f}%")
m4.metric("CPM", money(overall_cpm))
m5, m6, m7, m8 = st.columns(4)
m5.metric("Spend", money(spend))
m6.metric("Conversions", f"{conversions:,.0f}")
m7.metric("CPA", money(overall_cpa))
m8.metric("ROAS", f"{overall_roas:.2f}x")

st.divider()

# ---------- Charts ----------
st.markdown("### Campaign comparisons")
left, right = st.columns(2)
chart_template = "plotly_dark"
with left:
    fig_ctr = px.bar(
        filtered, x="Campaign", y="CTR (%)", color="Platform",
        title="CTR by campaign", barmode="group",
        color_discrete_sequence=["#3B82F6", "#8B5CF6", "#22D3EE", "#14B8A6", "#F59E0B"],
        template=chart_template,
    )
    fig_ctr.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                          legend_title_text="", margin=dict(l=10, r=10, t=55, b=10))
    st.plotly_chart(fig_ctr, use_container_width=True)
with right:
    fig_roas = px.bar(
        filtered, x="Campaign", y="ROAS", color="Platform",
        title="ROAS by campaign", barmode="group",
        color_discrete_sequence=["#3B82F6", "#8B5CF6", "#22D3EE", "#14B8A6", "#F59E0B"],
        template=chart_template,
    )
    fig_roas.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                           legend_title_text="", margin=dict(l=10, r=10, t=55, b=10))
    st.plotly_chart(fig_roas, use_container_width=True)

# ---------- Table ----------
st.markdown("### Campaign performance")
display_cols = REQUIRED_COLUMNS + ["CTR (%)", "CPM", "CPC", "CPA", "ROAS"]
table = filtered[display_cols].copy()
st.dataframe(
    table.style.format({
        "Impressions": "{:,.0f}", "Clicks": "{:,.0f}",
        "Spend": "₹{:,.2f}", "Revenue": "₹{:,.2f}",
        "Conversions": "{:,.0f}", "CTR (%)": "{:.2f}%",
        "CPM": "₹{:,.2f}", "CPC": "₹{:,.2f}",
        "CPA": "₹{:,.2f}", "ROAS": "{:.2f}x",
    }),
    use_container_width=True, hide_index=True
)

csv_bytes = table.to_csv(index=False).encode("utf-8")
st.download_button(
    "⬇ Download filtered campaign report",
    data=csv_bytes,
    file_name="campaigncore_report.csv",
    mime="text/csv",
)

# ---------- Insights ----------
st.divider()
st.markdown("### ✨ Campaign optimization insights")
insights = build_insights(filtered)
if not insights:
    st.success("No campaigns triggered the current illustrative review rules.")
else:
    for insight in insights:
        icon = "🟢" if insight["level"] == "Positive" else "🔎"
        with st.expander(f"{icon} {insight['title']} · {insight['campaign']}"):
            st.write(insight["detail"])

st.caption(
    "CampaignCore portfolio demo · Demo data is illustrative. Insights are rule-based, "
    "not generated by a trained AI model. Thresholds should be adapted to campaign goals, "
    "formats, markets and benchmarks."
)
