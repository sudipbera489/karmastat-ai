import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkflow } from "../api";

const learnerSteps = [
    ["assessment", "Skill assessment"],
    ["analysis", "AI skill-gap analysis"],
    ["learning-path", "Personalized learning path"],
    ["courses", "Recommended courses"],
    ["course-details", "Course details"],
    ["quiz", "AI quiz"],
    ["results", "Result & progress"],
];

const adminSteps = [
    ["admin-dashboard", "Admin dashboard"],
    ["learners", "Learners"],
    ["skill-analytics", "Skill analytics"],
    ["training", "Training & courses"],
    ["quiz-generator", "AI quiz generator"],
    ["reports", "Reports"],
];

const content = {
    assessment: { eyebrow: "STEP 01 / LEARNER", title: "Tell us what you know.", intro: "Answer a few questions so KarmaStat AI can understand your current capability.", button: "Complete assessment", cards: [{ label: "Your role", value: "Junior Data Analyst" }, { label: "Experience", value: "0–2 years" }, { label: "Interests", value: "Data quality, surveys, policy" }] },
    analysis: { eyebrow: "STEP 02 / AI INSIGHT", title: "Your skill gaps, made clear.", intro: "We compared your role, experience and assessment responses with the competencies needed for your target role.", button: "View my learning path", cards: [{ label: "Strongest skill", value: "Data analysis · 82%" }, { label: "Priority gap", value: "Communication · 41%" }, { label: "Overall readiness", value: "72%" }] },
    "learning-path": { eyebrow: "STEP 03 / YOUR PLAN", title: "A learning path made for you.", intro: "Seven focused actions connect your current skills to the next role you want to grow into.", button: "Explore recommended courses", cards: [{ label: "Week 01", value: "Communicate insights" }, { label: "Week 02", value: "Build data projects" }, { label: "Week 03", value: "Practice with real datasets" }] },
    courses: { eyebrow: "STEP 04 / RECOMMENDATIONS", title: "Courses that close the gap.", intro: "These resources are selected from iGOT Karmayogi and NPTEL for your learning goals.", button: "Open course details", cards: [{ label: "iGOT Karmayogi", value: "Data-driven decision making", meta: "4.6 ★ · 6 hours" }, { label: "NPTEL", value: "Data analytics with Python", meta: "8 weeks · Certificate" }, { label: "KarmaStat sprint", value: "Writing a clear data story", meta: "25 min · AI guided" }] },
    "course-details": { eyebrow: "STEP 05 / COURSE", title: "Data analytics with Python.", intro: "Build practical confidence with a guided course selected for your competency gaps.", button: "Start AI quiz", cards: [{ label: "Provider", value: "NPTEL" }, { label: "Duration", value: "8 weeks · 24 hours" }, { label: "Why this course", value: "Improves Python fundamentals" }] },
    quiz: { eyebrow: "STEP 06 / PRACTICE", title: "Show what you learned.", intro: "Take a short AI-generated quiz based on your role and the course you completed.", button: "Submit quiz", cards: [{ label: "Questions", value: "10 questions" }, { label: "Time", value: "15 minutes" }, { label: "Focus", value: "Data interpretation" }] },
    results: { eyebrow: "STEP 07 / PROGRESS", title: "Your progress is taking shape.", intro: "You have strengthened the skills that matter for your next opportunity in official statistics.", button: "Return to dashboard", cards: [{ label: "Quiz score", value: "8 / 10" }, { label: "Skill improvement", value: "+12% data interpretation" }, { label: "Next recommendation", value: "Practice communication" }] },
    "admin-dashboard": { eyebrow: "ADMIN / OVERVIEW", title: "Capability at a glance.", intro: "See where your teams are growing and where focused interventions can make the biggest difference.", button: "View learners", cards: [{ label: "Active learners", value: "248" }, { label: "Average readiness", value: "68%" }, { label: "Courses in progress", value: "114" }] },
    learners: { eyebrow: "ADMIN / PEOPLE", title: "Know your learners.", intro: "Review learner progress and find the people who need a little more support.", button: "Open skill analytics", cards: [{ label: "On track", value: "184 learners" }, { label: "Need attention", value: "38 learners" }, { label: "Completed this month", value: "26 learners" }] },
    "skill-analytics": { eyebrow: "ADMIN / INSIGHT", title: "See the skill gaps.", intro: "Turn assessment responses into a clear view of capability across your organization.", button: "Explore training", cards: [{ label: "Largest gap", value: "Data storytelling" }, { label: "Strongest area", value: "Survey methods" }, { label: "Teams analyzed", value: "12 departments" }] },
    training: { eyebrow: "ADMIN / RESOURCES", title: "Make learning relevant.", intro: "Curate and track iGOT Karmayogi, NPTEL and internal training resources for your teams.", button: "Create an AI quiz", cards: [{ label: "Published courses", value: "34" }, { label: "In review", value: "8 resources" }, { label: "Most popular", value: "Data quality basics" }] },
    "quiz-generator": { eyebrow: "ADMIN / ASSESSMENT", title: "Generate better practice.", intro: "Create role-specific quizzes from a course, a competency or a real work scenario.", button: "View reports", cards: [{ label: "Question bank", value: "426 questions" }, { label: "Draft quizzes", value: "6 ready to review" }, { label: "Last generated", value: "Survey design · Today" }] },
    reports: { eyebrow: "ADMIN / REPORTING", title: "Progress you can act on.", intro: "Export a clear picture of learning activity, competency movement and training outcomes.", button: "Back to admin dashboard", cards: [{ label: "Monthly completion", value: "74%" }, { label: "Skills improved", value: "18 competencies" }, { label: "Report status", value: "Ready to share" }] },
};

