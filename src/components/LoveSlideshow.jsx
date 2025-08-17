import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Layout (mobile-first) */
const Wrapper = ({ children }) => (
  <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-pink-50 text-slate-800 flex items-stretch justify-center p-3 sm:p-4">
    <div className="w-full max-w-4xl rounded-2xl shadow-xl bg-white/90 backdrop-blur p-4 xs:p-5 sm:p-6 md:p-8 border border-rose-100 relative">
      {children}
    </div>
  </div>
);

const Header = ({ step, total }) => (
  <div className="flex items-center justify-between mb-4">
    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
      OneSixZeroEight 🌻🐝
    </h1>
    <div className="text-xs xs:text-sm font-medium text-rose-500">
      {step + 1} / {total}
    </div>
  </div>
);

/** Nav: Next supports disabled state */
const Nav = ({ onPrev, onNext, canNext = true, nextLabel = "Next" }) => (
  <div className="mt-6 flex items-center justify-between gap-3">
    <button
      onClick={onPrev}
      className="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 shadow active:scale-[0.99]"
      aria-label="Previous slide"
      type="button"
    >
      Back
    </button>

    <button
      onClick={canNext ? onNext : undefined}
      disabled={!canNext}
      className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-xl transition shadow ${
        canNext
          ? "bg-rose-500 hover:bg-rose-600 text-white"
          : "bg-slate-200 text-slate-400 cursor-not-allowed"
      } active:scale-[0.99]`}
      aria-label="Next slide"
      type="button"
    >
      {nextLabel}
    </button>
  </div>
);

/** --- Local image helper: tries .jpg -> .jpeg -> .png -> .webp --- */
function useBestLocalImage(seed, imageUrl) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (imageUrl) {
      setSrc(imageUrl);
      return;
    }
    if (!seed) {
      setSrc(null);
      return;
    }

    let cancelled = false;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
    const candidates = [
      `${base}images/${seed}.jpg`,
      `${base}images/${seed}.jpeg`,
      `${base}images/${seed}.png`,
      `${base}images/${seed}.webp`,
    ];

    const tryNext = (i) => {
      if (cancelled || i >= candidates.length) {
        setSrc(null);
        return;
      }
      const img = new Image();
      img.onload = () => !cancelled && setSrc(candidates[i]);
      img.onerror = () => tryNext(i + 1);
      img.src = candidates[i];
    };

    tryNext(0);
    return () => { cancelled = true; };
  }, [seed, imageUrl]);

  return src;
}

/** Frame: preserve original aspect ratio (no cropping) */
const SlideFrame = ({ children, imageSeed, caption, imageUrl }) => {
  const localSrc = useBestLocalImage(imageSeed, imageUrl);
  const fallback = imageSeed
    ? `https://picsum.photos/seed/${imageSeed}/1200/800`
    : null;

  // No image scenario (e.g., video slide)
  if (imageSeed === null && !imageUrl) {
    return (
      <div>
        {children}
        {caption ? <p className="text-xs text-center mt-2 text-slate-500">{caption}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
      <div className="order-2 md:order-1">{children}</div>

      <div className="order-1 md:order-2 w-full">
        {/* Center the image; contain it so it never crops. Letterboxes if needed. */}
        <div className="w-full rounded-xl shadow border border-slate-100 bg-white overflow-hidden grid place-items-center p-2">
          <img
            src={localSrc || fallback}
            alt={caption || ""}
            loading="lazy"
            className="block max-w-full h-auto object-contain max-h-[60vh] md:max-h-[520px]"
            onError={(e) => {
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>
        {caption ? <p className="text-xs text-center mt-2 text-slate-500">{caption}</p> : null}
      </div>
    </div>
  );
};

/** Reusable Emoji Confetti (animates down; can be fullscreen) */
const Confetti = ({ durationSeconds = 5, count = 120, fullscreen = false, className = "" }) => {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const total = count;
    const height = window.innerHeight || document.documentElement.clientHeight;
    const nodes = [];
    for (let i = 0; i < total; i++) {
      const span = document.createElement("span");
      span.textContent = Math.random() < 0.5 ? "❤️" : "✨";
      span.style.position = "absolute";
      span.style.left = Math.random() * 100 + "%";
      span.style.top = "-20px";
      span.style.fontSize = Math.random() * 18 + 12 + "px";
      span.style.willChange = "transform, opacity";
      const startRot = (Math.random() * 60 - 30).toFixed(1);
      span.style.transform = `translateY(0px) rotate(${startRot}deg)`;
      const fall = height + 120 + Math.random() * 60;
      const rot = 540 + Math.random() * 360;
      const dur = 3.6 + Math.random() * 2.2;
      const delay = Math.random() * 0.6;
      span.style.transition = `transform ${dur}s cubic-bezier(.22,.61,.36,1), opacity 0.5s`;
      span.style.transitionDelay = `${delay}s`;
      span.style.opacity = "1";

      nodes.push(span);
      container.appendChild(span);

      requestAnimationFrame(() => {
        span.style.transform = `translateY(${fall}px) rotate(${rot}deg)`;
      });
    }
    const t = setTimeout(() => {
      nodes.forEach((n) => (n.style.opacity = "0"));
    }, durationSeconds * 1000);
    return () => clearTimeout(t);
  }, [durationSeconds, count]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${fullscreen ? "fixed" : "absolute"} inset-0 overflow-hidden ${className}`}
    />
  );
};

/** Mini-game: Pop Hearts — float/wobble + pop animation */
const HeartsGame = ({ target = 5, onComplete }) => {
  const [popped, setPopped] = useState(0);
  const [removed, setRemoved] = useState({});
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 82 + 4,
        top: Math.random() * 52 + 12,
        size: Math.random() * 30 + 30,
        driftDur: 3.2 + Math.random() * 2.4,
        wobbleDur: 2.0 + Math.random() * 1.6,
        delay: Math.random() * 0.8
      })),
    []
  );

  useEffect(() => {
    if (popped >= target) {
      const t = setTimeout(() => onComplete?.(), 400);
      return () => clearTimeout(t);
    }
  }, [popped, target, onComplete]);

  const handlePop = (id) => {
    if (removed[id]) return;
    setRemoved((r) => ({ ...r, [id]: true }));
    setPopped((x) => Math.min(target, x + 1));
  };

  return (
    <div className="relative h-64 sm:h-72 border rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden touch-none">
      <p className="absolute left-3 top-3 text-sm font-medium text-rose-600 z-10">
        Pop {target} hearts ({popped}/{target})
      </p>

      {/* subtle animated glow */}
      <motion.div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-rose-200/40 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -10, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-pink-200/40 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 10, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {hearts.map((h) => {
        const isGone = removed[h.id];
        return (
          <motion.button
            key={h.id}
            onClick={() => handlePop(h.id)}
            onTouchStart={() => handlePop(h.id)}
            className="absolute select-none"
            style={{ left: `${h.left}%`, top: `${h.top}%` }}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={
              isGone
                ? { scale: 0, opacity: 0, rotate: 20 }
                : {
                    opacity: 1,
                    scale: [1, 1.08, 1],
                    rotate: [0, 4, -4, 0],
                    y: [0, -10, 0]
                  }
            }
            transition={
              isGone
                ? { duration: 0.25 }
                : {
                    scale: { duration: h.wobbleDur, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: h.wobbleDur * 1.1, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: h.driftDur, repeat: Infinity, ease: "easeInOut", delay: h.delay },
                    opacity: { duration: 0.4, delay: h.delay }
                  }
            }
          >
            <motion.span
              whileTap={{ scale: 0.85, rotate: -10 }}
              className="text-rose-500 drop-shadow"
              style={{ fontSize: h.size }}
            >
              ❤️
            </motion.span>
          </motion.button>
        );
      })}

      {popped >= target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 grid place-items-center bg-white/50 backdrop-blur-sm"
        >
          <span className="px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 border border-emerald-200 shadow">
            Unlocked ✨
          </span>
        </motion.div>
      )}
    </div>
  );
};

/** Mini-interaction: Press & Hold (touch + mouse) */
const HoldToContinue = ({ seconds = 2, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);

  const start = () => {
    if (timer.current) return;
    const started = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / (seconds * 1000));
      setProgress(p);
      if (p >= 1) {
        clearInterval(timer.current);
        timer.current = null;
        onComplete?.();
      }
    }, 16);
  };
  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setProgress(0);
  };

  return (
    <div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-rose-500"
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "tween", duration: 0.16 }}
        />
      </div>
      <button
        className="mt-3 w-full py-4 sm:py-3 rounded-xl bg-rose-500 text-white font-medium shadow hover:bg-rose-600 active:scale-[0.99]"
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        type="button"
      >
        Press & hold for {seconds}s
      </button>
    </div>
  );
};

/** Mini-game: Drag stickers (also lets you tap to drop on mobile) */
const DragStickers = ({ count = 3, onComplete }) => {
  const [dropped, setDropped] = useState(0);
  const [bag, setBag] = useState(["💘", "🌹", "🎂", "💍", "✨"]);
  const required = bag.slice(0, count);

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (required.includes(data)) {
      setDropped((n) => Math.min(count, n + 1));
      setBag((list) => list.filter((x) => x !== data));
    }
  };

  const tapDrop = (it) => {
    if (required.includes(it)) {
      setDropped((n) => Math.min(count, n + 1));
      setBag((list) => list.filter((x) => x !== it));
    }
  };

  useEffect(() => {
    if (dropped >= count) onComplete?.();
  }, [dropped, count, onComplete]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border bg-slate-50">
        {bag.map((it, idx) => (
          <motion.div
            key={idx}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", it)}
            onClick={() => tapDrop(it)}
            className="text-3xl cursor-grab select-none active:scale-95"
            role="button"
            aria-label={`Sticker ${it}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {it}
          </motion.div>
        ))}
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-6 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50 flex flex-col items-center justify-center min-h-32"
      >
        <p className="text-sm text-rose-700">
          Drop or tap {count} love stickers here ({dropped}/{count})
        </p>
      </div>
    </div>
  );
};

