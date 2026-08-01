import { useMemo, useState, type CSSProperties } from 'react';
import {
  DEFAULT_DRAGON_LOOK,
  DRAGON_ACCESSORIES,
  DRAGON_COLOR_PRESETS,
  MAX_DRAGON_NAME_LENGTH,
  getColorPreset,
  sanitizeDragonName,
  type DragonAccessoryId,
  type DragonColorId,
  type DragonLook,
} from '@characters/dragonLooks';
import './CustomizeScreen.css';

interface CustomizeScreenProps {
  initialLook?: DragonLook;
  onConfirm: (look: DragonLook) => void;
  onBack: () => void;
}

export function CustomizeScreen({
  initialLook = DEFAULT_DRAGON_LOOK,
  onConfirm,
  onBack,
}: CustomizeScreenProps) {
  const [name, setName] = useState(initialLook.name);
  const [colorId, setColorId] = useState<DragonColorId>(initialLook.colorId);
  const [accessoryId, setAccessoryId] = useState<DragonAccessoryId>(
    initialLook.accessoryId,
  );

  const palette = useMemo(() => getColorPreset(colorId), [colorId]);
  const accessory = DRAGON_ACCESSORIES.find((item) => item.id === accessoryId);

  const previewStyle = {
    '--preview-body': palette.body,
    '--preview-belly': palette.belly,
    '--preview-crest': palette.crest,
    '--preview-wing': palette.wing,
    '--preview-accent': palette.accent,
  } as CSSProperties;

  const handlePlay = () => {
    onConfirm({
      name: sanitizeDragonName(name),
      colorId,
      accessoryId,
    });
  };

  return (
    <section className="customize" aria-labelledby="customize-title">
      <div className="customize__sky" aria-hidden="true" />
      <div className="customize__blob customize__blob--a" aria-hidden="true" />
      <div className="customize__blob customize__blob--b" aria-hidden="true" />

      <header className="customize__header">
        <p className="customize__eyebrow">Make it yours</p>
        <h1 id="customize-title" className="customize__title">
          Dress Your Dragon
        </h1>
        <p className="customize__lead">
          Pick a rainbow color, a fun hat, and a name!
        </p>
      </header>

      <div className="customize__layout">
        <div className="customize__preview-wrap">
          <div className="customize__preview" style={previewStyle} aria-hidden="true">
            <div className="customize__preview-wing customize__preview-wing--back" />
            <div className="customize__preview-body">
              <div className="customize__preview-belly" />
            </div>
            <div className="customize__preview-wing customize__preview-wing--front" />
            <div className="customize__preview-head">
              <span className="customize__preview-eye" />
              <span className="customize__preview-eye" />
              <span className="customize__preview-snout" />
              <span className="customize__preview-crest" />
              {accessoryId !== 'none' && (
                <span
                  className={`customize__preview-hat customize__preview-hat--${accessoryId}`}
                  aria-hidden="true"
                >
                  {accessory?.emoji}
                </span>
              )}
            </div>
            <div className="customize__preview-tail" />
          </div>
          <p className="customize__preview-name">{sanitizeDragonName(name)}</p>
        </div>

        <div className="customize__controls">
          <fieldset className="customize__fieldset">
            <legend>Dragon color</legend>
            <div className="customize__swatches" role="listbox" aria-label="Dragon color">
              {DRAGON_COLOR_PRESETS.map((preset) => {
                const selected = preset.id === colorId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`customize__swatch${selected ? ' is-selected' : ''}`}
                    style={
                      {
                        '--swatch-a': preset.body,
                        '--swatch-b': preset.crest,
                        '--swatch-c': preset.wing,
                      } as CSSProperties
                    }
                    onClick={() => setColorId(preset.id)}
                  >
                    <span className="customize__swatch-chip" aria-hidden="true" />
                    <span className="customize__swatch-label">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="customize__fieldset">
            <legend>Hat or accessory</legend>
            <div className="customize__accessories" role="listbox" aria-label="Accessory">
              {DRAGON_ACCESSORIES.map((item) => {
                const selected = item.id === accessoryId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`customize__accessory${selected ? ' is-selected' : ''}`}
                    onClick={() => setAccessoryId(item.id)}
                  >
                    <span className="customize__accessory-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="customize__name-field">
            <span>Dragon name</span>
            <input
              type="text"
              value={name}
              maxLength={MAX_DRAGON_NAME_LENGTH}
              spellCheck={false}
              autoComplete="off"
              placeholder="Sparky"
              onChange={(event) => setName(event.target.value)}
            />
            <small>{name.trim().length}/{MAX_DRAGON_NAME_LENGTH}</small>
          </label>
        </div>
      </div>

      <div className="customize__actions">
        <button type="button" className="customize__btn customize__btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="customize__btn customize__btn--play" onClick={handlePlay}>
          Play as {sanitizeDragonName(name)}!
        </button>
      </div>
    </section>
  );
}
