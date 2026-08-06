import { registerCommand } from './registry';
import { asciiArt } from '../data/ascii-art';

registerCommand('about', () => ({
  output: [
    <div className="about-layout">
      <pre className="ascii-art c-accent1 about-art">
        {asciiArt}
      </pre>
      <div className="about-info">
        <div className="cmd-header">Faran Zafar</div>
        <span>
          <span className="c-accent3">AI/ML Engineer</span> ·{' '}
          <span className="c-accent3">Founder</span> ·{' '}
          <span className="c-accent3">Builder</span>
        </span>
        <div style={{ marginTop: '12px' }}>
          Specialized in multi-agent orchestration, RAG architectures, and production
          LLM systems for enterprise applications.{' '}
          <span className="c-accent4">6x Hackathon Winner</span> with a First Class
          Honours in Computer Science.
        </div>
        <table className="cmd-table" style={{ marginTop: '16px' }}>
          <tbody>
            <tr>
              <td><span className="c-accent2">Currently</span></td>
              <td>Machine Learning Engineer @ RealityMine</td>
            </tr>
            <tr>
              <td><span className="c-accent2">Building</span></td>
              <td>Acumei — AI automation for British SMEs</td>
            </tr>
            <tr>
              <td><span className="c-accent2">Previously</span></td>
              <td>Research Intern @ Google DeepMind</td>
            </tr>
            <tr>
              <td><span className="c-accent2">Education</span></td>
              <td>BSc Computer Science, First Class Honours — Aston University</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>,
  ],
}));