/** Mini-challenge: Date riddle */
const DateRiddle = ({ onSolved }) => {
  const [val, setVal] = useState("");
  const [ok, setOk] = useState(false);

  const check = (s) => {
    const v = s.trim().toLowerCase();
    const patterns = [
      /^(2017-08-16)$/,
      /^(16[\/\-.]0?8[\/\-.]2017)$/,
      /^(0?8[\/\-.]16[\/\-.]2017)$/,
      /^(aug(ust)?\s+16,?\s*2017)$/,
      /^(16\s+aug(ust)?\s*2017)$/
    ];
    return patterns.some((p) => p.test(v));
  };

  useEffect(() => {
    if (ok) onSolved?.();
  }, [ok, onSolved]);

  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">
        Riddle: <span className="italic">“The day our forever started. (use the format: YYYY-MM-DD)”</span>
      </p>
      <div className="flex gap-2 items-stretch">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          inputMode="text"
          className="flex-1 px-3 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-300"
          aria-label="Enter our start date"
        />
        <button
          onClick={() => setOk(check(val))}
          className="px-4 py-3 rounded-xl bg-slate-900 text-white active:scale-[0.99]"
          type="button"
        >
          Check
        </button>
      </div>
      {ok ? (
        <p className="mt-2 text-emerald-600 text-sm">Perfect memory! 💖</p>
      ) : val ? (
        <p className="mt-2 text-rose-600 text-sm">keep trying babo 👀</p>
      ) : null}
    </div>
  );
};

