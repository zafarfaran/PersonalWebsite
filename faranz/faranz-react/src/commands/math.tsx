import { registerCommand } from './registry';

const MATH_URL = '/math/';

registerCommand('math', () => {
  // short pause so the message is visible before the page changes
  setTimeout(() => window.location.assign(MATH_URL), 500);
  return {
    output: [
      <span className="c-accent2">Opening the mental math trainer...</span>,
      <span className="c-dimmed">
        Arithmetic shortcuts one at a time: lessons, practice, 60-second sprints and memory cards.
      </span>,
      <span>
        Not redirected?{' '}
        <a href={MATH_URL} className="cmd-link">
          {MATH_URL}
        </a>
      </span>,
    ],
  };
});
