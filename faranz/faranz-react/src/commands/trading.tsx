import { registerCommand } from './registry';

const TRADING_URL = '/trading/';

registerCommand('trading', () => {
  // short pause so the message is visible before the page changes
  setTimeout(() => window.location.assign(TRADING_URL), 500);
  return {
    output: [
      <span className="c-accent2">Opening the trading trainer...</span>,
      <span className="c-dimmed">
        A course in day trading options from zero: live figures, quizzes, exercises that run in the browser and a notebook. Education, not financial advice.
      </span>,
      <span>
        Not redirected?{' '}
        <a href={TRADING_URL} className="cmd-link">
          {TRADING_URL}
        </a>
      </span>,
    ],
  };
});
