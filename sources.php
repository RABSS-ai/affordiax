<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sources — LivingCost USA</title>
  <meta name="description" content="Explore the official federal, state, and academic data sources used by LivingCost USA for indexing and parity models.">
  
  <!-- Stylesheet -->
  <link rel="stylesheet" href="output.css">
  <link rel="stylesheet" href="style.css">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .gradient-text {
      background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .glow-box {
      box-shadow: 0 0 40px -10px rgba(20, 184, 166, 0.15);
    }
  </style>
</head>
<body class="bg-[#090d16] text-slate-100 min-h-screen selection:bg-teal-500/30 selection:text-teal-200">

  <!-- 1. STICKY PREMIUM NAVIGATION -->
  <header id="site-header">
    <div class="nav-container">
      <div class="nav-brand-group">
        <a href="index.html" class="brand-logo" aria-label="LivingCost Homepage">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div class="brand-text-block">
            <span class="brand-name">LivingCost</span>
            <span class="brand-edition">USA Edition</span>
          </div>
        </a>
      </div>

      <!-- Center Navigation -->
      <nav class="nav-center-menu" aria-label="Main Navigation">
        <a href="index.html#popular-cities" class="nav-item">Cities</a>
        <a href="index.html#explore-states" class="nav-item">States</a>
        <a href="index.html#salary-explorer" class="nav-item">Salary Explorer</a>
        <a href="index.html#city-comparison" class="nav-item">Compare</a>
        <a href="index.html#relocation-planner" class="nav-item">Relocation</a>
        <a href="index.html#relocation-guides" class="nav-item">Guides</a>
      </nav>

      <!-- Right Actions & Country Switcher -->
      <div class="nav-right-actions">
        <div class="country-switcher-wrapper">
          <button class="country-btn" id="country-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Select Country">
            <span class="flag-icon">🇺🇸</span>
            <span class="country-code">USA</span>
            <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          
          <!-- International Expansion Dropdown -->
          <div class="country-dropdown-menu" id="country-dropdown">
            <div class="dropdown-header">Select Region</div>
            <a href="#" class="country-opt active"><span class="flag">🇺🇸</span> United States <span class="badge-active">Active</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇨🇦</span> Canada <span class="badge-soon">Soon</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇬🇧</span> United Kingdom <span class="badge-soon">Soon</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇦🇺</span> Australia <span class="badge-soon">Soon</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇦🇪</span> UAE <span class="badge-soon">Soon</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇩🇪</span> Germany <span class="badge-soon">Soon</span></a>
            <a href="#" class="country-opt upcoming"><span class="flag">🇯🇵</span> Japan <span class="badge-soon">Soon</span></a>
          </div>
        </div>

        <a href="index.html#city-comparison" class="btn-primary-nav">Compare Cities</a>

        <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-20 pb-16 border-b border-slate-800/50">
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
    
    <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
      <span class="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-bold tracking-wider uppercase mb-6 inline-block">
        Platform Integrity & Mathematics
      </span>
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
        Our <span class="gradient-text">Authoritative Sources</span>
      </h1>
      <p class="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
        Review the primary government agencies, bureaus, and foundational economic datasets we utilize to maintain metric integrity.
      </p>
    </div>
  </section>

  <!-- Main Navigation Tabs -->
  <div class="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
    <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-1.5 flex max-w-2xl mx-auto gap-1 shadow-2xl backdrop-blur-xl">
      <a href="about.php" class="text-center flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 text-slate-400 hover:text-white">
        About Us
      </a>
      <a href="methodology.php" class="text-center flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 text-slate-400 hover:text-white">
        Methodology
      </a>
      <a href="sources.php" class="text-center flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 bg-teal-500 text-slate-950 shadow-md">
        Sources
      </a>
    </div>
  </div>

  <!-- Content Wrapper -->
  <main class="max-w-5xl mx-auto px-6 py-16">
    <div class="glow-box bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 sm:p-12">
      <h2 class="text-3xl font-bold text-white mb-6">Foundational Economic Benchmarks</h2>
      <p class="text-slate-400 leading-relaxed mb-8">
        To ensure absolute accuracy, we do not rely on user-submitted, unvetted estimates. Instead, our platform queries and normalizes public data publications issued by primary federal, state, and local agencies.
      </p>

      <!-- Sources List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- source 1 -->
        <div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 font-bold">
            HUD
          </div>
          <h3 class="text-lg font-bold text-white mb-2">HUD Fair Market Rents (FMR)</h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            Primary rental data profiles are normalized utilizing HUD's annual Fair Market Rents and 50th Percentile Rent tables, providing precise metrics for geographical metropolitan statistical areas (MSAs).
          </p>
          <a href="https://www.huduser.gov/" target="_blank" rel="noopener noreferrer" class="text-teal-400 text-xs font-semibold hover:underline inline-block mt-4">
            Explore HUD Data Sets &rarr;
          </a>
        </div>

        <!-- source 2 -->
        <div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 font-bold">
            BLS
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Bureau of Labor Statistics (BLS)</h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            Typical occupational salaries and regional employment weights are extracted directly from the Occupational Employment and Wage Statistics (OEWS) annual releases and local Consumer Price Indexes (CPI).
          </p>
          <a href="https://www.bls.gov/" target="_blank" rel="noopener noreferrer" class="text-teal-400 text-xs font-semibold hover:underline inline-block mt-4">
            Browse CPI Metrics &rarr;
          </a>
        </div>

        <!-- source 3 -->
        <div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 font-bold">
            USC
          </div>
          <h3 class="text-lg font-bold text-white mb-2">U.S. Census Bureau ACS</h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            Demographic parameters, municipal population counts, local travel times, and average utilities coefficients are cross-referenced using the latest American Community Survey (ACS) 5-Year estimates.
          </p>
          <a href="https://www.census.gov/programs-surveys/acs" target="_blank" rel="noopener noreferrer" class="text-teal-400 text-xs font-semibold hover:underline inline-block mt-4">
            Explore ACS Survey Models &rarr;
          </a>
        </div>

        <!-- source 4 -->
        <div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 font-bold">
            TAX
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Tax Foundation &amp; Local Tax Codes</h3>
          <p class="text-sm text-slate-400 leading-relaxed">
            State-level property assessments, standard municipal sales tax rates, and individual state income tax structures are cross-referenced annually from local fiscal statutes and Tax Foundation tables.
          </p>
          <a href="https://taxfoundation.org/" target="_blank" rel="noopener noreferrer" class="text-teal-400 text-xs font-semibold hover:underline inline-block mt-4">
            Review Tax Brackets &rarr;
          </a>
        </div>
      </div>
    </div>
  </main>

  <!-- 20. LARGE SEO FOOTER -->
  <footer id="site-footer">
    <div class="site-container">
      <div class="footer-grid-5col">
        <div class="footer-brand-col">
          <div class="brand-logo">
            <div class="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span class="brand-name">LivingCost</span>
          </div>
          <p class="footer-tagline">LivingCost — Understand the cost of living before making your next move.</p>
          <div class="footer-country-badge">
            <span class="flag">🇺🇸</span> United States Edition
          </div>
        </div>

        <div class="footer-nav-col">
          <span class="col-head">EXPLORE</span>
          <ul>
            <li><a href="index.html#popular-cities">U.S. Cities</a></li>
            <li><a href="index.html#explore-states">50 States</a></li>
            <li><a href="affordability.html">Affordability Hub</a></li>
            <li><a href="salary.html">Salaries & Wages</a></li>
            <li><a href="index.html#popular-cities">Housing & Rent</a></li>
            <li><a href="index.html#explore-states">State Tax Rates</a></li>
          </ul>
        </div>

        <div class="footer-nav-col">
          <span class="col-head">TOOLS</span>
          <ul>
            <li><a href="index.html#city-comparison">City Comparison</a></li>
            <li><a href="index.html#quick-calculator">Cost Calculator</a></li>
            <li><a href="index.html#relocation-planner">Relocation Planner</a></li>
            <li><a href="index.html#salary-explorer">Salary Checker</a></li>
            <li><a href="index.html#best-places-chips">Best Places Finder</a></li>
          </ul>
        </div>

        <div class="footer-nav-col">
          <span class="col-head">GUIDES</span>
          <ul>
            <li><a href="index.html#relocation-guides">Cross-Country Moving</a></li>
            <li><a href="index.html#relocation-guides">Rent Affordability (30% Rule)</a></li>
            <li><a href="index.html#relocation-guides">States with No Income Tax</a></li>
            <li><a href="index.html#relocation-guides">Best Cities for Tech Jobs</a></li>
            <li><a href="index.html#relocation-guides">Family Relocation Checklist</a></li>
          </ul>
        </div>

        <div class="footer-nav-col">
          <span class="col-head">COMPANY & LEGAL</span>
          <ul>
            <li><a href="about.php">About Us</a></li>
            <li><a href="methodology.php">Methodology &amp; Sources</a></li>
            <li><a href="editorial.html">Editorial Policy</a></li>
            <li><a href="contact.html">Contact Support</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms of Use</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <p class="disclaimer-text">
          <strong>Disclaimer:</strong> LivingCost provides informational estimates based on public research and government benchmarks. Data is modeled for comparison and does not constitute formal financial, legal, tax, or relocation advice.
        </p>
        <div class="copyright-row">
          <span>© 2026 LivingCost Global Inc. All rights reserved.</span>
          <span>Designed for modern mobility.</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- JS Dependencies -->
  <script src="data.js"></script>
  <script src="script.js"></script>
</body>
</html>