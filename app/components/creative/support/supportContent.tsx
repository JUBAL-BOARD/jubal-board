"use client";
import { useState, useEffect } from "react";
import { Search, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

const HelpSupportContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openResource, setOpenResource] = useState<number | null>(null);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);

  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articleDetails, setArticleDetails] = useState<Record<string, ArticleDetail>>({});
  const [articleLoadingId, setArticleLoadingId] = useState<string | null>(null);

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

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

  const handleCallClick = () => {
    if (contactInfo?.supportPhoneNumber) {
      window.location.href = `tel:${contactInfo.supportPhoneNumber}`;
    }
  };

  const handleEmailClick = () => {
    if (contactInfo?.emailAddress) {
      window.location.href = `mailto:${contactInfo.emailAddress}`;
    }
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
            onClick={() => {}}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <MessageCircle size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Live Chat</span>
          </button>
          <button
            onClick={handleCallClick}
            disabled={!contactInfo?.supportPhoneNumber}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <Phone size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Call Us</span>
          </button>
          <button
            onClick={handleEmailClick}
            disabled={!contactInfo?.emailAddress}
            className="bg-white h-[200px] rounded-xl py-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <Mail size={22} className="text-[#E05C5C]" />
            <span className="text-sm text-black font-medium">Email Us</span>
          </button>
        </div>
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
    </div>
  );
};

export default HelpSupportContent;