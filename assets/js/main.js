document.addEventListener('DOMContentLoaded', () => {
    
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
        const listEl = document.getElementById('pd-list');
        const projectDetailsPanel = document.getElementById('project-details');

        // Flat list mapping to regions
        const allProjects = [
            { region: 'java', name: 'VOPAK Jakarta Tank Terminal', type: 'Biodiversity Management Plan', desc: 'Conducting inventory of terrestrial and marine biodiversity, and developing a comprehensive BMP for project activities.' },
            { region: 'java', name: 'Welirang Arjuno Geothermal', type: 'ESIA', desc: 'Development of ESIA study for the geothermal project in compliance with national regulations and IFC PS.' },
            { region: 'java', name: 'Saguling Floating Solar', type: 'ESMS & ESMP', desc: 'Creation of standard operating procedures, policies, and sub-plans based on IFC Performance Standards.' },
            { region: 'java', name: 'Legok Nangka Waste to Energy', type: 'ESIA', desc: 'Terrestrial and freshwater aquatic biodiversity survey for ESIA of WFTPS based on ADB Safeguards.' },
            { region: 'sumatra', name: 'Singkarak Floating Solar', type: 'ESIA', desc: 'Biodiversity study for ESIA based on ADB Safeguard, IFC PS6, and IFC GN6.' },
            { region: 'nusa', name: 'Green Power Plant Sumba', type: 'ESIA', desc: 'Biodiversity survey for ESIA of Green Power Plant Project (solar, wind, hydrogen).' }
        ];

        // Initial render of all projects as cards
        listEl.innerHTML = allProjects.map((p, i) => `
            <div class="project-card-item" data-region="${p.region}" id="project-card-${i}">
                <div class="project-card-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <div>
                        <h4>${p.name}</h4>
                        <span class="type">${p.type}</span>
                    </div>
                    <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div class="project-card-body">
                    <p class="text-sm" style="color:var(--text-light);">${p.desc}</p>
                </div>
            </div>
        `).join('');

        // Initialize ECharts
        try {
            // Register Map directly from the global variable to bypass CORS issues on file:/// protocol
            echarts.registerMap('Indonesia', indonesiaGeoJson);
            const myChart = echarts.init(mapContainer);
            
            const option = {
                backgroundColor: 'transparent',
                geo: {
                    map: 'Indonesia',
                    roam: true,
                    zoom: 1.2,
                    center: [118.0, -2.5], // Center of Indonesia
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
                        if(card.getAttribute('data-region') === region) {
                            card.classList.add('highlighted');
                            if(!firstMatch) firstMatch = card;
                        } else {
                            card.classList.remove('highlighted');
                        }
                    });
                    
                    if(firstMatch) {
                        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });
            
            myChart.on('mouseout', function () {
                document.querySelectorAll('.project-card-item').forEach(card => card.classList.remove('highlighted'));
            });

        } catch (error) {
            console.error('Error loading map data:', error);
            mapContainer.innerHTML = '<div style="color:white;text-align:center;padding:2rem;">Failed to load map data. Please ensure you are running on a local server.</div>';
        }
    };

    // Initialize Map
    initMap();

});
