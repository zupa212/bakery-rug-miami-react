import { motion } from 'framer-motion';

const steps = [
    {
        number: '01',
        title: 'Expert Inspection',
        description: 'We assess your rug for dye instability, stains, and structural damage before cleaning.',
    },
    {
        number: '02',
        title: 'Deep Dusting',
        description: 'We remove embedded dry soil, dust mites, and allergens from the foundation of the rug.',
    },
    {
        number: '03',
        title: 'Hand Wash',
        description: 'Gentle, pH-neutral hand washing preserves natural wool oils and vibrant colors.',
    },
    {
        number: '04',
        title: 'Repair & Detail',
        description: 'Our master weavers repair fringes, rebind edges, and fix holes if requested.',
    },
    {
        number: '05',
        title: 'Controlled Drying',
        description: 'Air drying in a climate-controlled environment prevents mold and shrinkage.',
    },
];

export default function Process() {
    return (
        <section id="process" className="py-32 bg-navy-950 text-white overflow-hidden">
            <div className="container-custom px-6 md:px-12">
                <div className="flex flex-col md:flex-row gap-16 md:gap-24 mb-24 items-center md:items-end">
                    <div className="max-w-2xl">
                        <span className="text-gold-500 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Proven Methodology</span>
                        {/* H2 tailored for SEO keywords "Rug Cleaning Process" */}
                        <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">Our 5-Step <br />Rug Cleaning Process</h2>
                        <div className="w-24 h-[2px] bg-gold-600" />
                    </div>
                    <p className="font-serif text-xl text-white/70 leading-relaxed italic max-w-lg mb-2">
                        The safest way to clean Oriental and Persian rugs in Miami. No harsh chemicals, no machines — just patience and expertise.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 border-t border-white/10 pt-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="font-heading text-6xl text-white/5 mb-6 absolute -top-8 -left-4 select-none">
                                {step.number}
                            </div>
                            <div className="relative z-10">
                                <span className="block text-gold-500 font-sans text-xs tracking-widest mb-3">STEP {step.number}</span>
                                <h3 className="font-heading text-xl text-white mb-4">{step.title}</h3>
                                <p className="font-serif text-white/60 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
