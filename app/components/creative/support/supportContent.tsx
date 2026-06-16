"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageCircle,
  AlertOctagon,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
} from "lucide-react";
import { WhatsApp } from "@/app/icons";

interface FaqItem {
  question: string;
  answer: string;
}

interface ArticleSummary {
  id: string;
  title: string;
  category: string;
  readTime?: string;
}

interface ArticleDetail {
  id: string;
  title: string;
  content: string;
}

interface ContactInfo {
  whatsappNumber?: string;
  emailAddress?: string;
  communityForumUrl?: string;
  supportPhoneNumber?: string;
  liveChatProvider?: string;
}

interface SupportCaseSummary {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  createdAt: string;
}

const CASE_TYPES = [
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "LOGIN_PROBLEM", label: "Login Problem" },
  { value: "PROFILE_VERIFICATION", label: "Profile Verification" },
  { value: "APP_BUG", label: "App Bug" },
  { value: "OTHER", label: "Other" },
];

const CASE_STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

const formatCaseStatus = (status: string) =>
  status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5MB

const getCaseTypeLabel = (value: string) =>
  CASE_TYPES.find((t) => t.value === value)?.label ?? formatCaseStatus(value);

const formatCaseDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const HelpSupportContent: React.FC = () => {
  const router = useRouter();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openResource, setOpenResource] = useState<number | null>(null);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);

  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articleDetails, setArticleDetails] = useState<Record<string, ArticleDetail>>({});
  const [articleLoadingId, setArticleLoadingId] = useState<string | null>(null);

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // Report Case modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ caseNumber: string } | null>(null);
  const [supportCases, setSupportCases] = useState<SupportCaseSummary[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);

  const getHeaders = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/v1/support/faq", { credentials: "include", headers });
        const json = await res.json();

        // Response is grouped by category: { success, data: [{ category, faqs: [...] }] } or flat array
        const raw = json?.data;
        let flat: FaqItem[] = [];

        if (Array.isArray(raw)) {
          raw.forEach((entry: any) => {
            if (entry.question && entry.answer) {
              flat.push({ question: entry.question, answer: entry.answer });
            } else if (Array.isArray(entry.faqs)) {
              entry.faqs.forEach((f: any) =>
                flat.push({ question: f.question, answer: f.answer })
              );
            }
          });
        }

        setFaqs(flat);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Fetch help articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/v1/support/articles", { credentials: "include", headers });
        const json = await res.json();
        const list: ArticleSummary[] = Array.isArray(json?.data) ? json.data : [];
        setArticles(list);
      } catch (err) {
        console.error("Failed to load help articles:", err);
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Fetch contact info
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/v1/support/contact-info", { credentials: "include", headers });
        const json = await res.json();
        setContactInfo(json?.data ?? null);
      } catch (err) {
        console.error("Failed to load contact info:", err);
      }
    };
    fetchContactInfo();
  }, []);

  const toggleResource = async (i: number, articleId: string) => {
    if (openResource === i) {
      setOpenResource(null);
      return;
    }
    setOpenResource(i);

    if (!articleDetails[articleId]) {
      setArticleLoadingId(articleId);
      try {
        const headers = await getHeaders();
        const res = await fetch(`/api/v1/support/articles/${articleId}`, {
          credentials: "include",
          headers,
        });
        const json = await res.json();
        if (json?.data) {
          setArticleDetails((prev) => ({ ...prev, [articleId]: json.data }));
        }
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        setArticleLoadingId(null);
      }
    }
  };

  const handleWhatsAppClick = () => {
    if (contactInfo?.whatsappNumber) {
      const number = contactInfo.whatsappNumber.replace(/[^\d]/g, "");
      window.open(`https://wa.me/${number}`, "_blank");
    }
  };

  // ----- Report Case modal -----

  const resetReportForm = () => {
    setCaseType("");
    setDescription("");
    setScreenshotFile(null);
    setFileError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const openReportModal = () => {
    resetReportForm();
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_SCREENSHOT_BYTES) {
      setFileError("Screenshot must be smaller than 5MB.");
      setScreenshotFile(null);
      return;
    }
    setFileError(null);
    setScreenshotFile(file);
  };

  const handleSubmitReport = async () => {
    if (!caseType) {
      setSubmitError("Please select an issue type.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Please add a description.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const formData = new FormData();
      formData.append("caseType", caseType);
      formData.append("description", description.trim());
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await fetch("/api/v1/support/cases", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Submit case failed:", res.status, json);
        throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
      }

      const caseNumber = json?.data?.caseNumber ?? json?.caseNumber ?? "";
      setSubmitSuccess({ caseNumber });
      fetchSupportCases();
    } catch (err: any) {
      console.error("Failed to submit case:", err);
      setSubmitError(err?.message || "Something went wrong submitting your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchSupportCases = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/v1/support/cases/me", { credentials: "include", headers });
      const json = await res.json();
      setSupportCases(Array.isArray(json?.data) ? json.data : []);
      setCasesError(null);
    } catch (err) {
      console.error("Failed to load support cases:", err);
      setCasesError("We couldn't load your reports.");
    } finally {
      setCasesLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportCases();
  }, []);

  const handleDisputesClick = () => {
    router.push("/creative/support/disputes");
  };

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
          <button
            onClick={() => { }}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageCircle size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Live Chat</span>
          </button>
          <button
            onClick={openReportModal}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <AlertOctagon size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Report Case</span>
          </button>
          <button
            onClick={handleDisputesClick}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <AlertOctagon size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Disputes</span>
          </button>
        </div>
      </section>

      {/* Your Reports */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Your Reports</h2>

        {casesLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#E05C5C]" size={28} />
          </div>
        )}

        {!casesLoading && casesError && (
          <p className="text-sm text-red-500 text-center py-10">{casesError}</p>
        )}

        {!casesLoading && !casesError && supportCases.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">You haven't submitted any reports yet.</p>
        )}

        {!casesLoading && !casesError && (
          <div className="flex flex-col gap-4">
            {supportCases.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between shadow-sm"
              >
                <div className="flex-1">
                  <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5 font-mono">
                    #{c.caseNumber}
                  </span>
                  <h3 className="font-semibold font-heading text-black mt-1">
                    {getCaseTypeLabel(c.caseType)}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-sm text-black">
                    <Calendar size={18} />
                    {formatCaseDate(c.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 ml-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${CASE_STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {formatCaseStatus(c.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading text-black mb-3">Frequently Asked Questions</h2>
        <div className="bg-[#fafafa] rounded-2xl overflow-hidden divide-y divide-gray-200">
          {faqLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading FAQs...</span>
            </div>
          )}

          {!faqLoading && faqs.length === 0 && (
            <p className="text-sm text-black text-center py-6">No FAQs available.</p>
          )}

          {!faqLoading &&
            faqs.map((faq, i) => (
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
          {articlesLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading resources...</span>
            </div>
          )}

          {!articlesLoading && articles.length === 0 && (
            <p className="text-sm text-black text-center py-6">No help resources available.</p>
          )}

          {!articlesLoading &&
            articles.map((article, i) => (
              <div key={article.id}>
                <button
                  onClick={() => toggleResource(i, article.id)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-black">{article.title}</p>
                    <p className="text-xs text-black mt-0.5">
                      {article.category}
                      {article.readTime ? ` · ${article.readTime}` : ""}
                    </p>
                  </div>
                  {openResource === i ? (
                    <ChevronUp size={16} className="text-black shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-black shrink-0" />
                  )}
                </button>
                {openResource === i && (
                  <div className="px-4 pb-4 text-sm text-black leading-relaxed">
                    {articleLoadingId === article.id ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      articleDetails[article.id]?.content ?? "Content unavailable."
                    )}
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
        <button
          onClick={handleWhatsAppClick}
          disabled={!contactInfo?.whatsappNumber}
          className="bg-white rounded-xl p-14 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow mx-auto disabled:opacity-50"
        >
          <WhatsApp />
          <span className="text-xl font-semibold font-heading text-black">WhatsApp Support</span>
          <span className="text-sm text-black">Quick responses via WhatsApp</span>
        </button>
      </section>

      {/* Report Case Modal */}
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeReportModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading text-black">Report a Case</h2>
              <button onClick={closeReportModal} aria-label="Close">
                <X size={20} className="text-black" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center">
                <p className="text-base font-semibold text-black mb-2">Report submitted</p>
                <p className="text-sm text-black">
                  Your case number is{" "}
                  <span className="font-semibold">{submitSuccess.caseNumber || "on its way"}</span>.
                  Our support team will be in touch shortly.
                </p>
                <button
                  onClick={closeReportModal}
                  className="mt-6 bg-[#E05C5C] text-white rounded-xl py-3 px-8 font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="bg-[#fafafa] rounded-2xl p-5 space-y-5">
                <div>
                  <label className="block text-sm text-black mb-2">Issue Type</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black outline-none pr-10"
                  >
                    <option value="" disabled>
                      Select an issue type
                    </option>
                    {CASE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-black mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe in detail"
                    rows={4}
                    className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-black outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black mb-2">Add Evidence</label>
                  <label className="inline-flex items-center gap-2 bg-[#E05C5C] text-white rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer">
                    <Upload size={16} />
                    {screenshotFile ? screenshotFile.name : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  {fileError ? (
                    <p className="text-xs text-red-600 mt-1">{fileError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Optional screenshot, max 5MB.</p>
                  )}
                </div>

                {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="w-full bg-[#E05C5C] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportContent;