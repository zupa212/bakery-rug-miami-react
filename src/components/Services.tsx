import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMSContent } from '../hooks/useCMSContent';
import { useCMSImage } from '../hooks/useCMSImage';

const defaultContent = {
    tagline: "Our Expertise",
    headline: "Professional Rug Cleaning & Repair Services",
    description: "Each rug is a unique work of art requiring a specialized approach. As Miami's leading rug atelier, our master craftsmen examine every knot and dye lot before cleaning."
};

const servicesList = [
    {
        title: 'Rug Washing',
        description: 'Specialized hand-washing for Persian, Turkish, wool, and silk rugs. We remove deep-set dirt while preserving natural dyes.',
        imageId: 'service_1',
        defaultImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
        link: '/miami-rug-cleaning'
    },
    {
        title: 'Pad Sales',
        description: 'Custom-cut non-slip rug pads to protect your floors and extend the life of your fine rugs. Moth proofing available.',
        imageId: 'service_2',
        defaultImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        link: '/catalog'
    },
    {
        title: 'Rug Repair',
        description: 'Expert fringe repair, hole reweaving, and color restoration. Our master weavers restore antique rugs to their original glory.',
        imageId: 'service_3',
        defaultImage: 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?auto=format&fit=crop&q=80&w=800',
        link: '/miami-rug-cleaning'
    },
];

export default function Services() {
    const content = useCMSContent('services', defaultContent);

    // Dynamic images from CMS
    const { imageUrl: service1Img } = useCMSImage('service_1', servicesList[0].defaultImage, 'Rug Washing');
    const { imageUrl: service2Img } = useCMSImage('service_2', servicesList[1].defaultImage, 'Pad Sales');
    const { imageUrl: service3Img } = useCMSImage('service_3', servicesList[2].defaultImage, 'Rug Repair');
    const serviceImages = [service1Img, service2Img, service3Img];

    // Carousel images from CMS
    const { imageUrl: c1 } = useCMSImage('carousel_1', '/photos/DSC06446.webp');
    const { imageUrl: c2 } = useCMSImage('carousel_2', '/photos/DSC06459.webp');
    const { imageUrl: c3 } = useCMSImage('carousel_3', '/photos/DSC06460.webp');
    const { imageUrl: c4 } = useCMSImage('carousel_4', '/photos/DSC06469-Edit.webp');
    const { imageUrl: c5 } = useCMSImage('carousel_5', '/photos/DSC06472-Edit.webp');
    const { imageUrl: c6 } = useCMSImage('carousel_6', '/photos/DSC06474.webp');
    const { imageUrl: c7 } = useCMSImage('carousel_7', '/photos/DSC06477.webp');
    const { imageUrl: c8 } = useCMSImage('carousel_8', '/photos/DSC06479.webp');
    const { imageUrl: c9 } = useCMSImage('carousel_9', '/photos/DSC06487.webp');
    const { imageUrl: c10 } = useCMSImage('carousel_10', '/photos/DSC06505.webp');
    const { imageUrl: c11 } = useCMSImage('carousel_11', '/photos/DSC06508.webp');
    const { imageUrl: c12 } = useCMSImage('carousel_12', '/photos/DSC06515.webp');
    const { imageUrl: c13 } = useCMSImage('carousel_13', '/photos/DSC06520.webp');
    const { imageUrl: c14 } = useCMSImage('carousel_14', '/photos/DSC06522.webp');

    const row1 = [c1, c2, c3, c4, c5, c6, c7];
    const row2 = [c8, c9, c10, c11, c12, c13, c14];

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
                    <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">
                        {content.tagline}
                    </span>
                    {/* SEO Optimized H2 */}
                    <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">
                        {content.headline}
                    </h2>
                    <div className="w-24 h-[2px] bg-gold-400 mb-8" />
                    <p className="font-serif text-xl text-navy-600 leading-relaxed italic">
                        {content.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-cream-200">
                    {servicesList.map((service, index) => (
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
                                    src={serviceImages[index]}
                                    alt={`${service.title} Service Miami`}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                                />
                            </div>
                            {/* H3 with Keywords */}
                            <h3 className="font-heading text-2xl text-navy-900 mb-3">{service.title}</h3>
                            <p className="font-serif text-lg text-navy-600 mb-6 leading-relaxed text-opacity-80">
                                {service.description}
                            </p>
                            <Link to={service.link} className="inline-flex items-center gap-2 text-gold-700 font-sans text-xs tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300" aria-label={`Inquire about ${service.title}`}>
                                Inquire <ArrowRight size={14} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
