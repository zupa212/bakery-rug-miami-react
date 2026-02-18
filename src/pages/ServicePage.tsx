
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, Truck, Award, CheckCircle, Phone, MapPin } from 'lucide-react';

const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BakersRug Service",
    "description": "Professional rug cleaning, repair, and restoration in Miami. Family-owned since 1940. Specialists in Persian, Oriental, Turkish, and Wool rugs.",
    "url": "https://bakersrug.com/service",
    "telephone": "305-801-9000",
    "email": "bakersrug@comcast.net",
    "foundingDate": "1940",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "8723 SW 132nd Street",
        "addressLocality": "Miami",
        "addressRegion": "FL",
        "postalCode": "33176",
        "addressCountry": "US"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6295,
        "longitude": -80.3573
    },
    "areaServed": [
        { "@type": "City", "name": "Miami" },
        { "@type": "City", "name": "Coral Gables" },
        { "@type": "City", "name": "Pinecrest" },
        { "@type": "City", "name": "Coconut Grove" },
        { "@type": "City", "name": "Key Biscayne" },
        { "@type": "City", "name": "Brickell" },
        { "@type": "City", "name": "South Miami" },
        { "@type": "City", "name": "Kendall" },
        { "@type": "City", "name": "Fort Lauderdale" },
        { "@type": "City", "name": "Boca Raton" }
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Rug Services",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Rug Washing & Cleaning",
                    "description": "Hand-washing for Persian, Turkish, wool, and silk rugs"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Rug Repair & Restoration",
                    "description": "Fringe repair, reweaving, and color restoration"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Rug Pad Sales",
                    "description": "Non-slip rug pads and moth proofing"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Free Pickup & Delivery",
                    "description": "Complimentary rug pickup and delivery in Miami-Dade, Broward, Palm Beach"
                }
            }
        ]
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "worstRating": "1",
        "reviewCount": "120"
    },
    "sameAs": [
        "https://www.google.com/maps/place/Bakers+Rug+Service"
    ]
};

const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How much does rug cleaning cost in Miami?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Professional rug cleaning in Miami typically costs $2–$5 per square foot depending on the rug type. Persian and silk rugs may cost more due to specialized hand-washing techniques. BakersRug offers free estimates and competitive pricing. Call (305) 801-9000 for a custom quote."
            }
        },
        {
            "@type": "Question",
            "name": "Do you offer free pickup and delivery for rug cleaning?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! BakersRug offers free pickup and delivery throughout Miami-Dade, Broward, and Palm Beach counties. We handle your rugs with care from door to door, making the process effortless."
            }
        },
        {
            "@type": "Question",
            "name": "How long does professional rug cleaning take?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most rugs are cleaned and returned within 5–7 business days. Complex repairs or restoration may take 2–4 weeks. We provide status updates so you always know where your rug is."
            }
        },
        {
            "@type": "Question",
            "name": "Can you clean Persian and Oriental rugs?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. BakersRug specializes in Persian, Oriental, Turkish, wool, and silk rug cleaning. Our master craftsmen hand-wash each rug individually, never using machine cleaning, to preserve delicate fibers and natural dyes."
            }
        },
        {
            "@type": "Question",
            "name": "What areas in Miami do you serve?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We serve all of Miami-Dade County including Miami (33176), Coral Gables, Pinecrest, Coconut Grove, Key Biscayne, Brickell, South Miami, Kendall, Doral, and Aventura. We also serve Broward County (Fort Lauderdale) and Palm Beach County (Boca Raton)."
            }
        },
        {
            "@type": "Question",
            "name": "Do you repair damaged rugs?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Our master weavers perform fringe repair, hole reweaving, color restoration, and moth damage repair. We restore antique and heirloom rugs to their original condition using traditional techniques."
            }
        }
    ]
};

