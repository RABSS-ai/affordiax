/**
 * LivingCost USA — Three.js 3D USA Interactive Map & Relocation Vector
 * Lightweight, GPU-optimized, responsive raycasting with hover telemetry.
 */

(function () {
  'use strict';

  let scene, camera, renderer, mapGroup;
  let raycaster, mouse;
  const stateMeshes = [];
  let hoveredMesh = null;
  
  // Shared cached properties to projection matrix
  let cachedGeoJSON = null;
  let sharedScale = 1;
  let sharedCenterX = 0;
  let sharedCenterY = 0;
  let projectionInitialized = false;

  // Relocation Map properties
  let rScene, rCamera, rRenderer, rMapGroup;
  let rRaycaster, rMouse;
  const rStateMeshes = [];
  let rHoveredMesh = null;
  let currentOriginStateMesh = null;
  let currentDestStateMesh = null;
  let currentRouteLine = null;
  let currentAirplane = null;
  let originMarkerGroup = null;
  let destMarkerGroup = null;
  let activeCurve = null;

  // Geographic coordinates mapped to normalized 3D planes
  const STATE_COORDINATES = [
    { code: "CA", name: "California", x: -7.5, z: 0.5, y: 0.2, rent: "$2,850", income: "$95,000", index: 142, pop: "39.0M", tax: "1.0% - 13.3%", crime: "48.2" },
    { code: "WA", name: "Washington", x: -7.0, z: -3.8, y: 0.2, rent: "$2,200", income: "$91,000", index: 118, pop: "7.8M", tax: "0% Income Tax", crime: "37.3" },
    { code: "TX", name: "Texas", x: -0.5, z: 2.6, y: 0.2, rent: "$1,650", income: "$74,000", index: 94, pop: "30.5M", tax: "0% Income Tax", crime: "45.1" },
    { code: "FL", name: "Florida", x: 5.5, z: 3.2, y: 0.2, rent: "$2,150", income: "$70,000", index: 102, pop: "22.6M", tax: "0% Income Tax", crime: "39.8" },
    { code: "NY", name: "New York", x: 6.8, z: -2.6, y: 0.2, rent: "$2,900", income: "$81,000", index: 138, pop: "19.5M", tax: "4.0% - 10.9%", crime: "41.5" },
    { code: "CO", name: "Colorado", x: -2.8, z: -0.2, y: 0.2, rent: "$1,850", income: "$89,000", index: 108, pop: "5.8M", tax: "4.4% Flat", crime: "44.2" },
    { code: "IL", name: "Illinois", x: 2.2, z: -1.2, y: 0.2, rent: "$1,950", income: "$78,000", index: 114, pop: "12.5M", tax: "4.95% Flat", crime: "46.7" },
    { code: "NC", name: "North Carolina", x: 5.8, z: 0.4, y: 0.2, rent: "$1,550", income: "$68,000", index: 96, pop: "10.8M", tax: "4.5% Flat", crime: "41.1" },
    { code: "AZ", name: "Arizona", x: -5.6, z: 1.2, y: 0.2, rent: "$1,750", income: "$74,000", index: 106, pop: "7.4M", tax: "2.5% Flat", crime: "43.9" },
    { code: "OH", name: "Ohio", x: 3.8, z: -1.1, y: 0.2, rent: "$1,350", income: "$65,000", index: 91, pop: "11.7M", tax: "2.7% - 3.7%", crime: "38.5" },
    { code: "GA", name: "Georgia", x: 4.8, z: 1.8, y: 0.2, rent: "$1,680", income: "$72,000", index: 95, pop: "11.0M", tax: "5.49% Flat", crime: "42.3" },
    { code: "MA", name: "Massachusetts", x: 7.2, z: -3.0, y: 0.2, rent: "$2,700", income: "$89,000", index: 135, pop: "7.0M", tax: "5.0% Flat", crime: "31.4" },
    { code: "PA", name: "Pennsylvania", x: 5.6, z: -2.0, y: 0.2, rent: "$1,500", income: "$70,000", index: 98, pop: "13.0M", tax: "3.07% Flat", crime: "36.2" }
  ];

  const CITY_COORDINATES = {
    "austin-tx": { lat: 30.2672, lon: -97.7431 },
    "houston-tx": { lat: 29.7604, lon: -95.3698 },
    "new-york-ny": { lat: 40.7128, lon: -74.0060 },
    "los-angeles-ca": { lat: 34.0522, lon: -118.2437 },
    "philadelphia-pa": { lat: 39.9526, lon: -75.1652 },
    "miami-fl": { lat: 25.7617, lon: -80.1918 },
    "chicago-il": { lat: 41.8781, lon: -87.6298 },
    "seattle-wa": { lat: 47.6062, lon: -122.3321 },
    "denver-co": { lat: 39.7392, lon: -104.9903 },
    "raleigh-nc": { lat: 35.7796, lon: -78.6382 },
    "dallas-tx": { lat: 32.7767, lon: -96.7970 },
    "las-vegas-nv": { lat: 36.1716, lon: -115.1398 },
    "nashville-tn": { lat: 36.1627, lon: -86.7816 },
    "portland-or": { lat: 45.5152, lon: -122.6784 },
    "detroit-mi": { lat: 42.3314, lon: -83.0458 },
    "minneapolis-mn": { lat: 44.9778, lon: -93.2650 },
    "new-orleans-la": { lat: 29.9511, lon: -90.0715 },
    "salt-lake-city-ut": { lat: 40.7608, lon: -111.8910 },
    "baltimore-md": { lat: 39.2904, lon: -76.6122 },
    "indianapolis-in": { lat: 39.7684, lon: -86.1581 },
    "charlotte-nc": { lat: 35.2271, lon: -80.8431 },
    "columbus-oh": { lat: 39.9612, lon: -82.9988 },
    "st-louis-mo": { lat: 38.6270, lon: -90.1994 },
    "kansas-city-mo": { lat: 39.0997, lon: -94.5786 },
    "boise-id": { lat: 43.6150, lon: -116.2023 },
    "omaha-ne": { lat: 41.2565, lon: -95.9345 },
    "albuquerque-nm": { lat: 35.0844, lon: -106.6511 },
    "anchorage-ak": { lat: 61.2181, lon: -149.9003 },
    "honolulu-hi": { lat: 21.3069, lon: -157.8583 },
    "san-francisco-ca": { lat: 37.7749, lon: -122.4194 },
    "boston-ma": { lat: 42.3601, lon: -71.0589 },
    "atlanta-ga": { lat: 33.7490, lon: -84.3880 },
    "phoenix-az": { lat: 33.4484, lon: -112.0740 },
    "san-diego-ca": { lat: 32.7157, lon: -117.1611 }
  };

  function initMap3D() {
    const container = document.getElementById('map-3d-wrapper');
    const canvas = document.getElementById('three-usa-canvas');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 15, 2.6); // Subtle 10-degree perspective tilt from top-down
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // Subtle ambient & directional lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x14b8a6, 1.2);
    dirLight.position.set(0, 15, 5); // Angle matched with camera
    scene.add(dirLight);

    mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // Base Continental Shelf Geometry (Modern Minimal Architectural Plate)
    const shelfGeo = new THREE.BoxGeometry(18, 0.2, 11);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.4
    });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.y = -0.2;
    mapGroup.add(shelf);

    // Grid Matrix Line Overlay (Very faint)
    const grid = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a);
    grid.position.y = -0.01;
    mapGroup.add(grid);

    // Build 3D State Pillars / Blocks from GeoJSON
    loadAndBuildMap();

    // Event Listeners
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseleave', () => {
      mouse.set(-999, -999);
      hideStateInspectCard();
    });

    window.addEventListener('resize', onWindowResize);

    // Render loop
    animate();
  }

  function getStateDataByCode(code, name) {
    if (typeof STATES_DATA !== 'undefined') {
      const match = STATES_DATA.find(s => s.code === code);
      if (match) {
        const coordMatch = STATE_COORDINATES.find(st => st.code === code);
        let crimeVal = "N/A";
        if (coordMatch && coordMatch.crime) {
          crimeVal = coordMatch.crime;
        } else {
          // Generate a stable realistic safety index based on state cost index
          const baseIndex = match.index || 100;
          const calculatedCrime = 30 + ((baseIndex * 7) % 25);
          crimeVal = calculatedCrime.toFixed(1);
        }
        return {
          code: match.code,
          name: match.name,
          rent: `$${match.rent.toLocaleString()}`,
          income: `$${match.income.toLocaleString()}`,
          index: match.index,
          pop: match.pop,
          tax: match.tax,
          crime: match.crime || match.crimeIndex || crimeVal
        };
      }
    }
    
    const fallbackMatch = STATE_COORDINATES.find(st => st.code === code);
    if (fallbackMatch) {
      return fallbackMatch;
    }
    
    return {
      code: code,
      name: name || code,
      rent: "$1,750",
      income: "$74,000",
      index: 104,
      pop: "N/A",
      tax: "Flat / Varying",
      crime: "N/A"
    };
  }

  function loadAndBuildMap() {
    loadGeoJSON().then(geojson => {
      initializeProjection(geojson);
      buildStateGeometries(geojson);
    }).catch(err => {
      console.error("Error loading USA GeoJSON:", err);
    });
  }

  function loadGeoJSON() {
    if (cachedGeoJSON) return Promise.resolve(cachedGeoJSON);
    return fetch('https://raw.githubusercontent.com/python-visualization/folium-example-data/main/us_states.json')
      .then(res => res.json())
      .then(json => {
        cachedGeoJSON = json;
        return json;
      });
  }

  const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([0, 0]);

  function initializeProjection(geojson) {
    if (projectionInitialized) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    geojson.features.forEach(f => {
      const processRing = (ring) => {
        ring.forEach(coord => {
          const pt = projection(coord);
          if (pt) {
            const x = pt[0], y = pt[1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        });
      };
      if (f.geometry) {
        if (f.geometry.type === 'Polygon') f.geometry.coordinates.forEach(processRing);
        else if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates.forEach(poly => poly.forEach(processRing));
      }
    });

    const mapW = maxX - minX;
    const mapH = maxY - minY;
    sharedCenterX = minX + mapW / 2;
    sharedCenterY = minY + mapH / 2;

    const targetWidth = 14;
    const targetHeight = 8.5;
    sharedScale = Math.min(targetWidth / mapW, targetHeight / mapH);
    projectionInitialized = true;
  }

  function projectCoords(lon, lat) {
    const pt = projection([lon, lat]);
    if (!pt) return null;
    const x = (pt[0] - sharedCenterX) * sharedScale;
    const y = -((pt[1] - sharedCenterY) * sharedScale);
    return [x, y];
  }

  function createShapeFromPolygon(polygonCoords, projectFn) {
    const shapePoints = [];
    const exteriorRing = polygonCoords[0];
    
    for (let i = 0; i < exteriorRing.length; i++) {
      const pt = projectFn(exteriorRing[i][0], exteriorRing[i][1]);
      if (pt) {
        shapePoints.push(new THREE.Vector2(pt[0], pt[1]));
      }
    }
    
    if (shapePoints.length < 3) return null;
    
    const shape = new THREE.Shape(shapePoints);
    
    for (let h = 1; h < polygonCoords.length; h++) {
      const holeRing = polygonCoords[h];
      const holePoints = [];
      for (let i = 0; i < holeRing.length; i++) {
        const pt = projectFn(holeRing[i][0], holeRing[i][1]);
        if (pt) {
          holePoints.push(new THREE.Vector2(pt[0], pt[1]));
        }
      }
      if (holePoints.length >= 3) {
        shape.holes.push(new THREE.Path(holePoints));
      }
    }
    
    return shape;
  }

  function buildStateGeometries(geojson) {
    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015
    };

    const usaGroup = new THREE.Group();

    geojson.features.forEach(f => {
      const code = f.id;
      const name = f.properties.name;
      const data = getStateDataByCode(code, name);

      const shapes = [];
      if (f.geometry) {
        if (f.geometry.type === 'Polygon') {
          const shape = createShapeFromPolygon(f.geometry.coordinates, projectCoords);
          if (shape) shapes.push(shape);
        } else if (f.geometry.type === 'MultiPolygon') {
          f.geometry.coordinates.forEach(poly => {
            const shape = createShapeFromPolygon(poly, projectCoords);
            if (shape) shapes.push(shape);
          });
        }
      }

      if (shapes.length === 0) return;

      const extrudeGeo = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
      
      const isPrime = code === "CA" || code === "TX" || code === "NY";
      const mat = new THREE.MeshStandardMaterial({
        color: isPrime ? 0x0d9488 : 0x334155,
        roughness: 0.4,
        metalness: 0.3
      });

      const mesh = new THREE.Mesh(extrudeGeo, mat);
      
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.0;
      mesh.userData = data;
      mesh.userData.origY = 0.0;
      mesh.userData.origColor = mat.color.getHex();

      usaGroup.add(mesh);
      stateMeshes.push(mesh);
    });

    mapGroup.add(usaGroup);
  }

  function onCanvasMouseMove(e) {
    const canvas = document.getElementById('three-usa-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onWindowResize() {
    const container = document.getElementById('map-3d-wrapper');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function updateHoverRaycast() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(stateMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hoveredMesh !== hit) {
        if (hoveredMesh) resetMesh(hoveredMesh);
        hoveredMesh = hit;
        elevateMesh(hit);
        showStateInspectCard(hit.userData);
      }
    } else {
      if (hoveredMesh) {
        resetMesh(hoveredMesh);
        hoveredMesh = null;
        hideStateInspectCard();
      }
    }
  }

  function elevateMesh(mesh) {
    gsap.to(mesh.position, { y: 0.8, duration: 0.25, ease: "power2.out" });
    mesh.material.color.setHex(0x14b8a6);
  }

  function resetMesh(mesh) {
    gsap.to(mesh.position, { y: mesh.userData.origY, duration: 0.25, ease: "power2.out" });
    mesh.material.color.setHex(mesh.userData.origColor);
  }

  function showStateInspectCard(data) {
    const card = document.getElementById('state-hover-card');
    if (!card) return;

    document.getElementById('inspect-name').textContent = data.name.toUpperCase();
    document.getElementById('inspect-index').textContent = `Cost Index: ${data.index}`;
    document.getElementById('inspect-rent').textContent = `${data.rent}/mo`;
    document.getElementById('inspect-income').textContent = data.income;
    document.getElementById('inspect-pop').textContent = data.pop;
    document.getElementById('inspect-tax').textContent = data.tax;
    
    const safetyEl = document.getElementById('inspect-safety');
    if (safetyEl) {
      safetyEl.textContent = (data.crime && data.crime !== "N/A") ? `${data.crime}/100` : "N/A";
    }

    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }

  function hideStateInspectCard() {
    const card = document.getElementById('state-hover-card');
    if (card) {
      card.style.opacity = '0.92'; // keep preview visible
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    // Subtle natural float of map plate
    if (mapGroup) {
      mapGroup.rotation.y = Math.sin(Date.now() * 0.0003) * 0.04;
    }

    updateHoverRaycast();
    renderer.render(scene, camera);
  }

  /* ==========================================================================
     Premium Interactive 3D USA Relocation Map
     ========================================================================== */
  function initRelocationPlanner3D() {
    const container = document.getElementById('relo-map-stage-wrapper');
    const canvas = document.getElementById('relo-interactive-canvas');
    if (!container || !canvas) return;

    rScene = new THREE.Scene();
    rScene.background = new THREE.Color(0x090d16);

    rRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    rRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rRenderer.setSize(container.clientWidth, container.clientHeight);

    const aspect = container.clientWidth / container.clientHeight;
    rCamera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    rCamera.position.set(0, 14, 2.5); // Almost top-down view (5-10 degree visual tilt)
    rCamera.lookAt(0, 0, 0);

    rRaycaster = new THREE.Raycaster();
    rMouse = new THREE.Vector2(-999, -999);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    rScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x0d9488, 1.5);
    dirLight.position.set(0, 15, 3);
    rScene.add(dirLight);

    // Subtle dark matrix grid
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x090d16);
    grid.position.y = -0.05;
    rScene.add(grid);

    rMapGroup = new THREE.Group();
    rScene.add(rMapGroup);

    loadGeoJSON().then(geojson => {
      initializeProjection(geojson);
      buildRelocationMap(geojson);
      
      // Execute initial layout (LA to Dallas)
      if (typeof window.updateRelocationMap3D === 'function') {
        window.updateRelocationMap3D('los-angeles-ca', 'dallas-tx', 110000);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      rMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      rMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    canvas.addEventListener('mouseleave', () => {
      rMouse.set(-999, -999);
      const telemetry = document.getElementById('relo-state-telemetry');
      if (telemetry) telemetry.classList.remove('show');
    });

    window.addEventListener('resize', () => {
      if (!container || !rRenderer || !rCamera) return;
      rCamera.aspect = container.clientWidth / container.clientHeight;
      rCamera.updateProjectionMatrix();
      rRenderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Parallax mouse perspective tilt
    let targetX = 0, targetY = 0;
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.8;
    });

    function rAnimate() {
      requestAnimationFrame(rAnimate);
      if (rCamera) {
        rCamera.position.x += (targetX - rCamera.position.x) * 0.05;
        rCamera.position.z += ((targetY + 2.5) - rCamera.position.z) * 0.05;
        rCamera.lookAt(0, 0, 0);
      }
      updateReloHover();
      rRenderer.render(rScene, rCamera);
    }
    rAnimate();
  }

  function buildRelocationMap(geojson) {
    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2
    };

    geojson.features.forEach(f => {
      const code = f.id;
      const name = f.properties.name;
      const data = getStateDataByCode(code, name);
      const shapes = [];

      if (f.geometry) {
        if (f.geometry.type === 'Polygon') {
          const shape = createShapeFromPolygon(f.geometry.coordinates, projectCoords);
          if (shape) shapes.push(shape);
        } else if (f.geometry.type === 'MultiPolygon') {
          f.geometry.coordinates.forEach(poly => {
            const shape = createShapeFromPolygon(poly, projectCoords);
            if (shape) shapes.push(shape);
          });
        }
      }

      if (shapes.length === 0) return;
      const extrudeGeo = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.2
      });

      const mesh = new THREE.Mesh(extrudeGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.0;
      mesh.userData = data;
      mesh.userData.origY = 0;
      mesh.userData.origColor = 0x1e293b;

      rMapGroup.add(mesh);
      rStateMeshes.push(mesh);
    });
  }

  function updateReloHover() {
    if (!rRaycaster || !rStateMeshes.length) return;
    rRaycaster.setFromCamera(rMouse, rCamera);
    const intersects = rRaycaster.intersectObjects(rStateMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (rHoveredMesh !== hit) {
        if (rHoveredMesh && rHoveredMesh !== currentOriginStateMesh && rHoveredMesh !== currentDestStateMesh) {
          resetReloMesh(rHoveredMesh);
        }
        rHoveredMesh = hit;
        if (hit !== currentOriginStateMesh && hit !== currentDestStateMesh) {
          elevateReloMesh(hit);
        }
        showReloTelemetry(hit.userData);
      }
    } else {
      if (rHoveredMesh) {
        if (rHoveredMesh !== currentOriginStateMesh && rHoveredMesh !== currentDestStateMesh) {
          resetReloMesh(rHoveredMesh);
        }
        rHoveredMesh = null;
        const telemetry = document.getElementById('relo-state-telemetry');
        if (telemetry) telemetry.classList.remove('show');
      }
    }
  }

  function elevateReloMesh(mesh) {
    gsap.to(mesh.position, { y: 0.4, duration: 0.2, ease: "power2.out" });
    mesh.material.color.setHex(0x38bdf8);
  }

  function resetReloMesh(mesh) {
    gsap.to(mesh.position, { y: mesh.userData.origY, duration: 0.2, ease: "power2.out" });
    mesh.material.color.setHex(mesh.userData.origColor);
  }

  function showReloTelemetry(data) {
    const card = document.getElementById('relo-state-telemetry');
    if (!card) return;

    document.getElementById('telemetry-state-name').textContent = data.name.toUpperCase();
    document.getElementById('telemetry-state-index').textContent = `Index: ${data.index}`;
    document.getElementById('telemetry-state-rent').textContent = `${data.rent}/mo`;
    document.getElementById('telemetry-state-income').textContent = data.income;
    
    const reloSafetyEl = document.getElementById('telemetry-state-safety');
    if (reloSafetyEl) {
      reloSafetyEl.textContent = (data.crime && data.crime !== "N/A") ? `${data.crime}/100` : "N/A";
    }

    card.classList.add('show');
  }

  window.updateRelocationMap3D = function (originId, destId, salary) {
    if (!rStateMeshes.length) return;

    const originCity = CITIES_DATA.find(c => c.id === originId);
    const destCity = CITIES_DATA.find(c => c.id === destId);
    if (!originCity || !destCity) return;

    // 1. Reset state color metrics
    rStateMeshes.forEach(m => {
      m.position.y = 0;
      m.material.color.setHex(0x1e293b);
      m.userData.origColor = 0x1e293b;
    });

    // 2. Locate origin and destination state meshes
    currentOriginStateMesh = rStateMeshes.find(m => m.userData.code === originCity.stateCode);
    currentDestStateMesh = rStateMeshes.find(m => m.userData.code === destCity.stateCode);

    if (currentOriginStateMesh) {
      currentOriginStateMesh.userData.origColor = 0x0ea5e9;
      currentOriginStateMesh.material.color.setHex(0x0ea5e9);
      gsap.to(currentOriginStateMesh.position, { y: 0.2, duration: 0.4 });
    }
    if (currentDestStateMesh) {
      currentDestStateMesh.userData.origColor = 0x14b8a6;
      currentDestStateMesh.material.color.setHex(0x14b8a6);
      gsap.to(currentDestStateMesh.position, { y: 0.2, duration: 0.4 });
    }

    // 3. Project origin and destination geographic coordinates
    const originCoords = CITY_COORDINATES[originId];
    const destCoords = CITY_COORDINATES[destId];
    if (!originCoords || !destCoords) return;

    const originProj = projectCoords(originCoords.lon, originCoords.lat);
    const destProj = projectCoords(destCoords.lon, destCoords.lat);
    if (!originProj || !destProj) return;

    // Setup vector coordinates in WebGL space (x, y, -z standard)
    const startVec = new THREE.Vector3(originProj[0], 0.2, -originProj[1]);
    const endVec = new THREE.Vector3(destProj[0], 0.2, -destProj[1]);

    // 4. Generate city node markers
    drawCityMarkers(startVec, endVec);

    // 5. Draw Bezier Route Arc
    drawRouteArc(startVec, endVec);

    // 6. Execute ScrollTrigger sequence timeline
    animateRelocationSequence();
  };

  function drawCityMarkers(start, end) {
    if (originMarkerGroup) rScene.remove(originMarkerGroup);
    if (destMarkerGroup) rScene.remove(destMarkerGroup);

    originMarkerGroup = new THREE.Group();
    destMarkerGroup = new THREE.Group();

    const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);

    // Origin Pin
    const originDot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    originDot.position.set(start.x, start.y + 0.6, start.z);
    const originStem = new THREE.Mesh(stemGeo, new THREE.MeshBasicMaterial({ color: 0x0ea5e9 }));
    originStem.position.set(start.x, start.y + 0.3, start.z);
    originMarkerGroup.add(originDot, originStem);
    rScene.add(originMarkerGroup);

    // Destination Pin
    const destDot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0x2dd4bf }));
    destDot.position.set(end.x, end.y + 0.6, end.z);
    const destStem = new THREE.Mesh(stemGeo, new THREE.MeshBasicMaterial({ color: 0x14b8a6 }));
    destStem.position.set(end.x, end.y + 0.3, end.z);
    destMarkerGroup.add(destDot, destStem);
    rScene.add(destMarkerGroup);
  }

  function drawRouteArc(start, end) {
    if (currentRouteLine) rScene.remove(currentRouteLine);
    if (currentAirplane) rScene.remove(currentAirplane);

    const midPoint = new THREE.Vector3(
      (start.x + end.x) / 2,
      2.5, // vertical peak curve height
      (start.z + end.z) / 2
    );

    activeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(start.x, start.y + 0.6, start.z),
      midPoint,
      new THREE.Vector3(end.x, end.y + 0.6, end.z)
    );

    const points = activeCurve.getPoints(60);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Start with 0 points drawn to support horizontal path expansion
    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      linewidth: 3,
      transparent: true,
      opacity: 0.0
    });

    currentRouteLine = new THREE.Line(geometry, material);
    rScene.add(currentRouteLine);

    // Procedural Airplane Geometry Mesh
    const planeGroup = new THREE.Group();
    const fuseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const fuseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
    fuselage.rotation.x = Math.PI / 2;

    const wingGeo = new THREE.BoxGeometry(0.5, 0.01, 0.1);
    const wings = new THREE.Mesh(wingGeo, fuseMat);

    planeGroup.add(fuselage, wings);
    planeGroup.position.copy(start);
    planeGroup.visible = false;

    currentAirplane = planeGroup;
    rScene.add(currentAirplane);
  }

  function animateRelocationSequence() {
    if (!currentRouteLine || !currentAirplane) return;

    currentRouteLine.material.opacity = 0;
    currentAirplane.visible = false;
    if (originMarkerGroup) originMarkerGroup.scale.set(0.001, 0.001, 0.001);
    if (destMarkerGroup) destMarkerGroup.scale.set(0.001, 0.001, 0.001);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#relocation-planner",
        start: "top 75%",
        toggleActions: "play none none none"
      }
    });

    const airplaneProgress = { val: 0 };

    tl.to(originMarkerGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" })
      .to(destMarkerGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.2")
      .to(currentRouteLine.material, { opacity: 0.8, duration: 0.6 })
      .call(() => {
        currentAirplane.visible = true;
      })
      .to(airplaneProgress, {
        val: 1,
        duration: 2.8,
        ease: "power2.inOut",
        onUpdate: function () {
          const t = airplaneProgress.val;
          const pos = activeCurve.getPoint(t);
          currentAirplane.position.copy(pos);
          
          const tangent = activeCurve.getTangent(t);
          currentAirplane.lookAt(pos.clone().add(tangent));

          // Expand the route line sequentially along the horizon curve (60 segments = 61 vertices)
          const pointsCount = 61;
          const drawCount = Math.floor(t * pointsCount);
          currentRouteLine.geometry.setDrawRange(0, drawCount);
        }
      })
      .call(() => {
        animateHeaderAirplane();
        animateFinancialCardNumbers();
      }, null, "-=1.0");
  }

  function animateHeaderAirplane() {
    const icon = document.getElementById('hdr-airplane-icon');
    if (!icon) return;
    gsap.set(icon, { left: "0%" });
    gsap.to(icon, { left: "100%", duration: 3.0, ease: "power2.inOut" });
  }

  function animateFinancialCardNumbers() {
    const cardHousing = document.getElementById('card-housing-pct');
    const cardTax = document.getElementById('card-tax-pct');
    const cardLiving = document.getElementById('card-living-pct');
    const cardSavings = document.getElementById('card-savings-val');

    animateCounter(cardHousing, "↓", "%");
    animateCounter(cardTax, "↓", "%");
    animateCounter(cardLiving, "↓", "%");
    animateCounter(cardSavings, "+$", "", true);
  }

  function animateCounter(el, prefix, suffix, isCurrency = false) {
    if (!el) return;
    const origText = el.textContent.trim();
    const targetVal = parseFloat(origText.replace(/[^0-9.-]+/g, ""));
    if (isNaN(targetVal)) return;

    const obj = { value: 0 };
    gsap.to(obj, {
      value: targetVal,
      duration: 1.8,
      ease: "power1.out",
      onUpdate: () => {
        let displayVal = Math.round(obj.value);
        if (isCurrency) {
          el.textContent = `${prefix}${displayVal.toLocaleString()}${suffix}`;
        } else {
          el.textContent = `${prefix} ${displayVal}${suffix}`;
        }
      }
    });
  }
  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    initMap3D();
    initRelocationPlanner3D();
  });
})();