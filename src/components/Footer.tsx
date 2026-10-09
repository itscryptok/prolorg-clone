import { Link } from "wouter";

const NAV_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Feed", to: "/" },
  { label: "Search", to: "/search" },
  { label: "Activity", to: "/activity" },
  { label: "Login", to: "/sign-in" },
  { label: "Sign Up", to: "/sign-up" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
      <p className="mb-0.5">
        Product of{" "}
        <a
          href="https://cryptok.online"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          Cryp Tok Solutions
        </a>
        {" "}2026
      </p>
      <p className="mb-1 text-xs">© Cryptok Solutions 2026</p>
      <p className="mb-5">
        <a
          href="https://x.com/itsCryp_Tok"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </p>
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className="hover:text-foreground transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground/70">
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
      </div>
    </footer>
  );
}
