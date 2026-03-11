import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { BookOpen, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the auth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Extract token from URL hash (e.g., #access_token=...&refresh_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token") && hash.includes("type=recovery")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        // Manually set the session using the tokens from the URL
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (!error) {
            setReady(true);
          } else {
            setError(error.message || "Failed to establish secure session.");
          }
        });
      }
    } else {
      // Also check if we already have a session (user clicked the link)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setSubmitting(false);
  };

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
          <p className="font-sans text-sm text-muted-foreground/60">
            Set your new password
          </p>
        </div>

        {!ready ? (
          <div className="text-center space-y-3">
            <KeyRound className="mx-auto text-muted-foreground/40" size={32} />
            <p className="text-sm font-sans text-muted-foreground">
              Verifying your reset link…
            </p>
          </div>
        ) : success ? (
          <div className="text-center space-y-3">
            <p className="text-sm font-sans text-primary bg-primary/10 rounded-lg px-4 py-3">
              Password updated! Redirecting…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">
                New Password
              </label>
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
            <div>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-card text-foreground font-sans text-sm
                  shadow-card placeholder:text-muted-foreground/40 outline-none
                  transition-shadow duration-300 focus:shadow-card-hover"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm font-sans text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm
                tracking-wide transition-all duration-200 hover:brightness-95 active:scale-[0.98]
                disabled:opacity-50 shadow-card"
            >
              {submitting ? "..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-center font-sans text-sm text-muted-foreground">
          <button onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
