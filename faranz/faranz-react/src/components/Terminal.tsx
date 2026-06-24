import { useState, useCallback, type ReactNode } from 'react';
import TitleBar from './TitleBar';
import TabBar from './TabBar';
import OutputArea from './OutputArea';
import PromptInput from './PromptInput';
import BootSequence from './BootSequence';
import NanoEditor from './NanoEditor';
import MatrixRain from './MatrixRain';
import SnakeGame from './SnakeGame';
import PongGame from './PongGame';
import DinoGame from './DinoGame';
import { executeCommand, getCommandNames, type NanoRequest } from '../commands/registry';
import { getThemeById, applyTheme, DEFAULT_THEME_ID } from '../themes/themes';
import { getCwdShort, writeFile } from '../fs/vfs';
import '../commands';

const NAV_TABS = ['about', 'experience', 'projects', 'skills', 'education', 'contact'];

function initTheme() {
  const savedId = localStorage.getItem('terminal-theme') || DEFAULT_THEME_ID;
  const theme = getThemeById(savedId);
  if (theme) applyTheme(theme);
}
initTheme();

export default function Terminal() {
  const [outputLines, setOutputLines] = useState<ReactNode[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [nanoState, setNanoState] = useState<NanoRequest | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showPong, setShowPong] = useState(false);
  const [showDino, setShowDino] = useState(false);

  const runCommand = useCallback((input: string) => {
    const cwdPath = getCwdShort();
    const promptLine = (
      <span className="prompt-line">
        <span className="prompt-user">faran</span>
        <span className="prompt-at">@</span>
        <span className="prompt-host">portfolio</span>
        <span className="prompt-colon">:</span>
        <span className="prompt-path">{cwdPath}</span>
        <span className="prompt-symbol">$ </span>
        <span className="c-fg">{input}</span>
      </span>
    );

    const cmd = input.trim().toLowerCase();

    if (cmd === 'clear') {
      setOutputLines([]);
      setCommandHistory(prev => [...prev, input]);
      setActiveTab(null);
      return;
    }

    if (cmd === 'history') {
      const histLines: ReactNode[] = [
        <div className="cmd-header">Command History</div>,
        ...commandHistory.map((h, i) => (
          <span key={i}>
            <span className="c-dimmed">{String(i + 1).padStart(4, ' ')}  </span>
            <span className="c-fg">{h}</span>
          </span>
        )),
      ];
      setOutputLines(prev => [...prev, promptLine, ...histLines, <span>{''}</span>]);
      setCommandHistory(prev => [...prev, input]);
      return;
    }

    if (cmd === 'cv') {
      window.open('/pdf/cv.pdf', '_blank');
      setOutputLines(prev => [
        ...prev,
        promptLine,
        <span className="c-accent2">Opening CV in a new tab...</span>,
        <span>{''}</span>,
      ]);
      setCommandHistory(prev => [...prev, input]);
      return;
    }

    const result = executeCommand(input);

    // Check if command wants to open nano
    if (result.nano) {
      setOutputLines(prev => [...prev, promptLine]);
      setCommandHistory(prev => [...prev, input]);
      setNanoState(result.nano);
      return;
    }

    if (result.overlay === 'matrix') {
      setShowMatrix(true);
    }
    if (result.overlay === 'snake') {
      setShowSnake(true);
      setCommandHistory(prev => [...prev, input]);
      return;
    }
    if (result.overlay === 'pong') {
      setShowPong(true);
      setCommandHistory(prev => [...prev, input]);
      return;
    }
    if (result.overlay === 'dino') {
      setShowDino(true);
      setCommandHistory(prev => [...prev, input]);
      return;
    }

    const baseName = cmd.split(/\s+/)[0];
    if (NAV_TABS.includes(baseName)) {
      setActiveTab(baseName);
    } else {
      setActiveTab(null);
    }

    setOutputLines(prev => [...prev, promptLine, ...result.output, <span>{''}</span>]);
    setCommandHistory(prev => [...prev, input]);
  }, [commandHistory]);

  const handleBootComplete = useCallback((bootOutput: ReactNode[]) => {
    setOutputLines(bootOutput);
    setBooting(false);
  }, []);

  const handleTabClick = useCallback((tab: string) => {
    runCommand(tab);
  }, [runCommand]);

  const handleNanoSave = useCallback((content: string): string | null => {
    if (!nanoState) return 'No file open';
    return writeFile(nanoState.filePath, content);
  }, [nanoState]);

  const handleNanoExit = useCallback(() => {
    setNanoState(null);
  }, []);

  return (
    <div className="desktop">
      <div className="terminal-window">
        <TitleBar />
        <TabBar tabs={NAV_TABS} activeTab={activeTab} onTabClick={handleTabClick} />
        {showSnake ? (
          <SnakeGame onExit={(finalScore) => {
            setShowSnake(false);
            setOutputLines(prev => [
              ...prev,
              <span className="c-dimmed">snake: game ended with score <span className="c-accent1">{finalScore}</span></span>,
              <span>{''}</span>,
            ]);
          }} />
        ) : showPong ? (
          <PongGame onExit={(p, ai) => {
            setShowPong(false);
            setOutputLines(prev => [
              ...prev,
              <span className="c-dimmed">pong: game ended — you <span className="c-accent1">{p}</span> : <span className="c-accent5">{ai}</span> ai</span>,
              <span>{''}</span>,
            ]);
          }} />
        ) : showDino ? (
          <DinoGame onExit={(score) => {
            setShowDino(false);
            setOutputLines(prev => [
              ...prev,
              <span className="c-dimmed">dino: game ended with score <span className="c-accent1">{score}</span></span>,
              <span>{''}</span>,
            ]);
          }} />
        ) : nanoState ? (
          <div style={{ flex: 1, position: 'relative' }}>
            <NanoEditor
              fileName={nanoState.filePath}
              initialContent={nanoState.initialContent}
              readonly={nanoState.readonly}
              onSave={handleNanoSave}
              onExit={handleNanoExit}
            />
          </div>
        ) : booting ? (
          <BootSequence onComplete={handleBootComplete} />
        ) : (
          <>
            <OutputArea lines={outputLines} />
            <PromptInput
              onSubmit={runCommand}
              onClear={() => setOutputLines([])}
              history={commandHistory}
              commandNames={getCommandNames()}
              cwdPath={getCwdShort()}
            />
          </>
        )}
      </div>
      {showMatrix && (
        <MatrixRain
          duration={8000}
          onComplete={() => setShowMatrix(false)}
          className="matrix-overlay"
        />
      )}
    </div>
  );
}
