"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "../../assets/icononly.png";
import clientsignup from "../../assets/client/signup.jpg";
import { registerUser, oauthLogin } from "../../lib/authService";
import { ApiError } from "../../lib/api";

// ─── OAuth helpers ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    google: any;
    FB: any;
    AppleID: any;
  }
}

function loadFacebookSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.FB) { resolve(); return; }
    (window as any).fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    document.body.appendChild(s);
  });
}

function loadAppleSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.AppleID) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Apple SDK"));
    document.body.appendChild(s);
  });
}

async function getGoogleToken(): Promise<{ token: string; name: string }> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google SDK not loaded"));
      return;
    }
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (res: { credential: string }) => {
        if (!res.credential) { reject(new Error("Google sign-in failed")); return; }
        const payload = JSON.parse(atob(res.credential.split(".")[1]));
        resolve({ token: res.credential, name: payload.name ?? "" });
      },
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.prompt((n: any) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        const div = document.createElement("div");
        div.style.display = "none";
        document.body.appendChild(div);
        window.google.accounts.id.renderButton(div, { type: "standard" });
        (div.querySelector("div[role=button]") as HTMLElement)?.click();
      }
    });
  });
}

async function getFacebookToken(): Promise<{ token: string; name: string }> {
  await loadFacebookSDK();
  return new Promise((resolve, reject) => {
    window.FB.login((res: any) => {
      if (res.status !== "connected" || !res.authResponse?.accessToken) {
        reject(new Error("Facebook sign-in cancelled or failed"));
        return;
      }
      const accessToken = res.authResponse.accessToken;
      window.FB.api("/me", { fields: "name" }, (profile: any) => {
        resolve({ token: accessToken, name: profile?.name ?? "" });
      });
    }, { scope: "public_profile,email" });
  });
}

async function getAppleToken(): Promise<{ token: string; name: string }> {
  await loadAppleSDK();
  window.AppleID.auth.init({
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
    scope: "name email",
    redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? window.location.origin,
    usePopup: true,
  });
  const data = await window.AppleID.auth.signIn();
  const token: string = data.authorization?.id_token ?? "";
  if (!token) throw new Error("Apple sign-in did not return a token");
  const name = [data.user?.name?.firstName, data.user?.name?.lastName]
    .filter(Boolean).join(" ");
  return { token, name };
}

// ─── Also add this to your authService.ts ─────────────────────────────────
// (shown below the component)

// ─── Types ────────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="black">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const roleConfig = {
  creative: {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    nextRoute: "/signin/creative",
  },
  client: {
    image: clientsignup,
    nextRoute: "/signin/client",
  },
};

const roleMap: Record<string, string> = {
  creative: "CREATIVE",
  client: "CLIENT",
};

// ─── Component ────────────────────────────────────────────────────────────────

