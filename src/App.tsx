import { useRunStore } from './store/runStore';
import { SetupScreen } from './components/setup/SetupScreen';
import { RunScreen } from './components/run/RunScreen';
import { CompletionScreen } from './components/completion/CompletionScreen';

function App() {
  const phase = useRunStore(s => s.state.phase);

  if (phase === 'idle') return <SetupScreen />;
  if (phase === 'complete') return <CompletionScreen />;
  return <RunScreen />;
}

export default App;
