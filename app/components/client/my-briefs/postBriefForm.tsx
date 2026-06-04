"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Upload, MapPin, Check, X } from "lucide-react";
import { useBriefStore } from "../../../lib/stores/briefStore";

type Category = { id: string; name: string };
type Skill = { id: string; name: string };

const CURRENCY_MAP: Record<string, string> = {
  "Dollars ($)": "USD",
  "Euros (€)": "EUR",
  "Pounds (£)": "GBP",
  "Naira (₦)": "NGN",
};

const MODE_MAP: Record<string, string> = {
  "Virtual": "VIRTUAL",
  "On-site": "IN_PERSON",
  "Hybrid": "HYBRID",
};

const NUM_CREATIVES_MAP: Record<string, number> = {
  "1 creative": 1,
  "2 creatives": 2,
  "3 creatives": 3,
  "4 creatives": 4,
  "5+ creatives": 5,
};

const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-orange-400/80 rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
        <Check size={52} fill="white" stroke="#fb923c" />
      </div>
      <h2 className="text-[22px] font-bold text-white m-0 mb-1">Your Project is live!</h2>
      <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
        Your job is now visible to creatives. We'll notify you when a pitch comes in.
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-[#fb923c] font-semibold text-xs lg:text-[14px] hover:bg-orange-500 hover:text-black transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

const PostBriefForm: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { form, setField, reset } = useBriefStore();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/briefs/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list: Category[] = Array.isArray(json) ? json : json.data ?? [];
        setCategories(list);
      } catch {
        // fail silently
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!form.projectCategoryId) { setSkills([]); return; }
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch(`/api/v1/platform-services?categoryId=${form.projectCategoryId}`, {
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
  }, [form.projectCategoryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setField("referenceFile", file);
    setField("referenceFileName", file?.name ?? "");
  };

  const toggleSkill = (skillId: string, skillName: string) => {
    const currentIds = form.specificSkillIds;
    const currentNames = form.specificSkillNames;
    const isSelected = currentIds.includes(skillId);
    setField("specificSkillIds", isSelected ? currentIds.filter((id) => id !== skillId) : [...currentIds, skillId]);
    setField("specificSkillNames", isSelected ? currentNames.filter((n) => n !== skillName) : [...currentNames, skillName]);
  };

  const handlePostJob = async () => {
    setError(null);

    if (!form.jobTitle.trim()) return setError("Job title is required.");
    if (!form.projectCategoryId) return setError("Please select a project category.");
    if (form.specificSkillIds.length === 0) return setError("Please select at least one skill.");
    if (!form.jobDescription.trim()) return setError("Job description is required.");
    if (!form.budgetMin || !form.budgetMax) return setError("Please enter a budget range.");
    if (Number(form.budgetMin) >= Number(form.budgetMax)) return setError("Max budget must be greater than min.");
    if (!form.timelineValue) return setError("Please set a delivery date.");

    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const timelineMs: Record<string, number> = {
        hours: 1000 * 60 * 60,
        days: 1000 * 60 * 60 * 24,
        weeks: 1000 * 60 * 60 * 24 * 7,
        months: 1000 * 60 * 60 * 24 * 30,
      };

      const deliveryDate = new Date(
        Date.now() + Number(form.timelineValue) * (timelineMs[form.timelineUnit] ?? 1000 * 60 * 60 * 24)
      )
        .toISOString()
        .split("T")[0];

      const formData = new FormData();
      formData.append("jobTitle", form.jobTitle);
      formData.append("projectCategoryId", form.projectCategoryId);
      form.specificSkillIds.forEach((id) => formData.append("specificSkills[]", id));
      formData.append("jobDescription", form.jobDescription);
      formData.append("numberOfCreatives", String(NUM_CREATIVES_MAP[form.numCreatives] ?? 1));
      formData.append("currency", CURRENCY_MAP[form.currency] ?? "USD");
      formData.append("budgetMin", form.budgetMin);
      formData.append("budgetMax", form.budgetMax);
      formData.append("timeline", `${form.timelineValue} ${form.timelineUnit}`);
      formData.append("deliveryDate", deliveryDate);
      formData.append("modeOfProject", MODE_MAP[form.modeOfProject] ?? "VIRTUAL");
      if (form.location) formData.append("location", form.location);
      if (form.referenceFile) formData.append("referenceFiles", form.referenceFile);

      const res = await fetch("/api/v1/briefs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to post brief.");
      }

      reset();
      setShowModal(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push("/client/dashboard")} />
      )}

      <h1 className="text-2xl font-heading font-extrabold text-black mb-6">Post a Brief</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="bg-[#fafafa] rounded-2xl p-6 flex flex-col gap-6">

        <Field label="Job Title">
          <input
            value={form.jobTitle}
            onChange={(e) => setField("jobTitle", e.target.value)}
            placeholder="Type here"
            className={inputClass}
          />
        </Field>

        <Field label="Project Category">
          <div className="relative">
            <select
              value={form.projectCategoryId}
              onChange={(e) => {
                const selected = categories.find((c) => c.id === e.target.value);
                setField("projectCategoryId", e.target.value);
                setField("projectCategory", selected?.name ?? "");
                setField("specificSkillIds", []);
                setField("specificSkillNames", []);
              }}
              className={`${inputClass} appearance-none pr-10`}
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? "Loading categories…" : "Select category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="Select Specific Skill(s)">
          {!form.projectCategoryId ? (
            <p className="text-sm text-gray-400">Select a category first</p>
          ) : loadingSkills ? (
            <p className="text-sm text-gray-400">Loading skills…</p>
          ) : skills.length === 0 ? (
            <p className="text-sm text-gray-400">No skills found for this category</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const selected = form.specificSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id, skill.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected
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
            value={form.jobDescription}
            onChange={(e) => setField("jobDescription", e.target.value)}
            placeholder="Describe your project in detail"
            rows={5}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Attach Reference File (Optional)">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-[#E05C5C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d04f4f] transition-colors"
            >
              <Upload size={15} />
              Upload
            </button>
            {form.referenceFileName && (
              <span className="text-sm text-gray-500">{form.referenceFileName}</span>
            )}
          </div>
        </Field>

        <Field label="Select number of Creatives you want on this project">
          <div className="relative">
            <select
              value={form.numCreatives}
              onChange={(e) => setField("numCreatives", e.target.value)}
              className={`${inputClass} appearance-none pr-10`}
            >
              {["1 creative", "2 creatives", "3 creatives", "4 creatives", "5+ creatives"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="Select Currency">
          <div className="relative">
            <select
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
              className={`${inputClass} appearance-none pr-10`}
            >
              {Object.keys(CURRENCY_MAP).map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="Select Budget Range">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.budgetMin}
              onChange={(e) => setField("budgetMin", e.target.value)}
              placeholder="Min"
              className={inputClass}
            />
            <input
              type="number"
              value={form.budgetMax}
              onChange={(e) => setField("budgetMax", e.target.value)}
              placeholder="Max"
              className={inputClass}
            />
          </div>
        </Field>

        <Field label="Timeline">
          <div className="flex gap-2">
            <input
              type="number"
              value={form.timelineValue}
              onChange={(e) => setField("timelineValue", e.target.value)}
              placeholder="e.g. 2"
              style={{ width: "50%" }}
              className={inputClass}
            />
            <div className="relative" style={{ width: "50%" }}>
              <select
                value={form.timelineUnit}
                onChange={(e) => setField("timelineUnit", e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                {["hours", "days", "weeks", "months"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </Field>

        <Field label="Mode of Project">
          <div className="relative">
            <select
              value={form.modeOfProject}
              onChange={(e) => setField("modeOfProject", e.target.value)}
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
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="Type here"
              className={`${inputClass} pr-10`}
            />
            <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </Field>

      </div>

      <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-20">
        <button
          onClick={() => router.push("/client/my-briefs/preview")}
          className="bg-[#E05C5C] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#d04f4f] transition-colors"
        >
          Preview Brief
        </button>
        <button
          onClick={handlePostJob}
          disabled={submitting}
          className="bg-[#E05C5C] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#d04f4f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting…" : "Post Job"}
        </button>
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

export default PostBriefForm;