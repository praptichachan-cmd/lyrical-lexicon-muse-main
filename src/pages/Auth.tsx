import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setSuccess("Check your email for a password reset link.");
    } else if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else navigate("/");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate("/");
    }
    setSubmitting(false);
  };

  const subtitle =
    mode === "forgot" ? "Reset your password" :
    mode === "signup" ? "Create your account" : "Welcome back";

  const buttonLabel =
    mode === "forgot" ? "Send Reset Link" :
    mode === "signup" ? "Create Account" : "Sign In";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card shadow-card">
            <BookOpen className="text-primary" size={28} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
            Lyrical Lexicon
          </h1>
          <p className="font-sans text-sm text-muted-foreground/60">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-card text-foreground font-sans text-sm
                shadow-card placeholder:text-muted-foreground/40 outline-none
                transition-shadow duration-300 focus:shadow-card-hover"
              placeholder="you@example.com"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-card text-foreground font-sans text-sm
                  shadow-card placeholder:text-muted-foreground/40 outline-none
                  transition-shadow duration-300 focus:shadow-card-hover"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <p className="text-sm font-sans text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">{error}</p>
          )}
          {success && (
            <p className="text-sm font-sans text-primary bg-primary/10 rounded-lg px-4 py-2.5">{success}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm
              tracking-wide transition-all duration-200 hover:brightness-95 active:scale-[0.98]
              disabled:opacity-50 shadow-card"
          >
            {submitting ? "..." : buttonLabel}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center font-sans text-sm text-muted-foreground space-y-1">
          {mode === "signin" && (
            <>
              <p>
                <button onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }} className="text-primary font-medium hover:underline">
                  Forgot password?
                </button>
              </p>
              <p>
                Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); setSuccess(null); }} className="text-primary font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(null); setSuccess(null); }} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <p>
              <button onClick={() => { setMode("signin"); setError(null); setSuccess(null); }} className="text-primary font-medium hover:underline">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
