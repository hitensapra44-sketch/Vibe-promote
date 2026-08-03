import React, { useState, useEffect } from 'react';
import { logEvent } from "../lib/analytics";

import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/landing/navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/problemsection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/howitworks';
import BenefitsTable from '../components/landing/BenefitsTable';
import Testimonials from '../components/landing/testimnonials';
import FAQSection from '../components/landing/faqs';
import CTASection from '../components/landing/CTAsection';
import FooterSection from '../components/landing/fottersection';

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;

  const blocked = ["test@", "fake@", "abc@", "123@", "temp@"];
  if (blocked.some(word => email.toLowerCase().includes(word))) {
    return false;
  }

  return true;
};

const commonTypos = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "yaho.com": "yahoo.com",
};

const fixEmailTypos = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return email;

  const [name, domain] = parts;

  if (commonTypos[domain]) {
    return `${name}@${commonTypos[domain]}`;
  }

  return email;
};

const disposableDomains = [
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com"
];

const isDisposable = (email) => {
  const domain = email.split("@")[1];
  return disposableDomains.includes(domain);
};

export default function Home() {
  const [joined, setJoined] = useState(() => localStorage.getItem('joined_waitlist') === 'true');
  const [searchParams] = useSearchParams();
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (searchParams.get("paid") === "true") {
      setShowPopup(true);
    }
  }, [searchParams]);

   const handlePaymentSubmit = async (e) => {
     e.preventDefault();
     if (!email) return;

     await supabase.from("user_payments").insert({
       email: email,
       payment_status: true
     });

     setShowPopup(false);
     window.history.replaceState({}, "", "/");
     localStorage.setItem('pre_purchase_email_confirmed', 'true');
   };

  const onValidateEmail = (email) => {
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return null;
    }

    if (isDisposable(email)) {
      alert("Please use a real email address");
      return null;
    }

    return fixEmailTypos(email);
  };

  // @ts-ignore
  const handleJoined = () => {
    setJoined(true);
    localStorage.setItem('joined_waitlist', 'true');
    logEvent("waitlist", "signup", "email submitted");
  };

  return (
    <div className="font-poppins bg-transparent">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-bg-surface p-8 rounded-lg max-w-sm w-full mx-4 shadow-xl border border-border-muted">
            <h2 className="text-white text-lg font-bold mb-4 text-center">Confirm you paid by wiritng the your gmail</h2>
            <form onSubmit={handlePaymentSubmit}>
              <input
                type="email"
                required
                className="w-full px-4 py-2 mb-4 bg-bg-elevated border border-border-muted rounded focus:outline-none focus:ring-1 focus:ring-primary/30 text-text-primary"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition-all duration-200"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
      <Navbar joined={joined} onJoinWaitlist={undefined} />
      <HeroSection joined={joined} onJoined={handleJoined} onValidateEmail={onValidateEmail} />
      <HowItWorks />
      <ProblemSection />
      <FeaturesSection />
      <BenefitsTable />
      <Testimonials />
      <FAQSection />
      <CTASection />
      <FooterSection joined={joined} onJoined={handleJoined} onValidateEmail={onValidateEmail} />
    </div>
  );
}