/** Mini-challenge: Type the word */
const TypeToContinue = ({ word = "forever", onSolved }) => {
  const [val, setVal] = useState("");
  useEffect(() => {
    if (val.trim().toLowerCase() === word.toLowerCase()) onSolved?.();
  }, [val, word, onSolved]);
  return (
    <div>
      <label className="text-sm text-slate-600">
        *In whispering voice* hey 👀 type <span className="font-semibold underline decoration-rose-300">{word}</span> to continue:
      </label>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="mt-2 w-full px-3 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-300"
        aria-label={`Type the word ${word}`}
      />
    </div>
  );
};

const slides = [
  {
    key: "s1",
    seed: "slide1",
    title: "Eight Years Today",
    caption: "A new chapter every day",
    content: (
      <p>
        We started this thingy going on <span className="font-semibold">August 16, 2017</span> 🥰. Eight years later, my
        favorite thing everyday is still "us" doing silly shit. Today, this little thing I worked for is my kinda my surprise for you (GPT helped hehe, developer life is long gone 😔) — a walk through memories,
        laughs, and all the tiny moments <span className="font-semibold"> I never want to forget</span>.
      </p>
    ),
    game: null
  },
  {
    key: "s2",
    seed: "slide2",
    title: "Collect a Little Love",
    caption: "KISS ME and send me hearts 💕",
    content: (
      <p>
        Before we go on, catch a few hearts for me will ya? 😉 Just like
        our memories, they keep floating back to <b>us</b>.
      </p>
    ),
    game: (unlock) => <HeartsGame target={5} onComplete={unlock} />
  },
  {
    key: "s3",
    seed: "slide3",
    title: "Hold on no matter what!",
    caption: "We stronk together hehe",
    content: (
      <p>
        Some things are better when you <b>hold on</b> 💪. Press and hold the button until it fills — like all the little moments (good or bad)
        that fill our days.
      </p>
    ),
    game: (unlock) => <HoldToContinue seconds={2} onComplete={unlock} />
  },
  {
    key: "s4",
    seed: "slide4",
    title: "Our Day One",
    caption: "The very first day we met 🥹",
    content: <p>A tiny question for a giant memory 🤔. Enter the day our <b>forever</b> thingy began and unlock the path ahead. (There is no way you get this wrong LOL)</p>,
    game: (unlock) => <DateRiddle onSolved={unlock} />
  },
  {
    key: "s5",
    seed: "slide5",
    title: "Stick With Me",
    caption: "A perfect match 👀",
    content: <p>Drag three love stickers into our album. Simple, silly, and a little like <b>us</b>. You are not limited to just choose 3 btw hehe 😏.</p>,
    game: (unlock) => <DragStickers count={3} onComplete={unlock} />
  },
  {
    key: "s6",
    seed: "slide6",
    title: "Survival",
    caption: "We made it through, didn't we?",
    content: (
      <p>
        We’ve been across continents for 8 years now but <b>we still survived and made moments</b> — from ordinary days to little adventures. Here’s to how you make every
        place feel like home ❤️ — no matter the distance.
      </p>
    ),
    game: null
  },
  {
    key: "s7",
    seed: "slide7",
    title: "Say the Magic Word",
    caption: "A promise in one word",
    content: (
      <p>
        There’s a word I whisper to myself whenever I think about us. Type it to continue: it’s how long I want to love
        you. 
      </p>
    ),
    game: (unlock) => <TypeToContinue word="forever" onSolved={unlock} />
  },
  {
    key: "s8_poem",
    seed: "slide8", /* matches public/images/slide8.jpg */
    title: "Forever & Always — A Poem",
    caption: "Words from my ❤️",
    content: (
      <div className="text-sm sm:text-base leading-7 sm:leading-8">
        <p>
          Holding your hand through the years,<br/>
          Wiping away each other’s tears.<br/>
          Eight years since our story began,<br/>
          Ever since, we’ve walked hand in hand.
        </p>

        <p className="mt-3">
          Through distance, laughter, and sleepless nights,<br/>
          We’ve been each other’s calm and light.<br/>
          Your smile still feels like home to me,<br/>
          Your love, my sweetest destiny.
        </p>

        <p className="mt-3">
          We’ve grown, we’ve changed, yet stayed the same,<br/>
          Two souls forever in love’s warm flame.<br/>
          We’ve seen storms and sunny skies,<br/>
          But my heart still melts when I see your eyes.
        </p>

        <p className="mt-3">
          You are my lover, my best friend too,<br/>
          My safe place, my forever view.<br/>
          I promise each day to love you more,<br/>
          To keep building the life we’ve dreamed before.
        </p>

        <p className="mt-3">
          Though miles may sometimes keep us apart,<br/>
          You’re always right here, close to my heart.<br/>
          And with each sunrise, I still find it true<br/>
          Forever and always, I love you.
        </p>
      </div>
    ),
    game: null
  },
  {
    key: "s9",
    seed: "slide9",
    title: "Eight Years & Always",
    caption: "You + Me",
    content: (
      <div>
        <p className="mb-3">
          Eight years behind, a lifetime ahead. Thank you for your patience, your laughs, your hand in mine. I love you
          — today, tomorrow, and every ordinary day in between.
        </p>
        <p className="mb-3">
            Here’s to the little things that make us, us. From our silly inside jokes to the way you always know how to
            make me smile, I cherish every moment we share. You are my favorite person, my partner in crime, and my
            forever love.
        </p>
        <p className="text-rose-600 font-semibold">Happy 8 year anniversary bummy boob ❤️</p>
      </div>
    ),
    game: null
  },
  /* Final video slide (YouTube Short) */
  {
    key: "s10_video",
    seed: null, // no image — renders full-width content
    title: "One Last Thing",
    caption: "A memory to play",
    content: (
      <div>
        <p className="mb-3 text-slate-700">
          Hit play — just my fav video you made that reminds me of us. 💖
        </p>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 shadow">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/MCR-Y032Lm4?rel=0&modestbranding=1&playsinline=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    ),
    game: null
  }
];

export default function LoveSlideshow() {
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState({});
  const [canProceed, setCanProceed] = useState(true); // controls Next enabled/disabled
  const [burst, setBurst] = useState(false); // transient confetti burst overlay
  const total = slides.length;

  const current = slides[step];

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const triggerBurst = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), 2600);
  };

  const handleNext = () => {
    if (!canProceed) return;

    // Burst when leaving the "forever" slide
    if (current.key === "s7" && unlocked[current.key]) {
      triggerBurst();
    }

    // Replay from the start on last slide
    if (step === total - 1) {
      setStep(0);
      setUnlocked({});
      setCanProceed(true);
      return;
    }

    setStep((s) => Math.min(total - 1, s + 1));
  };

  const onUnlock = (k) => {
    setUnlocked((u) => ({ ...u, [k]: true }));
    setCanProceed(true); // enable Next when activity done
  };

  // Reset Next enabled/disabled whenever slide changes
  useEffect(() => {
    if (current.game) {
      setCanProceed(!!unlocked[current.key]);
    } else {
      setCanProceed(true);
    }
  }, [current, unlocked]);

  const showFinale = step === total - 1;

  return (
    <Wrapper>
      {/* Burst overlay (plays on Next from slide 7) */}
      {burst && <Confetti durationSeconds={2.4} count={140} fullscreen className="z-[60]" />}

      {/* Finale overlay on very last slide (video) */}
      {showFinale && <Confetti durationSeconds={5} count={160} fullscreen className="z-[50]" />}

      <Header step={step} total={total} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-2">
            <span className="inline-flex items-center gap-2 text-xs xs:text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-full">
              🎉 Celebrating 8 years of love, happiness, fun, sadness, anger and what else? 😏
            </span>
          </div>

          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-3">{current.title}</h2>

          <div className="relative">
            <SlideFrame imageSeed={current.seed} caption={current.caption}>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                {current.content}
                {current.game && (
                  <div className="pt-2">
                    {current.game(() => onUnlock(current.key))}
                  </div>
                )}
              </div>
            </SlideFrame>
          </div>

          <Nav
            onPrev={goPrev}
            onNext={handleNext}
            canNext={canProceed}
            nextLabel={step === total - 1 ? "Replay" : "Next"}
          />
        </motion.div>
      </AnimatePresence>

      <footer className="mt-6 text-xs text-center text-slate-500">
        <b>Built with </b>❤️ — teejay 🐸 (2025-Aug)
      </footer>
    </Wrapper>
  );
}
