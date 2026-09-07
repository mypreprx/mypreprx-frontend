import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Activity, CheckSquare, HelpCircle, 
  Target, Clock, Zap, Award, 
  TrendingUp, AlertTriangle, BookOpen, 
  BarChart2, AlertCircle, ChevronDown,
  BrainCircuit, Layers, Filter, Eye, Check
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, AreaChart, Area
} from 'recharts';
import './AdminAnalytics.css';
import useAnalyticsStore from '../../../store/analyticsStore';

// Streak Palette for Light Theme
const STREAK_COLORS = ['#CBD5E1', '#94A3B8', '#B58A28', '#8C6B1B', '#5B450F'];

const KPI_ICONS = {
  totalStudents: Users,
  activeStudents: Activity,
  quizzesCompleted: CheckSquare,
  questionsAnswered: HelpCircle,
  averageAccuracy: Target,
  avgStudyTime: Clock,
  activeStreaks: Zap,
  avgQuizScore: Award,
};

// Custom Tooltip for Light Dashboard Theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-item">
            <span className="tooltip-indicator" style={{ backgroundColor: entry.color || '#B58A28' }} />
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-val">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Academic Year 2026'];

const DateRangeDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="date-dropdown" ref={ref}>
      <button
        type="button"
        className="date-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Filter size={16} className="gold-icon" />
        <span className="date-dropdown-label">{value}</span>
        <ChevronDown size={14} className={`date-dropdown-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <ul className="date-dropdown-menu" role="listbox">
          {DATE_RANGES.map((r) => (
            <li
              key={r}
              role="option"
              aria-selected={r === value}
              className={`date-dropdown-item ${r === value ? 'selected' : ''}`}
              onClick={() => { onChange(r); setOpen(false); }}
            >
              <span>{r}</span>
              {r === value && <Check size={14} className="date-dropdown-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [popularityMetric, setPopularityMetric] = useState('attempts');
  const [selectedVizTopic, setSelectedVizTopic] = useState('All Topics');

  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  const a = analytics || {};
  const kpis = a.kpis || [];
  const studentActivityData = a.studentActivity || [];
  const performanceTrendData = a.performanceTrend || [];
  const streakDistributionData = a.streakDistribution || [];
  const popularTopicsData = a.popularTopics || [];
  const performanceByTopicData = a.performanceByTopic || [];
  const difficultTopics = a.difficultTopics || [];
  const riskStudents = a.riskStudents || [];
  const featureUsageData = a.featureUsage || [];
  const visualizationTopics = a.visualizationRoom?.topics || [];
  const qualityAlerts = a.qualityAlerts || [];
  const quizAnalytics = a.quizAnalytics || {};

  const buildKpi = (kpi) => ({
    id: kpi.key,
    title: kpi.title,
    value: kpi.value,
    change: kpi.change === null || kpi.change === undefined ? null : `${kpi.change > 0 ? '+' : ''}${kpi.change}%`,
    isPositive: kpi.isPositive,
    icon: KPI_ICONS[kpi.key] || Users,
    subtitle: kpi.subtitle,
  });

  return (
    <div className="analytics-container">
      {/* Header Bar */}
      <header className="analytics-header">
        <div className="header-branding">
          <h1 className="header-title">Analytics & Learning Outcomes</h1>
          <p className="header-subtitle">
            Track adoption, student engagement, learning gaps, and AI item bank quality.
          </p>
        </div>

        <div className="header-controls">
          <DateRangeDropdown value={dateRange} onChange={setDateRange} />
        </div>
      </header>

      {error && (
        <div className="status-badge warning" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isLoading && !analytics && (
        <div className="kpi-subtitle" style={{ marginBottom: '1rem' }}>Loading analytics…</div>
      )}

      {/* Row 1: KPI Cards */}
      <section className="kpi-grid">
        {kpis.length === 0 ? (
          <div className="kpi-subtitle">No analytics data available.</div>
        ) : (
          kpis.map((kpi) => {
            const k = buildKpi(kpi);
            return (
              <div key={k.id} className="card kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">{k.title}</span>
                  <div className="icon-badge">
                    <k.icon size={18} className="gold-icon" />
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-value-row">
                    <h2 className="kpi-value">{k.value}</h2>
                    {k.change !== null && (
                      <span className={`kpi-change ${k.isPositive ? 'positive' : 'negative'}`}>
                        {k.change}
                      </span>
                    )}
                  </div>
                  <p className="kpi-subtitle">{k.subtitle}</p>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Row 2: Student Activity Trend, Performance Trend, Streak Overview */}
      <section className="row-grid row-3-cols">
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Student Activity Trend</h3>
              <p className="card-subtext">Active students & quizzes completed over time</p>
            </div>
            <TrendingUp size={18} className="gold-icon" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={studentActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                <Line type="monotone" dataKey="activeStudents" name="Active Students" stroke="#B58A28" strokeWidth={2.5} dot={{ fill: '#B58A28', r: 4 }} />
                <Line type="monotone" dataKey="quizzes" name="Quizzes Completed" stroke="#64748B" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#64748B', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Performance Trend</h3>
              <p className="card-subtext">Average question accuracy trajectory (%)</p>
            </div>
            <BarChart2 size={18} className="gold-icon" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B58A28" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#B58A28" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="accuracy" name="Avg Accuracy %" stroke="#B58A28" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Streak Distribution</h3>
              <p className="card-subtext">Student cohort habit formation breakdown</p>
            </div>
            <Zap size={18} className="gold-icon" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={streakDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {streakDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STREAK_COLORS[index % STREAK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 3: Most Popular Topics, Performance by Topic, Difficult Topics, Feature Usage */}
      <section className="row-grid row-4-cols">
        <div className="card chart-card">
          <div className="card-header align-start">
            <div>
              <h3>Most Popular Topics</h3>
              <p className="card-subtext">Ranked learning engagement</p>
            </div>
            <div className="metric-toggle">
              <button 
                className={popularityMetric === 'attempts' ? 'active' : ''} 
                onClick={() => setPopularityMetric('attempts')}
              >
                Attempts
              </button>
              <button 
                className={popularityMetric === 'students' ? 'active' : ''} 
                onClick={() => setPopularityMetric('students')}
              >
                Users
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={popularTopicsData} margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis type="category" dataKey="topic" stroke="#475569" fontSize={11} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={popularityMetric} name={popularityMetric === 'attempts' ? 'Quiz Attempts' : 'Unique Students'} fill="#B58A28" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Performance by Topic</h3>
              <p className="card-subtext">Average accuracy by subject (%)</p>
            </div>
            <Target size={18} className="gold-icon" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={performanceByTopicData} margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <XAxis type="number" stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <YAxis type="category" dataKey="topic" stroke="#475569" fontSize={11} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#8C6B1B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card list-card">
          <div className="card-header">
            <div>
              <h3>Most Difficult Topics</h3>
              <p className="card-subtext">High priority learning gaps</p>
            </div>
            <AlertCircle size={18} className="danger-icon" />
          </div>
          <div className="list-content">
            {difficultTopics.length === 0 ? (
              <p className="kpi-subtitle">No critical learning gaps detected.</p>
            ) : (
              difficultTopics.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-header">
                    <span className="item-title">{item.topic}</span>
                    <span className={`badge ${item.badge}`}>{item.category}</span>
                  </div>
                  <div className="list-item-sub">
                    <span>Attempts: {item.attempts}</span>
                    <span className="danger-text">Accuracy: {item.accuracy}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill danger-fill" style={{ width: `${item.fill}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Feature Usage</h3>
              <p className="card-subtext">Modality engagement counts</p>
            </div>
            <Layers size={18} className="gold-icon" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={featureUsageData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="feature" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Interactions" fill="#B58A28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 4: Visualization Room, Quiz Analytics, Students Requiring Attention */}
      <section className="row-grid row-3-cols-asym">
         {/* Visualization Room - Drilldown */}
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Visualization Room</h3>
              <p className="card-subtext">Interactive Topic performance matrix (attempts vs accuracy)</p>
            </div>
            <div className="subject-filter">
              <label>Topic:</label>
              <select value={selectedVizTopic} onChange={(e) => setSelectedVizTopic(e.target.value)}>
                <option>All Topics</option>
                {visualizationTopics.map((t) => (
                  <option key={t.topic} value={t.topic}>{t.topic}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={selectedVizTopic === 'All Topics' ? visualizationTopics : visualizationTopics.filter((t) => t.topic === selectedVizTopic)}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="topic" stroke="#64748B" fontSize={11} />
                <YAxis yAxisId="left" orientation="left" stroke="#B58A28" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="attempts" name="Topic Attempts" fill="#B58A28" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
       
        {/* Quiz Analytics Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Quiz Analytics</h3>
              <p className="card-subtext">Core quiz funnel metrics</p>
            </div>
            <BookOpen size={18} className="gold-icon" />
          </div>
          <div className="stats-list">
            <div className="stat-row">
              <span>Quizzes Generated</span> 
              <strong>{quizAnalytics.generated != null ? Number(quizAnalytics.generated).toLocaleString() : "—"}</strong>
            </div>
            <div className="stat-row">
              <span>Quizzes Started</span> 
              <strong>{quizAnalytics.started != null ? Number(quizAnalytics.started).toLocaleString() : "—"}</strong>
            </div>
            <div className="stat-row">
              <span>Quizzes Completed</span> 
              <strong>{quizAnalytics.completed != null ? Number(quizAnalytics.completed).toLocaleString() : "—"}</strong>
            </div>
            <div className="stat-row">
              <span>Quiz Completion Rate</span> 
              <strong className="gold-text">{quizAnalytics.completionRate != null ? `${quizAnalytics.completionRate}%` : "—"}</strong>
            </div>
            <div className="stat-row">
              <span>Average Quiz Score</span> 
              <strong>{quizAnalytics.avgScore != null ? `${quizAnalytics.avgScore} / 100` : "—"}</strong>
            </div>
            <div className="stat-row">
              <span>Average Quiz Duration</span> 
              <strong>
                {quizAnalytics.avgDurationSeconds != null
                  ? `${Math.floor(quizAnalytics.avgDurationSeconds / 60)}m ${quizAnalytics.avgDurationSeconds % 60}s`
                  : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Students Requiring Attention */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Students Needing Attention</h3>
              <p className="card-subtext">Drop-off risk & declining accuracy</p>
            </div>
            <AlertTriangle size={18} className="warning-icon" />
          </div>
          <div className="attention-list">
            {riskStudents.length === 0 ? (
              <p className="kpi-subtitle">No at-risk students identified.</p>
            ) : (
              riskStudents.map((student, idx) => (
                <div key={idx} className="attention-card">
                  <div className="attention-header">
                    <span className="student-name">{student.name}</span>
                    <span className="risk-tag">{student.dropoffRisk}</span>
                  </div>
                  <div className="attention-details">
                    <span>Accuracy: <strong className="danger-text">{student.accuracy}</strong></span>
                    <span>Streak Lost: <strong>{student.streakLost}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Row 5: AI Question Quality Alerts */}
      <section className="row-grid row-1-col">
        <div className="card table-card">
          <div className="card-header border-bottom">
            <div className="header-with-icon">
              <BrainCircuit size={20} className="gold-icon" />
              <div>
                <h3>AI Question Quality Alerts</h3>
                <p className="card-subtext">System flags and student reports requiring administrator review</p>
              </div>
            </div>
          </div>
          <div className="table-container">
            {qualityAlerts.length === 0 ? (
              <p className="kpi-subtitle" style={{ padding: '1.5rem' }}>
                No question quality alerts. Flagged questions will appear here for review.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question ID</th>
                    <th>Subject Topic</th>
                    <th>Issue Detected</th>
                    <th>Root Cause Trigger</th>
                    <th>Flag Count</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityAlerts.map((alert, index) => (
                    <tr key={index}>
                      <td className="mono-text">{alert.id}</td>
                      <td className="font-medium">{alert.subject}</td>
                      <td>{alert.issue}</td>
                      <td className="text-muted">{alert.trigger}</td>
                      <td>
                        <span className="flag-count">{alert.flags} flags</span>
                      </td>
                      <td>
                        <span className={`status-badge ${alert.status === 'Critical Fix' ? 'critical' : 'warning'}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td>
                        <button className="text-button flex-align">
                          <Eye size={14} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
