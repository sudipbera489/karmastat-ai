import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import ResumeGuide from "./pages/ResumeGuide";
import WorkflowPage from "./pages/WorkflowPage";
import AssessmentPage from "./pages/AssessmentPage";
import AdminDashboard from "./pages/AdminDashboard";
import SkillAnalysis from "./pages/SkillAnalysis";
import LearningPath from "./pages/LearningPath";
import QuizGenerator from "./pages/QuizGenerator";
import RequireAuth from "./components/RequireAuth";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/role"
                    element={<RequireAuth><RoleSelection /></RequireAuth>}
                />

                <Route
                    path="/learner-dashboard"
                    element={<RequireAuth><ResumeGuide /></RequireAuth>}
                />

                <Route
                    path="/admin-dashboard"
                    element={<RequireAuth><AdminDashboard /></RequireAuth>}
                />

                <Route path="/learner/assessment" element={<RequireAuth><AssessmentPage /></RequireAuth>} />
                <Route path="/learner/analysis" element={<RequireAuth><SkillAnalysis /></RequireAuth>} />
                <Route path="/learner/learning-path" element={<RequireAuth><LearningPath /></RequireAuth>} />
                <Route path="/learner/quiz" element={<RequireAuth><QuizGenerator /></RequireAuth>} />
                <Route path="/learner/:section" element={<RequireAuth><WorkflowPage /></RequireAuth>} />
                <Route path="/admin/:section" element={<RequireAuth><WorkflowPage /></RequireAuth>} />

            </Routes>

        </BrowserRouter>

    );
}

export default App;