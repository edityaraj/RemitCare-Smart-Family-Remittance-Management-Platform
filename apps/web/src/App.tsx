import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Feedback from "@/pages/Feedback";

import SenderDashboard from "@/pages/SenderDashboard";
import Receivers from "@/pages/Receivers";
import PlanNew from "@/pages/PlanNew";
import PlanDetail from "@/pages/PlanDetail";
import ReceiverDashboard from "@/pages/ReceiverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<Feedback />} />

          <Route element={<ProtectedRoute allow={["sender"]} />}>
            <Route path="/sender/dashboard" element={<SenderDashboard />} />
            <Route path="/sender/receivers" element={<Receivers />} />
            <Route path="/sender/plans/new" element={<PlanNew />} />
          </Route>

          <Route element={<ProtectedRoute allow={["receiver"]} />}>
            <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allow={["sender", "receiver"]} />}>
            <Route path="/plans/:id" element={<PlanDetail />} />
          </Route>

          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
    </div>
  );
}
