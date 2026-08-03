/**
 * HomeScreen
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │  Hero      (full-screen intro)  │
 * │  About     (personal bio)       │
 * │  Experience (work history)      │
 * │  Projects  (portfolio items)    │
 * │  Skills    (tech stack)         │
 * │  Education (academic bg)        │
 * │  Contact   (reach out form)     │
 * └─────────────────────────────────┘
 */
import Hero from "./Hero";
import About from "./About";
import Experience from "./Experience";
import Projects from "./Projects";
import Skills from "./Skills";
import Education from "./Education";
import Contact from "./Contact";

export default function HomeScreen() {
  return (
    <div className="flex flex-col">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
    </div>
  );
}