const services = [
    {
        title: 'Rug Washing & Cleaning',
        description: 'Specialized hand-washing for Persian, Turkish, wool, and silk rugs. We gently remove deep-set dirt, stains, and allergens while preserving natural dyes and fiber integrity.',
        features: ['Hand-washed individually', 'Natural dye safe', 'Pet stain removal', 'Allergy reduction'],
        icon: Shield,
        image: '/photos/DSC06446.webp'
    },
    {
        title: 'Rug Repair & Restoration',
        description: 'Expert fringe repair, hole reweaving, and color restoration by master weavers. We restore antique and heirloom rugs to their original glory using traditional techniques.',
        features: ['Fringe repair', 'Reweaving', 'Color restoration', 'Moth damage repair'],
        icon: Award,
        image: '/photos/DSC06459.webp'
    },
    {
        title: 'Rug Pad Sales',
        description: 'Custom-cut non-slip rug pads to protect your floors and extend the life of your rugs. We carry premium pads for every floor type and rug style.',
        features: ['Custom-cut to size', 'Non-slip grip', 'Floor protection', 'Moth proofing'],
        icon: CheckCircle,
        image: '/photos/DSC06469-Edit.webp'
    },
    {
        title: 'Free Pickup & Delivery',
        description: 'Complimentary, white-glove pickup and delivery throughout Miami-Dade, Broward, and Palm Beach counties. We handle your rugs with the utmost care from door to door.',
        features: ['Miami-Dade', 'Broward County', 'Palm Beach', 'White-glove handling'],
        icon: Truck,
        image: '/photos/DSC06474.webp'
    }
];

const testimonials = [
    {
        text: "BakersRug brought my grandmother's Persian rug back to life. The colors are vibrant again and it smells fresh. Truly artisanal work.",
        author: "Maria G.",
        location: "Coral Gables, FL"
    },
    {
        text: "Free pickup, excellent communication, and my rug came back looking brand new. Best rug cleaning service in Miami, hands down.",
        author: "David R.",
        location: "Pinecrest, FL"
    },
    {
        text: "They repaired moth damage on a 100-year-old Turkish rug that other shops said was beyond saving. Incredible craftsmanship.",
        author: "Sarah K.",
        location: "Key Biscayne, FL"
    }
];

