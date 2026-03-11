import { useAuth } from "@/hooks/useAuth";
import { getVault } from "@/lib/wordService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, LogOut, User } from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const words = getVault();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const wordCount = words.length;
  const notesCount = words.filter((w) => w.notes.trim().length > 0).length;
  const latestWord = words.length > 0 ? words[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-xl font-semibold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {/* User Info */}
        <div className="rounded-lg bg-card p-6 shadow-card text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
            <User className="text-muted-foreground" size={28} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Wordsmith"}
            </h2>
            <p className="font-sans text-sm text-muted-foreground/60">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-card p-5 shadow-card text-center">
            <p className="font-serif text-3xl font-semibold text-foreground">{wordCount}</p>
            <p className="font-sans text-xs text-muted-foreground/60 tracking-wider uppercase mt-1">Words Saved</p>
          </div>
          <div className="rounded-lg bg-card p-5 shadow-card text-center">
            <p className="font-serif text-3xl font-semibold text-foreground">{notesCount}</p>
            <p className="font-sans text-xs text-muted-foreground/60 tracking-wider uppercase mt-1">With Notes</p>
          </div>
        </div>

        {/* Latest Word */}
        {latestWord && (
          <div className="rounded-lg bg-card p-5 shadow-card">
            <p className="font-sans text-xs text-muted-foreground/50 tracking-wider uppercase mb-2">Latest Addition</p>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary shrink-0" />
              <span className="font-serif text-lg text-foreground">{latestWord.word}</span>
              <span className="text-xs font-sans text-muted-foreground">{latestWord.partOfSpeech}</span>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-card text-destructive font-sans text-sm
            shadow-card transition-all hover:shadow-card-hover"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </main>
    </div>
  );
};

export default Profile;