const SignUp: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const role = params.role as keyof typeof roleConfig;
  const config = roleConfig[role] ?? roleConfig.creative;

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, value: string) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Email/password submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: roleMap[role] ?? "CREATIVE",
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(form.email)}&role=${role}&next=${encodeURIComponent(config.nextRoute)}`
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError("An account with this email already exists. Try signing in.");
        else if (err.status === 422) setError("Please check your details and try again.");
        else setError(err.message || "Something went wrong. Please try again.");
      } else {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── OAuth submit ───────────────────────────────────────────────────────────
  const handleOAuth = async (provider: "google" | "apple" | "facebook") => {
    setOauthLoading(provider);
    setError(null);

    try {
      let token = "";
      let name = "";

      if (provider === "google") {
        ({ token, name } = await getGoogleToken());
      } else if (provider === "facebook") {
        ({ token, name } = await getFacebookToken());
      } else {
        ({ token, name } = await getAppleToken());
      }

      // Map provider to what the backend expects
      const providerMap = {
        google: "GOOGLE",
        apple: "APPLE",
        facebook: "FACEBOOK",
      } as const;

      await oauthLogin({
        provider: providerMap[provider],
        token,
        role: roleMap[role] ?? "CREATIVE",
        name,
      });

      // OAuth login doesn't require email verification — go straight to app
      router.push(config.nextRoute);

    } catch (err: any) {
      // Ignore user-cancelled flows silently
      const msg: string = err?.message ?? "";
      const cancelled =
        msg.toLowerCase().includes("cancel") ||
        msg.toLowerCase().includes("closed") ||
        msg.toLowerCase().includes("dismissed");

      if (!cancelled) {
        if (err instanceof ApiError && err.status === 409) {
          setError("An account already exists with this email. Try signing in.");
        } else {
          setError(msg || "OAuth sign-in failed. Please try again.");
        }
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isAnyLoading = loading || oauthLoading !== null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-screen w-screen lg:overflow-hidden">

      {/* Left — image */}
      <div className="hidden lg:block relative w-full h-[220px] sm:h-[280px] lg:flex-1 lg:h-full flex-shrink-0">
        <Image
          src={config.image}
          alt="signup background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-[700px] h-screen lg:flex-shrink-0 flex items-center justify-center px-5 sm:px-8 lg:px-12 py-8 lg:py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="flex justify-center mb-4 lg:mb-5">
            <Image
              src={logo}
              alt="Jubal Board logo"
              width={100}
              height={100}
              className="object-contain w-[70px] lg:w-[100px]"
            />
          </div>

          {/* Heading */}
          <h1 className="text-xl lg:text-[26px] font-extrabold text-[#1a1a2e] text-center mb-2">
            Create an account
          </h1>
          <p className="text-sm lg:text-base text-black text-center mb-5 lg:mb-7 leading-relaxed">
            Join the board where creativity meets opportunity.<br />
            Connect. Collaborate. Get it done.
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Fields */}
          <div className="flex flex-col gap-3 mb-2">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name"
              disabled={isAnyLoading}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-black outline-none bg-white box-border disabled:opacity-50"
            />
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Email Address"
              type="email"
              disabled={isAnyLoading}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-black outline-none bg-white box-border disabled:opacity-50"
            />
            <div className="relative">
              <input
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                disabled={isAnyLoading}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-3 pr-10 text-sm text-black outline-none bg-white box-border disabled:opacity-50"
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex"
              >
                {showPassword
                  ? <EyeOff size={18} stroke="#9CA3AF" />
                  : <Eye size={18} stroke="#9CA3AF" />
                }
              </button>
            </div>
            <p className="m-0 mb-1 text-xs text-black">Must be at least 8 characters</p>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={isAnyLoading}
            className="w-full bg-[#E2554F] border-none rounded-lg py-3 lg:py-3.5 cursor-pointer text-white font-bold text-[15px] mb-3 lg:mb-3.5 hover:bg-[#d44a44] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating account...</>
            ) : "Let's Go"}
          </button>

          {/* Sign in */}
          <p className="text-center text-[13px] text-black mb-4 lg:mb-5">
            Already have an account?{" "}
            <span
              onClick={() => router.push(`/signin/${role}`)}
              className="text-[#E2554F] font-semibold cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4 lg:mb-5">
            <div className="flex-1 h-px bg-black" />
            <span className="text-[13px] text-black whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-black" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-2 lg:gap-2.5 mb-5 lg:mb-6">
            {(
              [
                { key: "google", icon: <GoogleIcon />, label: "Google" },
                { key: "apple", icon: <AppleIcon />, label: "Apple" },
                { key: "facebook", icon: <FacebookIcon />, label: "Facebook" },
              ] as const
            ).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => handleOAuth(key)}
                disabled={isAnyLoading}
                className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 bg-white border border-gray-200 rounded-lg py-2 lg:py-2.5 cursor-pointer text-[12px] lg:text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {oauthLoading === key
                  ? <Loader2 size={15} className="animate-spin text-gray-400" />
                  : icon
                }
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-black m-0">
            By signing up, you agree to our{" "}
            <span className="text-[#E2554F] cursor-pointer hover:underline">Terms</span>
            {" "}and{" "}
            <span className="text-[#E2554F] cursor-pointer hover:underline">Privacy Policy</span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignUp;