import { registerCommand } from './registry';

const ML_URL = '/ml/';

registerCommand('ml', () => {
  // short pause so the message is visible before the page changes
  setTimeout(() => window.location.assign(ML_URL), 500);
  return {
    output: [
      <span className="c-accent2">Opening the machine learning trainer...</span>,
      <span className="c-dimmed">
        A course in ML and AI engineering: live figures, code quizzes, exercises that run in the browser and a notebook for diagrams.
      </span>,
      <span>
        Not redirected?{' '}
        <a href={ML_URL} className="cmd-link">
          {ML_URL}
        </a>
      </span>,
    ],
  };
});