function WorkflowPage() {
    const navigate = useNavigate();
    const { section = "assessment" } = useParams();
    const isAdmin = section.startsWith("admin") || ["learners", "skill-analytics", "training", "quiz-generator", "reports"].includes(section);
    const steps = isAdmin ? adminSteps : learnerSteps;
    const current = content[section] || content.assessment;
    const [notice, setNotice] = useState("");
    const [apiConnected, setApiConnected] = useState(false);
    const index = Math.max(0, steps.findIndex(([key]) => key === section));
    const next = steps[index + 1]?.[0];

    useEffect(() => {
        getWorkflow(isAdmin ? "admin" : "learner", section)
            .then(() => setApiConnected(true))
            .catch((error) => {
                setApiConnected(false);
                if (error.status === 401) navigate("/");
            });
    }, [isAdmin, navigate, section]);

    function goNext() {
        if (next) {
            navigate(isAdmin ? `/admin/${next}` : `/learner/${next}`);
        } else {
            navigate(isAdmin ? "/admin/admin-dashboard" : "/learner-dashboard");
        }
    }

    function openSection(key) {
        navigate(isAdmin ? `/admin/${key}` : `/learner/${key}`);
    }

    return (
        <main className="workflow-shell">
            <header className="workflow-header">
                <button className="workflow-brand" onClick={() => navigate(isAdmin ? "/admin/admin-dashboard" : "/learner-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="workflow-context"><span className="workflow-status"></span>{isAdmin ? "Administrator workspace" : "Arjun Sharma · Learner workspace"}<button onClick={() => navigate("/role")}>Switch role</button></div>
            </header>
            <div className="workflow-layout">
                <aside className="workflow-sidebar">
                    <p className="workflow-label">{isAdmin ? "ADMIN WORKFLOW" : "LEARNER WORKFLOW"}</p>
                    <nav>
                        {steps.map(([key, label], stepIndex) => <button className={key === section ? "workflow-step active" : `workflow-step ${stepIndex < index ? "complete" : ""}`} key={key} onClick={() => openSection(key)}><span>{stepIndex < index ? "✓" : String(stepIndex + 1).padStart(2, "0")}</span>{label}<b>{key === section ? "" : "›"}</b></button>)}
                    </nav>
                    <div className="workflow-note"><span>✦</span><p><strong>AI guide</strong><br />Your recommendations update as you learn.</p></div>
                </aside>
                <section className="workflow-main">
                    <div className="workflow-breadcrumb">{isAdmin ? "Administrator" : "Learner"} <span>/</span> {current.eyebrow.split(" / ")[1]}</div>
                    <div className="workflow-heading"><div><p className="eyebrow">{current.eyebrow}</p><h1>{current.title}</h1><p>{current.intro}</p></div><div className="workflow-progress"><strong>{String(index + 1).padStart(2, "0")}</strong><span>/ {String(steps.length).padStart(2, "0")}</span><small>step</small></div></div>
                    <div className="workflow-cards">{current.cards.map((card) => <div className="workflow-card" key={card.label}><span>{card.label}</span><strong>{card.value}</strong>{card.meta && <small>{card.meta}</small>}</div>)}</div>
                    <div className="workflow-action"><div><span className="action-mark">✦</span><p><strong>{isAdmin ? "One clear view." : "One step at a time."}</strong><br />{isAdmin ? "Use data to guide the next training decision." : "KarmaStat AI keeps your learning path focused and practical."}</p></div><button onClick={goNext}>{current.button} <b>→</b></button></div>
                    {notice && <p className="workflow-notice">{notice}</p>}
                    <div className="workflow-footnote"><span>{apiConnected ? "Connected to KarmaStat AI services" : "Powered by personalized competency intelligence"}</span><button onClick={() => setNotice("Your feedback has been noted. Thank you.")}>Give feedback</button></div>
                </section>
            </div>
        </main>
    );
}

export default WorkflowPage;
