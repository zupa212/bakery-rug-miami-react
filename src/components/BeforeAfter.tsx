import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

export default function BeforeAfter() {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    }, []);

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    const handleInteractionStart = () => setIsDragging(true);

    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, []);

    return (
        <section className="py-24 bg-navy-900 overflow-hidden relative">
            <div className="container-custom px-6 md:px-12">
                <div className="text-center mb-16">
                    <span className="text-gold-500 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Proven Results</span>
                    <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">Restoring Vibrancy</h2>
                    <div className="w-24 h-[2px] bg-gold-600 mx-auto mb-8" />
                    <p className="font-serif text-xl text-white/80 leading-relaxed italic max-w-2xl mx-auto">
                        See the difference our hand-washing process makes. We remove decades of embedded dust and restore the original brilliance of vegetable dyes.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative rounded-sm overflow-hidden shadow-2xl border border-white/10 select-none cursor-ew-resize group"
                    ref={containerRef}
                    onMouseDown={handleInteractionStart}
                    onTouchStart={handleInteractionStart}
                    onMouseMove={onMouseMove}
                    onTouchMove={onTouchMove}
                >
                    {/* Images Container */}
                    <div className="relative aspect-[4/3] md:aspect-[16/9] w-full bg-navy-950">
                        {/* After Image (Full Width - Background) */}
                        <img
                            src="/photos/DSC06472-Edit.webp"
                            alt="Clean Oriental Rug After Washing"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute top-6 right-6 font-sans text-xs font-bold tracking-widest text-white uppercase bg-navy-900/80 px-3 py-1 backdrop-blur-md rounded-sm border border-white/20">
                            After Treatment
                        </div>

                        {/* Before Image (Clipped) */}
                        <div
                            className="absolute inset-0 w-full h-full overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <img
                                src="/photos/DSC06460.webp"
                                alt="Dirty Rug Before Washing"
                                className="absolute inset-0 w-full h-full object-cover filter sepia-[0.1]"
                                draggable={false}
                            />
                            <div className="absolute top-6 left-6 font-sans text-xs font-bold tracking-widest text-white uppercase bg-navy-900/80 px-3 py-1 backdrop-blur-md rounded-sm border border-white/20">
                                Before Treatment
                            </div>
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white transition-transform group-hover:scale-110">
                                <ChevronsLeftRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-sans tracking-widest uppercase pointer-events-none md:hidden">
                        Drag to compare
                    </div>
                </div>
            </div>
        </section>
    );
}
