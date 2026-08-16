document.addEventListener('DOMContentLoaded', () => {

    // 0. Theme Toggle & Mobile Menu
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Initialize Theme (Temporarily disabled)
    /*
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
    */

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
        });
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
    // 1. Navbar Scroll Effect
    const header = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations using Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Hanya animasi sekali
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger saat 10% elemen masuk viewport
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Interactive Map Logic
    const initMap = async () => {
        const mapContainer = document.getElementById('indo-map');
        const portfolioGallery = document.getElementById('portfolio-gallery');

        // Flat list mapping to regions
        const allProjects = [
            { region: 'java', name: 'VOPAK Jakarta Tank Terminal', type: 'Biodiversity Management Plan', desc: 'Conducting inventory of terrestrial and marine biodiversity, and developing a comprehensive BMP for project activities.', image: 'assets/images/svc_feasibility.jpg' },
            { region: 'java', name: 'Welirang Arjuno Geothermal', type: 'ESIA', desc: 'Development of ESIA study for the geothermal project in compliance with national regulations and IFC PS.', image: 'assets/images/svc_survey.jpg' },
            { region: 'java', name: 'Saguling Floating Solar', type: 'ESMS & ESMP', desc: 'Creation of standard operating procedures, policies, and sub-plans based on IFC Performance Standards.', image: 'assets/images/svc_management.jpg' },
            { region: 'java', name: 'Legok Nangka Waste to Energy', type: 'ESIA', desc: 'Terrestrial and freshwater aquatic biodiversity survey for ESIA of WFTPS based on ADB Safeguards.', image: 'assets/images/svc_feasibility.jpg' },
            { region: 'sumatra', name: 'Singkarak Floating Solar', type: 'ESIA', desc: 'Biodiversity study for ESIA based on ADB Safeguard, IFC PS6, and IFC GN6.', image: 'assets/images/c1.jpg' },
            { region: 'nusa', name: 'Green Power Plant Sumba', type: 'ESIA', desc: 'Biodiversity survey for ESIA of Green Power Plant Project (solar, wind, hydrogen).', image: 'assets/images/svc_survey.jpg' }
        ];

        // Initial render of all projects as horizontal gallery cards
        if (portfolioGallery) {
            portfolioGallery.innerHTML = allProjects.map((p, i) => `
                <div class="image-card" style="background-image: url('${p.image}');">
                    <div class="image-card-content">
                        <span style="display:inline-block; font-size: 0.75rem; color: var(--accent-green); border: 1px solid var(--accent-green); padding: 2px 8px; border-radius: 50px; margin-bottom: 0.5rem;">${p.type}</span>
                        <h3>${p.name}</h3>
                        <p style="margin-bottom: 1.5rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${p.desc}</p>
                        <a href="#" class="read-more" style="color: var(--accent-green) !important;">Read More <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg></a>
                    </div>
                </div>
            `).join('');

            // Carousel Logic
            const prevBtn = document.getElementById('port-prev');
            const nextBtn = document.getElementById('port-next');
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => {
                    // Scroll back by the width of the container
                    portfolioGallery.scrollBy({ left: -portfolioGallery.clientWidth, behavior: 'smooth' });
                });
                nextBtn.addEventListener('click', () => {
                    // Scroll forward by the width of the container
                    portfolioGallery.scrollBy({ left: portfolioGallery.clientWidth, behavior: 'smooth' });
                });
            }
        }

        // Initialize ECharts
        try {
            // Register Map directly from the global variable to bypass CORS issues on file:/// protocol
            echarts.registerMap('SEA', seaGeoJson);
            const myChart = echarts.init(mapContainer);

            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    show: true,
                    trigger: 'item',
                    backgroundColor: 'rgba(20, 30, 25, 0.8)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    textStyle: { color: '#fff' },
                    padding: 16,
                    borderRadius: 12,
                    formatter: function (params) {
                        if (params.seriesType === 'effectScatter') {
                            const region = params.data.region;
                            const regionProjects = allProjects.filter(p => p.region === region);
                            if (regionProjects.length === 0) return 'No projects found here.';

                            let html = `<div style="font-family: 'Inter', sans-serif; min-width: 220px;">`;
                            html += `<h4 style="margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #fff;">Projects in ${params.name}</h4>`;

                            regionProjects.forEach(p => {
                                html += `<div style="margin-bottom: 10px;">
                                            <strong style="color: #74c69d; font-size: 0.95rem; display: block; margin-bottom: 2px;">${p.name}</strong>
                                            <span style="font-size: 0.8rem; color: #b0b8c4; text-transform: uppercase; letter-spacing: 0.5px;">${p.type}</span>
                                         </div>`;
                            });

                            html += `</div>`;
                            return html;
                        }
                        return '';
                    }
                },
                geo: {
                    map: 'SEA',
                    roam: true,
                    zoom: 1.5,
                    aspectScale: 1.0, // Fixes vertical stretching
                    center: [114.0, 2.0], // Center of Southeast Asia (shifted slightly south for zoom)
                    itemStyle: {
                        areaColor: 'rgba(45, 106, 79, 0.4)', // Solid dark green
                        borderColor: 'rgba(116, 198, 157, 0.4)', // Faint green border
                        borderWidth: 1
                    },
                    emphasis: {
                        // Disable base map hover effect entirely
                        disabled: true,
                        itemStyle: {
                            areaColor: 'rgba(45, 106, 79, 0.4)' // Keep same as base
                        },
                        label: { show: false }
                    }
                },
                series: [
                    {
                        name: 'Projects',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        data: [
                            { name: 'Sumatra', value: [102.0, -1.0], region: 'sumatra' },
                            { name: 'Java', value: [110.0, -7.0], region: 'java' },
                            { name: 'Nusa Tenggara', value: [121.0, -8.5], region: 'nusa' }
                        ],
                        symbolSize: 12, // Visual size of the inner dot
                        itemStyle: {
                            color: '#fff',
                            borderWidth: 20, // Huge invisible border to expand hover radius
                            borderColor: 'transparent', // Keeps it invisible
                            shadowBlur: 10,
                            shadowColor: '#74c69d'
                        },
                        rippleEffect: {
                            brushType: 'stroke',
                            scale: 4
                        },
                        label: {
                            formatter: '{b}',
                            position: 'right',
                            show: false // Hide text as requested
                        },
                        emphasis: {
                            scale: true,
                            itemStyle: {
                                color: '#74c69d', // Bright green
                                borderColor: 'rgba(116, 198, 157, 0.8)', // Makes the hover area visually expand!
                                borderWidth: 8, // Creates a thick green ring expanding outward
                                shadowBlur: 30,
                                shadowColor: '#ffffff'
                            },
                            label: { show: false }
                        }
                    }
                ]
            };
            myChart.setOption(option);

            // Listen for theme changes to update map colors
            document.addEventListener('themeChanged', (e) => {
                const isLight = e.detail.isLight;
                myChart.setOption({
                    geo: {
                        itemStyle: {
                            areaColor: isLight ? 'rgba(116, 198, 157, 0.6)' : 'rgba(45, 106, 79, 0.4)',
                            borderColor: isLight ? 'rgba(27, 67, 50, 0.3)' : 'rgba(116, 198, 157, 0.4)'
                        },
                        emphasis: {
                            itemStyle: {
                                areaColor: isLight ? 'rgba(116, 198, 157, 0.6)' : 'rgba(45, 106, 79, 0.4)'
                            }
                        }
                    },
                    series: [{
                        itemStyle: {
                            color: isLight ? '#1b4332' : '#fff',
                            shadowColor: isLight ? 'transparent' : '#74c69d'
                        }
                    }]
                });
            });

            // Set initial theme for map if already in light mode
            if (document.body.classList.contains('light-mode')) {
                document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight: true } }));
            }

            // Handle Resize
            window.addEventListener('resize', () => {
                myChart.resize();
            });

            // Hover Event to link with Project Cards
            myChart.on('mouseover', function (params) {
                // Determine region from point or map area
                let region = null;
                if (params.componentType === 'series') {
                    region = params.data.region;
                }

                if (region) {
                    const cards = document.querySelectorAll('.project-card-item');
                    let firstMatch = null;

                    cards.forEach(card => {
                        if (card.getAttribute('data-region') === region) {
                            card.classList.add('highlighted');
                            if (!firstMatch) firstMatch = card;
                        } else {
                            card.classList.remove('highlighted');
                        }
                    });

                    if (firstMatch) {
                        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });

            myChart.on('mouseout', function () {
                document.querySelectorAll('.project-card-item').forEach(card => card.classList.remove('highlighted'));
            });

            // Ensure map resizes with window (crucial for mobile)
            window.addEventListener('resize', function () {
                if (myChart) {
                    myChart.resize();
                }
            });

        } catch (error) {
            console.error('Error loading map data:', error);
            mapContainer.innerHTML = '<div style="color:white;text-align:center;padding:2rem;">Failed to load map data. Please ensure you are running on a local server.</div>';
        }
    };

    // Initialize Map
    initMap();

});
