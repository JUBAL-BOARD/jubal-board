"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../assets/logo.png";
import { Camera, User, MapPin, Upload, ChevronDown, Check, BadgeCheck, Loader2 } from "lucide-react";
import { apiRequest } from "../../../lib/api";

type Category = {
  id: string;
  name: string;
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

const industries = ["Technology", "Fashion", "Music", "Film", "Architecture", "Food & Culinary", "Health", "Education"];
const languages = ["English", "French", "Spanish", "Arabic", "Yoruba"];
const commOptions = ["Chat only", "Email only", "Phone", "Any"];
const budgetRanges = ["$100-$200", "$200-$500", "$500-$1000", "$1000-$5000", "$5000+"];

const commValueMap: Record<string, string> = {
  "Chat only": "CHAT_ONLY",
  "Email only": "EMAIL",
  "Phone": "PHONE",
  "Any": "ANY",
};

const languageValueMap: Record<string, string> = {
  "English": "en",
  "French": "fr",
  "Spanish": "es",
  "Arabic": "ar",
  "Yoruba": "yo",
};

const reqStar = <span className="text-[#E2554F]"> *</span>;
const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-black block mb-1.5";

const SelectField = ({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) => (
  <div>
    <label className={labelClass}>{label}{reqStar}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={14} stroke="#6B7280" />
      </div>
    </div>
  </div>
);

const BrandProfile: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFilesRef = useRef<HTMLInputElement>(null);

  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [descTouched, setDescTouched] = useState(false);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);

  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  const [form, setForm] = useState({
    businessName: "", contactNumber: "", country: "",
    streetAddress: "", websiteLinks: "",
    registrationNumber: "", taxId: "",
    description: "", postalCode: "",
    language: "English", communication: "Chat only",
    industry: "", budgetRange: "$100-$200",
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/v1/platform/countries', { credentials: "include" });
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data?.countries) {
            setCountries(apiResponse.data.countries);
          }
        }
      } catch (e) {
        console.warn("Countries could not be loaded.");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/v1/platform/currencies', { credentials: "include" });
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data?.currencies) {
            const active = apiResponse.data.currencies.filter((c: CurrencyOption) => c.isActive);
            setCurrencyOptions(active);
            if (active.length > 0) setSelectedCurrency(active[0].code);
          }
        }
      } catch (e) {
        console.warn("Currencies could not be loaded.");
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const list: Category[] = Array.isArray(data) ? data : data.data ?? [];
        setCategories(list);
      } catch {
        // silently fail
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCountryChange = (countryName: string) => {
    const found = countries.find((c) => c.name === countryName) || null;
    setSelectedCountry(found);
    setSelectedState("");
    setPhoneCode(found ? `+${found.phoneCode}` : "");
    update("country", countryName);
  };

  const handleProjectFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setProjectFiles((prev) => {
      const existing = prev.map((f) => f.name);
      const newFiles = files.filter((f) => !existing.includes(f.name));
      return [...prev, ...newFiles];
    });
    e.target.value = "";
  };

  const removeProjectFile = (name: string) => {
    setProjectFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBrandLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (
      !form.businessName ||
      !form.contactNumber ||
      !form.country ||
      !form.description ||
      selectedCategories.length === 0
    ) {
      setError("Please fill in all required fields marked with *");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (form.description.trim().length < 50) {
      setDescTouched(true);
      setError("Your bio must be at least 50 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      if (!tokenRes.ok) throw new Error("Authentication failed. Please log in again.");
      const { token } = await tokenRes.json();
      if (!token) throw new Error("Authentication failed. Please log in again.");

      const formData = new FormData();
      formData.append("businessName", form.businessName);
      formData.append("contactNumber", form.contactNumber);
      formData.append("streetAddress", form.streetAddress);
      formData.append("businessRegistrationNumber", form.registrationNumber);
      formData.append("taxId", form.taxId);
      formData.append("industrySector", form.industry);
      formData.append("preferredCommunication", commValueMap[form.communication]);
      formData.append("languagePreference", languageValueMap[form.language]);
      formData.append("currency", selectedCurrency);

      selectedCategories.forEach((id) => {
        formData.append("categoriesOfInterest", id);
      });

      projectFiles.forEach((file) => {
        formData.append("projectFiles", file);
      });

      const logoFile = fileInputRef.current?.files?.[0];
      if (logoFile) {
        formData.append("image", logoFile);
      }

      const res = await fetch("/api/v1/creatives/me/business-profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save profile.");
      }

      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.profileStatus = "Completed";
        localStorage.setItem("userData", JSON.stringify(parsed));
      }

      // Redirect to KYC instead of showing modal
      router.push("/creative/kyc");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen pb-5 bg-white font-sans">
      {/* Navbar */}
      <div className="flex items-center gap-2.5 px-[42px] bg-[#fafafa] h-[100px] border-b border-gray-200">
        <Image src={logo} alt="Jubal Board logo" width={120} height={120} className="object-contain" />
      </div>

      <h1 className="text-center text-[28px] font-black text-[#1a1a2e] mt-9 mb-6">Build Your Space</h1>

      <div className="max-w-[760px] mx-auto mb-[60px] bg-[#fafafa] rounded-2xl px-12 py-10 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Logo Upload */}
        <div className="flex flex-col items-center mb-9">
          <div className="relative mb-2.5">
            <div className="w-[90px] h-[90px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {brandLogo
                ? <img src={brandLogo} alt="logo" className="w-full h-full object-cover" />
                : <User size={48} fill="#1a1a2e" stroke="none" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full border-2 border-white cursor-pointer flex items-center justify-center bg-white"
            >
              <Camera size={18} stroke="black" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>
          <p className="m-0 text-[13px] text-gray-500">Add your Logo</p>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Business Name{reqStar}</label>
            <input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Type here" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Number{reqStar}</label>
              <div className={`${inputClass} flex items-center gap-0 p-0 overflow-hidden`}>
                {phoneCode && (
                  <span className="px-3 py-[1px] text-[13px] text-black border-r border-gray-200 flex-shrink-0 select-none">
                    {phoneCode}
                  </span>
                )}
                <input
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPhoneNumber(val);
                  }}
                  placeholder="8012345678"
                  inputMode="numeric"
                  className="flex-1 px-3 py-[1px] text-[13px] text-black outline-none bg-white border-none"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Country{reqStar}</label>
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

          {selectedCountry && selectedCountry.states.length > 0 && (
            <div>
              <label className={labelClass}>State{reqStar}</label>
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
            <label className={labelClass}>Street Address{reqStar}</label>
            <input value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} placeholder="Type your street address" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Business Website/Social Link(s){reqStar}</label>
            <input value={form.websiteLinks} onChange={(e) => update("websiteLinks", e.target.value)} placeholder="Type here" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Registration Number</label>
              <input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} placeholder="Type here" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tax ID</label>
              <input value={form.taxId} onChange={(e) => update("taxId", e.target.value)} placeholder="Type here" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelClass}>Show off your best projects{reqStar}</label>
              <button
                type="button"
                onClick={() => projectFilesRef.current?.click()}
                className="flex items-center gap-2 bg-[#E2554F] border-none rounded-lg px-5 py-2.5 cursor-pointer text-white font-semibold text-[13px] hover:bg-[#d44a44] transition-colors"
              >
                <Upload size={16} stroke="white" /> Upload
              </button>
              <input
                ref={projectFilesRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
                onChange={handleProjectFilesChange}
                className="hidden"
              />

              {projectFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {projectFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500 uppercase">
                          {file.name.split(".").pop()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-gray-800 truncate max-w-[220px]">{file.name}</p>
                          <p className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProjectFile(file.name)}
                        className="text-gray-400 hover:text-red-400 transition-colors text-lg leading-none ml-3 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Describe what makes your brand unique{reqStar}</label>
            <div className="relative">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                onBlur={() => setDescTouched(true)}
                rows={4}
                placeholder="Tell clients who you are, what you do, and what makes you unique..."
                className={`${inputClass} resize-y leading-relaxed pr-2 ${descTouched && form.description.trim().length < 50
                  ? "border-red-400 focus:border-red-400"
                  : ""
                  }`}
              />
              <div className={`text-right text-[11px] mt-1 ${form.description.trim().length < 50 ? "text-red-400" : "text-green-500"}`}>
                {form.description.trim().length}/50 min
                {form.description.trim().length >= 50 && " ✓"}
              </div>
            </div>
            {descTouched && form.description.trim().length < 50 && (
              <p className="text-red-400 text-[11px] mt-1">
                Please write at least 50 characters ({50 - form.description.trim().length} more to go)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Postal Code</label>
              <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Type here" className={inputClass} />
            </div>
            <SelectField label="Language Preference" value={form.language} onChange={(v) => update("language", v)} options={languages} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Preferred Communication" value={form.communication} onChange={(v) => update("communication", v)} options={commOptions} />
            <div>
              <label className={labelClass}>Select your currency{reqStar}</label>
              <div className="relative">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                >
                  <option value="" disabled>Select currency</option>
                  {currencyOptions.map((c) => (
                    <option key={c.id} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} stroke="#6B7280" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Pick Categories where your business shines{reqStar}</label>
            <div className="border border-gray-200 rounded-[10px] p-4 flex flex-wrap gap-2.5">
              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-[13px] text-gray-400">
                  <Loader2 size={14} className="animate-spin" /> Loading categories...
                </div>
              ) : (
                categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3.5 py-[7px] rounded-md cursor-pointer border-none text-[13px] flex items-center gap-1.5 transition-all duration-150
                        ${selected ? "bg-[#1a1a2e] text-white font-semibold" : "bg-gray-100 text-gray-700 font-normal"}`}
                    >
                      {selected && <Check size={12} stroke="white" strokeWidth={3} />}
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-9">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#E2554F] border-none rounded-lg px-12 py-3.5 cursor-pointer text-white font-bold text-[15px] hover:bg-[#d44a44] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandProfile;