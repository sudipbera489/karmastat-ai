import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearnerDashboard } from "../api";

function ResumeGuide() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const profile = dashboard?.profile;
    const hasAnalysis = Boolean(dashboard?.hasResume || dashboard?.enteredSkills?.length || dashboard?.skills?.length);

    useEffect(() => {
        getLearnerDashboard()
            .then(setDashboard)
            .catch((error) => {
                if (error.status === 401) navigate("/");
            });
    }, [navigate]);

    const skillGaps = (dashboard?.recommendations || []).slice(0, 3);
    const logout = () => { sessionStorage.removeItem("karmastatUser"); navigate("/"); };

    return (
        <div className="learner-dashboard">
            <aside className="learner-sidebar">
                <div className="learner-brand">KarmaStat <span>AI</span></div>
                <p className="learner-portal-label">Learner Portal</p>
                <nav className="learner-nav" aria-label="Learner navigation">
                    <button className="active" onClick={() => navigate("/learner-dashboard")}>⌂ <span>Dashboard</span></button>
                    <button onClick={() => navigate("/learner/assessment")}>◫ <span>Assessment</span></button>
                    <button onClick={() => navigate("/learner/analysis")}>◉ <span>Skill Gap</span></button>
                    <button onClick={() => navigate("/learner/learning-path")}>◎ <span>Learning Path</span></button>
                    <button onClick={() => navigate("/learner/courses")}>▤ <span>My Courses</span></button>
                    <button onClick={() => navigate("/learner/quiz")}>◇ <span>AI Quiz</span></button>
                    <button onClick={() => navigate("/learner/results")}>↗ <span>Progress</span></button>
                    <button onClick={() => navigate("/learner/assistant")}>✦ <span>AI Assistant</span></button>
                </nav>
                <button className="learner-logout" onClick={logout}>↪ <span>Logout</span></button>
            </aside>

            <main className="learner-main">
                <header className="learner-header">
                    <div><p className="eyebrow">LEARNER PORTAL</p><h1>Good morning, {profile?.name || "Learner"} <span>👋</span></h1><p>Welcome back to your personalized learning journey.</p></div>
                    <button className="learner-profile-circle" onClick={() => navigate("/learner/assessment")}>{profile?.initials || "U"}</button>
                </header>

                <section className="learner-stats">
                    <div><span>🎯</span><div><strong>{dashboard?.readiness ?? 0}%</strong><small>Overall Competency</small></div></div>
                    <div><span>🧠</span><div><strong>{skillGaps.length}</strong><small>Skill Gaps</small></div></div>
                    <div><span>📚</span><div><strong>{dashboard?.recommendations?.length || 0}</strong><small>Courses Recommended</small></div></div>
                    <div><span>🏆</span><div><strong>{hasAnalysis ? `${dashboard.readiness}%` : "0%"}</strong><small>Learning Progress</small></div></div>
                </section>

                <section className="learner-dashboard-grid">
                    <section className="learner-card" onClick={() => navigate("/learner/analysis")}>
                        <div className="learner-card-heading"><div><h2>Skill Gap Analysis</h2><p>Your current competency compared with the required level.</p></div><span>🧠</span></div>
                        {hasAnalysis ? skillGaps.map((item, index) => <div className="learner-skill" key={item.skill}><div><span>{item.skill}</span><b>{Math.max(20, 100 - index * 18)}%</b></div><i><em style={{ width: `${Math.max(20, 100 - index * 18)}%` }}></em></i></div>) : <div className="learner-empty"><strong>No analysis yet</strong><p>Complete your assessment to see your skill gaps.</p></div>}
                        <button className="learner-card-button" onClick={() => navigate(hasAnalysis ? "/learner/analysis" : "/learner/assessment")}>{hasAnalysis ? "View Detailed Analysis" : "Start Assessment"} →</button>
                    </section>

                    <section className="learner-card">
                        <div className="learner-card-heading"><div><h2>Recommended Learning</h2><p>Courses selected based on your skill gaps.</p></div><span>🎯</span></div>
                        {hasAnalysis ? dashboard.recommendations.slice(0, 3).map((item) => <a className="learner-course-mini" href={item.url} target="_blank" rel="noreferrer" key={item.title}><div><strong>{item.title}</strong><small>{item.skill} / Video lesson</small></div><span>Watch</span></a>) : <div className="learner-empty"><strong>Your recommendations will appear here</strong><p>Add your skills and resume to build your learning path.</p></div>}
                        <button className="learner-card-button" onClick={() => navigate(hasAnalysis ? "/learner/learning-path" : "/learner/assessment")}>{hasAnalysis ? "View Learning Path" : "Add Profile Details"} →</button>
                    </section>
                </section>

                <section className="learner-quiz-banner"><div><h2>🤖 Test Your Knowledge</h2><p>Take an AI-generated quiz based on your learning materials.</p></div><button onClick={() => navigate("/learner/quiz")}>Start AI Quiz →</button></section>
            </main>
        </div>
    );
}

export default ResumeGuide;
