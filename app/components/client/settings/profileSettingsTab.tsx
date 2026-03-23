"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Upload, Check } from "lucide-react";
import Image from "next/image";
import SaveCancelBar from "./saveCancelBar";

const categories = [
  "Graphics Designer", "Illustrators", "UI/UX Designers",
  "Motion Designers", "Photographers", "3D Artists",
  "Photo Editors/Retouchers", "Video Editors", "Cinematographers",
  "Visual Brand Strategists",
];

const industries  = ["Technology", "Fashion", "Music", "Film", "Architecture", "Food & Culinary"];
const employeeSizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
const commModes   = ["Chat only", "Email only", "Chat & Email", "Phone & Chat"];
const languages   = ["English", "French", "Spanish", "Arabic", "Yoruba"];

const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-700 outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-[#1a1a2e] block mb-1.5";

const SelectField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none pr-9 cursor-pointer`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronDown size={14} stroke="#6B7280" />
    </div>
  </div>
);

const ProfileSettingsTab: React.FC = () => {
  const [form, setForm] = useState({
    businessName: "", contactNumber: "",
    industry: "", locationCity: "",
    streetAddress: "", websiteLinks: "",
    taxId: "", regNumber: "",
    employeeSize: "", preferredComm: "Chat only",
    language: "English",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Graphics Designer"]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  return (
    <div className="bg-[#fafafa] p-6 mb-7">

      {/* Avatar */}
      <div className="text-center mb-7">
        <div className="relative inline-block">
          <Image
            src="https://i.pravatar.cc/150?img=33"
            alt="Charles Eden"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-white rounded-full w-[26px] h-[26px] flex items-center justify-center shadow cursor-pointer">
            <Pencil size={14} stroke="#E85D3A" />
          </div>
        </div>
        <p className="mt-2.5 mb-0 font-bold text-[15px] text-[#1a1a2e]">Charles Eden</p>
      </div>

      {/* Business Name + Contact */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: "Business Name",   key: "businessName" },
          { label: "Contact Number",  key: "contactNumber" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              value={(form as any)[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder="Type here"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Industry + City */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Industry/Sector</label>
          <SelectField
            value={form.industry}
            onChange={(v) => update("industry", v)}
            options={industries}
            placeholder="Select your industry/sector"
          />
        </div>
        <div>
          <label className={labelClass}>Business Location City</label>
          <input
            value={form.locationCity}
            onChange={(e) => update("locationCity", e.target.value)}
            placeholder="Type here"
            className={inputClass}
          />
        </div>
      </div>

      {/* Street Address */}
      <div className="mb-4">
        <label className={labelClass}>Street Address</label>
        <input
          value={form.streetAddress}
          onChange={(e) => update("streetAddress", e.target.value)}
          placeholder="Type your street address"
          className={inputClass}
        />
      </div>

      {/* Website */}
      <div className="mb-4">
        <label className={labelClass}>Company Website/Social Links</label>
        <input
          value={form.websiteLinks}
          onChange={(e) => update("websiteLinks", e.target.value)}
          placeholder="Type here"
          className={inputClass}
        />
      </div>

      {/* Tax ID + Reg Number */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: "Tax ID",                          key: "taxId" },
          { label: "Business Registration Number",    key: "regNumber" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              value={(form as any)[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder="Type here"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Attach Doc + Employee Size */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Attach Document</label>
          <button className="flex items-center gap-2 bg-[#E2554F] border-none rounded-lg px-5 py-2.5 cursor-pointer text-white font-semibold text-[13px] hover:bg-[#d44a44] transition-colors">
            <Upload size={14} stroke="white" /> Upload
          </button>
        </div>
        <div>
          <label className={labelClass}>Business Size of Employee</label>
          <SelectField
            value={form.employeeSize}
            onChange={(v) => update("employeeSize", v)}
            options={employeeSizes}
            placeholder="Select size"
          />
        </div>
      </div>

      {/* Comm + Language */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Preferred Communication</label>
          <SelectField
            value={form.preferredComm}
            onChange={(v) => update("preferredComm", v)}
            options={commModes}
          />
        </div>
        <div>
          <label className={labelClass}>Language Preference</label>
          <SelectField
            value={form.language}
            onChange={(v) => update("language", v)}
            options={languages}
          />
        </div>
      </div>

      {/* Categories of Interest */}
      <div className="mb-4">
        <label className={labelClass}>Select Categories of Interest</label>
        <div className="border border-gray-200 rounded-[10px] p-4 flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const selected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-[13px] cursor-pointer border-none transition-all duration-150
                  ${selected
                    ? "bg-[#1a1a2e] text-white font-semibold"
                    : "bg-gray-100 text-gray-700 font-normal"
                  }`}
              >
                {selected && <Check size={12} stroke="white" strokeWidth={3} />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <SaveCancelBar onCancel={() => {}} onSave={() => alert("Profile saved!")} />
    </div>
  );
};

export default ProfileSettingsTab;