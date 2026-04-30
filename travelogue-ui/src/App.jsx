import { useState, useRef,useEffect } from "react";
import JoinPage from "./pages/JoinPage";
import "./Tokens.css";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard           from "./pages/Dashboard";
import NotebookPage        from "./pages/NotebookPage";
import Navbar              from "./components/Navbar";
import AuthModal           from "./components/AuthModal";
import CheckoutModal       from "./components/CheckoutModal";
import DemoModal           from "./components/DemoModal";
import HeroSection         from "./components/HeroSection";
import ProblemSection      from "./components/ProblemSection";
import FeaturesGrid        from "./components/FeaturesGrid";
import TestimonialsSection from "./components/TestimonialsSection";
import WhoSection          from "./components/WhoSection";
import PricingSection      from "./components/PricingSection";
import FAQSection          from "./components/FAQSection";
import AboutSection        from "./components/AboutSection";
import Notebookpreview     from "./components/Notebookpreview";
import HowItWorks          from "./components/HowitWorks";
import Privacy             from "./components/Privacy";
import Comparison          from "./components/Comparison";
import { CTABanner, Footer } from "./components/CTAAndFooter";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  const [modal,    setModal]    = useState(null);    // "login" | "signup" | null
  const [checkout, setCheckout] = useState(false);   // CheckoutModal open
  const [annual,   setAnnual]   = useState(false);   // passed from PricingSection toggle
  const [demo,     setDemo]     = useState(false);   // DemoModal open
  const { user } = useAuth();
  useScrollReveal();

  function handlePricingModal(type, isAnnual = false) {
    if (type === "checkout") {
      setAnnual(isAnnual);
      setCheckout(true);
    } else {
      setModal(type);
    }
  }

  return (
    <Routes>

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/notebook/:id" element={
        <PrivateRoute>
          <NotebookPage />
        </PrivateRoute>
      } />

      <Route path="/" element={
        <>
          <Navbar onOpenModal={setModal} />
          <main>
            <HeroSection         onOpenModal={setModal} />
            <AboutSection />
            <ProblemSection />
            <FeaturesGrid />
            <TestimonialsSection />
            <WhoSection />
            <Comparison />
            <Privacy />
            <Notebookpreview />
            <PricingSection
              onOpenModal={handlePricingModal}
              onOpenDemo={() => setDemo(true)}
            />
            <HowItWorks />
            <FAQSection />
            <CTABanner onOpenModal={setModal} />
          </main>
          <Footer />

          <AuthModal
            mode={user ? null : modal}
            onClose={() => setModal(null)}
          />

          <CheckoutModal
            open={checkout}
            annual={annual}
            onClose={() => setCheckout(false)}
          />

          <DemoModal
            open={demo}
            onClose={() => setDemo(false)}
          />
        </>
      } />

    </Routes>
  );
}
