import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const cities = [
    'Miami (33176)', 'Coral Gables', 'Pinecrest', 'Coconut Grove',
    'Key Biscayne', 'Brickell', 'South Miami', 'Kendall',
    'Palmetto Bay', 'Cutler Bay', 'Doral', 'Aventura',
    'Golden Beach', 'Sunny Isles', 'Fort Lauderdale', 'Boca Raton'
];

export default function ServiceArea() {
    return (
        <section className="py-32 bg-cream-50 relative overflow-hidden">
            <div className="container-custom px-6 md:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Service Area</span>
                        <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-8">Serving All of <br />South Florida</h2>

                        <p className="font-serif text-xl text-navy-600 mb-10 leading-relaxed italic border-l-2 border-gold-400 pl-6">
                            BakersRug offers <strong>free bespoke pickup and delivery</strong> for rug cleaning and repair orders in Miami-Dade, Broward, and Palm Beach counties. We are based in Miami, FL 33176.
                        </p>

                        {/* Keyword rich zip codes and cities */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 mb-10">
                            {cities.map((city) => (
                                <div key={city} className="flex items-center gap-2 text-navy-700 font-sans text-xs md:text-sm tracking-wide uppercase font-semibold">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full flex-shrink-0" />
                                    {city}
                                </div>
                            ))}
                        </div>

                        <a href="#contact" className="btn-primary" aria-label="Schedule Rug Pickup Miami">
                            Schedule Miami Pickup
                        </a>
                    </motion.div>

                    <div className="relative">
                        <div className="aspect-[4/5] bg-navy-100 relative overflow-hidden rounded-sm shadow-2xl">
                            <img
                                src="/photos/service_area_van_rug_pickup_1768092463313.webp"
                                alt="Miami Rug Repair Specialist"
                                className="w-full h-full object-cover filter sepia-[0.2] contrast-[1.1]"
                            />
                            <div className="absolute inset-0 border-[1px] border-white/20 m-4 pointer-events-none" />
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-white p-8 shadow-luxury max-w-xs border border-cream-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-navy-900 p-3 text-white">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <span className="block font-heading text-lg text-navy-900">Miami, FL</span>
                                    <span className="block font-serif text-navy-500 italic">Zip Code: 33176</span>
                                </div>
                            </div>
                            <div className="h-px bg-cream-200 w-full mb-4" />
                            <p className="font-sans text-xs tracking-widest text-navy-400 uppercase">
                                Pickup & Delivery Available
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
