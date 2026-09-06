import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../api";

const stages = [
    { number: "01", title: "Assess", description: "Collect learner assessments", route: "/admin/learners", status: "Live", tone: "green" },
    { number: "02", title: "Identify gaps", description: "Find competency gaps", route: "/admin/skill-analytics", status: "12 gaps", tone: "blue" },
    { number: "03", title: "Recommend", description: "Match training to need", route: "/admin/training", status: "34 courses", tone: "gold" },
    { number: "04", title: "Learn", description: "Track learning activity", route: "/admin/training", status: "114 active", tone: "coral" },
    { number: "05", title: "Test", description: "Create role-based quizzes", route: "/admin/quiz-generator", status: "426 questions", tone: "violet" },
    { number: "06", title: "Measure", description: "Report improvement", route: "/admin/reports", status: "+18% this month", tone: "mint" },
];

const attentionRows = [
    { initials: "RM", name: "Riya Mehta", role: "Survey Analyst", gap: "Data storytelling", progress: 42, color: "#e9c1a1" },
    { initials: "VK", name: "Vivek Kumar", role: "Field Supervisor", gap: "Data quality", progress: 57, color: "#b8d6ce" },
    { initials: "NS", name: "Neha Singh", role: "Junior Statistician", gap: "Python basics", progress: 64, color: "#d4c3e7" },
];

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeStage, setActiveStage] = useState(1);
    const [dashboard, setDashboard] = useState(null);
    const stage = stages[activeStage];

    useEffect(() => {
        getAdminDashboard()
            .then(setDashboard)
            .catch((error) => {
                if (error.status === 401) navigate("/");
            });
    }, [navigate]);

    return (
        <main className="admin-shell">
            <header className="admin-header">
                <button className="workflow-brand" onClick={() => navigate("/admin-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="admin-header-right"><span className="admin-status"><i></i> System overview</span><div className="admin-avatar">AS</div><button className="admin-switch" onClick={() => navigate("/role")}>Switch role</button></div>
            </header>
            <div className="admin-body">
                <aside className="admin-sidebar">
                    <p className="workflow-label">ADMIN WORKSPACE</p>
                    <nav>
                        <button className="admin-nav active"><span>◈</span> Overview</button>
                        <button className="admin-nav" onClick={() => navigate("/admin/learners")}><span>◌</span> Learners <b>248</b></button>
                        <button className="admin-nav" onClick={() => navigate("/admin/skill-analytics")}><span>⌁</span> Skill analytics</button>
                        <button className="admin-nav" onClick={() => navigate("/admin/training")}><span>▤</span> Training &amp; courses</button>
                        <button className="admin-nav" onClick={() => navigate("/admin/quiz-generator")}><span>◇</span> AI quiz generator</button>
                        <button className="admin-nav" onClick={() => navigate("/admin/reports")}><span>↗</span> Reports</button>
                    </nav>
                    <div className="admin-sidebar-footer"><span>✦</span><p><strong>KarmaStat AI</strong><br />Capability intelligence<br />for official statistics.</p></div>
                </aside>
                <section className="admin-content">
                    <div className="admin-welcome"><div><p className="eyebrow">MONDAY, 14 SEPTEMBER 2026 / ADMINISTRATOR</p><h1>Make capability<br /><i>visible.</i></h1><p>Move from assessment to measurable improvement with one clear view of your people, skills and training.</p></div><button className="admin-primary" onClick={() => navigate("/admin/reports")}>View latest report <span>↗</span></button></div>
                    <div className="admin-metrics"><div><span>ACTIVE LEARNERS</span><strong>{dashboard?.activeLearners || 248}</strong><small><b>+12%</b> from last month</small></div><div><span>AVERAGE READINESS</span><strong>{dashboard?.readiness || 68}%</strong><small><b>+8%</b> competency movement</small></div><div><span>TRAINING COMPLETION</span><strong>{dashboard?.completion || 74}%</strong><small><b>+6%</b> this reporting period</small></div><div><span>NEEDS ATTENTION</span><strong>{dashboard?.needsAttention || 38}</strong><small>learners to support</small></div></div>
                    <section className="admin-process"><div className="admin-section-heading"><div><p className="eyebrow">THE CAPABILITY CYCLE</p><h2>From assessment to improvement</h2></div><span>6 connected stages</span></div><div className="stage-track">{stages.map((item, index) => <button className={`admin-stage ${activeStage === index ? "selected" : ""}`} key={item.number} onClick={() => setActiveStage(index)}><span className={`stage-icon ${item.tone}`}>{item.number}</span><strong>{item.title}</strong><small>{item.description}</small><em>{item.status}</em>{index < stages.length - 1 && <i className="stage-connector">→</i>}</button>)}</div><div className="stage-detail"><div><span className="stage-detail-number">{stage.number}</span><div><p className="eyebrow">CURRENT STAGE</p><h3>{stage.title}: {stage.description}</h3><p>Keep this stage moving so every learner receives the right support at the right time.</p></div></div><button onClick={() => navigate(stage.route)}>Open {stage.title.toLowerCase()} <b>→</b></button></div></section>
                    <div className="admin-lower-grid"><section className="admin-table-panel"><div className="admin-section-heading"><div><p className="eyebrow">PRIORITY SUPPORT</p><h2>Learners needing attention</h2></div><button className="admin-text-button" onClick={() => navigate("/admin/learners")}>View all →</button></div><div className="learner-table"><div className="table-head"><span>LEARNER</span><span>PRIORITY GAP</span><span>READINESS</span></div>{attentionRows.map((learner) => <button className="learner-row" key={learner.name} onClick={() => navigate("/admin/learners")}><span className="learner-person"><i style={{ background: learner.color }}>{learner.initials}</i><span><strong>{learner.name}</strong><small>{learner.role}</small></span></span><span className="learner-gap">{learner.gap}</span><span className="learner-progress"><i><b style={{ width: `${learner.progress}%` }}></b></i><strong>{learner.progress}%</strong></span><b className="row-arrow">›</b></button>)}</div></section><section className="admin-quick-panel"><p className="eyebrow">QUICK ACTION</p><h2>What would you like to do?</h2><button onClick={() => navigate("/admin/skill-analytics")}><span>⌁</span><strong>Explore skill gaps</strong><b>→</b></button><button onClick={() => navigate("/admin/quiz-generator")}><span>◇</span><strong>Generate an AI quiz</strong><b>→</b></button><button onClick={() => navigate("/admin/training")}><span>▤</span><strong>Add training resource</strong><b>→</b></button></section></div>
                    <footer className="admin-footer"><span>Official statistics, made stronger by people.</span><span>Last synced 8 minutes ago · <b>All systems operational</b></span></footer>
                </section>
            </div>
        </main>
    );
}

export default AdminDashboard;
