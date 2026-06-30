"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, User, Check, Loader2, ChevronDown } from "lucide-react";
import { ApiError } from "../../../lib/api";

const languages = ["English", "French", "Spanish", "Arabic", "Yoruba"];
const commOptions = ["Chat only", "Email only", "Chat & Email", "Phone & Chat"];
const roles = ["Graphic Designer", "Photographer", "Videographer", "Illustrator", "3D Artist", "Content Creator"];
const rateTypes = ["Hourly", "Project-Based", "Retainer", "Per Deliverable"];

const commApiMap: Record<string, string> = {
  "Chat only": "CHAT_ONLY", "Email only": "EMAIL", "Chat & Email": "ANY", "Phone & Chat": "ANY",
};
const commReverseMap: Record<string, string> = {
  "CHAT_ONLY": "Chat only", "EMAIL": "Email only", "ANY": "Chat & Email",
};
const rateTypeApiMap: Record<string, string> = {
  "Hourly": "HOURLY", "Project-Based": "PROJECT_BASED", "Retainer": "BOTH", "Per Deliverable": "PROJECT_BASED",
};
const rateTypeReverseMap: Record<string, string> = {
  "HOURLY": "Hourly", "PROJECT_BASED": "Project-Based", "BOTH": "Retainer",
};
const languageApiMap: Record<string, string> = {
  "English": "en", "French": "fr", "Spanish": "es", "Arabic": "ar", "Yoruba": "yo",
};
const languageReverseMap: Record<string, string> = {
  "en": "English", "fr": "French", "es": "Spanish", "ar": "Arabic", "yo": "Yoruba",
};

interface StateOption {
  id: string;
  name: string;
}
interface CountryOption {
  id: string;
  name: string;
  code: string;
  phoneCode: string;
  states: StateOption[];
}
interface CurrencyOption {
  id: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

const reqStar = <span className="text-red-500"> *</span>;
const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-red-100 bg-gray-50";
const labelClass = "text-xs font-medium text-black mb-1 block";

const SelectField = ({ label, value, onChange, options, placeholder, required = true }: any) => (
  <div>
    <label className={labelClass}>{label}{required && reqStar}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={14} stroke="#6B7280" />
      </div>
    </div>
  </div>
);

const ProfileSettingsTab: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  const [form, setForm] = useState({
    fullName: "", dob: "", country: "", streetAddress: "",
    socialLinks: "", description: "", postalCode: "",
    language: "English", communication: "Chat only",
    professionalRole: "Graphic Designer",
    rateRangeMin: "0", rateRangeMax: "0", rateType: "Hourly",
  });

