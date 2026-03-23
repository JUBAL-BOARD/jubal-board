"use client";

import { useState } from "react";
import { ChevronDown, Upload, Calendar, MapPin } from "lucide-react";
import { budgetRanges, timelines, projectModes } from "../../../data/favoritesData";

interface FormData {
  jobTitle: string;
  projectCategory: string;
  jobDescription: string;
  budgetRange: string;
  timeline: string;
  deliveryDate: string;
  modeOfProject: string;
  location: string;
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-700 outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-[#1a1a2e] mb-1.5 block";

const SelectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronDown size={14} stroke="#6B7280" />
    </div>
  </div>
);

const SendBriefForm: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    jobTitle: "",
    projectCategory: "",
    jobDescription: "",
    budgetRange: "$50-$100",
    timeline: "Less than 24 hours",
    deliveryDate: "",
    modeOfProject: "Virtual",
    location: "",
  });

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    console.log("Brief sent:", form);
    alert("Brief sent successfully!");
  };

  return (
    <div className="flex-1 overflow-y-auto px-1 pb-5 flex flex-col gap-4">

      {/* Job Title */}
      <div>
        <label className={labelClass}>Job Title</label>
        <input
          value={form.jobTitle}
          onChange={(e) => update("jobTitle", e.target.value)}
          placeholder="Type here"
          className={inputClass}
        />
      </div>

      {/* Project Category */}
      <div>
        <label className={labelClass}>Project Category</label>
        <SelectWrapper>
          <select
            value={form.projectCategory}
            onChange={(e) => update("projectCategory", e.target.value)}
            className={`${inputClass} appearance-none pr-9 cursor-pointer`}
          >
            <option value="">Type here</option>
            <option>Graphic Design</option>
            <option>Web Development</option>
            <option>Music Production</option>
            <option>Photography</option>
            <option>Content Writing</option>
          </select>
        </SelectWrapper>
      </div>

      {/* Job Description */}
      <div>
        <label className={labelClass}>Job Description</label>
        <textarea
          value={form.jobDescription}
          onChange={(e) => update("jobDescription", e.target.value)}
          placeholder="Describe your project in detail"
          rows={5}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </div>

      {/* Attach Reference File */}
      <div>
        <label className={labelClass}>Attach Reference File (Optional)</label>
        <button className="flex items-center gap-2 bg-[#E2554F] border-none rounded-lg px-5 py-2.5 cursor-pointer text-white font-semibold text-[13px] hover:bg-[#d44a44] transition-colors">
          <Upload size={16} stroke="white" /> Upload
        </button>
      </div>

      {/* Budget Range */}
      <div>
        <label className={labelClass}>Select Budget Range</label>
        <SelectWrapper>
          <select
            value={form.budgetRange}
            onChange={(e) => update("budgetRange", e.target.value)}
            className={`${inputClass} appearance-none pr-9 cursor-pointer`}
          >
            {budgetRanges.map((b) => <option key={b}>{b}</option>)}
          </select>
        </SelectWrapper>
      </div>

      {/* Timeline */}
      <div>
        <label className={labelClass}>Timeline</label>
        <SelectWrapper>
          <select
            value={form.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            className={`${inputClass} appearance-none pr-9 cursor-pointer`}
          >
            {timelines.map((t) => <option key={t}>{t}</option>)}
          </select>
        </SelectWrapper>
      </div>

      {/* Delivery Date */}
      <div>
        <label className={labelClass}>Delivery Date</label>
        <div className="relative">
          <input
            type="date"
            value={form.deliveryDate}
            onChange={(e) => update("deliveryDate", e.target.value)}
            className={`${inputClass} pr-9`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar size={16} stroke="#9CA3AF" />
          </div>
        </div>
      </div>

      {/* Mode of Project */}
      <div>
        <label className={labelClass}>Mode of Project</label>
        <SelectWrapper>
          <select
            value={form.modeOfProject}
            onChange={(e) => update("modeOfProject", e.target.value)}
            className={`${inputClass} appearance-none pr-9 cursor-pointer`}
          >
            {projectModes.map((m) => <option key={m}>{m}</option>)}
          </select>
        </SelectWrapper>
      </div>

      {/* Location */}
      <div>
        <label className={labelClass}>Location (Optional)</label>
        <div className="relative">
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Type here"
            className={`${inputClass} pr-9`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <MapPin size={16} stroke="#9CA3AF" />
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="text-right">
        <button
          onClick={handleSubmit}
          className="w-[20%] bg-[#E2554F] border-none rounded-lg py-3.5 cursor-pointer text-white font-bold text-[15px] mt-1 hover:bg-[#d44a44] transition-colors"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default SendBriefForm;