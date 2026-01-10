import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const services = [
    {
        title: 'Oriental Rug Cleaning',
        description: 'Specialized hand-washing for Persian, Turkish, wool, and silk rugs. We remove deep-set dirt while preserving natural dyes.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Rug Repair & Restoration',
        description: 'Expert fringe repair, hole reweaving, and color restoration. Our master weavers restore antique rugs to their original glory.',
        image: 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Pet Stain & Odor Removal',
        description: 'Guaranteed removal of pet urine stains and odors using enzyme treatments that are safe for wool and silk fibers.',
        image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Rug Appraisals',
        description: 'Certified valuations for insurance, estate planning, or resale. We appraise Persian, Oriental, and antique textiles.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Padding & Protection',
        description: 'Custom-cut non-slip rug pads to protect your floors and extend the life of your fine rugs. Moth proofing available.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Antique Rug Sales',
        description: 'Browse our curated collection of authentic hand-knotted antique and semi-antique rugs from around the world.',
        image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800',
    },
];

export default function Services() {
    const row1 = [
        '/photos/DSC06446.webp', '/photos/DSC06459.webp', '/photos/DSC06460.webp',
        '/photos/DSC06469-Edit.webp', '/photos/DSC06472-Edit.webp', '/photos/DSC06474.webp', '/photos/DSC06477.webp'
    ];
    const row2 = [
        '/photos/DSC06479.webp', '/photos/DSC06487.webp', '/photos/DSC06505.webp',
        '/photos/DSC06508.webp', '/photos/DSC06515.webp', '/photos/DSC06520.webp', '/photos/DSC06522.webp'
    ];

    const MarqueeRow = ({ images, reverse = false }: { images: string[], reverse?: boolean }) => (
        <div className="flex overflow-hidden whitespace-nowrap mb-6 relative z-0">
            <motion.div
                className="flex gap-6"
                initial={{ x: reverse ? "-50%" : "0%" }}
                animate={{ x: reverse ? "0%" : "-50%" }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            >
                {[...images, ...images].map((src, i) => (
                    <div key={i} className="w-[360px] h-[260px] flex-shrink-0 rounded-2xl overflow-hidden border-[4px] border-white shadow-lg relative group">
                        <img
                            src={src}
                            alt="Rug Cleaning Work"
                            className="w-full h-full object-cover filter grayscale-[0.1] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                ))}
            </motion.div>
        </div>
    );

    return (
        <section id="services" className="py-20 bg-white overflow-hidden">
            {/* Dual Marquee */}
            <div className="mb-20 opacity-90 hover:opacity-100 transition-opacity duration-700">
                <MarqueeRow images={row1} />
                <MarqueeRow images={row2} reverse />
            </div>

            <div className="container-custom px-6 md:px-12 relative z-10">
                <div className="max-w-3xl mb-16">
                    <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Our Expertise</span>
                    {/* SEO Optimized H2 */}
                    <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">Professional Rug Cleaning <br />& Repair Services</h2>
                    <div className="w-24 h-[2px] bg-gold-400 mb-8" />
                    <p className="font-serif text-xl text-navy-600 leading-relaxed italic">
                        Each rug is a unique work of art requiring a specialized approach. As Miami's leading rug atelier, our master craftsmen examine every knot and dye lot before cleaning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-cream-200">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative border-r border-b border-cream-200 p-10 hover:bg-cream-50 transition-colors duration-500"
                        >
                            <div className="mb-8 overflow-hidden aspect-[4/3]">
                                <img
                                    src={service.image}
                                    alt={`${service.title} Service Miami`}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                                />
                            </div>
                            {/* H3 with Keywords */}
                            <h3 className="font-heading text-2xl text-navy-900 mb-3">{service.title}</h3>
                            <p className="font-serif text-lg text-navy-600 mb-6 leading-relaxed text-opacity-80">
                                {service.description}
                            </p>
                            <a href="#contact" className="inline-flex items-center gap-2 text-gold-700 font-sans text-xs tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300" aria-label={`Inquire about ${service.title}`}>
                                Inquire <ArrowRight size={14} />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
