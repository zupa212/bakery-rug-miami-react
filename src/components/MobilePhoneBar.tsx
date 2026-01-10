export default function MobilePhoneBar() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <a
                href="tel:305-232-3368"
                className="block bg-navy-900 text-white text-center py-4 font-sans text-sm font-bold tracking-widest uppercase"
            >
                Call for Estimate: (305) 232-3368
            </a>
        </div>
    );
}
