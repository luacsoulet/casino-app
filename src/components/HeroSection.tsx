export const HeroSection = () => {
    return (
        <section className="relative h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#0a192f] via-[#0f2942] to-[#020c1b]">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10" />
            </div>
            <div className="relative z-10 text-center text-white px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#64ffda]">
                    Bienvenue sur Lucky Casino
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-300">
                    Découvrez nos jeux exclusifs et amasser des jetons !
                </p>
                <a
                    href="#games"
                    className="bg-[#64ffda]/10 hover:bg-[#64ffda]/70 hover:text-white text-[#64ffda] border border-[#64ffda] px-8 py-3 rounded-full text-lg font-semibold transition duration-300"
                >
                    Jouer Maintenant
                </a>
            </div>
        </section>
    )
}