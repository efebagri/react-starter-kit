import HomepageLayout from '@/layouts/home/homepage-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function CamperCommunity() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    const baseTransition = 'transition-all duration-700 transform';
    const loadedClass = loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5';

    return (
        <HomepageLayout>
            <Head title="Camper Community" />

            <section className="bg-gradient-to-br from-gray-900 via-[#0f172a] to-black text-white min-h-screen py-12 px-6">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header */}
                    <header className={`flex justify-between items-center ${baseTransition} ${loadedClass} delay-100`}>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Camper Community
                        </h1>
                        <Button variant="secondary" className="bg-blue-600 hover:bg-blue-500">
                            Jetzt Mitglied werden
                        </Button>
                    </header>

                    {/* Category Navigation */}
                    <nav className={`flex gap-4 overflow-x-auto no-scrollbar py-2 ${baseTransition} ${loadedClass} delay-200`}>
                        {['Campingplätze', 'Wohnmobile', 'Roadtrips', 'Tipps & Tricks', 'Zubehör', 'Reiseberichte'].map((category) => (
                            <button
                                key={category}
                                className="bg-gradient-to-tr from-blue-800 to-purple-800 px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-105 hover:brightness-110"
                            >
                                {category}
                            </button>
                        ))}
                    </nav>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Left Sidebar */}
                        <aside className={`space-y-6 md:col-span-1 sticky top-24 self-start ${baseTransition} ${loadedClass} delay-300`}>
                            <section className="bg-gray-800 rounded-lg p-4 shadow">
                                <h2 className="text-lg font-semibold mb-3">Trend Themen</h2>
                                <div className="flex flex-wrap gap-2">
                                    {['#Vanlife', '#CampingLife', '#Roadtrip', '#DIYVan', '#CamperInterior'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-gray-700 text-xs px-3 py-1 rounded-full text-gray-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </aside>

                        {/* Main Feed */}
                        <main className={`space-y-6 md:col-span-2 ${baseTransition} ${loadedClass} delay-400`}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((post, index) => (
                                <article
                                    key={post}
                                    className={`bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition transform ${
                                        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                    }`}
                                    style={{ animationDelay: `${0.2 * index}s` }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-600" />
                                        <div>
                                            <h3 className="font-medium">CamperLena</h3>
                                            <p className="text-xs text-gray-400">Vor 5 Minuten · #Vanlife</p>
                                        </div>
                                    </div>
                                    <p className="mb-3">Traumhafter Sonnenuntergang am Nordkap 🌅</p>
                                    <img
                                        src="https://www.hessenschau.de/wirtschaft/wohnmobile-camping-100~_t-1690389209111_v-16to9__retina.jpg"
                                        alt="Camper Post"
                                        className="rounded-lg"
                                    />
                                </article>
                            ))}
                        </main>

                        {/* Right Sidebar */}
                        <aside className={`space-y-6 md:col-span-1 sticky top-24 self-start ${baseTransition} ${loadedClass} delay-500`}>
                            <section className="bg-gray-800 rounded-lg p-4 shadow">
                                <h2 className="text-lg font-semibold mb-3">Top Camper</h2>
                                <ul className="space-y-3">
                                    {['CamperLena', 'VanMichi', 'NomadTom', 'WildCamper'].map((user) => (
                                        <li key={user} className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-600" />
                                            <span className="text-sm">{user}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="ghost" size="sm" className="mt-3 text-blue-400 hover:text-blue-300">
                                    Mehr anzeigen
                                </Button>
                            </section>
                        </aside>

                    </div>
                </div>
            </section>
        </HomepageLayout>
    );
}
