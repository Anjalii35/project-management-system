import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Landing from "./pages/Landing";
import { isLoggedIn } from "./services/authService";

// Protects routes — if not logged in, redirect to /landing
const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/landing" />;
};

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>

        {/* Public route */}
        <Route path="/landing" element={<Landing />} />

        {/* Protected routes — need to be logged in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/landing" />} />

      </Routes>
    </>
  );
};

export default App;