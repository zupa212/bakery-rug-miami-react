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
    item4_title: 'Insured & Bonded',
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
        <section className="py-24 bg-cream-50 border-b border-cream-200">
            <div className="container-custom px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-cream-200">
                    {trustItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="px-4 py-8 md:py-0 text-center"
                        >
                            <div className="flex justify-center mb-6">
                                <item.icon className="w-8 h-8 text-gold-600 stroke-[1.5]" />
                            </div>
                            <h3 className="font-heading text-xl text-navy-900 mb-3 tracking-wide">{item.title}</h3>
                            <p className="font-serif text-lg text-navy-600 italic leading-relaxed">"{item.description}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
