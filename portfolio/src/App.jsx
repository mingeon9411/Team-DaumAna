import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import CaseStudiesList from "./pages/CaseStudiesList.jsx";
import CaseStudyDetail from "./pages/CaseStudyDetail.jsx";
import WorkLogs from "./pages/WorkLogs.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/case-studies" element={<CaseStudiesList />} />
          <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