export default function ServicePage() {
    return (
        <>
            <Helmet>
                <title>Rug Cleaning & Repair Services Miami | BakersRug (Est. 1940)</title>
                <meta name="description" content="BakersRug offers professional rug cleaning, repair, and restoration in Miami since 1940. Free pickup & delivery. Persian, Oriental, Turkish, wool and silk rug specialists. Call (305) 801-9000." />
                <link rel="canonical" href="https://bakersrug.com/service" />
                <meta name="keywords" content="rug cleaning Miami, rug repair Miami, Persian rug cleaning, Oriental rug cleaning Miami, rug restoration Miami, rug pad sales Miami, rug cleaning 33176, rug cleaning Coral Gables, rug cleaning Pinecrest" />
                <meta property="og:title" content="Rug Cleaning & Repair Services Miami | BakersRug" />
                <meta property="og:description" content="Family-owned since 1940. Professional rug cleaning, repair, and restoration for Persian, Oriental, and wool rugs in Miami. Free pickup & delivery." />
                <meta property="og:url" content="https://bakersrug.com/service" />
                <meta property="og:type" content="website" />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
                <script type="application/ld+json">{JSON.stringify(faqData)}</script>
            </Helmet>

            <main>
                {/* Hero Section */}
                <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-navy-950">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/photos/DSC06477.webp"
                            alt="Professional rug cleaning service in Miami"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/50" />
                    </div>

                    <div className="relative z-10 container-custom px-6 md:px-12 pt-32 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <span className="w-16 h-[1px] bg-gold-400/60" />
                                <span className="text-gold-300 font-sans text-xs tracking-[0.3em] uppercase">
                                    Miami's Trusted Rug Atelier Since 1940
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-heading font-medium leading-[1.05] mb-8">
                                <span className="block italic font-serif text-cream-100 mb-2">Expert</span>
                                Rug Cleaning & Repair<br />
                                <span className="text-gold-400">in Miami</span>
                            </h1>

                            <p className="font-serif text-xl md:text-2xl text-cream-100/90 leading-relaxed max-w-2xl mb-10 font-light">
                                Hand-washed. Never machine cleaned. Family-owned for over <strong className="text-white">100 years</strong>,
                                serving Coral Gables, Pinecrest, Key Biscayne, and all of South Florida.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                                <a href="tel:305-801-9000" className="btn-gold flex items-center gap-2" aria-label="Call for rug cleaning quote">
                                    <Phone size={18} /> (305) 801-9000
                                </a>
                                <Link to="/#contact" className="btn-outline" aria-label="Schedule rug pickup">
                                    Schedule Free Pickup
                                </Link>
                                <Link to="/catalog" className="px-8 py-4 bg-navy-900/80 backdrop-blur-sm border border-navy-700 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-navy-800 hover:border-gold-500/50 transition-all duration-300 flex items-center justify-center gap-3 group" aria-label="View rug inventory">
                                    View Inventory <Star size={14} className="text-gold-400" fill="currentColor" />
                                </Link>
                            </div>

                            <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
                                <div className="flex gap-1 text-gold-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <span className="text-sm font-sans tracking-wide text-white/60 uppercase">
                                    4.9 Stars • 120+ Reviews • Top Rated in Florida
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Trust Bar */}
                <section className="bg-navy-900 py-6 border-y border-navy-700">
                    <div className="container-custom px-6 md:px-12">
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-white/70 font-sans text-xs tracking-[0.2em] uppercase">
                            <div className="flex items-center gap-2"><Shield size={16} className="text-gold-400" /> Hand-Washed Only</div>
                            <div className="flex items-center gap-2"><Clock size={16} className="text-gold-400" /> 5–7 Day Turnaround</div>
                            <div className="flex items-center gap-2"><Truck size={16} className="text-gold-400" /> Free Pickup & Delivery</div>
                            <div className="flex items-center gap-2"><Award size={16} className="text-gold-400" /> Est. 1940</div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-24 bg-white">
                    <div className="container-custom px-6 md:px-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-20"
                        >
                            <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Our Services</span>
                            <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">
                                Professional Rug Care in Miami
                            </h2>
                            <div className="w-24 h-[2px] bg-gold-400 mx-auto mb-8" />
                            <p className="font-serif text-xl text-navy-600 leading-relaxed italic">
                                Every rug is a unique work of art. Our master craftsmen examine each knot and dye lot,
                                then hand-wash each piece individually — never by machine.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-cream-200">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group border-r border-b border-cream-200 p-10 hover:bg-cream-50 transition-colors duration-500"
                                >
                                    <div className="mb-6 overflow-hidden aspect-[16/9] rounded-lg">
                                        <img
                                            src={service.image}
                                            alt={`${service.title} in Miami`}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <service.icon size={24} className="text-gold-600" />
                                        <h3 className="font-heading text-2xl text-navy-900">{service.title}</h3>
                                    </div>

                                    <p className="font-serif text-lg text-navy-600 mb-6 leading-relaxed">
                                        {service.description}
                                    </p>

                                    <ul className="grid grid-cols-2 gap-2">
                                        {service.features.map(feature => (
                                            <li key={feature} className="flex items-center gap-2 text-navy-700 font-sans text-sm">
                                                <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-24 bg-cream-50">
                    <div className="container-custom px-6 md:px-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-16"
                        >
                            <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Why BakersRug</span>
                            <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">
                                Miami's Most Trusted Rug Cleaning Since 1940
                            </h2>
                            <div className="w-24 h-[2px] bg-gold-400 mx-auto" />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    stat: '100+',
                                    label: 'Years of Excellence',
                                    description: 'Family-owned and operated since 1940. Three generations of master craftsmen dedicated to rug care.'
                                },
                                {
                                    stat: '4.9★',
                                    label: 'Google Rating',
                                    description: 'Over 120 five-star reviews from Miami homeowners who trust us with their most precious rugs.'
                                },
                                {
                                    stat: 'Free',
                                    label: 'Pickup & Delivery',
                                    description: 'Complimentary white-glove service throughout Miami-Dade, Broward, and Palm Beach counties.'
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-10 border border-cream-200 text-center"
                                >
                                    <span className="block font-heading text-5xl text-gold-600 mb-3">{item.stat}</span>
                                    <span className="block font-sans text-xs tracking-[0.2em] uppercase text-navy-400 mb-4">{item.label}</span>
                                    <p className="font-serif text-navy-600 leading-relaxed italic">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-navy-950">
                    <div className="container-custom px-6 md:px-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-16"
                        >
                            <span className="text-gold-400 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">What Our Clients Say</span>
                            <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
                                Trusted by Miami Homeowners
                            </h2>
                            <div className="w-24 h-[2px] bg-gold-400 mx-auto" />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <motion.div
                                    key={t.author}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="bg-navy-900 border border-navy-700 p-10"
                                >
                                    <div className="flex gap-1 text-gold-400 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="font-serif text-lg text-cream-100/90 leading-relaxed italic mb-6">"{t.text}"</p>
                                    <div>
                                        <span className="font-sans text-sm font-bold text-white tracking-wide">{t.author}</span>
                                        <span className="block font-sans text-xs text-white/50 tracking-widest uppercase mt-1">{t.location}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-white">
                    <div className="container-custom px-6 md:px-12 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">FAQ</span>
                            <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">
                                Frequently Asked Questions
                            </h2>
                            <div className="w-24 h-[2px] bg-gold-400 mx-auto" />
                        </motion.div>

                        <div className="space-y-0 border-t border-cream-200">
                            {faqData.mainEntity.map((faq, i) => (
                                <motion.details
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group border-b border-cream-200"
                                >
                                    <summary className="flex items-center justify-between cursor-pointer py-6 px-2 text-navy-900 font-heading text-lg hover:text-gold-700 transition-colors">
                                        {faq.name}
                                        <ArrowRight size={18} className="text-gold-500 transition-transform group-open:rotate-90 flex-shrink-0 ml-4" />
                                    </summary>
                                    <div className="pb-6 px-2">
                                        <p className="font-serif text-navy-600 leading-relaxed">
                                            {faq.acceptedAnswer.text}
                                        </p>
                                    </div>
                                </motion.details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service Area */}
                <section className="py-24 bg-cream-50">
                    <div className="container-custom px-6 md:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-gold-600 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Service Area</span>
                                <h2 className="font-heading text-4xl md:text-5xl text-navy-900 mb-8">
                                    Serving All of<br />South Florida
                                </h2>
                                <p className="font-serif text-xl text-navy-600 mb-10 leading-relaxed italic border-l-2 border-gold-400 pl-6">
                                    BakersRug offers <strong>free pickup and delivery</strong> for rug cleaning and repair in Miami-Dade, Broward, and Palm Beach counties.
                                </p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mb-10">
                                    {[
                                        'Miami (33176)', 'Coral Gables', 'Pinecrest', 'Coconut Grove',
                                        'Key Biscayne', 'Brickell', 'South Miami', 'Kendall',
                                        'Palmetto Bay', 'Cutler Bay', 'Doral', 'Aventura',
                                        'Golden Beach', 'Sunny Isles', 'Fort Lauderdale', 'Boca Raton'
                                    ].map(city => (
                                        <div key={city} className="flex items-center gap-2 text-navy-700 font-sans text-sm tracking-wide font-semibold">
                                            <MapPin size={12} className="text-gold-500 flex-shrink-0" />
                                            {city}
                                        </div>
                                    ))}
                                </div>
                                <a href="tel:305-801-9000" className="btn-gold flex items-center gap-2 w-fit" aria-label="Call for rug cleaning Miami">
                                    <Phone size={18} /> Call (305) 801-9000
                                </a>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="aspect-[4/5] bg-navy-100 relative overflow-hidden rounded-sm shadow-2xl"
                            >
                                <img
                                    src="/photos/service_area_banana_van.webp"
                                    alt="BakersRug service van - free rug pickup and delivery in Miami"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950/80 to-transparent p-8">
                                    <span className="font-heading text-2xl text-white block mb-1">Free Pickup</span>
                                    <span className="font-sans text-xs tracking-[0.2em] text-white/70 uppercase">All of South Florida</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-navy-950 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <img src="/photos/DSC06520.webp" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                    </div>
                    <div className="relative z-10 container-custom px-6 md:px-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-gold-400 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Get Started Today</span>
                            <h2 className="font-heading text-4xl md:text-6xl text-white mb-6">
                                Ready for Expert<br />Rug Care?
                            </h2>
                            <p className="font-serif text-xl text-cream-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schedule your free pickup today and experience why Miami families have trusted BakersRug for over 100 years.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="tel:305-801-9000" className="btn-gold flex items-center justify-center gap-2" aria-label="Call BakersRug Miami">
                                    <Phone size={18} /> (305) 801-9000
                                </a>
                                <Link to="/#contact" className="btn-outline" aria-label="Contact BakersRug">
                                    Request a Quote <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
