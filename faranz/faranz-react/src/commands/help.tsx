import { registerCommand } from './registry';

const gameCommands = [
  ['games', 'List & launch terminal games'],
];

const portfolioCommands = [
  ['about', 'Who I am — bio, portrait, quick stats'],
  ['experience', 'Work history and roles'],
  ['projects', 'Selected projects ("projects <n>" for details)'],
  ['skills', 'Tech stack and tools'],
  ['education', 'Academic background'],
  ['contact', 'Social links and email'],
  ['cv', 'Open my CV in a new tab'],
  ['chess', 'Open my chess opening trainer'],
  ['theme', 'Switch terminal color theme'],
];

const shellCommands = [
  ['neofetch', 'System info summary'],
  ['matrix', 'Matrix rain effect'],
  ['whoami', 'Print current user'],
  ['cat', 'Print file contents'],
  ['ls', 'List directory contents'],
  ['clear', 'Clear the terminal (or Ctrl+L)'],
  ['history', 'Show command history'],
  ['help', 'Show this message'],
];

function Section({ title, commands }: { title: string; commands: string[][] }) {
  return (
    <>
      <div style={{ marginBottom: '4px' }}><span className="c-accent3">{title}</span></div>
      <table className="cmd-table">
        <tbody>
          {commands.map(([cmd, desc]) => (
            <tr key={cmd}>
              <td><span className="c-accent1">{cmd}</span></td>
              <td><span className="c-dimmed">{desc}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

registerCommand('help', () => ({
  output: [
    <div className="cmd-header">Available Commands</div>,
    <Section title="Portfolio" commands={portfolioCommands} />,
    <span>{''}</span>,
    <Section title="Games" commands={gameCommands} />,
    <span>{''}</span>,
    <Section title="Shell" commands={shellCommands} />,
    <span>{''}</span>,
    <div className="c-dimmed">
      <div>Shortcuts: <span className="c-accent3">Tab</span> autocomplete · <span className="c-accent3">→</span> accept hint · <span className="c-accent3">↑↓</span> history</div>
      <div style={{ marginLeft: '70px' }}><span className="c-accent3">Ctrl+C</span> cancel · <span className="c-accent3">Ctrl+L</span> clear · <span className="c-accent3">Ctrl+U</span> clear line</div>
    </div>,
    <div className="c-dimmed" style={{ opacity: 0.5, fontSize: '12px' }}>
      Also available: cd, pwd, nano, touch, mkdir, rm, grep, echo, date, uname, hostname, which
    </div>,
  ],
}));
