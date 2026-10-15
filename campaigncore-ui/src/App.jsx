
import { useMemo, useState } from "react";
import {
  BarChart3, House, Send, ChartNoAxesCombined, Lightbulb,
  FileText, Search, CalendarDays, ChevronDown, Upload,
  Eye, MousePointer2, Percent, Coins, Wallet, Target,
  UserRound, Download, SlidersHorizontal, AlertTriangle,
  Flame, TrendingUp, Sparkles, Menu, X, ArrowUpRight,
  FileSpreadsheet, CircleCheck, RefreshCw, Sun, Moon
} from "lucide-react";


import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line
} from "recharts";

import "./index.css";

const initialCampaigns = [
  { Campaign: "Summer Sale", Platform: "DV360", Impressions: 250000, Clicks: 3250, Spend: 12500, Conversions: 130, Revenue: 37500 },
  { Campaign: "Brand Awareness", Platform: "Google Ads", Impressions: 400000, Clicks: 3600, Spend: 18000, Conversions: 90, Revenue: 27000 },
  { Campaign: "Retargeting", Platform: "The Trade Desk", Impressions: 120000, Clicks: 2400, Spend: 6000, Conversions: 150, Revenue: 30000 },
  { Campaign: "Video Campaign", Platform: "YouTube", Impressions: 300000, Clicks: 2700, Spend: 15000, Conversions: 75, Revenue: 22500 },
  { Campaign: "Lead Generation", Platform: "Meta Ads", Impressions: 180000, Clicks: 3600, Spend: 9000, Conversions: 180, Revenue: 36000 },
  { Campaign: "Product Launch", Platform: "DV360", Impressions: 220000, Clicks: 1980, Spend: 11000, Conversions: 66, Revenue: 22000 },
];

const colors = {
  "Google Ads": "#3182f6",
  "Meta Ads": "#a46af5",
  "YouTube": "#f45b91",
  "DV360": "#38d5c6",
  "The Trade Desk": "#ffa34d",
};

const navItems = [
  { name: "Dashboard", Icon: House },
  { name: "Campaigns", Icon: Send },
  { name: "Analytics", Icon: ChartNoAxesCombined },
  { name: "Insights", Icon: Lightbulb },
  { name: "Reports", Icon: FileText },
];

const number = n => Number(n).toLocaleString("en-IN");
const money = n => "₹" + Number(n).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percent = n => `${Number(n).toFixed(2)}%`;

function enrich(campaign) {
  return {
    ...campaign,
    CTR: campaign.Impressions
      ? campaign.Clicks / campaign.Impressions * 100 : 0,
    CPM: campaign.Impressions
      ? campaign.Spend / campaign.Impressions * 1000 : 0,
    CPC: campaign.Clicks
      ? campaign.Spend / campaign.Clicks : 0,
    CPA: campaign.Conversions
      ? campaign.Spend / campaign.Conversions : 0,
    ROAS: campaign.Spend
      ? campaign.Revenue / campaign.Spend : 0,
  };
}

function parseCSV(text) {
  // Supports standard comma-separated CSV without embedded commas in fields.
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(x => x.trim());

  const required = [
    "Campaign", "Platform", "Impressions", "Clicks",
    "Spend", "Conversions", "Revenue",
  ];

  const missing = required.filter(x => !headers.includes(x));
  if (missing.length) {
    throw new Error(`CSV is missing columns: ${missing.join(", ")}`);
  }

  return lines.filter(line => line.trim()).map(line => {
    const values = line.split(",");
    const row = Object.fromEntries(
      headers.map((header, i) => [header, values[i]?.trim() ?? ""])
    );

    for (const field of required.slice(2)) {
      row[field] = Number(row[field]) || 0;
    }

    return row;
  });
}

