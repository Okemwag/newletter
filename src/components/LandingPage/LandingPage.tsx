import { Hero } from '../Hero/Hero';
import { Features } from '../Features/Features';
import { NewsletterPreview } from '../NewsletterPreview/NewsletterPreview';
import { SocialProof } from '../SocialProof/SocialProof';
import { SubscriptionForm } from '../SubscriptionForm/SubscriptionForm';
import { Footer } from '../Footer/Footer';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className="landing-page">
      <Hero />
      <Features />
      <NewsletterPreview />
      <SocialProof />
      <SubscriptionForm />
      <Footer />
    </div>
  );
}