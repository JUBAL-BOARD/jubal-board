"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../assets/logo.png";
import { Camera, User, ChevronDown, Check, Loader2 } from "lucide-react";

type Category = { id: string; name: string };

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

const languages = ["English", "French", "Spanish", "Arabic", "Yoruba"];
const commOptions = ["Chat only", "Email only", "Phone", "Any"];

const commValueMap: Record<string, string> = {
  "Chat only": "CHAT_ONLY",
  "Email only": "EMAIL",
  "Phone": "PHONE",
  "Any": "ANY",
};

const languageValueMap: Record<string, string> = {
  "English": "en", "French": "fr", "Spanish": "es", "Arabic": "ar", "Yoruba": "yo",
};

const reqStar = <span className="text-[#E2554F]"> *</span>;
const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-black block mb-1.5";

const SelectField = ({
  label, value, onChange, options, placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; required?: boolean;
}) => (
  <div>
    <label className={labelClass}>{label}{required && reqStar}</label>
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

const IndividualProfile: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [descTouched, setDescTouched] = useState(false);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  const [form, setForm] = useState({
    fullName: "", contactNumber: "", country: "",
    location: "", postalCode: "",
    streetAddress: "", socialLink: "",
    communication: "Chat only", language: "English",
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144:3000";
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

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/v1/platform/currencies', { credentials: "include" });
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data?.currencies) {
            const active = apiResponse.data.currencies.filter((c: CurrencyOption) => c.isActive);
            setCurrencies(active);
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
        if (!res.ok) throw new Error();
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

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCountryChange = (countryName: string) => {
    const found = countries.find((c) => c.name === countryName) || null;
    setSelectedCountry(found);
    setSelectedState("");
    setPhoneCode(found ? `+${found.phoneCode}` : "");
    update("country", countryName);
  };

  const handleSave = async () => {
    if (!form.fullName || !phoneNumber || !form.country || selectedCategories.length === 0) {
      setError("Please fill in all required fields marked with *");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
      setError("Please enter a valid contact number.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      formData.append("fullName", form.fullName);
      formData.append("contactNumber", `${phoneCode}${phoneNumber}`);
      formData.append("locationCity", form.country);
      formData.append("postalCode", form.postalCode);
      formData.append("streetAddress", form.streetAddress);
      formData.append("preferredCommunication", commValueMap[form.communication]);
      formData.append("languagePreference", languageValueMap[form.language]);
      selectedCategories.forEach((id) => formData.append("categoriesOfInterest", id));

      const photoFile = fileInputRef.current?.files?.[0];
      if (photoFile) formData.append("image", photoFile);

      const res = await fetch("/api/v1/clients/me/personal-profile", {
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
      router.push("client/kyc");
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

      <h1 className="text-center text-[28px] font-black font-heading text-black mt-9 mb-1">Build Your Space</h1>
      <p className="text-center text-[13px] text-black font-body mb-6">
        Join JubalBoard and start connecting with creatives. Fill out your profile to get started.
      </p>

      <div className="max-w-[760px] mx-auto mb-[60px] bg-[#fafafa] rounded-2xl px-12 py-10 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Photo Upload */}
        <div className="flex flex-col items-center mb-9">
          <div className="relative mb-2.5">
            <div className="w-[90px] h-[90px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {photo
                ? <img src={photo} alt="photo" className="w-full h-full object-cover" />
                : <User size={48} fill="#1a1a2e" stroke="none" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full border-2 border-white cursor-pointer flex items-center justify-center bg-white shadow"
            >
              <Camera size={16} stroke="#E2554F" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <p className="m-0 text-[13px] text-gray-500">Add your photo</p>
        </div>

        <div className="flex flex-col gap-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name{reqStar}</label>
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Type here" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Number{reqStar}</label>
              <div className={`${inputClass} flex items-center gap-0 p-0 overflow-hidden ${phoneError ? "border-red-400" : ""}`}>
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
                    if (phoneError) setPhoneError(null);
                  }}
                  onBlur={() => {
                    if (!phoneNumber) return;
                    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
                      setPhoneError("Enter a valid phone number (7–15 digits).");
                    } else {
                      setPhoneError(null);
                    }
                  }}
                  placeholder="8012345678"
                  inputMode="numeric"
                  className="flex-1 px-3 py-[1px] text-[13px] text-black outline-none bg-white border-none"
                />
              </div>
              {phoneError && (
                <p className="text-xs text-red-500 mt-1">{phoneError}</p>
              )}
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
            <label className={labelClass}>Postal Code</label>
            <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Type here" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Street Address</label>
            <input value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} placeholder="Type your street address" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Preferred Social Link</label>
            <input value={form.socialLink} onChange={(e) => update("socialLink", e.target.value)} placeholder="Type here" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Preferred Communication" value={form.communication} onChange={(v) => update("communication", v)} options={commOptions} required />
            <SelectField label="Language Preference" value={form.language} onChange={(v) => update("language", v)} options={languages} required />
          </div>

          <div>
            <label className={labelClass}>Categories of Interest{reqStar}</label>
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
                      className={`px-3.5 py-[7px] rounded-md cursor-pointer border text-[13px] flex items-center gap-1.5 transition-all duration-150
                        ${selected ? "bg-white border-gray-300 text-black font-medium" : "bg-white border-gray-300 text-black font-normal"}`}
                    >
                      {selected && <Check size={12} stroke="#1a1a2e" strokeWidth={3} />}
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

export default IndividualProfile;