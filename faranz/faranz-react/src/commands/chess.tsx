import { registerCommand } from './registry';

const CHESS_URL = '/chess/';

registerCommand('chess', () => {
  // short pause so the message is visible before the page changes
  setTimeout(() => window.location.assign(CHESS_URL), 500);
  return {
    output: [
      <span className="c-accent2">Opening the chess opening trainer...</span>,
      <span className="c-dimmed">
        London System and Italian Game: lessons, drills, memory training and practice matches.
      </span>,
      <span>
        Not redirected?{' '}
        <a href={CHESS_URL} className="cmd-link">
          {CHESS_URL}
        </a>
      </span>,
    ],
  };
});
