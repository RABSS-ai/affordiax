/**
 * LivingCost USA — Application Engine
 * Interactive calculators, search autocomplete, comparisons, and GSAP workflows.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Navigation, Country Switcher & Mobile Menu
     ========================================================================== */
  function initNav() {
    const toggle = document.getElementById('country-toggle');
    const dropdown = document.getElementById('country-dropdown');

    if (toggle && dropdown) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }

    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const centerMenu = document.querySelector('.nav-center-menu');
    if (mobileBtn && centerMenu) {
      mobileBtn.addEventListener('click', () => {
        const isShown = centerMenu.style.display === 'flex';
        centerMenu.style.display = isShown ? 'none' : 'flex';
        if (!isShown) {
          centerMenu.style.flexDirection = 'column';
          centerMenu.style.position = 'absolute';
          centerMenu.style.top = '100%';
          centerMenu.style.left = '0';
          centerMenu.style.width = '100%';
          centerMenu.style.background = '#ffffff';
          centerMenu.style.padding = '20px';
          centerMenu.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
        }
      });
    }
  }

  /* ==========================================================================
     2. Global Search with Autocomplete
     ========================================================================== */
  function initGlobalSearch() {
    const input = document.getElementById('global-search-input');
    const panel = document.getElementById('search-autocomplete-panel');
    const clearBtn = document.getElementById('search-clear');
    const citiesBox = document.getElementById('ac-cities');
    const statesBox = document.getElementById('ac-states');
    const guidesBox = document.getElementById('ac-guides');

    if (!input || !panel) return;

    // Inject custom styling for active list item hover/keyboard focus state
    const style = document.createElement('style');
    style.innerHTML = `
      .ac-item.ac-active {
        background-color: rgba(20, 184, 166, 0.15) !important;
        color: #0d9488 !important;
      }
    `;
    document.head.appendChild(style);

    let currentFocus = -1;

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      currentFocus = -1; // reset focus index
      if (q.length > 0) {
        if (clearBtn) clearBtn.style.display = 'block';
        panel.classList.add('show');
        renderAutocomplete(q);
      } else {
        if (clearBtn) clearBtn.style.display = 'none';
        panel.classList.remove('show');
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        panel.classList.remove('show');
        currentFocus = -1;
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-card-outer')) {
        panel.classList.remove('show');
      }
    });

    // Quick filter chips
    document.querySelectorAll('.pill-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.search;
        input.dispatchEvent(new Event('input'));
      });
    });

    // Keyboard navigation support
    input.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('show')) return;
      const items = panel.querySelectorAll('.ac-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentFocus++;
        addActive(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentFocus--;
        addActive(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) {
          items[currentFocus].click();
        }
      } else if (e.key === 'Escape') {
        panel.classList.remove('show');
        input.blur();
      }
    });

    function addActive(items) {
      removeActive(items);
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      items[currentFocus].classList.add('ac-active');
      items[currentFocus].scrollIntoView({ block: 'nearest' });
    }

    function removeActive(items) {
      items.forEach(item => item.classList.remove('ac-active'));
    }

    function highlightText(text, tokens) {
      if (!tokens || !tokens.length) return text;
      const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(t => t.length > 0);
      if (!escapedTokens.length) return text;
      const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
      return text.replace(regex, '<mark style="background: rgba(20, 184, 166, 0.15); color: #0d9488; font-weight: 700; padding: 0 2px; border-radius: 2px;">$1</mark>');
    }

    function renderAutocomplete(q) {
      const tokens = q.split(/\s+/).filter(t => t.length > 0);
      const comparisonRegex = /\s+(?:vs|to|and|compared\s+to|or)\s+/i;
      let comparisonHtml = '';

      // Check for dual-city comparison queries
      if (comparisonRegex.test(q)) {
        const parts = q.split(comparisonRegex);
        if (parts.length >= 2) {
          const partA = parts[0].trim().toLowerCase();
          const partB = parts[1].trim().toLowerCase();
          const cityA = CITIES_DATA.find(c => c.name.toLowerCase().includes(partA) || c.state.toLowerCase().includes(partA) || c.stateCode.toLowerCase().includes(partA));
          const cityB = CITIES_DATA.find(c => c.name.toLowerCase().includes(partB) || c.state.toLowerCase().includes(partB) || c.stateCode.toLowerCase().includes(partB));
          if (cityA && cityB && cityA.id !== cityB.id) {
            comparisonHtml = `
              <div class="ac-item" style="background: rgba(20, 184, 166, 0.08); border-left: 4px solid #14b8a6; font-weight: 600;" onclick="selectSearchComparison('${cityA.id}', '${cityB.id}')">
                <span>Compare <strong>${cityA.name}</strong> vs <strong>${cityB.name}</strong></span>
                <span class="ac-meta" style="color: #0d9488; font-weight: 700;">Launch Parity &rarr;</span>
              </div>
            `;
          }
        }
      }

      // Filter Cities with token-matching
      const matchedCities = CITIES_DATA.filter(c => {
        const targetText = `${c.name} ${c.state} ${c.stateCode}`.toLowerCase();
        return tokens.every(token => targetText.includes(token));
      }).slice(0, 3);

      if (citiesBox) {
        const citiesListHtml = matchedCities.map(c => {
          const displayName = highlightText(`${c.name}, ${c.stateCode}`, tokens);
          return `<div class="ac-item" onclick="selectSearchCity('${c.id}')"><span>${displayName}</span><span class="ac-meta">Avg Rent: $${c.rent}</span></div>`;
        }).join('');
        citiesBox.innerHTML = (comparisonHtml || citiesListHtml)
          ? comparisonHtml + citiesListHtml
          : `<div class="ac-item text-muted">No matching cities</div>`;
      }

      // Filter States with token-matching
      const matchedStates = STATES_DATA.filter(s => {
        const targetText = `${s.name} ${s.code}`.toLowerCase();
        return tokens.every(token => targetText.includes(token));
      }).slice(0, 3);

      if (statesBox) {
        statesBox.innerHTML = matchedStates.length
          ? matchedStates.map(s => {
              const displayName = highlightText(`${s.name} (${s.code})`, tokens);
              return `<div class="ac-item" onclick="selectSearchState('${s.code}')"><span>${displayName}</span><span class="ac-meta">Index: ${s.index}</span></div>`;
            }).join('')
          : `<div class="ac-item text-muted">No matching states</div>`;
      }

      // Filter Guides
      const matchedFaqs = TRENDING_FAQS.filter(f => {
        const targetText = `${f.title} ${f.category} ${f.snippet}`.toLowerCase();
        return tokens.every(token => targetText.includes(token));
      });
      const matchedEditorials = EDITORIAL_GUIDES.filter(e => {
        const targetText = `${e.title} ${e.category} ${e.snippet}`.toLowerCase();
        return tokens.every(token => targetText.includes(token));
      });
      const matchedGuides = [
        ...matchedFaqs.map(f => ({ ...f, type: 'faq', index: TRENDING_FAQS.indexOf(f) })),
        ...matchedEditorials.map(e => ({ ...e, type: 'guide', index: EDITORIAL_GUIDES.indexOf(e) }))
      ].slice(0, 2);

      if (guidesBox) {
        guidesBox.innerHTML = matchedGuides.length
          ? matchedGuides.map(g => {
              const displayTitle = highlightText(g.title, tokens);
              return `<div class="ac-item" onclick="selectSearchGuide('${g.type}', ${g.index})"><span>${displayTitle}</span><span class="ac-meta">${g.category}</span></div>`;
            }).join('')
          : `<div class="ac-item text-muted" onclick="viewAllGuides()" style="cursor: pointer;">View all relocation guides</div>`;
      }
    }
  }

  window.selectSearchCity = function (id) {
    const c = CITIES_DATA.find(x => x.id === id);
    if (c) {
      const sel = document.getElementById('calc-city-select');
      if (sel) {
        sel.value = c.id;
        calculateBudget();
      }
      document.getElementById('quick-calculator').scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.selectSearchComparison = function (idA, idB) {
    const selA = document.getElementById('compare-city-a');
    const selB = document.getElementById('compare-city-b');
    if (selA && selB) {
      selA.value = idA;
      selB.value = idB;
      selA.dispatchEvent(new Event('change'));
      selB.dispatchEvent(new Event('change'));
    }
    const compSec = document.getElementById('city-comparison');
    if (compSec) {
      compSec.scrollIntoView({ behavior: 'smooth' });
    }
    const panel = document.getElementById('search-autocomplete-panel');
    if (panel) panel.classList.remove('show');
  };

  window.selectSearchState = function (code) {
    const s = STATES_DATA.find(x => x.code === code);
    if (s) {
      const input = document.getElementById('state-filter-input');
      if (input) {
        input.value = s.name;
        input.dispatchEvent(new Event('input'));
      }
      const grid = document.getElementById('states-grid-container');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
      }
      const panel = document.getElementById('search-autocomplete-panel');
      if (panel) panel.classList.remove('show');
    }
  };

  window.selectSearchGuide = function (type, index) {
    let item;
    if (type === 'faq') {
      item = TRENDING_FAQS[index];
    } else if (type === 'guide') {
      item = EDITORIAL_GUIDES[index];
    }
    if (item) {
      showArticleModal(item.title, item.category, item.readTime || item.date || '', item.content || item.snippet);
      const panel = document.getElementById('search-autocomplete-panel');
      if (panel) panel.classList.remove('show');
    }
  };

  window.viewAllGuides = function () {
    showAllGuidesModal();
    const panel = document.getElementById('search-autocomplete-panel');
    if (panel) panel.classList.remove('show');
  };

  function showArticleModal(title, category, meta, content) {
    const existing = document.getElementById('editorial-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'editorial-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.25s ease';

    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = '#ffffff';
    contentBox.style.borderRadius = '16px';
    contentBox.style.padding = '32px';
    contentBox.style.maxWidth = '600px';
    contentBox.style.width = '90%';
    contentBox.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    contentBox.style.transform = 'scale(0.95)';
    contentBox.style.transition = 'transform 0.25s ease';
    contentBox.style.position = 'relative';

    contentBox.innerHTML = `
      <button id="modal-close-btn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; line-height: 1; transition: color 0.15s ease;">&times;</button>
      <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #0d9488; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">${category}</span>
      <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; line-height: 1.4;">${title}</h3>
      <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">${meta}</div>
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">${content}</p>
      <button id="modal-ok-btn" style="background-color: #0d9488; color: #ffffff; font-weight: 600; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.15s ease; width: 100%;">Done Reading</button>
    `;

    modal.appendChild(contentBox);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      contentBox.style.transform = 'scale(1)';
    });

    const close = () => {
      modal.style.opacity = '0';
      contentBox.style.transform = 'scale(0.95)';
      setTimeout(() => modal.remove(), 250);
    };

    document.getElementById('modal-close-btn').addEventListener('click', close);
    document.getElementById('modal-ok-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.onmouseover = () => { closeBtn.style.color = '#0f172a'; };
    closeBtn.onmouseout = () => { closeBtn.style.color = '#64748b'; };

    const okBtn = document.getElementById('modal-ok-btn');
    okBtn.onmouseover = () => { okBtn.style.backgroundColor = '#0f766e'; };
    okBtn.onmouseout = () => { okBtn.style.backgroundColor = '#0d9488'; };
  }

  function showAllGuidesModal() {
    const existing = document.getElementById('editorial-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'editorial-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.25s ease';

    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = '#ffffff';
    contentBox.style.borderRadius = '16px';
    contentBox.style.padding = '32px';
    contentBox.style.maxWidth = '700px';
    contentBox.style.width = '90%';
    contentBox.style.maxHeight = '85vh';
    contentBox.style.overflowY = 'auto';
    contentBox.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    contentBox.style.transform = 'scale(0.95)';
    contentBox.style.transition = 'transform 0.25s ease';
    contentBox.style.position = 'relative';

    const allGuides = [
      ...TRENDING_FAQS.map((f, i) => ({ ...f, type: 'faq', originalIndex: i })),
      ...EDITORIAL_GUIDES.map((g, i) => ({ ...g, type: 'guide', originalIndex: i }))
    ];

    contentBox.innerHTML = `
      <button id="modal-close-btn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; line-height: 1; transition: color 0.15s ease;">&times;</button>
      <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.2; font-family: 'Plus Jakarta Sans', sans-serif;">All Relocation & Cost Guides</h3>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Browse our full directory of expert blueprints, salary benchmarks, and cost optimizations.</p>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${allGuides.map((g, idx) => `
          <div class="all-guides-item" style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.15s ease-in-out;" data-type="${g.type}" data-index="${idx}">
            <span style="display: inline-block; font-size: 10px; font-weight: 700; color: #0d9488; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">${g.category}</span>
            <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">${g.title}</h4>
            <p style="font-size: 13px; color: #475569; margin: 0 0 10px 0; line-height: 1.5;">${g.snippet}</p>
            <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">${g.readTime || g.date || ''} &middot; Click to read full article &rarr;</span>
          </div>
        `).join('')}
      </div>
    `;

    modal.appendChild(contentBox);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      contentBox.style.transform = 'scale(1)';
    });

    const close = () => {
      modal.style.opacity = '0';
      contentBox.style.transform = 'scale(0.95)';
      setTimeout(() => modal.remove(), 250);
    };

    document.getElementById('modal-close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    contentBox.querySelectorAll('.all-guides-item').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.borderColor = '#0d9488'; item.style.backgroundColor = '#f0fdfa'; });
      item.addEventListener('mouseleave', () => { item.style.borderColor = '#e2e8f0'; item.style.backgroundColor = 'transparent'; });
      item.addEventListener('click', () => {
        const guide = allGuides[parseInt(item.dataset.index)];
        showArticleModal(guide.title, guide.category, guide.readTime || guide.date || '', guide.content || guide.snippet);
      });
    });
  }

  /* ==========================================================================
     3. Quick Cost Calculator Logic
     ========================================================================== */
  function initCalculator() {
    const citySelect = document.getElementById('calc-city-select');
    const salaryInput = document.getElementById('calc-salary-input');
    const salaryDisplay = document.getElementById('salary-display-val');
    const hhSelect = document.getElementById('calc-household');
    const houseSelect = document.getElementById('calc-housing-type');
    const btn = document.getElementById('btn-recalc');

    // Populate City Dropdown
    if (citySelect) {
      citySelect.innerHTML = CITIES_DATA.map(c => `<option value="${c.id}">${c.name}, ${c.stateCode}</option>`).join('');
      citySelect.value = "austin-tx";
    }

    salaryInput.addEventListener('input', (e) => {
      salaryDisplay.textContent = `$${parseInt(e.target.value).toLocaleString()}`;
      calculateBudget();
    });

    [citySelect, hhSelect, houseSelect].forEach(el => el && el.addEventListener('change', calculateBudget));
    if (btn) btn.addEventListener('click', calculateBudget);

    calculateBudget();
  }

  function calculateBudget() {
    const cityId = document.getElementById('calc-city-select').value;
    const salary = parseInt(document.getElementById('calc-salary-input').value);
    const hhFactor = parseFloat(document.getElementById('calc-household').value);
    const houseType = document.getElementById('calc-housing-type').value;

    const city = CITIES_DATA.find(c => c.id === cityId) || CITIES_DATA[0];

    // Housing calculation modifier
    let baseRent = city.rent;
    if (houseType === 'rent-1b') baseRent = city.rent * 0.85;
    else if (houseType === 'rent-3b') baseRent = city.rent * 1.35;
    else if (houseType === 'own') baseRent = city.rent * 1.45;

    // Scale food, transit, health based on household size
    const housing = Math.round(baseRent);
    const food = Math.round(city.expenses.food * (1 + (hhFactor - 1) * 0.6));
    const transit = Math.round(city.expenses.transit * (1 + (hhFactor - 1) * 0.3));
    const health = Math.round(city.expenses.health * (1 + (hhFactor - 1) * 0.5));
    const utils = Math.round(city.expenses.utils * (1 + (hhFactor - 1) * 0.2));
    const savings = Math.round(housing * 0.15);

    const totalMonthlyExpenses = housing + food + transit + health + utils + savings;

    // Estimated take home pay after federal & state taxes
    const taxRate = city.taxRate;
    const netMonthly = Math.round((salary * (1 - taxRate)) / 12);
    const remaining = netMonthly - totalMonthlyExpenses;

    // Update DOM
    document.getElementById('res-city-name').textContent = `${city.name}, ${city.state}`;
    document.getElementById('res-gross').textContent = `$${salary.toLocaleString()}`;
    document.getElementById('res-takehome').textContent = `$${netMonthly.toLocaleString()}/mo`;
    document.getElementById('res-expenses').textContent = `$${totalMonthlyExpenses.toLocaleString()}/mo`;

    const remEl = document.getElementById('res-remaining');
    remEl.textContent = `${remaining >= 0 ? '+' : ''}$${remaining.toLocaleString()}`;
    remEl.className = `stat-badge-num ${remaining >= 0 ? 'text-teal' : 'text-coral'}`;

    // Verdict
    const verdEl = document.getElementById('res-verdict');
    if (remaining > 1000) {
      verdEl.textContent = 'Very Comfortable';
      verdEl.className = 'text-teal';
    } else if (remaining >= 0) {
      verdEl.textContent = 'Comfortable';
      verdEl.className = 'text-teal';
    } else if (remaining > -600) {
      verdEl.textContent = 'Moderate / Tight';
      verdEl.className = 'text-gold';
    } else {
      verdEl.textContent = 'Financial Stretch';
      verdEl.className = 'text-coral';
    }

    // Update Bars
    updateBar('bar-housing', 'bar-housing-val', housing, totalMonthlyExpenses, 'Housing');
    updateBar('bar-food', 'bar-food-val', food, totalMonthlyExpenses, 'Food');
    updateBar('bar-transit', 'bar-transit-val', transit, totalMonthlyExpenses, 'Transit');
    updateBar('bar-health', 'bar-health-val', health, totalMonthlyExpenses, 'Healthcare');
    updateBar('bar-utils', 'bar-utils-val', utils, totalMonthlyExpenses, 'Utilities');
    updateBar('bar-savings', 'bar-savings-val', savings, totalMonthlyExpenses, 'Savings');
  }

  function updateBar(barId, labelId, val, total, name) {
    const pct = Math.round((val / total) * 100);
    const bar = document.getElementById(barId);
    const lbl = document.getElementById(labelId);
    if (bar && lbl) {
      bar.style.width = `${pct}%`;
      lbl.textContent = `$${val.toLocaleString()} (${pct}%)`;
    }
  }

  /* ==========================================================================
     4. City Cards Grid Rendering & Filtering
     ========================================================================== */
  function initCityCards() {
    const grid = document.getElementById('city-grid-container');
    if (!grid) return;

    function renderCards(filter) {
      const list = filter === 'all' ? CITIES_DATA : CITIES_DATA.filter(c => c.tier === filter);
      grid.innerHTML = list.map(c => `
        <article class="city-card">
          <div class="city-card-img-wrap">
            <img src="${c.img}" alt="${c.name} skyline" class="city-card-img" loading="lazy">
            <span class="city-card-badge badge-${c.tier.toLowerCase()}">${c.tier}</span>
          </div>
          <div class="city-card-body">
            <h3 class="city-name">${c.name}</h3>
            <span class="city-state">${c.state}</span>
            <div class="city-metrics-row">
              <div class="metric-item">
                <span class="lbl">Avg. Rent</span>
                <span class="val">$${c.rent.toLocaleString()}</span>
              </div>
              <div class="metric-item">
                <span class="lbl">Typical Salary</span>
                <span class="val">$${c.salary.toLocaleString()}</span>
              </div>
            </div>
            <div class="city-card-footer">
              <span class="index-pill">Cost Index: <strong>${c.index}</strong></span>
              <a href="#quick-calculator" onclick="selectSearchCity('${c.id}')" class="city-link">View Costs →</a>
            </div>
          </div>
        </article>
      `).join('');
    }

    renderCards('all');

    // Filter chip buttons
    document.querySelectorAll('#city-tier-filters .chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#city-tier-filters .chip').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderCards(e.target.dataset.filter);
      });
    });
  }

  /* ==========================================================================
     5. City Comparison Tool Logic
     ========================================================================== */
  function initComparisonTool() {
    const selA = document.getElementById('compare-city-a');
    const selB = document.getElementById('compare-city-b');
    const salInput = document.getElementById('compare-salary-base');

    if (!selA || !selB) return;

    // Populate selects
    const options = CITIES_DATA.map(c => `<option value="${c.id}">${c.name}, ${c.stateCode}</option>`).join('');
    selA.innerHTML = options;
    selB.innerHTML = options;

    selA.value = 'new-york-ny';
    selB.value = 'austin-tx';

    function runComparison() {
      const cityA = CITIES_DATA.find(c => c.id === selA.value) || CITIES_DATA[1];
      const cityB = CITIES_DATA.find(c => c.id === selB.value) || CITIES_DATA[0];
      const baseSalary = parseInt(salInput.value) || 100000;

      // Parity ratio based on overall index
      const parityRatio = cityB.index / cityA.index;
      const targetSalary = Math.round(baseSalary * parityRatio);

      document.getElementById('parity-text-a').textContent = `$${baseSalary.toLocaleString()} in ${cityA.name}`;
      document.getElementById('parity-text-b').textContent = `$${targetSalary.toLocaleString()} in ${cityB.name}`;

      const diffPct = Math.round(((cityB.index - cityA.index) / cityA.index) * 100);
      const diffText = diffPct < 0 ? `${Math.abs(diffPct)}% cheaper` : `${diffPct}% more expensive`;

      document.getElementById('parity-summary-sentence').innerHTML = `
        Living in <strong>${cityB.name}</strong> is overall <strong>${diffText}</strong> than in <strong>${cityA.name}</strong>. An income of <strong>$${targetSalary.toLocaleString()}</strong> affords an equivalent lifestyle.
      `;

      // Category breakdown comparison boxes
      const diffGrid = document.getElementById('compare-diff-grid');
      const cats = [
        { name: "Housing", a: cityA.expenses.housing, b: cityB.expenses.housing },
        { name: "Food & Dining", a: cityA.expenses.food, b: cityB.expenses.food },
        { name: "Transportation", a: cityA.expenses.transit, b: cityB.expenses.transit },
        { name: "Healthcare", a: cityA.expenses.health, b: cityB.expenses.health }
      ];

      diffGrid.innerHTML = cats.map(cat => {
        const catDiff = Math.round(((cat.b - cat.a) / cat.a) * 100);
        const isCheaper = catDiff <= 0;
        return `
          <div class="diff-box">
            <div class="diff-box-title">
              <span>${cat.name}</span>
              <span class="diff-pct ${isCheaper ? 'cheaper' : 'pricier'}">${catDiff > 0 ? '+' : ''}${catDiff}%</span>
            </div>
            <div class="diff-bar-track">
              <div class="diff-bar-fill" style="width: ${Math.min(100, Math.abs(catDiff) * 2)}%; background: ${isCheaper ? '#14b8a6' : '#f43f5e'}"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    [selA, selB, salInput].forEach(el => el.addEventListener('change', runComparison));
    runComparison();
  }

  /* ==========================================================================
     6. Salary Explorer Logic
     ========================================================================== */
  function initSalaryExplorer() {
    const salInput = document.getElementById('sal-input-amount');
    const citySel = document.getElementById('sal-input-city');
    const hhSel = document.getElementById('sal-input-household');

    if (!salInput || !citySel) return;

    citySel.innerHTML = CITIES_DATA.map(c => `<option value="${c.id}">${c.name}, ${c.stateCode}</option>`).join('');
    citySel.value = 'denver-co';

    function updateSalaryHealth() {
      const salary = parseInt(salInput.value) || 85000;
      const city = CITIES_DATA.find(c => c.id === citySel.value) || CITIES_DATA[0];

      const netMonthly = Math.round((salary * (1 - city.taxRate)) / 12);
      const essentials = Math.round(city.expenses.housing + city.expenses.food + city.expenses.transit + city.expenses.health);
      const remaining = netMonthly - essentials;
      const flexible = Math.max(0, Math.round(remaining * 0.45));
      const savings = Math.max(0, remaining - flexible);

      document.getElementById('sal-takehome').innerHTML = `$${netMonthly.toLocaleString()}<small>/mo</small>`;
      document.getElementById('sal-essentials').innerHTML = `$${essentials.toLocaleString()}<small>/mo</small>`;
      document.getElementById('sal-flexible').innerHTML = `$${flexible.toLocaleString()}<small>/mo</small>`;
      document.getElementById('sal-savings').innerHTML = `$${savings.toLocaleString()}<small>/mo</small>`;

      const badge = document.getElementById('sal-badge-status');
      if (savings > 800) {
        badge.textContent = `Strong competitive salary for ${city.name}`;
      } else if (savings > 200) {
        badge.textContent = `Adequate living wage for a household in ${city.name}`;
      } else {
        badge.textContent = `Tight budget — high living costs in ${city.name}`;
      }
    }

    [salInput, citySel, hhSel].forEach(el => el.addEventListener('input', updateSalaryHealth));
    updateSalaryHealth();
  }

  /* ==========================================================================
     7. Relocation Planner Analyzer
     ========================================================================== */
  function initRelocationPlanner() {
    const origSel = document.getElementById('relo-origin');
    const destSel = document.getElementById('relo-dest');
    const btn = document.getElementById('btn-analyze-move');

    if (!origSel || !destSel) return;

    const options = CITIES_DATA.map(c => `<option value="${c.id}">${c.name}, ${c.stateCode}</option>`).join('');
    origSel.innerHTML = options;
    destSel.innerHTML = options;

    origSel.value = 'los-angeles-ca';
    destSel.value = 'dallas-tx';

    function analyzeMove() {
      const o = CITIES_DATA.find(c => c.id === origSel.value) || CITIES_DATA[2];
      const d = CITIES_DATA.find(c => c.id === destSel.value) || CITIES_DATA[8];
      const salary = parseInt(document.getElementById('relo-salary').value) || 110000;

      document.getElementById('relo-origin-lbl').textContent = `${o.name}, ${o.stateCode}`;
      document.getElementById('relo-dest-lbl').textContent = `${d.name}, ${d.stateCode}`;

      const housingDiff = Math.round(((d.rent - o.rent) / o.rent) * 100);
      const taxDiff = Math.round((d.taxRate - o.taxRate) * 100);
      const overallDiff = Math.round(((d.index - o.index) / o.index) * 100);

      const annualExpenseSaved = Math.round((o.rent - d.rent) * 12 + (salary * (o.taxRate - d.taxRate)));

      document.getElementById('relo-housing-change').textContent = `${housingDiff < 0 ? '↓' : '↑'} ${Math.abs(housingDiff)}%`;
      document.getElementById('relo-taxes-change').textContent = `${taxDiff < 0 ? '↓' : '↑'} ${Math.abs(taxDiff)}%`;
      document.getElementById('relo-overall-change').textContent = `${overallDiff < 0 ? '↓' : '↑'} ${Math.abs(overallDiff)}%`;
      document.getElementById('relo-savings-annual').textContent = `${annualExpenseSaved >= 0 ? '+' : ''}$${annualExpenseSaved.toLocaleString()}`;
    }

    btn.addEventListener('click', analyzeMove);
    analyzeMove();
  }

  /* ==========================================================================
     8. Best Places Scorecards Rendering
     ========================================================================== */
  function initBestPlaces() {
    const grid = document.getElementById('places-grid-container');
    if (!grid) return;

    function renderPlaces(cat) {
      const filtered = BEST_PLACES_DATA.filter(p => p.cat.includes(cat));
      grid.innerHTML = filtered.map(p => `
        <div class="place-score-card">
          <div class="place-head">
            <h3 class="place-name">${p.name}</h3>
            <span class="subhead-badge">${cat.replace('-', ' ')}</span>
          </div>
          <div class="scores-bars-stack">
            <div class="score-row"><span>Affordability</span><span class="score-val">${p.affordability}/10</span></div>
            <div class="score-row"><span>Job Market</span><span class="score-val">${p.jobMarket}/10</span></div>
            <div class="score-row"><span>Quality of Life</span><span class="score-val">${p.qualityOfLife}/10</span></div>
            <div class="score-row"><span>Housing Value</span><span class="score-val">${p.housing}/10</span></div>
          </div>
          <a href="#quick-calculator" class="btn-explore-place">Explore ${p.name.split(',')[0]} Guides →</a>
        </div>
      `).join('');
    }

    renderPlaces('best-overall');

    document.querySelectorAll('#best-places-chips .chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#best-places-chips .chip').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderPlaces(e.target.dataset.cat);
      });
    });
  }

  /* ==========================================================================
     9. Personalized Salary Destination Tiers
     ========================================================================== */
  function initSalaryDestinations() {
    const input = document.getElementById('dest-salary-input');
    const btn = document.getElementById('btn-find-dest-cities');

    function populateTiers() {
      const sal = parseInt(input.value) || 75000;

      const comfy = document.getElementById('tier-comfortable-list');
      const mod = document.getElementById('tier-moderate-list');
      const chal = document.getElementById('tier-challenging-list');

      comfy.innerHTML = `
        <div class="dest-city-item"><span>Raleigh, NC</span><strong>High Purchasing Power</strong></div>
        <div class="dest-city-item"><span>Dallas, TX</span><strong>Zero State Income Tax</strong></div>
        <div class="dest-city-item"><span>Pittsburgh, PA</span><strong>Low Cost Median Rent</strong></div>
      `;

      mod.innerHTML = `
        <div class="dest-city-item"><span>Austin, TX</span><strong>Balanced Tech Market</strong></div>
        <div class="dest-city-item"><span>Denver, CO</span><strong>Outdoor Hub</strong></div>
        <div class="dest-city-item"><span>Chicago, IL</span><strong>Great Transit Savings</strong></div>
      `;

      chal.innerHTML = `
        <div class="dest-city-item"><span>New York City, NY</span><strong>High Rent Threshold</strong></div>
        <div class="dest-city-item"><span>Los Angeles, CA</span><strong>State Tax & Transit Costs</strong></div>
        <div class="dest-city-item"><span>Seattle, WA</span><strong>Elevated Housing Market</strong></div>
      `;
    }

    if (btn) btn.addEventListener('click', populateTiers);
    populateTiers();
  }

  /* ==========================================================================
     10. State Directory Grid Rendering & Search
     ========================================================================== */
  function initStateGrid() {
    const grid = document.getElementById('states-grid-container');
    const search = document.getElementById('state-filter-input');
    const showAllBtn = document.getElementById('btn-show-all-states');
    if (!grid) return;

    let showAll = false;

    function renderStates(filter) {
      let list = filter
        ? STATES_DATA.filter(s => s.name.toLowerCase().includes(filter) || s.code.toLowerCase().includes(filter))
        : STATES_DATA;

      if (!filter && !showAll) {
        list = list.slice(0, 8);
        if (showAllBtn) showAllBtn.style.display = 'block';
      } else {
        if (showAllBtn) showAllBtn.style.display = 'none';
      }

      grid.innerHTML = list.map(s => `
        <div class="state-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 class="state-card-name">${s.name} (${s.code})</h3>
            <div class="state-card-metrics">
              <div>Cost Index: <strong>${s.index}</strong></div>
              <div>Avg Rent: <strong>$${s.rent.toLocaleString()}</strong></div>
              <div>Income Tax: <strong>${s.tax}</strong></div>
              <div>Major Hubs: <em>${s.cities}</em></div>
            </div>
          </div>
          <div class="state-card-footer" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(226, 232, 240, 0.6); display: flex; justify-content: flex-end; align-items: center;">
            <a href="state.php?state=${s.name.toLowerCase().replace(/\s+/g, '-')}" class="city-link">View Costs →</a>
          </div>
        </div>
      `).join('');
    }

    renderStates('');

    if (search) {
      search.addEventListener('input', (e) => {
        renderStates(e.target.value.trim().toLowerCase());
      });
    }

    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        showAll = true;
        renderStates(search ? search.value.trim().toLowerCase() : '');
      });
    }
  }

  /* ==========================================================================
     11. FAQs & Relocation Guides Rendering
     ========================================================================== */
  function initEditorialSections() {
    const faqGrid = document.getElementById('trending-faq-grid');
    if (faqGrid) {
      faqGrid.innerHTML = TRENDING_FAQS.map((f, index) => `
        <article class="faq-card">
          <span class="article-category-tag">${f.category}</span>
          <h3 class="article-card-title">${f.title}</h3>
          <p class="article-card-snippet">${f.snippet}</p>
          <div class="article-card-footer">
            <span>${f.readTime}</span>
            <a href="#" class="read-guide-btn" data-faq-index="${index}">Read Answer →</a>
          </div>
        </article>
      `).join('');

      faqGrid.querySelectorAll('.read-guide-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.getAttribute('data-faq-index'));
          const faq = TRENDING_FAQS[idx];
          if (faq) {
            showArticleModal(faq.title, faq.category, faq.readTime, faq.content || faq.snippet);
          }
        });
      });
    }

    const guideGrid = document.getElementById('guides-grid-container');
    if (guideGrid) {
      guideGrid.innerHTML = EDITORIAL_GUIDES.map((g, index) => `
        <article class="guide-card">
          <span class="article-category-tag">${g.category}</span>
          <h3 class="article-card-title">${g.title}</h3>
          <p class="article-card-snippet">${g.snippet}</p>
          <div class="article-card-footer">
            <span>${g.date}</span>
            <a href="#" class="read-guide-btn" data-guide-index="${index}">Explore Guide →</a>
          </div>
        </article>
      `).join('');

      guideGrid.querySelectorAll('.read-guide-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.getAttribute('data-guide-index'));
          const guide = EDITORIAL_GUIDES[idx];
          if (guide) {
            showArticleModal(guide.title, guide.category, guide.date, guide.content || guide.snippet);
          }
        });
      });
    }

    document.querySelectorAll('.view-all-link').forEach(link => {
      link.addEventListener('click', (e) => { e.preventDefault(); showAllGuidesModal(); });
    });

    // Global delegation for fallback / safety
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const txt = target.textContent.toLowerCase();
      if (target.classList.contains('view-all-link') || txt.includes('120+') || (txt.includes('view all') && txt.includes('guides'))) {
        e.preventDefault();
        showAllGuidesModal();
      }
    });
  }

  /* ==========================================================================
     11b. Cost Breakdown Donut Chart
     ========================================================================== */
  function initDonutChart() {
    const svg = document.getElementById('donut-svg-element');
    if (!svg) return;

    const segments = [
      { pct: 34, color: '#3b82f6' }, // Housing & Shelter
      { pct: 17, color: '#6366f1' }, // Federal & State Taxes
      { pct: 14, color: '#f59e0b' }, // Transportation & Gas
      { pct: 13, color: '#10b981' }, // Food & Groceries
      { pct: 8, color: '#ef4444' },  // Healthcare & Insurance
      { pct: 6, color: '#8b5cf6' },  // Utilities & Energy
      { pct: 8, color: '#06b6d4' }   // Discretionary & Misc
    ];

    let accumulated = 0;
    let html = '';

    segments.forEach(seg => {
      html += `
        <circle
          cx="18"
          cy="18"
          r="15.91549430918954"
          fill="transparent"
          stroke="${seg.color}"
          stroke-width="3.5"
          stroke-dasharray="${seg.pct} 100"
          stroke-dashoffset="-${accumulated}"
        ></circle>
      `;
      accumulated += seg.pct;
    });

    svg.innerHTML = html;
  }

  /* ==========================================================================
     12. GSAP ScrollTrigger Entrance Animations
     ========================================================================== */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.from('.hero-headline', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
    gsap.from('.hero-subhead', { opacity: 0, y: 20, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.search-card-outer', { opacity: 0, y: 20, duration: 0.8, delay: 0.4, ease: 'power3.out' });

    gsap.utils.toArray('.calc-card-grid, .city-card, .compare-card-main').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  // App Bootstrap
  window.addEventListener('DOMContentLoaded', () => {
    initNav();
    initGlobalSearch();
    initCalculator();
    initCityCards();
    initComparisonTool();
    initSalaryExplorer();
    initRelocationPlanner();
    initBestPlaces();
    initSalaryDestinations();
    initStateGrid();
    initEditorialSections();
    initDonutChart();
    initScrollAnimations();
  });
})();