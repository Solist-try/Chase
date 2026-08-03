import type { DialogueLine } from '@characters/NPC';
import { Button } from './Button';
import './ui.css';

interface DialogueBoxProps {
  lines: DialogueLine[];
  index: number;
  onNext: () => void;
  onClose: () => void;
}

export function DialogueBox({ lines, index, onNext, onClose }: DialogueBoxProps) {
  const line = lines[index];
  if (!line) return null;

  const isLast = index >= lines.length - 1;

  return (
    <div className="dialogue" role="dialog" aria-live="polite">
      <p className="dialogue__speaker">{line.speaker}</p>
      <p className="dialogue__text">{line.text}</p>
      <div className="dialogue__actions">
        {isLast ? (
          <Button onClick={onClose}>Got it!</Button>
        ) : (
          <Button onClick={onNext}>Next</Button>
        )}
      </div>
    </div>
  );
}