function Sidebar({ page, setPage, onUpload }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <BarChart3 size={31} />
        </div>
        <div>
          <div className="brand-name">CampaignCore</div>
          <div className="brand-subtitle">Marketing Analytics</div>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map(({ name, Icon }) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "selected" : ""}`}
            onClick={() => setPage(name)}
          >
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <label className="upload-box">
        <span className="upload-icon"><Upload size={23} /></span>
        <strong>Upload Campaign CSV</strong>
        <small>Click to browse<br />CSV files only</small>
        <input type="file" accept=".csv,text/csv" onChange={onUpload} />
      </label>

      <div className="sidebar-bottom">
        <div className="ready"><span /> Ready</div>
        <small>Marketing Analytics Workspace</small>
      </div>
    </aside>
  );
}

function PageHeading({ page }) {
  const descriptions = {
    Dashboard: "Analyze campaign performance, compare platforms, and discover optimization opportunities.",
    Campaigns: "Manage, search, filter, and review all your marketing campaigns.",
    Analytics: "Explore campaign metrics, platform comparisons, and efficiency trends.",
    Insights: "Discover campaign risks and opportunities from your performance data.",
    Reports: "Review your campaign data and export reports for further analysis.",
  };

  return (
    <div className="page-heading">
      <div className="heading-icon"><BarChart3 size={29} /></div>
      <div>
        <h1>{page === "Dashboard" ? "Marketing Campaign Analytics" : page}</h1>
        <p>{descriptions[page]}</p>
      </div>
    </div>
  );
}

function Panel({ title, Icon = BarChart3, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <h3 className="panel-title">
        <Icon size={18} className="panel-heading-icon" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function KpiCard({ title, value, delta, Icon, tone }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${tone}`}><Icon size={22} /></div>
      <div className="kpi-content">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-delta">
          <span>{delta.startsWith("-") ? "↓" : "↑"} {delta}</span>
          <small>vs. previous period</small>
        </div>
      </div>
    </div>
  );
}

function KpiGrid({ rows }) {
  const sum = field => rows.reduce((total, row) => total + row[field], 0);

  const impressions = sum("Impressions");
  const clicks = sum("Clicks");
  const spend = sum("Spend");
  const conversions = sum("Conversions");
  const revenue = sum("Revenue");

  const metrics = [
    ["Impressions", number(impressions), "+12.5%", Eye, "blue"],
    ["Clicks", number(clicks), "+18.2%", MousePointer2, "green"],
    ["CTR", percent(impressions ? clicks / impressions * 100 : 0), "+5.1%", Percent, "purple"],
    ["CPM", money(impressions ? spend / impressions * 1000 : 0), "-8.6%", Coins, "pink"],
    ["Spend", money(spend), "+10.3%", Wallet, "orange"],
    ["Conversions", number(conversions), "+22.7%", Target, "teal"],
    ["CPA", money(conversions ? spend / conversions : 0), "-10.8%", UserRound, "cyan"],
    ["ROAS", `${(spend ? revenue / spend : 0).toFixed(2)}x`, "+16.4%", TrendingUp, "yellow"],
  ];

  return (
    <div className="kpi-grid">
      {metrics.map(([title, value, delta, Icon, tone]) => (
        <KpiCard key={title} {...{ title, value, delta, Icon, tone }} />
      ))}
    </div>
  );
}

