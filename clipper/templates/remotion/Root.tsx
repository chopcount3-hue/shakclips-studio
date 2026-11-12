import React from 'react';
import {Composition, AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile} from 'remotion';

const fonts = `
@font-face { font-family: 'Anton'; src: url('${staticFile('Anton-Regular.ttf')}'); }
@font-face { font-family: 'Luckiest Guy'; src: url('${staticFile('LuckiestGuy-Regular.ttf')}'); }`;
const GOLD = '#FFD24A', RED = '#E8343A';

// Full-screen kinetic word(s): pops in with a spring, slight shake, gold accent on the last word.
export const WordCard: React.FC<{text: string; bg?: string; accent?: number}> = ({text, bg = '#0B0B0F', accent = -1}) => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 180, mass: 0.6}});
  const out = interpolate(f, [durationInFrames - 5, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = f < 8 ? Math.sin(f * 2.3) * (8 - f) * 1.5 : 0;
  const words = text.split(' ');
  const ai = accent < 0 ? words.length - 1 : accent;
  return (
    <AbsoluteFill style={{backgroundColor: bg, justifyContent: 'center', alignItems: 'center'}}>
      <style>{fonts}</style>
      <div style={{fontFamily: 'Anton', fontSize: words.length > 2 ? 190 : 260, color: 'white', letterSpacing: 4, textTransform: 'uppercase',
        transform: `scale(${0.6 + 0.4 * s}) translateX(${shake}px)`, opacity: out, textShadow: '0 10px 0 rgba(0,0,0,0.6), 0 0 40px rgba(255,210,74,0.15)',
        textAlign: 'center', lineHeight: 1.05, padding: '0 80px'}}>
        {words.map((w, i) => <span key={i} style={{color: i === ai ? GOLD : 'white'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
      </div>
    </AbsoluteFill>
  );
};

// Segment title card: big rank number, streamer name bar, title.
export const TitleCard: React.FC<{rank: string; streamer: string; title: string}> = ({rank, streamer, title}) => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 12, stiffness: 140}});
  const b = spring({frame: f - 6, fps, config: {damping: 12, stiffness: 140}});
  const c = spring({frame: f - 12, fps, config: {damping: 14, stiffness: 120}});
  const out = interpolate(f, [durationInFrames - 6, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 40%, #1d2240 0%, #07080d 70%)', opacity: out}}>
      <style>{fonts}</style>
      <div style={{position: 'absolute', left: 140, top: 250, fontFamily: 'Anton', fontSize: 420, color: GOLD, lineHeight: 1,
        transform: `translateX(${(1 - a) * -500}px)`, textShadow: '0 14px 0 #7a5a10'}}>{rank}</div>
      <div style={{position: 'absolute', left: 620, top: 360, transform: `translateX(${(1 - b) * 1400}px)`}}>
        <div style={{display: 'inline-block', background: RED, color: 'white', fontFamily: 'Anton', fontSize: 70, padding: '6px 28px',
          letterSpacing: 3, textTransform: 'uppercase'}}>{streamer}</div>
      </div>
      <div style={{position: 'absolute', left: 620, top: 480, width: 1180, fontFamily: 'Luckiest Guy', fontSize: 110, color: 'white',
        lineHeight: 1.05, transform: `translateY(${(1 - c) * 60}px)`, opacity: c, textShadow: '0 8px 0 rgba(0,0,0,0.7)'}}>{title}</div>
    </AbsoluteFill>
  );
};

// Transparent lower-third name tag (render with alpha and overlay on a clip).
export const NameTag: React.FC<{name: string; sub?: string}> = ({name, sub = ''}) => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 13, stiffness: 160}});
  const out = interpolate(f, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: 'transparent'}}>
      <style>{fonts}</style>
      <div style={{position: 'absolute', left: 70, bottom: 120, transform: `translateX(${(1 - a) * -700}px)`, opacity: out}}>
        <div style={{background: RED, color: 'white', fontFamily: 'Anton', fontSize: 64, padding: '4px 26px', letterSpacing: 2, textTransform: 'uppercase'}}>{name}</div>
        {sub ? <div style={{background: 'rgba(0,0,0,0.75)', color: GOLD, fontFamily: 'Anton', fontSize: 38, padding: '4px 26px', letterSpacing: 2}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// Shak Replay channel outro (12 s): banner background, logo pop, name, tagline, subscribe click, two "WATCH NEXT" frames
// placed where YouTube's end-screen video elements go (left and right, lower half).
export const Outro: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const pop = spring({frame: f - 4, fps, config: {damping: 8, stiffness: 160, mass: 0.7}});
  const nameIn = spring({frame: f - 12, fps, config: {damping: 12, stiffness: 140}});
  const tagIn = interpolate(f, [24, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boxIn = spring({frame: f - 30, fps, config: {damping: 14, stiffness: 120}});
  const subIn = spring({frame: f - 40, fps, config: {damping: 9, stiffness: 170}});
  const click = f >= 78 && f < 96; const subbed = f >= 84;
  const pulse = 1 + 0.05 * Math.sin(f / 4) * (subbed ? 0 : 1);
  const cursorX = interpolate(f, [56, 80], [1280, 990], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursorY = interpolate(f, [56, 80], [1050, 905], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(f, [0, 360], [1.08, 1.0]);
  const box = (x: number) => (
    <div style={{position: 'absolute', left: x, top: 470, width: 660, height: 372, borderRadius: 26, border: '6px solid rgba(255,255,255,0.9)',
      background: 'rgba(10,6,20,0.55)', boxShadow: '0 0 40px rgba(145,70,255,0.55)', opacity: boxIn, transform: `translateY(${(1 - boxIn) * 60}px)`,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center'}}>
      <div style={{marginTop: -30, background: GOLD, color: '#120a1a', fontFamily: 'Anton', fontSize: 40, padding: '4px 26px', borderRadius: 10, letterSpacing: 2}}>WATCH NEXT</div>
    </div>);
  return (
    <AbsoluteFill style={{background: '#07060c', overflow: 'hidden'}}>
      <style>{fonts}</style>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('shak_banner.jpg')})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: `scale(${zoom})`, filter: 'blur(26px) brightness(0.34) saturate(1.3)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(145,70,255,0.25), rgba(0,0,0,0.65) 75%)'}} />
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
        <img src={staticFile('shak_logo.png')} style={{width: 250, height: 250, borderRadius: '50%', boxShadow: '0 0 0 8px #fff, 0 0 60px rgba(255,79,176,0.8)', transform: `scale(${pop}) rotate(${(1 - pop) * -90}deg)`}} />
        <div style={{transform: `translateX(${(1 - nameIn) * 120}px)`, opacity: nameIn}}>
          <div style={{fontFamily: 'Anton', fontSize: 170, lineHeight: 0.95, color: '#fff', letterSpacing: 6, textShadow: '0 6px 0 #b3122e, 0 12px 0 #5e0818, 0 20px 30px rgba(0,0,0,0.7)'}}>SHAK <span style={{color: GOLD}}>REPLAY</span></div>
          <div style={{fontFamily: 'Anton', fontSize: 44, color: '#fff', letterSpacing: 4, opacity: tagIn, marginTop: 10}}>FOOTBALL DRAMA <span style={{color: RED}}>•</span> GTA 6 CHAOS <span style={{color: RED}}>•</span> FUNNY MOMENTS</div>
        </div>
      </div>
      {box(110)}{box(1150)}
      <div style={{position: 'absolute', left: 960 - 170, top: 860, width: 340, height: 96, borderRadius: 48, background: subbed ? '#3a3a44' : '#E62117',
        color: '#fff', fontFamily: 'Anton', fontSize: 50, letterSpacing: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        transform: `scale(${subIn * pulse * (click ? 0.92 : 1)})`, boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>
        {subbed ? 'SUBSCRIBED' : 'SUBSCRIBE'} <span style={{fontSize: 44}}>🔔</span>
      </div>
      <div style={{position: 'absolute', left: cursorX, top: cursorY, fontSize: 70, opacity: f > 54 && f < 120 ? 1 : 0, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))'}}>👆</div>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition id="Outro" component={Outro} durationInFrames={360} fps={30} width={1920} height={1080} />
    <Composition id="WordCard" component={WordCard} durationInFrames={30} fps={30} width={1920} height={1080} defaultProps={{text: 'NO WAY'}} />
    <Composition id="TitleCard" component={TitleCard} durationInFrames={48} fps={30} width={1920} height={1080}
      defaultProps={{rank: '#5', streamer: 'Kai Cenat', title: 'The Mountain Won'}} />
    <Composition id="NameTag" component={NameTag} durationInFrames={90} fps={30} width={1920} height={1080} defaultProps={{name: 'Kai Cenat', sub: 'twitch.tv/kaicenat'}} />
  </>
);
