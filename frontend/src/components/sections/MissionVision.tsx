import { useMemo, useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sceneImages, getHeroImageUrl } from '../../data/peaks';

const BACKDROP = sceneImages.missionDay;
// Dark mode swaps in a night range; the hidden one never loads because both are lazy
const NIGHT_BACKDROP = sceneImages.missionNight;

/** One word of a statement that brightens from dim to full as scroll passes its slot in `range`. */
const Word = ({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) => {
    const opacity = useTransform(progress, range, [0.16, 1]);
    return (
        <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
            {children}
        </motion.span>
    );
};

/** A statement whose words light up one after another across the scroll window [from, to]. */
const Statement = ({ text, progress, from, to }: { text: string; progress: MotionValue<number>; from: number; to: number }) => {
    const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
    const step = (to - from) / Math.max(words.length, 1);
    return (
        <p className="font-serif text-white text-[1.7rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-6xl md:leading-[1.12] max-w-5xl [text-shadow:0_4px_30px_rgba(0,0,0,0.45)]">
            {words.map((w, i) => (
                <Word key={i} progress={progress} range={[from + i * step, from + (i + 1) * step]}>{w}</Word>
            ))}
        </p>
    );
};

/** Chapter heading: oversized index numeral, an accent rule and the title set large in the accent colour. */
const Chapter = ({ index, title, accent, rule }: { index: string; title: string; accent: string; rule: string }) => (
    <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
        <span className={`font-serif italic text-4xl md:text-6xl leading-none ${accent} [text-shadow:0_0_30px_currentColor]`}>{index}</span>
        <span className={`h-[2px] w-10 md:w-20 rounded-full ${rule}`} />
        <h2 className={`font-display text-lg sm:text-xl md:text-3xl font-bold uppercase tracking-[0.28em] ${accent} [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]`}>{title}</h2>
    </div>
);

/**
 * Pinned "scrollytelling" chapter. The section is ~3 screens tall; its inner stage sticks to the
 * viewport while the backdrop slowly pushes in, the mission statement lights up word by word,
 * then hands over to the vision. The photo frame irises open on the way in and closed on the way
 * out. Requires no overflow:hidden ancestor (Home/App use overflow-clip) so position:sticky works.
 */
export const MissionVision = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

    const imageScale = useTransform(p, [0, 1], [1.06, 1.34]);
    const imageY = useTransform(p, [0, 1], ['0%', '-5%']);
    const frame = useTransform(p, [0, 0.1, 0.9, 1], [1, 0, 0, 1]);
    const clipPath = useTransform(frame, f => (f <= 0 ? 'none' : `inset(${(f * 7).toFixed(2)}% ${(f * 4).toFixed(2)}% round ${(f * 36).toFixed(1)}px)`));

    const missionOpacity = useTransform(p, [0, 0.44, 0.52], [1, 1, 0]);
    const missionY = useTransform(p, [0.44, 0.52], [0, -48]);
    const visionOpacity = useTransform(p, [0.5, 0.58], [0, 1]);
    const visionY = useTransform(p, [0.5, 0.58], [48, 0]);
    const chapter2 = useTransform(p, [0.5, 0.58], [0, 1]);
    const chapter1 = useTransform(chapter2, v => 1 - v);

    const missionTitle = t('mission.title', 'OUR MISSION');
    const visionTitle = t('mission.vision_title', 'OUR VISION');
    const missionText = t('mission.description', 'To forge unbreakable bonds on the highest peaks, pushing the boundaries of human endurance and shared heritage.');
    const visionText = t('mission.vision_desc', 'A Europe where every Malayalee can find their path, conquer the impossible, and carry the spirit of the mountains within.');

    if (reduce) {
        return (
            <section id="mission" className="relative py-24 md:py-32 px-6 md:px-12">
                <div className="max-w-5xl mx-auto flex flex-col gap-16">
                    <div>
                        <h2 className="text-alpine-sunrise text-lg md:text-2xl font-bold uppercase tracking-[0.28em] mb-4">{missionTitle}</h2>
                        <p className="font-serif text-3xl md:text-5xl leading-tight text-alpine-navy dark:text-alpine-snow">{missionText}</p>
                    </div>
                    <div>
                        <h2 className="text-alpine-blue dark:text-alpine-glacier text-lg md:text-2xl font-bold uppercase tracking-[0.28em] mb-4">{visionTitle}</h2>
                        <p className="font-serif text-3xl md:text-5xl leading-tight text-alpine-navy dark:text-alpine-snow">{visionText}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section ref={ref} id="mission" className="relative h-[260vh] md:h-[320vh]">
            <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
                {/* Backdrop: slow push-in inside an irising frame */}
                <motion.div style={{ clipPath }} className="absolute inset-0 bg-[#061A31]">
                    {([[BACKDROP, 'dark:hidden'], [NIGHT_BACKDROP, 'hidden dark:block']] as const).map(([slide, visibility]) => (
                        <motion.img
                            key={slide.src}
                            src={getHeroImageUrl(slide.src)}
                            alt={slide.alt}
                            loading="lazy"
                            decoding="async"
                            style={{ scale: imageScale, y: imageY }}
                            className={`${visibility} absolute inset-0 w-full h-full object-cover will-change-transform`}
                        />
                    ))}
                    <div className="cine-clouds opacity-70" aria-hidden="true" />
                    {/* Grade: navy shadows, readable lower third, soft top */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04101F]/95 via-[#08284C]/55 to-[#08284C]/25" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(226,160,113,0.18),transparent_60%)]" />
                </motion.div>

                {/* Chapters */}
                <div className="relative h-full max-w-[1600px] mx-auto px-6 md:px-16 flex items-end pb-[18svh] md:pb-[16svh]">
                    <motion.div style={{ opacity: missionOpacity, y: missionY }} className="absolute inset-x-6 md:inset-x-16 bottom-[18svh] md:bottom-[16svh]">
                        <Chapter index="01" title={missionTitle} accent="text-alpine-sunrise" rule="bg-gradient-to-r from-alpine-sunrise to-alpine-gold" />
                        <Statement text={missionText} progress={p} from={0.06} to={0.4} />
                    </motion.div>
                    <motion.div style={{ opacity: visionOpacity, y: visionY }} className="absolute inset-x-6 md:inset-x-16 bottom-[18svh] md:bottom-[16svh]">
                        <Chapter index="02" title={visionTitle} accent="text-alpine-glacier" rule="bg-gradient-to-r from-alpine-glacier to-white" />
                        <Statement text={visionText} progress={p} from={0.6} to={0.9} />
                    </motion.div>
                </div>

                {/* Chapter progress */}
                <div className="absolute left-6 right-6 md:left-16 md:right-16 bottom-8 md:bottom-10 flex items-center gap-4 text-white/70">
                    <span className="relative font-mono text-[10px] tracking-[0.3em]">
                        <motion.span style={{ opacity: chapter1 }}>01</motion.span>
                        <motion.span style={{ opacity: chapter2 }} className="absolute left-0">02</motion.span>
                        <span className="ml-2 text-white/40">/ 02</span>
                    </span>
                    <div className="relative flex-1 h-px bg-white/20 overflow-hidden">
                        <motion.div style={{ scaleX: p }} className="absolute inset-0 origin-left bg-gradient-to-r from-alpine-glacier via-alpine-sunrise to-alpine-gold" />
                    </div>
                </div>
            </div>
        </section>
    );
};