  const update = (key: string, value: string) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jubalboard.com";
        const response = await fetch(`${BASE_URL}/api/v1/platform/countries`, { credentials: "include" });
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data?.countries) {
            setCountries(apiResponse.data.countries);
          }
        }
      } catch {
        console.warn("Countries could not be loaded.");
      }
    };
    fetchCountries();
  }, []);

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jubalboard.com";
        const response = await fetch(`${BASE_URL}/api/v1/platform/currencies`, { credentials: "include" });
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data?.currencies) {
            const active = apiResponse.data.currencies.filter((c: CurrencyOption) => c.isActive);
            setCurrencies(active);
            if (active.length > 0) setSelectedCurrency(active[0].code);
          }
        }
      } catch {
        console.warn("Currencies could not be loaded.");
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jubalboard.com";
        const res = await fetch(`${BASE_URL}/api/v1/categories`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAvailableCategories(json.data.map((cat: any) => ({ id: cat.id, name: cat.name })));
          }
        }
      } catch {
        console.warn("Categories could not be loaded.");
      }
    };
    loadCategories();
  }, []);

  // Load existing profile — waits for countries first
  useEffect(() => {
    if (countries.length === 0) return;

    const loadProfile = async () => {
      try {
        setFetching(true);
        const tokenRes = await fetch("/api/auth/session/token", { credentials: "include" });
        const { token } = await tokenRes.json();
        if (!token) throw new Error("Unauthorized");

        const res = await fetch("/api/v1/creatives/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const json = await res.json();
        const payload = json.data?.data || json.data;
        const cp = payload?.creativeProfile;

        if (cp) {
          const matchedCountry = countries.find((c) => c.name === cp.country) || null;
          setSelectedCountry(matchedCountry);

          if (matchedCountry) setPhoneCode(`+${matchedCountry.phoneCode}`);
          if (cp.contactNumber) {
            const code = matchedCountry ? `+${matchedCountry.phoneCode}` : "";
            const stripped = code && cp.contactNumber.startsWith(code)
              ? cp.contactNumber.slice(code.length)
              : cp.contactNumber;
            setPhoneNumber(stripped);
          }

          if (matchedCountry && cp.state) setSelectedState(cp.state);
          if (cp.currency) setSelectedCurrency(cp.currency);

          setForm({
            fullName: cp.fullName || "",
            dob: cp.dateOfBirth ? cp.dateOfBirth.split("T")[0] : "",
            country: cp.country || "",
            streetAddress: cp.streetAddress || "",
            socialLinks: (cp.preferredSocialLinks || []).join(", "),
            description: cp.describeYourselfInOneLine || "",
            postalCode: cp.postalCode || "",
            language: languageReverseMap[cp.languagePreference] || "English",
            communication: commReverseMap[cp.preferredCommunication] || "Chat only",
            professionalRole: cp.professionalRole || "Graphic Designer",
            rateRangeMin: String(cp.rateRangeMin || 0),
            rateRangeMax: String(cp.rateRangeMax || 0),
            rateType: rateTypeReverseMap[cp.rateType] || "Hourly",
          });

          const catIds = (cp.categoriesOfInterest || []).map((c: any) =>
            typeof c === "string" ? c : c.id
          );
          setSelectedCategories(catIds);

          if (cp.imageUrl) setAvatar(cp.imageUrl);
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [countries]);

  const handleCountryChange = (countryName: string) => {
    const found = countries.find((c) => c.name === countryName) || null;
    setSelectedCountry(found);
    setSelectedState("");
    setPhoneCode(found ? `+${found.phoneCode}` : "");
    update("country", countryName);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    if (!form.professionalRole) { setError("Professional role is required."); return; }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      if (!token) throw new Error("Unauthorized");

      const formData = new FormData();

      if (form.fullName.trim()) formData.append("fullName", form.fullName.trim());
      if (form.dob) formData.append("dateOfBirth", form.dob);
      if (phoneNumber) formData.append("contactNumber", `${phoneCode}${phoneNumber}`);
      if (form.country.trim()) formData.append("country", form.country.trim());
      if (selectedState) formData.append("state", selectedState);
      if (form.streetAddress.trim()) formData.append("streetAddress", form.streetAddress.trim());
      if (form.postalCode.trim()) formData.append("postalCode", form.postalCode.trim());
      if (form.description.trim()) formData.append("describeYourselfInOneLine", form.description.trim());
      if (form.rateRangeMin) formData.append("rateRangeMin", form.rateRangeMin);
      if (form.rateRangeMax) formData.append("rateRangeMax", form.rateRangeMax);
      formData.append("languagePreference", languageApiMap[form.language] || "en");
      formData.append("preferredCommunication", commApiMap[form.communication] || "CHAT_ONLY");
      formData.append("professionalRole", form.professionalRole);
      formData.append("currency", selectedCurrency);
      formData.append("rateType", rateTypeApiMap[form.rateType] || "HOURLY");
      selectedCategories.forEach((id) => formData.append("categoriesOfInterest[]", id));
      if (form.socialLinks.trim()) {
        form.socialLinks.split(",").map((l) => l.trim()).filter(Boolean)
          .forEach((link) => formData.append("preferredSocialLinks[]", link));
      }
      const avatarFile = fileInputRef.current?.files?.[0];
      if (avatarFile) formData.append("image", avatarFile);

      const res = await fetch("/api/v1/creatives/me/personal-profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save profile.");
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) setError((err.data as any)?.message || "Failed to save.");
      else if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E2554F] mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-600">
          Profile updated successfully!
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <User size={40} fill="#1a1a2e" stroke="none" />
            }
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow cursor-pointer border-2 border-white"
          >
            <Camera size={14} className="text-black" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Update your photo</p>
      </div>

      {/* Form */}
      <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4">

        {/* Row 1: Full Name + DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name{reqStar}</label>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Type here"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              max={(() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 18);
                return d.toISOString().split("T")[0];
              })()}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                const minAge = new Date();
                minAge.setFullYear(minAge.getFullYear() - 18);
                if (selected > minAge) {
                  setError("You must be at least 18 years old.");
                  update("dob", "");
                } else {
                  update("dob", e.target.value);
                }
              }}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 2: Contact Number + Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Contact Number</label>
            <div className={`${inputClass} flex items-center gap-0 p-0 overflow-hidden`}>
              {phoneCode && (
                <span className="px-3 py-[1px] text-sm text-black border-r border-gray-200 flex-shrink-0 select-none">
                  {phoneCode}
                </span>
              )}
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="8012345678"
                inputMode="numeric"
                className="flex-1 px-3 py-[1px] text-sm text-black outline-none bg-gray-50 border-none"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <div className="relative">
              <select
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={`${inputClass} appearance-none pr-9 cursor-pointer`}
              >
                <option value="" disabled>Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} stroke="#6B7280" />
              </div>
            </div>
          </div>
        </div>

        {/* State — only when country has states */}
        {selectedCountry && selectedCountry.states.length > 0 && (
          <div>
            <label className={labelClass}>State</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className={`${inputClass} appearance-none pr-9 cursor-pointer`}
              >
                <option value="" disabled>Select state</option>
                {selectedCountry.states.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} stroke="#6B7280" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Street Address</label>
          <input value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} placeholder="Type your street address" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Preferred Social Link(s)</label>
          <input value={form.socialLinks} onChange={(e) => update("socialLinks", e.target.value)} placeholder="Separate multiple links with commas" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Describe yourself in one line</label>
          <div className="relative">
            <textarea
              value={form.description}
              onChange={(e) => {
                if (e.target.value.length <= 150) update("description", e.target.value);
              }}
              rows={4}
              maxLength={150}
              placeholder="Tell clients who you are, what you do, and what makes you unique..."
              className={`${inputClass} resize-y leading-relaxed`}
            />
            <div className={`text-right text-[11px] mt-1 ${form.description.length > 130 ? "text-red-400" : "text-gray-400"}`}>
              {form.description.length}/150
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Postal Code</label>
            <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Type here" className={inputClass} />
          </div>
          <SelectField label="Language Preference" value={form.language} onChange={(v: string) => update("language", v)} options={languages} required={false} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Preferred Communication" value={form.communication} onChange={(v: string) => update("communication", v)} options={commOptions} required={false} />
          <SelectField label="Professional Role" value={form.professionalRole} onChange={(v: string) => update("professionalRole", v)} options={roles} required={true} />
        </div>

        {/* Currency + Rate Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Currency</label>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className={`${inputClass} appearance-none pr-9 cursor-pointer`}
              >
                <option value="" disabled>Select currency</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} stroke="#6B7280" />
              </div>
            </div>
          </div>
          <SelectField label="Rate Type" value={form.rateType} onChange={(v: string) => update("rateType", v)} options={rateTypes} required={false} />
        </div>

        {/* Rate Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Rate Range Min</label>
            <input
              type="number"
              value={form.rateRangeMin}
              onChange={(e) => update("rateRangeMin", e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Rate Range Max</label>
            <input
              type="number"
              value={form.rateRangeMax}
              onChange={(e) => update("rateRangeMax", e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        {/* Categories of Interest */}
        {availableCategories.length > 0 && (
          <div>
            <label className={labelClass}>Categories of Interest</label>
            <div className="border border-gray-200 rounded-[10px] p-4 flex flex-wrap gap-2.5">
              {availableCategories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategories((prev) =>
                      prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                    )}
                    className={`px-3.5 py-[7px] rounded-md cursor-pointer border-none text-[13px] flex items-center gap-1.5 transition-all duration-150
                      ${selected ? "bg-[#1a1a2e] text-white font-semibold" : "bg-gray-100 text-gray-700 font-normal"}`}
                  >
                    {selected && <Check size={12} stroke="white" strokeWidth={3} />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => setForm((prev) => ({ ...prev }))}
          className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#E2554F] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-bold text-sm hover:bg-[#d44a44] transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsTab;