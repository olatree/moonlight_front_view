// src/pages/admin/fees/FeeCollectionAnalysisPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

const formatMoney = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG")}`;

const fmt = (n) => Number(n || 0).toLocaleString("en-NG");

// ─── Main Page ────────────────────────────────────────────────────────────────
const FeeCollectionAnalysisPage = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [summary, setSummary] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    sessionId: "",
    termId: "",
    classId: "",
    armId: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const collectionRate = Number(summary?.collectionRate || 0);
  const outstandingRate = Math.max(100 - collectionRate, 0);

  const printReport = () => {
    if (!summary) return;

    const s = summary;
    const rate = Number(s.collectionRate || 0);
    const statusSummary = s.statusSummary || {};
    const totalAccounts = Number(s.totalAccounts || 1);

    const barPct = (count) =>
      Math.round((Number(count || 0) / totalAccounts) * 100);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fee Collection Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #fff;
      padding: 32px 40px;
    }
    /* ── Header ── */
    .header { margin-bottom: 24px; border-bottom: 2px solid #16a34a; padding-bottom: 14px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .school-name { font-size: 18px; font-weight: 800; color: #15803d; letter-spacing: -0.3px; }
    .report-title { font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px; }
    .meta { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .filter-pill {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      color: #15803d; font-size: 11px; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; white-space: nowrap;
    }

    /* ── Section title ── */
    .section-title {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #94a3b8; margin-bottom: 10px;
    }

    /* ── Progress Banner ── */
    .banner {
      background: #15803d; color: #fff;
      border-radius: 10px; padding: 16px 18px; margin-bottom: 20px;
    }
    .banner-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .banner-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #bbf7d0; }
    .banner-rate { font-size: 18px; font-weight: 800; }
    .progress-track { height: 8px; background: rgba(0,0,0,0.25); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
    .progress-fill { height: 100%; background: #fff; border-radius: 99px; }
    .banner-row { display: flex; gap: 24px; font-size: 11px; color: #d1fae5; }
    .banner-row strong { color: #fff; }

    /* ── Metric grid ── */
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }

    .metric-card { border-radius: 8px; padding: 12px 14px; }
    .metric-card.neutral  { background: #1e293b; color: #fff; }
    .metric-card.green    { background: #f0fdf4; color: #14532d; }
    .metric-card.red      { background: #fef2f2; color: #7f1d1d; }
    .metric-card.yellow   { background: #fefce8; color: #713f12; }
    .metric-card .m-label { font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; opacity: 0.7; }
    .metric-card .m-value { font-size: 17px; font-weight: 800; margin: 3px 0 1px; line-height: 1.1; }
    .metric-card .m-sub   { font-size: 10px; opacity: 0.6; }

    .small-card {
      border-radius: 8px; border: 1px solid #e2e8f0;
      border-left: 4px solid #94a3b8;
      padding: 10px 12px; background: #fff;
    }
    .small-card.orange { border-left-color: #f97316; }
    .small-card.purple { border-left-color: #9333ea; }
    .small-card .s-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; }
    .small-card .s-value { font-size: 16px; font-weight: 800; color: #1e293b; margin: 2px 0 1px; }
    .small-card .s-sub   { font-size: 10px; color: #94a3b8; }

    /* ── Status breakdown ── */
    .status-section { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 20px; }
    .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
    .status-badge { border-radius: 8px; padding: 10px 12px; }
    .status-badge.green  { background: #f0fdf4; }
    .status-badge.yellow { background: #fefce8; }
    .status-badge.red    { background: #fef2f2; }
    .status-badge.purple { background: #faf5ff; }
    .status-badge .sb-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
    .status-badge.green  .sb-label { color: #15803d; }
    .status-badge.yellow .sb-label { color: #a16207; }
    .status-badge.red    .sb-label { color: #b91c1c; }
    .status-badge.purple .sb-label { color: #7e22ce; }
    .status-badge .sb-count { font-size: 20px; font-weight: 800; margin: 3px 0 4px; }
    .status-badge.green  .sb-count { color: #15803d; }
    .status-badge.yellow .sb-count { color: #a16207; }
    .status-badge.red    .sb-count { color: #b91c1c; }
    .status-badge.purple .sb-count { color: #7e22ce; }
    .mini-bar-track { height: 5px; background: rgba(0,0,0,0.08); border-radius: 99px; overflow: hidden; }
    .mini-bar-fill  { height: 100%; border-radius: 99px; }
    .status-badge.green  .mini-bar-fill { background: #16a34a; }
    .status-badge.yellow .mini-bar-fill { background: #ca8a04; }
    .status-badge.red    .mini-bar-fill { background: #dc2626; }
    .status-badge.purple .mini-bar-fill { background: #9333ea; }
    .sb-pct { font-size: 10px; margin-top: 3px; opacity: 0.65; }

    /* proportion bar */
    .prop-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; margin-bottom: 5px; }
    .prop-track  { display: flex; height: 10px; border-radius: 99px; overflow: hidden; background: #f1f5f9; }
    .prop-legend { display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap; }
    .prop-legend span { font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 4px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

    /* ── Footer ── */
    .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }

    @media print {
      body { padding: 20px 24px; }
      @page { margin: 1cm; size: A4; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-top">
      <div>
        <div class="school-name">Moonlight College</div>
        <div class="report-title">Fee Collection Analysis Report</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      ${selectedFilterText ? `<span class="filter-pill">${selectedFilterText}</span>` : ""}
    </div>
  </div>

  <!-- Collection Rate Banner -->
  <div class="banner">
    <div class="banner-top">
      <span class="banner-label">Collection Rate</span>
      <span class="banner-rate">${rate}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${Math.min(rate, 100)}%"></div>
    </div>
    <div class="banner-row">
      <span>Collected: <strong>${formatMoney(s.totalCollected)}</strong></span>
      <span>Outstanding: <strong>${outstandingRate}%</strong></span>
      <span>Expected: <strong>${formatMoney(s.totalExpected)}</strong></span>
    </div>
  </div>

  <!-- Primary Metrics -->
  <p class="section-title">Key Figures</p>
  <div class="grid-4">
    <div class="metric-card neutral">
      <div class="m-label">Expected</div>
      <div class="m-value">${formatMoney(s.totalExpected)}</div>
      <div class="m-sub">Net payable</div>
    </div>
    <div class="metric-card green">
      <div class="m-label">Collected</div>
      <div class="m-value">${formatMoney(s.totalCollected)}</div>
      <div class="m-sub">Payments received</div>
    </div>
    <div class="metric-card red">
      <div class="m-label">Outstanding</div>
      <div class="m-value">${formatMoney(s.totalOutstanding)}</div>
      <div class="m-sub">Still owed</div>
    </div>
    <div class="metric-card yellow">
      <div class="m-label">Discounts</div>
      <div class="m-value">${formatMoney(s.totalDiscounts)}</div>
      <div class="m-sub">Total approved</div>
    </div>
  </div>

  <!-- Secondary Metrics -->
  <p class="section-title">Supporting Figures</p>
  <div class="grid-4">
    <div class="small-card">
      <div class="s-label">Original Fees</div>
      <div class="s-value">${formatMoney(s.totalOriginalFees)}</div>
      <div class="s-sub">Before discounts</div>
    </div>
    <div class="small-card orange">
      <div class="s-label">Previous Balances</div>
      <div class="s-value">${formatMoney(s.totalPreviousBalance)}</div>
      <div class="s-sub">Carry-over</div>
    </div>
    <div class="small-card">
      <div class="s-label">Total Accounts</div>
      <div class="s-value">${fmt(s.totalAccounts)}</div>
      <div class="s-sub">Students enrolled</div>
    </div>
    <div class="small-card purple">
      <div class="s-label">Overpaid</div>
      <div class="s-value">${fmt(statusSummary.overpaid)}</div>
      <div class="s-sub">Excess payment</div>
    </div>
  </div>

  <!-- Status Breakdown -->
  <div class="status-section">
    <p class="section-title" style="margin-bottom:12px">Payment Status Breakdown</p>
    <div class="status-grid">
      ${[
        { label: "Fully Paid",    key: "paid",        cls: "green"  },
        { label: "Part Payment",  key: "partPayment", cls: "yellow" },
        { label: "Unpaid",        key: "unpaid",      cls: "red"    },
        { label: "Overpaid",      key: "overpaid",    cls: "purple" },
      ].map(({ label, key, cls }) => {
        const count = Number(statusSummary[key] || 0);
        const pct = barPct(count);
        return `
        <div class="status-badge ${cls}">
          <div class="sb-label">${label}</div>
          <div class="sb-count">${count.toLocaleString("en-NG")}</div>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="sb-pct">${pct}% of accounts</div>
        </div>`;
      }).join("")}
    </div>

    <!-- Proportion bar -->
    <div class="prop-label">Account Distribution</div>
    <div class="prop-track">
      ${[
        { key: "paid",        color: "#16a34a" },
        { key: "partPayment", color: "#ca8a04" },
        { key: "unpaid",      color: "#dc2626" },
        { key: "overpaid",    color: "#9333ea" },
      ].map(({ key, color }) => {
        const pct = barPct(Number(statusSummary[key] || 0));
        return pct > 0
          ? `<div style="width:${pct}%;background:${color}"></div>`
          : "";
      }).join("")}
    </div>
    <div class="prop-legend">
      ${[
        { label: "Paid",     color: "#16a34a" },
        { label: "Part",     color: "#ca8a04" },
        { label: "Unpaid",   color: "#dc2626" },
        { label: "Overpaid", color: "#9333ea" },
      ].map(({ label, color }) =>
        `<span><span class="dot" style="background:${color}"></span>${label}</span>`
      ).join("")}
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Moonlight College — Fee Collection Report</span>
    <span>Printed: ${new Date().toLocaleString("en-NG")}</span>
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      alert("Pop-up blocked. Please allow pop-ups for this page and try again.");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const selectedFilterText = useMemo(() => {
    const session = sessions.find((s) => s._id === filters.sessionId)?.name;
    const term = terms.find((t) => t._id === filters.termId)?.name;
    const cls = classes.find((c) => c._id === filters.classId)?.name;
    const arm = arms.find((a) => a._id === filters.armId)?.name;
    return [session, term, cls, arm, filters.status].filter(Boolean).join(" · ");
  }, [filters, sessions, terms, classes, arms]);

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, classesRes] = await Promise.all([
        api.get("/sessions"),
        api.get("/classes"),
      ]);
      setSessions(sessionsRes.data.data || sessionsRes.data || []);
      setClasses(classesRes.data.data || classesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load filters");
    }
  };

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const summaryRes = await api.get("/fees/reports/collection-summary", { params });
      setSummary(summaryRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ sessionId: "", termId: "", classId: "", armId: "", status: "" });
    setTerms([]);
    setArms([]);
    setSummary(null);
    setHasSearched(false);
    setError("");
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    const s = sessions.find((s) => s._id === filters.sessionId);
    setTerms(s?.terms || []);
    setFilters((p) => ({ ...p, termId: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sessionId, sessions]);

  useEffect(() => {
    const c = classes.find((c) => c._id === filters.classId);
    setArms(c?.arms || []);
    setFilters((p) => ({ ...p, armId: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.classId, classes]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-green-600">
            Finance
          </p>
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
            Fee Collection
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor revenue, collections, and outstanding balances.
          </p>
        </div>

        <button
          onClick={printReport}
          disabled={!hasSearched || !summary}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
          </svg>
          Print Report
        </button>
      </div>


      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Filters Card ─────────────────────────────────────────── */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-800">Filter Report</h2>
          {selectedFilterText && (
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
              {selectedFilterText}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Session"
            value={filters.sessionId}
            onChange={(v) => setFilters({ ...filters, sessionId: v })}
            options={sessions}
            placeholder="All Sessions"
          />
          <FilterSelect
            label="Term"
            value={filters.termId}
            onChange={(v) => setFilters({ ...filters, termId: v })}
            options={terms}
            placeholder="All Terms"
          />
          <FilterSelect
            label="Class"
            value={filters.classId}
            onChange={(v) => setFilters({ ...filters, classId: v })}
            options={classes}
            placeholder="All Classes"
          />
          <FilterSelect
            label="Arm"
            value={filters.armId}
            onChange={(v) => setFilters({ ...filters, armId: v })}
            options={arms}
            placeholder="All Arms"
          />

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-500 focus:bg-white"
            >
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="part_payment">Part Payment</option>
              <option value="paid">Paid</option>
              <option value="overpaid">Overpaid</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </span>
            ) : "Apply Filters"}
          </button>
          <button
            onClick={resetFilters}
            type="button"
            className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!hasSearched ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl font-bold text-green-700">
            ₦
          </div>
          <h2 className="text-base font-bold text-slate-800">No report loaded</h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose filters above and click Apply Filters.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
          <svg className="h-8 w-8 animate-spin text-green-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm">Loading report…</p>
        </div>
      ) : (
        <>
          {/* ── Collection Progress Banner ───────────────────────── */}
          <div className="mb-4 rounded-2xl bg-green-700 p-5 text-white shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-200">
                Collection Rate
              </p>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold">
                {collectionRate}%
              </span>
            </div>

            <div className="mb-3 mt-2 h-3 overflow-hidden rounded-full bg-green-900/40">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-green-100">
              <span>
                Collected: <strong className="text-white">{formatMoney(summary?.totalCollected)}</strong>
              </span>
              <span>
                Outstanding: <strong className="text-white">{outstandingRate}%</strong>
              </span>
              <span>
                Expected: <strong className="text-white">{formatMoney(summary?.totalExpected)}</strong>
              </span>
            </div>
          </div>

          {/* ── Primary Metrics ──────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <BigMetric
              label="Expected"
              sublabel="Net payable"
              value={formatMoney(summary?.totalExpected)}
              variant="neutral"
            />
            <BigMetric
              label="Collected"
              sublabel="Payments received"
              value={formatMoney(summary?.totalCollected)}
              variant="green"
            />
            <BigMetric
              label="Outstanding"
              sublabel="Still owed"
              value={formatMoney(summary?.totalOutstanding)}
              variant="red"
            />
            <BigMetric
              label="Discounts"
              sublabel="Total approved"
              value={formatMoney(summary?.totalDiscounts)}
              variant="yellow"
            />
          </div>

          {/* ── Secondary Metrics Row ────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SmallMetric
              label="Original Fees"
              value={formatMoney(summary?.totalOriginalFees)}
              sub="Before discounts"
            />
            <SmallMetric
              label="Previous Balances"
              value={formatMoney(summary?.totalPreviousBalance)}
              sub="Carry-over"
              accent="orange"
            />
            <SmallMetric
              label="Total Accounts"
              value={fmt(summary?.totalAccounts)}
              sub="Students enrolled"
            />
            <SmallMetric
              label="Overpaid"
              value={fmt(summary?.statusSummary?.overpaid)}
              sub="Excess payment"
              accent="purple"
            />
          </div>

          {/* ── Payment Status Breakdown ─────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">
              Payment Status Breakdown
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatusBadge
                label="Fully Paid"
                count={summary?.statusSummary?.paid || 0}
                total={summary?.totalAccounts || 1}
                color="green"
              />
              <StatusBadge
                label="Part Payment"
                count={summary?.statusSummary?.partPayment || 0}
                total={summary?.totalAccounts || 1}
                color="yellow"
              />
              <StatusBadge
                label="Unpaid"
                count={summary?.statusSummary?.unpaid || 0}
                total={summary?.totalAccounts || 1}
                color="red"
              />
              <StatusBadge
                label="Overpaid"
                count={summary?.statusSummary?.overpaid || 0}
                total={summary?.totalAccounts || 1}
                color="purple"
              />
            </div>

            {/* Visual proportion bar */}
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Account Distribution
              </p>
              <ProportionBar
                segments={[
                  { value: summary?.statusSummary?.paid || 0, color: "#16a34a" },
                  { value: summary?.statusSummary?.partPayment || 0, color: "#ca8a04" },
                  { value: summary?.statusSummary?.unpaid || 0, color: "#dc2626" },
                  { value: summary?.statusSummary?.overpaid || 0, color: "#9333ea" },
                ]}
                total={summary?.totalAccounts || 1}
              />
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                {[
                  { label: "Paid", color: "#16a34a" },
                  { label: "Part", color: "#ca8a04" },
                  { label: "Unpaid", color: "#dc2626" },
                  { label: "Overpaid", color: "#9333ea" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-500 focus:bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

const variantStyles = {
  neutral: {
    wrap: "bg-slate-800 text-white",
    label: "text-slate-300",
    sub: "text-slate-400",
  },
  green: {
    wrap: "bg-green-50 text-green-900",
    label: "text-green-700",
    sub: "text-green-500",
  },
  red: {
    wrap: "bg-red-50 text-red-900",
    label: "text-red-700",
    sub: "text-red-400",
  },
  yellow: {
    wrap: "bg-yellow-50 text-yellow-900",
    label: "text-yellow-700",
    sub: "text-yellow-500",
  },
};

const BigMetric = ({ label, sublabel, value, variant = "neutral" }) => {
  const s = variantStyles[variant];
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${s.wrap}`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${s.label}`}>
        {label}
      </p>
      <p className="mt-1.5 text-xl font-extrabold leading-tight sm:text-2xl">
        {value}
      </p>
      <p className={`mt-1 text-[11px] ${s.sub}`}>{sublabel}</p>
    </div>
  );
};

const accentMap = {
  default: "border-l-slate-400",
  orange: "border-l-orange-400",
  purple: "border-l-purple-400",
  green: "border-l-green-500",
};

const SmallMetric = ({ label, value, sub, accent = "default" }) => (
  <div className={`rounded-xl border border-slate-200 border-l-4 bg-white p-3 shadow-sm ${accentMap[accent]}`}>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-lg font-extrabold text-slate-800">{value}</p>
    <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
  </div>
);

const colorConfig = {
  green:  { bg: "bg-green-50",  text: "text-green-700",  ring: "ring-green-200",  bar: "bg-green-500"  },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200", bar: "bg-yellow-400" },
  red:    { bg: "bg-red-50",    text: "text-red-700",    ring: "ring-red-200",    bar: "bg-red-500"    },
  purple: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200", bar: "bg-purple-500" },
};

const StatusBadge = ({ label, count, total, color }) => {
  const c = colorConfig[color];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={`rounded-xl p-3 ring-1 ${c.bg} ${c.ring}`}>
      <p className={`text-[11px] font-bold uppercase tracking-wide ${c.text}`}>
        {label}
      </p>
      <p className={`mt-1 text-2xl font-extrabold ${c.text}`}>
        {count.toLocaleString()}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`mt-1 text-[11px] font-medium ${c.text} opacity-70`}>
        {pct}% of accounts
      </p>
    </div>
  );
};

const ProportionBar = ({ segments, total }) => {
  if (!total) return null;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={i}
            title={`${Math.round(pct)}%`}
            style={{ width: `${pct}%`, background: seg.color }}
            className="transition-all duration-700"
          />
        );
      })}
    </div>
  );
};

export default FeeCollectionAnalysisPage;