"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../../../components/client/my-desk/breadcrumb";
import { ChevronDown, Upload, Calendar, MapPin, X, Loader2, Check } from "lucide-react";

type Category = { id: string; name: string };
type Skill = { id: string; name: string };

const CURRENCY_MAP: Record<string, string> = {
  "Dollars ($)": "USD",
  "Euros (€)": "EUR",
  "Pounds (£)": "GBP",
  "Naira (₦)": "NGN",
};

const CURRENCY_REVERSE: Record<string, string> = {
  USD: "Dollars ($)",
  EUR: "Euros (€)",
  GBP: "Pounds (£)",
  NGN: "Naira (₦)",
};

const MODE_MAP: Record<string, string> = {
  Virtual: "VIRTUAL",
  "On-site": "IN_PERSON",
  Hybrid: "HYBRID",
};

const MODE_REVERSE: Record<string, string> = {
  VIRTUAL: "Virtual",
  IN_PERSON: "On-site",
  HYBRID: "Hybrid",
};

const NUM_CREATIVES_MAP: Record<string, number> = {
  "1 creative": 1,
  "2 creatives": 2,
  "3 creatives": 3,
  "4 creatives": 4,
  "5+ creatives": 5,
};

const NUM_CREATIVES_REVERSE: Record<number, string> = {
  1: "1 creative",
  2: "2 creatives",
  3: "3 creatives",
  4: "4 creatives",
  5: "5+ creatives",
};

const CongratulationsModal: React.FC<{ onGoToDetails: () => void }> = ({ onGoToDetails }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-orange-400/80 rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
        <Check size={52} fill="white" stroke="#fb923c" />
      </div>
      <h2 className="text-[22px] font-bold text-white mb-1">Brief Updated!</h2>
      <p className="text-[14px] text-white mb-7 leading-relaxed max-w-[260px]">
        Your brief has been updated successfully.
      </p>
      <button
        onClick={onGoToDetails}
        className="bg-white rounded-lg px-8 py-2.5 text-[#fb923c] font-semibold text-sm hover:bg-orange-500 hover:text-black transition-colors"
      >
        View Brief
      </button>
    </div>
  </div>
);

const EditBriefPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState<{ name: string; clientProfile: { fullName: string; imageUrl: string | null } } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [projectCategoryId, setProjectCategoryId] = useState("");
  const [specificSkillIds, setSpecificSkillIds] = useState<string[]>([]);
  const [numCreatives, setNumCreatives] = useState("1 creative");
  const [currency, setCurrency] = useState("Dollars ($)");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timeline, setTimeline] = useState("1-3 days");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [modeOfProject, setModeOfProject] = useState("Virtual");
  const [location, setLocation] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [existingFileUrls, setExistingFileUrls] = useState<string[]>([]);

  // Fetch brief + profile + categories on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        const [briefRes, profileRes, categoriesRes] = await Promise.all([
          fetch(`/api/v1/briefs/${id}`, { headers, credentials: "include" }),
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
          fetch("/api/v1/briefs/categories", { headers }),
        ]);

        const briefJson = await briefRes.json();
        const profileJson = await profileRes.json();
        const categoriesJson = await categoriesRes.json();

        const brief = briefJson.data ?? briefJson;
        setProfile(profileJson.data ?? profileJson);
        setCategories(Array.isArray(categoriesJson) ? categoriesJson : categoriesJson.data ?? []);

        // Pre-fill form with existing brief data
        setJobTitle(brief.jobTitle ?? "");
        setJobDescription(brief.jobDescription ?? "");
        setProjectCategoryId(brief.projectCategoryId ?? "");
        setSpecificSkillIds(brief.skills?.map((s: any) => s.id) ?? []);
        setNumCreatives(NUM_CREATIVES_REVERSE[brief.numberOfCreatives] ?? "1 creative");
        setCurrency(CURRENCY_REVERSE[brief.currency] ?? "Dollars ($)");
        setBudgetMin(String(brief.budgetMin ?? ""));
        setBudgetMax(String(brief.budgetMax ?? ""));
        setTimeline(brief.timeline ?? "1-3 days");
        setDeliveryDate(brief.deliveryDate ? brief.deliveryDate.split("T")[0] : "");
        setModeOfProject(MODE_REVERSE[brief.modeOfProject] ?? "Virtual");
        setLocation(brief.location ?? "");
        setExistingFileUrls(brief.referenceFileUrls ?? []);
      } catch {
        setError("Failed to load brief.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Fetch skills when category changes
  useEffect(() => {
    if (!projectCategoryId) { setSkills([]); return; }
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch(`/api/v1/platform-services?categoryId=${projectCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const services = Array.isArray(json) ? json : json.data ?? [];
        const allSkills: Skill[] = services.flatMap((svc: any) =>
          Array.isArray(svc.skills) ? svc.skills : []
        );
        setSkills(allSkills);
      } catch {
        setSkills([]);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [projectCategoryId]);

  const toggleSkill = (skillId: string) => {
    setSpecificSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewFile(file);
    setNewFileName(file?.name ?? "");
  };

  const handleSave = async () => {
    setError(null);
    if (!jobTitle.trim()) return setError("Job title is required.");
    if (!projectCategoryId) return setError("Please select a category.");
    if (specificSkillIds.length === 0) return setError("Please select at least one skill.");
    if (!jobDescription.trim()) return setError("Job description is required.");
    if (!deliveryDate) return setError("Please set a delivery date.");
    if (!budgetMin || !budgetMax) return setError("Please enter a budget range.");

    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const formData = new FormData();
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);
      formData.append("projectCategoryId", projectCategoryId);
      specificSkillIds.forEach((sid) => formData.append("specificSkills[]", sid));
      formData.append("numberOfCreatives", String(NUM_CREATIVES_MAP[numCreatives] ?? 1));
      formData.append("currency", CURRENCY_MAP[currency] ?? "USD");
      formData.append("budgetMin", budgetMin);
      formData.append("budgetMax", budgetMax);
      formData.append("timeline", timeline);
      formData.append("deliveryDate", deliveryDate);
      formData.append("modeOfProject", MODE_MAP[modeOfProject] ?? "VIRTUAL");
      if (location) formData.append("location", location);
      if (newFile) formData.append("referenceFiles", newFile);

      const res = await fetch(`/api/v1/briefs/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update brief.");
      }

      setShowModal(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E05C5C]" size={40} />
      </div>
    );
  }

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showModal && (
        <CongratulationsModal onGoToDetails={() => router.push(`/client/my-briefs/${id}`)} />
      )}

      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="My Briefs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "My Briefs", path: "/client/my-briefs" },
              { label: "Brief Details", path: `/client/my-briefs/${id}` },
              { label: "Edit" },
            ]}
          />

          <h1 className="text-2xl font-heading font-extrabold text-black mb-6">Edit Brief</h1>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          <div className="bg-[#fafafa] rounded-2xl p-6 flex flex-col gap-6">

            <Field label="Job Title">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Type here"
                className={inputClass}
              />
            </Field>

            <Field label="Project Category">
              <div className="relative">
                <select
                  value={projectCategoryId}
                  onChange={(e) => {
                    setProjectCategoryId(e.target.value);
                    setSpecificSkillIds([]);
                  }}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Select Specific Skill(s)">
              {!projectCategoryId ? (
                <p className="text-sm text-gray-400">Select a category first</p>
              ) : loadingSkills ? (
                <p className="text-sm text-gray-400">Loading skills…</p>
              ) : skills.length === 0 ? (
                <p className="text-sm text-gray-400">No skills found for this category</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const selected = specificSkillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          selected
                            ? "bg-[#E05C5C] text-white border-[#E05C5C]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#E05C5C]"
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>

            <Field label="Job Description">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe your project in detail"
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Reference Files">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              {/* Show existing files */}
              {existingFileUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {existingFileUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Reference ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => setExistingFileUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-[#E05C5C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d04f4f] transition-colors"
                >
                  <Upload size={15} />
                  Upload New
                </button>
                {newFileName && (
                  <span className="text-sm text-gray-500">{newFileName}</span>
                )}
              </div>
            </Field>

            <Field label="Number of Creatives">
              <div className="relative">
                <select
                  value={numCreatives}
                  onChange={(e) => setNumCreatives(e.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  {["1 creative", "2 creatives", "3 creatives", "4 creatives", "5+ creatives"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Currency">
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  {Object.keys(CURRENCY_MAP).map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Budget Min">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="e.g. 100"
                  className={inputClass}
                />
              </Field>
              <Field label="Budget Max">
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 500"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Timeline">
                <div className="relative">
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {["Less than 24 hours", "1-3 days", "3-7 days", "1-2 weeks", "1 month+"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Delivery Date">
                <div className="relative">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>
            </div>

            <Field label="Mode of Project">
              <div className="relative">
                <select
                  value={modeOfProject}
                  onChange={(e) => setModeOfProject(e.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  {["Virtual", "On-site", "Hybrid"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Location (Optional)">
              <div className="relative">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Type here"
                  className={`${inputClass} pr-10`}
                />
                <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between px-0 py-4 mt-2">
            <button
              onClick={() => router.push(`/client/my-briefs/${id}`)}
              className="border border-gray-200 text-gray-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="bg-[#E05C5C] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#d04f4f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-lg font-heading font-medium text-black">{label}</label>
    {children}
  </div>
);

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black bg-white outline-none focus:border-[#E05C5C] transition-colors placeholder:text-gray-400";

export default EditBriefPage;