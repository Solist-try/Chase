import './StoryIntro.css';

interface StoryIntroProps {
  dragonName?: string;
  onNext: () => void;
}

const STORY =
  'Once upon a rainbow, a tiny dragon called Cruul set out to explore magical lands…';

export function StoryIntro({ dragonName = 'Cruul', onNext }: StoryIntroProps) {
  return (
    <section className="story-intro" aria-labelledby="story-intro-title">
      <div className="story-intro__sky" aria-hidden="true">
        <span className="story-intro__arc" />
        <span className="story-intro__cloud story-intro__cloud--a" />
        <span className="story-intro__cloud story-intro__cloud--b" />
        <span className="story-intro__hill" />
      </div>

      <div className="story-intro__stage">
        <p className="story-intro__chapter">Chapter 1</p>
        <h1 id="story-intro-title" className="story-intro__brand">
          Dragon Adventure!
        </h1>

        <div className="story-intro__dragon" aria-hidden="true">
          <span className="story-intro__wing story-intro__wing--left" />
          <span className="story-intro__body" />
          <span className="story-intro__belly" />
          <span className="story-intro__head" />
          <span className="story-intro__eye story-intro__eye--left" />
          <span className="story-intro__eye story-intro__eye--right" />
          <span className="story-intro__wing story-intro__wing--right" />
          <span className="story-intro__sparkle story-intro__sparkle--a" />
          <span className="story-intro__sparkle story-intro__sparkle--b" />
        </div>

        <p className="story-intro__story">{STORY}</p>
        <p className="story-intro__aside">
          Ready, {dragonName}? Your first magical land awaits!
        </p>

        <button type="button" className="story-intro__next" onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}
