import { Apps } from './components/Apps';
import { Community } from './components/Community';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Manifesto } from './components/Manifesto';
import { Pillars } from './components/Pillars';
import { TopBar } from './components/TopBar';
import './landing.css';
import './landing.hero.css';
import './landing.sections.css';

/**
 * The landing, whole.
 *
 * `.landing` is the scope every token and every rule of this page lives in —
 * the brand of the product, not of the kit. See `landing.css` for why that
 * distinction matters.
 */
export function Landing() {
  return (
    <div className="landing">
      <TopBar />

      <main>
        <Hero />
        <Pillars />
        <Apps />
        <Manifesto />
        <Community />
      </main>

      <Footer />
    </div>
  );
}
