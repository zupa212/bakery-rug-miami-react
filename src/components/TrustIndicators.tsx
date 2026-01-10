import { motion } from 'framer-motion';
import { Award, Droplets, Leaf, ShieldCheck } from 'lucide-react';

const trustItems = [
    {
        icon: Award,
        title: 'Heritage',
        description: 'A legacy of excellence since 1940. Three generations of master rug connoisseurs.',
    },
    {
        icon: Droplets,
        title: 'Hand-Wash Only',
        description: 'We strictly adhere to traditional hand-washing methods. No damaging machinery.',
    },
    {
        icon: Leaf,
        title: 'Eco-Conscious',
        description: 'Using only organic, pH-balanced solutions safe for the finest silk and wool.',
    },
    {
        icon: ShieldCheck,
        title: 'Insured & Bonded',
        description: 'White-glove service with full insurance coverage for your peace of mind.',
    },
];

export default function TrustIndicators() {
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
