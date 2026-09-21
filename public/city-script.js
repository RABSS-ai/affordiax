/**
 * LivingCost USA — City Page Dynamic Script Engine
 */

(function () {
  'use strict';

  // Dynamically populated from controller PHP scope
  const currentCity = window.LIVING_COST_CITY_DATA;
  if (!currentCity) return;

  /* ==========================================================================
     1. Interactive Gauge and Animated Sectors
     ========================================================================== */
  function animateVisualMetrics() {
    if (typeof gsap === 'undefined') return;

    // Sector bars trigger on entering viewport
    gsap.utils.toArray('.bar-fill').forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      gsap.to(bar, {
        scrollTrigger: {
          trigger: bar,
          start: 'top 90%'
        },
        width: targetWidth,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
  }

  /* ==========================================================================
     2. Calculator Engine
     ========================================================================== */
  function initCalculator() {
    const slider = document.getElementById('input-calc-salary');
    const readout = document.getElementById('calc-salary-readout');
    const household = document.getElementById('input-calc-household');
    const housing = document.getElementById('input-calc-housing');
    const bedrooms = document.getElementById('input-calc-bedrooms');

    if (!slider) return;

    function runRecalculate() {
      const salary = parseInt(slider.value);
      readout.textContent = `$${salary.toLocaleString()}/yr`;

      const hhFactor = parseFloat(household.value);
      const isRenting = housing.value === 'rent';
      const beds = bedrooms.value;

      // Estimate base rental rates dynamically based on inputs
      let rentBase = currentCity.housing.oneBedroom;
      if (beds === 'studio') rentBase = currentCity.housing.studio;
      else if (beds === '2b') rentBase = currentCity.housing.twoBedroom;
      else if (beds === '3b') rentBase = currentCity.housing.threeBedroom;

      if (!isRenting) {
        rentBase = rentBase * 1.35; // Mortgage premiums
      }

      const housingCost = Math.round(rentBase);
      const foodCost = Math.round(currentCity.costs.groceries * (1 + (hhFactor - 1) * 0.5));
      const transitCost = Math.round(currentCity.costs.transportation * (1 + (hhFactor - 1) * 0.3));
      const otherCost = Math.round(currentCity.costs.other * (1 + (hhFactor - 1) * 0.4));

      const totalOutgoings = housingCost + foodCost + transitCost + otherCost;
      const netMonthlyIncome = Math.round((salary * (1 - currentCity.taxRate)) / 12);
      const remaining = netMonthlyIncome - totalOutgoings;

      // Update display nodes
      document.getElementById('out-gross').textContent = `$${salary.toLocaleString()}/yr`;
      document.getElementById('out-takehome').textContent = `$${netMonthlyIncome.toLocaleString()}/mo`;
      document.getElementById('out-expenses').textContent = `$${totalOutgoings.toLocaleString()}/mo`;

      const remNode = document.getElementById('out-remaining');
      remNode.textContent = `${remaining >= 0 ? '+' : ''}$${remaining.toLocaleString()}/mo`;
      
      const verdictNode = document.getElementById('out-verdict');
      if (remaining > 1500) {
        verdictNode.textContent = 'Highly Comfortable';
        verdictNode.className = 'verdict-banner text-teal';
      } else if (remaining >= 0) {
        verdictNode.textContent = 'Comfortable Profile';
        verdictNode.className = 'verdict-banner text-teal';
      } else {
        verdictNode.textContent = 'Financial Stretch';
        verdictNode.className = 'verdict-banner text-coral';
      }
    }

    slider.addEventListener('input', runRecalculate);
    [household, housing, bedrooms].forEach(el => el.addEventListener('change', runRecalculate));
    runRecalculate();
  }

  /* ==========================================================================
     3. Relocation Equivalency Tool
     ========================================================================== */
  function initEquivalencyTool() {
    const baseSalaryInput = document.getElementById('relo-advisor-salary');
    const targetSelect = document.getElementById('relo-advisor-target');
    const calcButton = document.getElementById('btn-relo-calc-trigger');

    if (!targetSelect || typeof CITIES_DATA === 'undefined') return;

    // Populate selection parameters from database js source
    targetSelect.innerHTML = CITIES_DATA.map(c => {
      if (c.id === currentCity.slug + '-' + currentCity.stateCode.toLowerCase()) return '';
      return `<option value="${c.index}">${c.name}, ${c.stateCode}</option>`;
    }).join('');

    function computeEquivalency() {
      const baseSalary = parseInt(baseSalaryInput.value) || 100000;
      const targetIndex = parseInt(targetSelect.value);
      
      const equivalentValue = Math.round(baseSalary * (targetIndex / currentCity.costIndex));
      document.getElementById('relo-advisor-result').textContent = `$${equivalentValue.toLocaleString()}`;
    }

    calcButton.addEventListener('click', computeEquivalency);
    computeEquivalency();
  }

  /* ==========================================================================
     4. FAQ Accordion Mechanics
     ========================================================================== */
  function initFaqAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
      });
    });
  }

  // Related Internal Linking
  function renderRelatedCities() {
    const grid = document.getElementById('related-cities-grid-box');
    if (!grid || typeof CITIES_DATA === 'undefined') return;
    grid.innerHTML = CITIES_DATA.slice(0, 6).map(c => `
      <a href="/usa/${c.state.toLowerCase().replace(/\s+/g, '-')}/${c.id.replace(/-[a-z]{2}$/, '')}/" class="related-city-item">
        <strong>${c.name}, ${c.stateCode}</strong>
        <span>Cost index: ${c.index}</span>
      </a>
    `).join('');
  }

  window.addEventListener('DOMContentLoaded', () => {
    animateVisualMetrics();
    initCalculator();
    initEquivalencyTool();
    initFaqAccordion();
    renderRelatedCities();
  });
})();