function CampaignChart({ rows, metric, title, isPercent = false }) {
  const data = rows.map(c => ({
    name: c.Campaign,
    [c.Platform]: c[metric],
  }));

  const platforms = [...new Set(rows.map(c => c.Platform))];

  return (
    <Panel title={title} className="chart-panel">
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="24%" barGap={3}>
            <CartesianGrid stroke="#1b3558" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#bdd0eb", fontSize: 10 }}
              axisLine={{ stroke: "#274061" }}
              tickLine={false}
              interval={0}
              tickFormatter={v => v.length > 13 ? v.slice(0, 12) + "…" : v}
            />
            <YAxis
              tick={{ fill: "#bdd0eb", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={38}
              tickFormatter={v => isPercent ? `${v}%` : v}
            />
            <Tooltip
              contentStyle={{
                background: "#102441",
                border: "1px solid #29466b",
                borderRadius: 8,
                color: "#fff",
              }}
              formatter={v => [
                isPercent ? percent(v) : `${Number(v).toFixed(2)}x`,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {platforms.map(platform => (
              <Bar
                key={platform}
                dataKey={platform}
                fill={colors[platform] || "#7795c5"}
                radius={[2, 2, 0, 0]}
                maxBarSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function PerformanceTable({ rows }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {[
              "Campaign", "Platform", "Impressions", "Clicks",
              "Spend (₹)", "Conversions", "Revenue (₹)",
              "CTR", "CPM", "CPC", "CPA", "ROAS",
            ].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.Campaign}>
              <td className="campaign-name">{c.Campaign}</td>
              <td>
                <span className="platform-dot"
                  style={{ background: colors[c.Platform] || "#7695c7" }} />
                {c.Platform}
              </td>
              <td>{number(c.Impressions)}</td>
              <td>{number(c.Clicks)}</td>
              <td>{number(c.Spend)}</td>
              <td>{number(c.Conversions)}</td>
              <td>{number(c.Revenue)}</td>
              <td>{percent(c.CTR)}</td>
              <td>{c.CPM.toFixed(2)}</td>
              <td>{c.CPC.toFixed(2)}</td>
              <td>{c.CPA.toFixed(2)}</td>
              <td>{c.ROAS.toFixed(2)}x</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && <p className="empty">No campaigns match your filters.</p>}
    </div>
  );
}

function InsightCard({ type, Icon, title, children }) {
  return (
    <div className={`insight-card ${type}`}>
      <div className="insight-symbol"><Icon size={17} /></div>
      <div className="insight-copy">
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
      <ArrowUpRight size={15} className="insight-arrow" />
    </div>
  );
}

function buildInsights(rows) {
  if (!rows.length) return [];

  const lowCTR = [...rows].sort((a, b) => a.CTR - b.CTR)[0];
  const highCPM = [...rows].sort((a, b) => b.CPM - a.CPM)[0];
  const bestROAS = [...rows].sort((a, b) => b.ROAS - a.ROAS)[0];
  const bestConversions = [...rows].sort((a, b) => b.Conversions - a.Conversions)[0];

  return [
    {
      type: "red", Icon: AlertTriangle, title: "Low CTR Detected",
      text: `${lowCTR.Campaign} has a CTR of ${percent(lowCTR.CTR)}. Review creative quality and targeting.`,
    },
    {
      type: "orange", Icon: Flame, title: "High CPM",
      text: `${highCPM.Campaign} has a CPM of ${money(highCPM.CPM)}. Review placements and audience costs.`,
    },
    {
      type: "green", Icon: TrendingUp, title: "Strong Performance",
      text: `${bestROAS.Campaign} has the highest ROAS (${bestROAS.ROAS.toFixed(2)}x). Consider scaling carefully.`,
    },
    {
      type: "blue", Icon: Target, title: "Conversion Opportunity",
      text: `${bestConversions.Campaign} leads with ${number(bestConversions.Conversions)} conversions.`,
    },
  ];
}

function DashboardPage({ rows }) {
  return (
    <>
      <KpiGrid rows={rows} />
      <div className="charts-grid">
        <CampaignChart rows={rows} metric="CTR" title="CTR by Campaign" isPercent />
        <CampaignChart rows={rows} metric="ROAS" title="ROAS by Campaign" />
      </div>

      <div className="bottom-grid">
        <Panel title="Campaign Performance" Icon={CalendarDays} className="performance-panel">
          <PerformanceTable rows={rows} />
        </Panel>
        <InsightsPanel rows={rows} compact />
      </div>
    </>
  );
}

function CampaignsPage({ rows, platform, setPlatform, onDownload }) {
  const platforms = [...new Set(rows.map(c => c.Platform))];

  return (
    <div className="page-stack">
      <div className="toolbar panel">
        <div>
          <h3 className="panel-title"><Send size={18} /> Campaign Management</h3>
          <p className="muted">{rows.length} campaigns in the current view</p>
        </div>
        <label className="filter-select">
          <SlidersHorizontal size={15} />
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option>All platforms</option>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <Panel title="All Campaigns" Icon={FileSpreadsheet} className="table-panel">
        <PerformanceTable rows={rows} />
        <div className="table-footer">
          <span>{rows.length} campaigns displayed</span>
          <button className="primary-button" onClick={onDownload}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </Panel>
    </div>
  );
}

function AnalyticsPage({ rows }) {
  const platformData = [...new Set(rows.map(c => c.Platform))].map(platform => {
    const group = rows.filter(c => c.Platform === platform);
    const spend = group.reduce((s, c) => s + c.Spend, 0);
    const impressions = group.reduce((s, c) => s + c.Impressions, 0);
    const clicks = group.reduce((s, c) => s + c.Clicks, 0);
    const revenue = group.reduce((s, c) => s + c.Revenue, 0);

    return {
      platform,
      Spend: spend,
      Revenue: revenue,
      CTR: impressions ? clicks / impressions * 100 : 0,
      ROAS: spend ? revenue / spend : 0,
    };
  });

  return (
    <div className="page-stack">
      <div className="analytics-grid">
        <Panel title="Spend by Platform">
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid stroke="#1b3558" vertical={false} />
                <XAxis dataKey="platform" tick={{ fill: "#bdd0eb", fontSize: 10 }} />
                <YAxis tick={{ fill: "#bdd0eb", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#102441", border: "1px solid #29466b" }} />
                <Bar dataKey="Spend" fill="#478cff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenue by Platform">
          <div className="chart-wrap tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid stroke="#1b3558" vertical={false} />
                <XAxis dataKey="platform" tick={{ fill: "#bdd0eb", fontSize: 10 }} />
                <YAxis tick={{ fill: "#bdd0eb", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#102441", border: "1px solid #29466b" }} />
                <Bar dataKey="Revenue" fill="#2bd6b0" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Platform Efficiency">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Platform</th><th>Spend</th><th>Revenue</th><th>CTR</th><th>ROAS</th></tr></thead>
            <tbody>
              {platformData.map(p => (
                <tr key={p.platform}>
                  <td>{p.platform}</td><td>{money(p.Spend)}</td>
                  <td>{money(p.Revenue)}</td><td>{percent(p.CTR)}</td>
                  <td>{p.ROAS.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function InsightsPanel({ rows, compact = false }) {
  const insights = buildInsights(rows);

  return (
    <Panel title="AI-Powered Insights" Icon={Sparkles} className="insights-panel">
      {insights.map((insight, i) => (
        <InsightCard key={`${insight.title}-${i}`} {...insight}>
          {insight.text}
        </InsightCard>
      ))}
      <p className="insights-disclaimer">
        These recommendations use transparent metric-based rules. They are not generated by an AI model.
      </p>
      {!compact && (
        <div className="info-note">
          <Lightbulb size={18} />
          <span>Use these as investigation prompts, not guaranteed performance outcomes. Validate against campaign goals and tracking quality.</span>
        </div>
      )}
    </Panel>
  );
}

function InsightsPage({ rows }) {
  return (
    <div className="page-stack">
      <div className="section-intro">
        <Sparkles size={21} />
        <div>
          <h2>Optimization opportunities</h2>
          <p>Metric-based flags generated from the campaigns currently in view.</p>
        </div>
      </div>
      <InsightsPanel rows={rows} />
    </div>
  );
}

function ReportsPage({ rows, onDownload }) {
  const spend = rows.reduce((s, c) => s + c.Spend, 0);
  const revenue = rows.reduce((s, c) => s + c.Revenue, 0);
  const conversions = rows.reduce((s, c) => s + c.Conversions, 0);
  const impressions = rows.reduce((s, c) => s + c.Impressions, 0);
  const clicks = rows.reduce((s, c) => s + c.Clicks, 0);

  return (
    <div className="page-stack">
      <Panel title="Reporting Summary" Icon={FileSpreadsheet}>
        <div className="report-summary">
          <div><span>Total campaigns</span><strong>{rows.length}</strong></div>
          <div><span>Total spend</span><strong>{money(spend)}</strong></div>
          <div><span>Total revenue</span><strong>{money(revenue)}</strong></div>
          <div><span>Conversions</span><strong>{number(conversions)}</strong></div>
          <div><span>Overall CTR</span><strong>{percent(impressions ? clicks / impressions * 100 : 0)}</strong></div>
          <div><span>Overall ROAS</span><strong>{(spend ? revenue / spend : 0).toFixed(2)}x</strong></div>
        </div>
        <div className="report-action">
          <div>
            <h3>Campaign performance report</h3>
            <p className="muted">Export the current campaign selection, including calculated metrics.</p>
          </div>
          <button className="primary-button" onClick={onDownload}>
            <Download size={16} /> Download CSV
          </button>
        </div>
      </Panel>

      <Panel title="Included in this report" Icon={CircleCheck}>
        <ul className="report-list">
          <li><CircleCheck size={16} /> Campaign and platform names</li>
          <li><CircleCheck size={16} /> Impressions, clicks, spend, conversions, and revenue</li>
          <li><CircleCheck size={16} /> CTR, CPM, CPC, CPA, and ROAS</li>
        </ul>
      </Panel>
    </div>
  );
}

export default function App() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All platforms");
  const [period, setPeriod] = useState("Last 30 days");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState("dark");


  const allRows = useMemo(() => campaigns.map(enrich), [campaigns]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allRows.filter(c =>
      (!query ||
        c.Campaign.toLowerCase().includes(query) ||
        c.Platform.toLowerCase().includes(query)) &&
      (platform === "All platforms" || c.Platform === platform)
    );
  }, [allRows, search, platform]);

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = parseCSV(await file.text());
      setCampaigns(parsed);
      setPlatform("All platforms");
      setSearch("");
      setNotice(`Successfully loaded ${parsed.length} campaigns from ${file.name}`);
    } catch (error) {
      setNotice(error.message || "Unable to read the CSV file.");
    }

    event.target.value = "";
  };

  const downloadReport = () => {
    const headers = [
      "Campaign", "Platform", "Impressions", "Clicks", "Spend",
      "Conversions", "Revenue", "CTR", "CPM", "CPC", "CPA", "ROAS",
    ];

    const escapeCSV = value => {
      const s = String(value ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [
      headers.join(","),
      ...rows.map(c => headers.map(h => escapeCSV(c[h])).join(",")),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "campaigncore-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const pageComponents = {
    Dashboard: <DashboardPage rows={rows} />,
    Campaigns: (
      <CampaignsPage
        rows={rows}
        platform={platform}
        setPlatform={setPlatform}
        onDownload={downloadReport}
      />
    ),
    Analytics: <AnalyticsPage rows={rows} />,
    Insights: <InsightsPage rows={rows} />,
    Reports: <ReportsPage rows={rows} onDownload={downloadReport} />,
  };

  return (
    <div className={`app-shell ${theme === "light" ? "light-mode" : ""}`}>
      <Sidebar page={page} setPage={setPage} onUpload={handleUpload} />

      <main className="main-area">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search campaigns, platforms..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="topbar-right">           
          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setTheme(current => current === "dark" ? "light" : "dark")
            }
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
           >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

            <label className="period-select">
              <CalendarDays size={16} />
              <select value={period} onChange={e => setPeriod(e.target.value)}>
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
                <option>Year to date</option>
              </select>
              <ChevronDown size={14} />
            </label>

            <div className="profile">
              <span className="avatar">AS</span>
              <span>Adarsh Sharma</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {notice && (
          <button className="notice" onClick={() => setNotice("")}>
            {notice} · Dismiss
          </button>
        )}

        <div className="page-content">
          <PageHeading page={page} />

          {pageComponents[page]}

          <footer className="app-footer">
            CampaignCore · Marketing Analytics · Demo data is illustrative
          </footer>
        </div>
      </main>
    </div>
  );
}
