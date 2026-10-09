import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 border-b border-border flex items-center gap-4">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/home")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-7 w-auto" />
            <span className="text-lg font-bold text-primary">Prolorg</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">The Talent stage app</p>
        </div>
      </header>

      <main className="flex-1 w-full md:w-4/5 lg:w-3/5 mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Terms of Use</h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Prolorg (the "Platform"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform. These terms apply to all visitors, registered users, and companies using Prolorg.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">2. Who Can Use Prolorg</h2>
            <p>You must be at least 18 years old to create an account. By registering, you confirm that the information you provide is accurate and that you are authorised to enter into this agreement.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">3. Your Content</h2>
            <p>You retain ownership of the videos and content you upload ("Your Content"). By posting to Prolorg, you grant Cryp Tok Solutions a non-exclusive, royalty-free, worldwide licence to display and deliver Your Content solely for the purpose of operating the Platform. You are solely responsible for ensuring Your Content does not violate any law or third-party rights.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">4. Prohibited Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Post content that is false, misleading, defamatory, or impersonates another person.</li>
              <li>Upload content that is illegal, obscene, or infringes on any intellectual property rights.</li>
              <li>Use the Platform to spam, harass, or harm other users.</li>
              <li>Attempt to reverse engineer, scrape, or disrupt the Platform's infrastructure.</li>
              <li>Create fake profiles or manipulate the feed through automated means.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">5. Account Suspension</h2>
            <p>We reserve the right to suspend or permanently ban any account that violates these Terms or that we determine, in our sole discretion, is harmful to the Platform or its users. No refund will be issued for banned accounts.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">6. Intellectual Property</h2>
            <p>All Platform design, code, trademarks, and branding belong to Cryp Tok Solutions. You may not copy, reproduce, or distribute any part of the Platform without our written permission.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">7. Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be uninterrupted, error-free, or that any particular outcome will result from its use.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Cryp Tok Solutions shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">9. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-2">10. Contact</h2>
            <p>Questions about these Terms? Reach us at <a href="https://cryptok.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cryptok.online</a> or via the <button onClick={() => setLocation("/report-issue")} className="text-primary hover:underline">feedback form</button>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
