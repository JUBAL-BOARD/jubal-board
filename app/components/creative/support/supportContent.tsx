"use client";
import { useState } from "react";
import { Search, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { WhatsApp } from "@/app/icons";

const faqs = [
  { question: "How does the payment system work?", answer: "Payments are held in escrow and released to the creative once you approve the delivered work. If there's a dispute, our team reviews the case." },
  { question: "What if I'm not satisfied with the work?", answer: "You can raise a dispute from the project page. Our support team will review the submitted files and mediate between you and the creative." },
  { question: "How does the escrow system work?", answer: "When you hire a creative, funds are locked in escrow. They are only released when you approve the final delivery, protecting both parties." },
];

const helpResources = [
  { title: "User Guide", subtitle: "Complete documentation" },
  { title: "Video Tutorials", subtitle: "Learn through videos" },
  { title: "Terms & Policies", subtitle: "Legal information" },
];

const HelpSupportContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openResource, setOpenResource] = useState<number | null>(null);

  return (
    <div className="mx-auto">
      {/* Hero */}
      <div className="text-center mt-8 mb-8">
        <h1 className="text-2xl font-bold font-heading text-black">How can we help you?</h1>
        <p className="text-sm text-black font-body mt-1">Get support, find answers, or contact our team</p>
        <div className="mt-4 flex items-center border border-black rounded-lg px-3 gap-2 bg-white max-w-md mx-auto">
          <Search size={16} className="text-black" />
          <input
            className="flex-1 py-2.5 text-sm text-black outline-none placeholder:text-black"
            placeholder="Search for answers"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Quick Actions</h2>
        <div className="bg-[#fafafa] rounded-2xl p-8 grid grid-cols-3 gap-3">
          {[
            { icon: <MessageCircle size={22} className="text-[#E05C5C]" />, label: "Live Chat" },
            { icon: <Phone size={22} className="text-[#E05C5C]" />, label: "Call Us" },
            { icon: <Mail size={22} className="text-[#E05C5C]" />, label: "Email Us" },
          ].map((action) => (
            <button
              key={action.label}
              className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              {action.icon}
              <span className="text-sm text-black font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Frequently Asked Questions</h2>
        <div className="bg-[#fafafa] rounded-2xl overflow-hidden divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
              >
                <span className="text-sm text-black font-medium">{faq.question}</span>
                {openFaq === i ? (
                  <ChevronUp size={16} className="text-black shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-black shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-black leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Help Resources */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Help Resources</h2>
        <div className="bg-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-200">
          {helpResources.map((res, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenResource(openResource === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-black">{res.title}</p>
                  <p className="text-xs text-black mt-0.5">{res.subtitle}</p>
                </div>
                {openResource === i ? (
                  <ChevronUp size={16} className="text-black shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-black shrink-0" />
                )}
              </button>
              {openResource === i && (
                <div className="px-4 pb-4 text-sm text-black">
                  Content for {res.title} goes here.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-gray-50 rounded-2xl p-12 text-center mb-10">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Still need help?</h2>
        <p className="text-sm text-black mt-1 mb-5">
          Our support team is here to help you with any questions or issues you may have.
        </p>
        <button className="bg-white rounded-xl p-14 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow mx-auto">
          <WhatsApp />
          <span className="text-xl font-semibold font-heading text-black">WhatsApp Support</span>
          <span className="text-sm text-black">Quick responses via WhatsApp</span>
        </button>
      </section>
    </div>
  );
};

export default HelpSupportContent;