import { motion } from 'framer-motion';
import { Award, Droplets, Leaf, ShieldCheck } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';

const defaultContent = {
    item1_title: 'Heritage',
    item1_desc: 'A legacy of excellence since 1940. Three generations of master rug connoisseurs.',
    item2_title: 'Hand-Wash Only',
    item2_desc: 'We strictly adhere to traditional hand-washing methods. No damaging machinery.',
    item3_title: 'Eco-Conscious',
    item3_desc: 'Using only organic, pH-balanced solutions safe for the finest silk and wool.',
    item4_title: 'Fully Insured',
    item4_desc: 'White-glove service with full insurance coverage for your peace of mind.',
};

export default function TrustIndicators() {
    const content = useCMSContent('trust_indicators', defaultContent);

    const trustItems = [
        {
            icon: Award,
            title: content.item1_title,
            description: content.item1_desc,
        },
        {
            icon: Droplets,
            title: content.item2_title,
            description: content.item2_desc,
        },
        {
            icon: Leaf,
            title: content.item3_title,
            description: content.item3_desc,
        },
        {
            icon: ShieldCheck,
            title: content.item4_title,
            description: content.item4_desc,
        },
    ];

    return (
        <section className="py-8 md:py-24 bg-cream-50 border-b border-cream-200">
            <div className="container-custom px-4 sm:px-6 md:px-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-8 md:divide-x divide-cream-200">
                    {trustItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 sm:p-4 md:px-4 md:py-0 text-center bg-white/80 md:bg-transparent rounded-xl md:rounded-none border border-cream-200/60 md:border-none shadow-xs md:shadow-none flex flex-col items-center justify-start"
                        >
                            <div className="flex justify-center mb-2 md:mb-6">
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gold-600 stroke-[1.5]" />
                            </div>
                            <h3 className="font-heading text-xs sm:text-sm md:text-xl text-navy-900 mb-1 md:mb-3 font-bold tracking-wide">{item.title}</h3>
                            <p className="font-serif text-[11px] sm:text-xs md:text-lg text-navy-600 italic leading-tight md:leading-relaxed line-clamp-3 md:line-clamp-none">
                                "{item.description}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
