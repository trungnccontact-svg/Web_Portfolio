"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Globe,
  Compass,
  Layers,
  Search,
  Pin,
  Ruler,
  Clock,
  Plus,
  Minus,
  X,
  RefreshCw,
  Sliders,
  Settings,
  Grid,
  Square,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  RotateCw,
  Layers3,
  Activity,
  Terminal,
  Info,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Navigation
} from "lucide-react";

// Preset Geological Scanning Coordinates
interface SpaceTarget {
  id: string;
  name: string;
  lat: string;
  lng: string;
  latVal: number;
  lngVal: number;
  altitude: string;
  sensors: string[];
  description: string;
  geology: string;
  image: string;
}

const ORBITAL_TARGETS: SpaceTarget[] = [
  {
    id: "mekong",
    name: "Mekong Delta, Vietnam",
    lat: "10.2418° N",
    lng: "105.9612° E",
    latVal: 10.2418,
    lngVal: 105.9612,
    altitude: "405 km (ISS)",
    sensors: ["Landsat-8 OLI", "Sentinel-2 MSI"],
    description: "One of the most fertile agricultural regions in Southeast Asia, known as the 'Rice Bowl' of Vietnam.",
    geology: "Alluvial plain featuring complex distributary river networks, high sediment deposit runoff, and dense mangrove vegetation margins.",
    image: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cape",
    name: "Cape Canaveral, Florida",
    lat: "28.3922° N",
    lng: "80.6077° W",
    latVal: 28.3922,
    lngVal: -80.6077,
    altitude: "411 km (Landsat)",
    sensors: ["WorldView-4", "Sentinel-1 SAR"],
    description: "The primary spaceport on the East Coast of the United States, home to NASA Kennedy Space Center launches.",
    geology: "Barrier island coastal topography, maritime scrub habitats, sandy estuary coastlines, and engineered launch structures.",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "pyramids",
    name: "Giza Plateau, Egypt",
    lat: "29.9792° N",
    lng: "31.1342° E",
    latVal: 29.9792,
    lngVal: 31.1342,
    altitude: "408 km (GeoEye)",
    sensors: ["GeoEye-1", "LIDAR Scanner"],
    description: "Historical ancient complex featuring the Great Pyramid of Giza, Sphinx, and outlying archaeological sites.",
    geology: "Desert limestone plateau forming a stable structural bedrock, surrounded by dense urban sprawl borders and arid sand fields.",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "canyon",
    name: "Grand Canyon, Arizona",
    lat: "36.0544° N",
    lng: "112.1401° W",
    latVal: 36.0544,
    lngVal: -112.1401,
    altitude: "415 km (Sentinel-2)",
    sensors: ["ASTER TIR", "LIDAR Profiler"],
    description: "One of the deepest and most spectacular erosion gorges on the surface of the Earth, carved by the Colorado River.",
    geology: "Horizontal sedimentary strata layers representing millions of years of geological history, deep canyons, and high plateau steps.",
    image: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hanoi",
    name: "Hanoi, Capital Region",
    lat: "21.0285° N",
    lng: "105.8542° E",
    latVal: 21.0285,
    lngVal: 105.8542,
    altitude: "406 km (ISS)",
    sensors: ["Sentinel-2 MSI", "Landsat-9"],
    description: "The historic administrative capital of Vietnam, settled along the banks of the mighty Red River.",
    geology: "Dense historic urban structures surrounding major lakes (Hoan Kiem, West Lake) on an alluvial plain basin, subject to monsoon hydrology.",
    image: "https://images.unsplash.com/photo-1509060464153-44667396260f?auto=format&fit=crop&w=800&q=80"
  }
];

// Earth continent outlines coordinates for custom realistic projection vector maps
const EARTH_CONTINENTS = [
  // North America
  [
    { lat: 75, lng: -160 }, { lat: 80, lng: -120 }, { lat: 80, lng: -80 },
    { lat: 70, lng: -60 }, { lat: 50, lng: -50 }, { lat: 45, lng: -65 },
    { lat: 25, lng: -80 }, { lat: 9, lng: -79 }, { lat: 16, lng: -93 },
    { lat: 20, lng: -105 }, { lat: 30, lng: -115 }, { lat: 48, lng: -125 },
    { lat: 60, lng: -145 }, { lat: 65, lng: -168 }, { lat: 72, lng: -168 }
  ],
  // South America
  [
    { lat: 12, lng: -72 }, { lat: 8, lng: -55 }, { lat: -5, lng: -35 },
    { lat: -23, lng: -43 }, { lat: -53, lng: -68 }, { lat: -55, lng: -71 },
    { lat: -45, lng: -75 }, { lat: -20, lng: -70 }, { lat: -5, lng: -80 },
    { lat: 5, lng: -77 }
  ],
  // Europe & Asia (Eurasia)
  [
    { lat: 70, lng: -10 }, { lat: 75, lng: 20 }, { lat: 75, lng: 60 },
    { lat: 75, lng: 100 }, { lat: 75, lng: 140 }, { lat: 70, lng: 170 },
    { lat: 60, lng: 160 }, { lat: 50, lng: 140 }, { lat: 35, lng: 140 },
    { lat: 22, lng: 120 }, { lat: 10, lng: 105 }, { lat: 6, lng: 95 },
    { lat: 20, lng: 70 }, { lat: 12, lng: 44 }, { lat: 30, lng: 32 },
    { lat: 40, lng: 26 }, { lat: 36, lng: 15 }, { lat: 36, lng: -5 },
    { lat: 43, lng: -10 }, { lat: 50, lng: -10 }, { lat: 60, lng: 5 }
  ],
  // Africa
  [
    { lat: 35, lng: 10 }, { lat: 30, lng: 32 }, { lat: 12, lng: 43 },
    { lat: 5, lng: 50 }, { lat: -34, lng: 20 }, { lat: -33, lng: 18 },
    { lat: 5, lng: 9 }, { lat: 15, lng: -17 }, { lat: 32, lng: -17 }
  ],
  // Australia
  [
    { lat: -11, lng: 131 }, { lat: -11, lng: 136 }, { lat: -15, lng: 143 },
    { lat: -25, lng: 153 }, { lat: -38, lng: 146 }, { lat: -35, lng: 115 },
    { lat: -22, lng: 113 }
  ],
  // Greenland
  [
    { lat: 83, lng: -30 }, { lat: 80, lng: -10 }, { lat: 70, lng: -20 },
    { lat: 60, lng: -45 }, { lat: 60, lng: -50 }, { lat: 70, lng: -60 },
    { lat: 78, lng: -70 }
  ],
  // Antarctica
  [
    { lat: -80, lng: -180 }, { lat: -80, lng: -120 }, { lat: -80, lng: -60 },
    { lat: -80, lng: 0 }, { lat: -80, lng: 60 }, { lat: -80, lng: 120 },
    { lat: -80, lng: 180 }
  ]
];

interface CustomPlacemark {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export function NasaObservatory() {
  const t = useTranslations("nav");

  // Client-side DOM overrides to hide portfolio headers and footers for full immersive Google Earth web app viewport
  React.useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const main = document.querySelector("main");

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (main) {
      main.style.padding = "0";
      main.style.margin = "0";
      main.style.maxWidth = "100vw";
      main.style.height = "100vh";
      main.style.overflow = "hidden";
    }

    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (main) {
        main.style.padding = "";
        main.style.margin = "";
        main.style.maxWidth = "";
        main.style.height = "";
        main.style.overflow = "";
      }
    };
  }, []);

  // Simulator Core States
  const [selectedTarget, setSelectedTarget] = React.useState<SpaceTarget>(ORBITAL_TARGETS[0]);
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [scanProgress, setScanProgress] = React.useState<number>(100);
  const [spectralMode, setSpectralMode] = React.useState<"visible" | "thermal" | "ndvi">("visible");
  const [sensorOpacity, setSensorOpacity] = React.useState<number>(85);
  const [subdividedCells, setSubdividedCells] = React.useState<Set<string>>(new Set(["t"]));
  const [hoveredCell, setHoveredCell] = React.useState<string | null>(null);

  // Left Sidebar and Active Tab
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = React.useState<boolean>(false);
  const [activeSidebarSection, setActiveSidebarSection] = React.useState<"places" | "layers" | "quadtree" | "manual" | "console">("places");

  // Web Toolbar and Overlay States
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeTool, setActiveTool] = React.useState<"none" | "placemark" | "line" | "polygon">("none");
  const [historicalYear, setHistoricalYear] = React.useState<number>(2026);
  const [showHistorySlider, setShowHistorySlider] = React.useState<boolean>(false);
  const [activeMenuDropdown, setActiveMenuDropdown] = React.useState<string | null>(null);

  // Placemarks and measuring vectors
  const [customPlacemarks, setCustomPlacemarks] = React.useState<CustomPlacemark[]>([
    { id: "1", name: "Custom Landmark Alpha", lat: 15.0, lng: 101.5 }
  ]);
  const [measuringPoints, setMeasuringPoints] = React.useState<{ lat: number; lng: number }[]>([]);
  const [drawPolygonPoints, setDrawPolygonPoints] = React.useState<{ lat: number; lng: number }[]>([]);
  const [tempPlacemarkCoords, setTempPlacemarkCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [showPlacemarkModal, setShowPlacemarkModal] = React.useState<boolean>(false);
  const [placemarkInputName, setPlacemarkInputName] = React.useState<string>("");

  // Real Earth satellite texture mapping states
  const [textureLoaded, setTextureLoaded] = React.useState<boolean>(false);
  const textureDataRef = React.useRef<{
    data: Uint8ClampedArray;
    width: number;
    height: number;
  } | null>(null);

  // Real-time Coordinate Telemetry States
  const [selectedCoords, setSelectedCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [telemetryData, setTelemetryData] = React.useState<{
    placeName: string;
    country: string;
    state: string;
    city: string;
    temp: number;
    apparentTemp: number;
    humidity: number;
    cloudCover: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
    isDay: number;
    timezone: string;
    timezoneAbbrev: string;
    localTime: string;
    elevation: number;
    latency: number;
  } | null>(null);
  const [telemetryLoading, setTelemetryLoading] = React.useState<boolean>(false);
  const [telemetryError, setTelemetryError] = React.useState<string | null>(null);
  const [showTelemetryHUD, setShowTelemetryHUD] = React.useState<boolean>(false);

  const getWeatherDesc = (code: number): { text: string; icon: string; color: string } => {
    switch (code) {
      case 0:
        return { text: "Clear Sky", icon: "☀️", color: "text-amber-400" };
      case 1:
      case 2:
      case 3:
        return { text: "Partly Cloudy", icon: "⛅", color: "text-slate-300" };
      case 45:
      case 48:
        return { text: "Foggy", icon: "🌫️", color: "text-slate-400" };
      case 51:
      case 53:
      case 55:
        return { text: "Light Drizzle", icon: "🌧️", color: "text-cyan-300" };
      case 61:
      case 63:
      case 65:
        return { text: "Rainy", icon: "🌧️", color: "text-blue-400" };
      case 71:
      case 73:
      case 75:
        return { text: "Snowy", icon: "🌨️", color: "text-sky-200" };
      case 80:
      case 81:
      case 82:
        return { text: "Showers", icon: "🌦️", color: "text-cyan-400" };
      case 95:
      case 96:
      case 99:
        return { text: "Thunderstorm", icon: "⛈️", color: "text-purple-400 animate-pulse" };
      default:
        return { text: "Overcast", icon: "☁️", color: "text-slate-400" };
    }
  };

  const handleGlobeClick = async (lat: number, lng: number) => {
    if (activeTool !== "none") return;

    setSelectedCoords({ lat, lng });
    setTelemetryLoading(true);
    setTelemetryError(null);
    setShowTelemetryHUD(true);

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev,
      `[${timestamp}] [API] Initiating telemetry lock for WGS-84 coordinate: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°...`
    ]);

    try {
      const startTime = Date.now();
      
      const [geoRes, weatherRes] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
          headers: {
            "User-Agent": "GoogleEarthReplica/1.0 (contact: user@portfolio.com)"
          }
        }).then(r => r.ok ? r.json() : null),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=auto`).then(r => r.ok ? r.json() : null)
      ]);

      const latency = Date.now() - startTime;
      
      if (!geoRes && !weatherRes) {
        throw new Error("Unable to contact live telemetry servers.");
      }

      const placeName = geoRes?.display_name || "Unknown Location (Open Ocean)";
      const address = geoRes?.address || {};
      const country = address.country || "";
      const state = address.state || address.region || "";
      const city = address.city || address.town || address.village || address.suburb || "";

      const current = weatherRes?.current || {};
      const timezone = weatherRes?.timezone || "GMT";
      const timezoneAbbrev = weatherRes?.timezone_abbrev || "";
      const localTimeFull = current.time ? new Date(current.time) : new Date();
      const localTimeStr = localTimeFull.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone
      });
      
      const elevation = weatherRes?.elevation || 0;

      setTelemetryData({
        placeName,
        country,
        state,
        city,
        temp: current.temperature_2m || 0,
        apparentTemp: current.apparent_temperature || 0,
        humidity: current.relative_humidity_2m || 0,
        cloudCover: current.cloud_cover || 0,
        windSpeed: current.wind_speed_10m || 0,
        precipitation: current.precipitation || 0,
        weatherCode: current.weather_code || 0,
        isDay: current.is_day === undefined ? 1 : current.is_day,
        timezone,
        timezoneAbbrev,
        localTime: localTimeStr,
        elevation,
        latency
      });

      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [API SUCCESS] Live telemetry locked. Place: ${city || country || "Ocean"} | Temp: ${current.temperature_2m}°C | Latency: ${latency}ms.`
      ]);
    } catch (err: any) {
      console.error(err);
      setTelemetryError(err.message || "Failed to fetch live coordinate metrics.");
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [API ERROR] Telemetry lock failed: ${err.message || "Connection refused"}.`
      ]);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const getDMS = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const absLat = Math.abs(lat);
    const latDeg = Math.floor(absLat);
    const latMin = Math.floor((absLat - latDeg) * 60);
    const latSec = ((absLat - latDeg - latMin / 60) * 3600).toFixed(1);

    const lngDir = lng >= 0 ? "E" : "W";
    const absLng = Math.abs(lng);
    const lngDeg = Math.floor(absLng);
    const lngMin = Math.floor((absLng - lngDeg) * 60);
    const lngSec = ((absLng - lngDeg - lngMin / 60) * 3600).toFixed(1);

    return `${latDeg}°${latMin}'${latSec}" ${latDir}  |  ${lngDeg}°${lngMin}'${lngSec}" ${lngDir}`;
  };

  const handleFlyToCoords = () => {
    if (!selectedCoords) return;
    const cam = earthCameraRef.current;
    setHistoryStack((prev) => [...prev, { yaw: cam.yaw, pitch: cam.pitch, z: cam.z }]);
    setRedoStack([]);

    cam.targetYaw = (selectedCoords.lng * Math.PI) / 180;
    cam.targetPitch = (selectedCoords.lat * Math.PI) / 180;
    cam.targetZ = 450;
    cam.isTransitioning = true;
    cam.transitionTimer = 0;

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev,
      `[${timestamp}] [NAVIGATION] Flight plan locked to geodetic target (${selectedCoords.lat.toFixed(4)}°, ${selectedCoords.lng.toFixed(4)}°). Easing camera target...`
    ]);
  };

  const handleGlobeClickRef = React.useRef(handleGlobeClick);
  React.useEffect(() => {
    handleGlobeClickRef.current = handleGlobeClick;
  }, [handleGlobeClick]);

  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    // Load local high-resolution photorealistic Earth daymap texture first
    img.src = "/images/earth_daymap.png";
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0);
        const imgData = tempCtx.getImageData(0, 0, img.width, img.height);
        textureDataRef.current = {
          data: imgData.data,
          width: img.width,
          height: img.height
        };
        setTextureLoaded(true);
        setTerminalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SYSTEM] Real Earth satellite texture map loaded locally into RAM.`
        ]);
      }
    };
    img.onerror = () => {
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [WARNING] Local Earth texture not found. Falling back to online resource...`
      ]);
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = "anonymous";
      fallbackImg.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Solarsystemscope_texture_2k_earth_daymap.jpg/1024px-Solarsystemscope_texture_2k_earth_daymap.jpg";
      fallbackImg.onload = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = fallbackImg.width;
        tempCanvas.height = fallbackImg.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(fallbackImg, 0, 0);
          const imgData = tempCtx.getImageData(0, 0, fallbackImg.width, fallbackImg.height);
          textureDataRef.current = {
            data: imgData.data,
            width: fallbackImg.width,
            height: fallbackImg.height
          };
          setTextureLoaded(true);
          setTerminalLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [SYSTEM] Online Earth satellite texture map fallback loaded successfully.`
          ]);
        }
      };
      fallbackImg.onerror = () => {
        setTerminalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [WARNING] Failed to load online Earth satellite texture. Falling back to vector grids.`
        ]);
      };
    };
  }, []);

  // Style and rendering options
  const [mapStyle, setMapStyle] = React.useState<"satellite" | "shaded" | "neon">("satellite");
  const [showAtmosphere, setShowAtmosphere] = React.useState<boolean>(true);
  const [showGridLines, setShowGridLines] = React.useState<boolean>(true);
  const [showSpaceStars, setShowSpaceStars] = React.useState<boolean>(true);
  const [showLabels, setShowLabels] = React.useState<boolean>(true);
  const [is3DMode, setIs3DMode] = React.useState<boolean>(true);

  // Street View Pegman States
  const [streetViewActive, setStreetViewActive] = React.useState<boolean>(false);
  const [streetViewPanoRef, setStreetViewPanoRef] = React.useState<HTMLCanvasElement | null>(null);
  const [streetViewPanoYaw, setStreetViewPanoYaw] = React.useState<number>(0);
  const [streetViewPanoImage, setStreetViewPanoImage] = React.useState<HTMLImageElement | null>(null);

  // Telemetry references for high-speed dynamic updates (eliminates React parent lags)
  const coordsTextRef = React.useRef<HTMLSpanElement | null>(null);
  const elevationTextRef = React.useRef<HTMLSpanElement | null>(null);
  const altitudeTextRef = React.useRef<HTMLSpanElement | null>(null);
  const scaleTextRef = React.useRef<HTMLSpanElement | null>(null);
  const scaleLineRef = React.useRef<HTMLDivElement | null>(null);

  // General console telemetry logger
  const [terminalLogs, setTerminalLogs] = React.useState<string[]>([
    "[SYSTEM INITIALIZED] NASA Space Telemetry Client online.",
    "[ORBIT] Google Earth Simulator core initialized.",
    "[SIGNAL] Latency with ISS ground station: 120ms.",
    "[SENSORS] Multispectral scanning calibration complete."
  ]);
  const terminalEndRef = React.useRef<HTMLDivElement>(null);

  // Canvas context elements
  const [earthCanvasNode, setEarthCanvasNode] = React.useState<HTMLCanvasElement | null>(null);
  const earthCanvasRef = React.useCallback((node: HTMLCanvasElement | null) => {
    setEarthCanvasNode(node);
  }, []);

  const earthCameraRef = React.useRef({
    yaw: 0.8,
    pitch: 0.15,
    z: 750, // Camera Altitude
    targetYaw: 0.8,
    targetPitch: 0.15,
    targetZ: 750,
    transitionTimer: 0,
    isTransitioning: false,
    globeInterpolation: 1.0 // 1.0 = 3D Spheroid, 0.0 = 2D Flat Map
  });

  const mouseHoverCoordsRef = React.useRef<{ lat: number; lng: number } | null>(null);
  const mouseIsDraggingRef = React.useRef<boolean>(false);
  const lastMousePosRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Navigation History Stack
  const [historyStack, setHistoryStack] = React.useState<{ yaw: number; pitch: number; z: number }[]>([]);
  const [redoStack, setRedoStack] = React.useState<{ yaw: number; pitch: number; z: number }[]>([]);

  // Periodically insert telemetry logs in background console logs tab
  React.useEffect(() => {
    const logPool = [
      "Sentinel-2: Data packet transmission complete.",
      "Landsat-8: Recalibrating band-10 Thermal Infrared sensor.",
      "GIS-ENGINE: Reprojecting WGS-84 coordinate grids to screen pixels.",
      "QUADTREE: Loading level-of-detail tiles for sector coordinate.",
      "ORBIT: Crossing terminator line. Satellite entering Earth shadow.",
      "TELEMETRY: Battery charge at 96.8%. Solar arrays optimized.",
      "SENSOR: Spectral signatures mapping urban expansion rates.",
      "NASA-APOD: Downloading astronomical observatory datasets...",
      "ALERT: Micro-meteoroid orbital tracking adjustments verified.",
      "GEOLOGY: Sediment runoff spike recorded in delta estuary channels."
    ];

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString();
      setTerminalLogs((prev) => [...prev.slice(-40), `[${timestamp}] ${randomLog}`]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs, activeSidebarSection]);

  // Handle Scanning Presets for Tab 1
  const handleSelectTarget = (target: SpaceTarget) => {
    if (isScanning) return;

    // Push past state to history stack
    const cam = earthCameraRef.current;
    setHistoryStack((prev) => [...prev, { yaw: cam.yaw, pitch: cam.pitch, z: cam.z }]);
    setRedoStack([]);

    setSelectedTarget(target);
    setIsScanning(true);
    setScanProgress(0);

    // Initialize fly-to s-curve transition to coordinates
    cam.targetYaw = (target.lngVal * Math.PI) / 180;
    cam.targetPitch = (target.latVal * Math.PI) / 180;
    cam.targetZ = 360; // Zoom in close!
    cam.isTransitioning = true;
    cam.transitionTimer = 0;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setScanProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setTerminalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [GEO LOCK] Coordinates locked at: ${target.lat} | Lng: ${target.lng}`
        ]);
      }
    }, 80);
  };

  // Autocomplete coordinates search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    const matchedPreset = ORBITAL_TARGETS.find(
      (t) => t.name.toLowerCase().includes(query) || t.id.includes(query)
    );

    const cam = earthCameraRef.current;
    setHistoryStack((prev) => [...prev, { yaw: cam.yaw, pitch: cam.pitch, z: cam.z }]);
    setRedoStack([]);

    if (matchedPreset) {
      handleSelectTarget(matchedPreset);
    } else {
      const parts = query.split(/[\s,]+/);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          cam.targetYaw = (lng * Math.PI) / 180;
          cam.targetPitch = (lat * Math.PI) / 180;
          cam.targetZ = 380;
          cam.isTransitioning = true;
          cam.transitionTimer = 0;
          setTerminalLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [SEARCH] Vector focus coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
          ]);
          return;
        }
      }
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [SEARCH ERROR] Coordinate resolution fail for "${searchQuery}".`
      ]);
    }
  };

  // Undo/Redo Camera Movements
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const cam = earthCameraRef.current;
    const prev = historyStack[historyStack.length - 1];
    setRedoStack((prevStack) => [...prevStack, { yaw: cam.yaw, pitch: cam.pitch, z: cam.z }]);
    setHistoryStack((prevStack) => prevStack.slice(0, -1));

    cam.targetYaw = prev.yaw;
    cam.targetPitch = prev.pitch;
    cam.targetZ = prev.z;
    cam.isTransitioning = true;
    cam.transitionTimer = 0;
    setTerminalLogs((prevLogs) => [...prevLogs, `[UNDO] Reverted camera navigation target.`]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const cam = earthCameraRef.current;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prevStack) => [...prevStack, { yaw: cam.yaw, pitch: cam.pitch, z: cam.z }]);
    setRedoStack((prevStack) => prevStack.slice(0, -1));

    cam.targetYaw = next.yaw;
    cam.targetPitch = next.pitch;
    cam.targetZ = next.z;
    cam.isTransitioning = true;
    cam.transitionTimer = 0;
    setTerminalLogs((prevLogs) => [...prevLogs, `[REDO] Restored camera navigation target.`]);
  };

  // Quadtree subdivision
  const handleCellClick = (cellId: string) => {
    if (cellId.length > 3) {
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [GIS LAB] Level-of-Detail limit hit at tile ${cellId}.`
      ]);
      return;
    }

    setSubdividedCells((prev) => {
      const next = new Set(prev);
      if (next.has(cellId)) {
        next.delete(cellId);
        for (const key of Array.from(next)) {
          if (key.startsWith(cellId)) {
            next.delete(key);
          }
        }
      } else {
        next.add(cellId);
        setTerminalLogs((prevLogs) => [
          ...prevLogs,
          `[${new Date().toLocaleTimeString()}] [QUADTREE SPLIT] Divided tile ${cellId} into sectors: ${cellId}0, ${cellId}1, ${cellId}2, ${cellId}3.`
        ]);
      }
      return next;
    });
  };

  // Recursive Quadtree cell renderer
  const renderQuadtreeCell = (cellId: string): React.JSX.Element => {
    const isSubdivided = subdividedCells.has(cellId);
    const level = cellId.length - 1; // "t" is Level 0, "t0" is Level 1, etc.
    const scaleMap: Record<number, string> = {
      0: "1:2,500,000",
      1: "1:625,000",
      2: "1:156,250",
      3: "1:39,062"
    };
    const resMap: Record<number, string> = {
      0: "250 km/tile",
      1: "62.5 km/tile",
      2: "15.6 km/tile",
      3: "3.9 km/tile"
    };

    if (isSubdivided) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full border border-cyan-500/25">
          {renderQuadtreeCell(`${cellId}0`)}
          {renderQuadtreeCell(`${cellId}1`)}
          {renderQuadtreeCell(`${cellId}2`)}
          {renderQuadtreeCell(`${cellId}3`)}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleCellClick(cellId)}
        onMouseEnter={() => setHoveredCell(cellId)}
        onMouseLeave={() => setHoveredCell(null)}
        className={`w-full h-full border border-white/10 hover:border-cyan-400 bg-white/[0.02] hover:bg-cyan-500/10 flex flex-col items-center justify-center p-1 transition-all relative overflow-hidden group cursor-pointer ${
          hoveredCell === cellId ? "border-cyan-400 shadow-inner shadow-cyan-400/5" : ""
        }`}
      >
        <span className="font-mono text-[8px] font-black text-cyan-400 group-hover:text-cyan-300">
          {cellId}
        </span>
        <span className="text-[6px] text-slate-500 group-hover:text-slate-300 font-extrabold mt-0.5 uppercase tracking-wide">
          LOD {level}
        </span>
        
        {/* Hover metadata tooltip overlay */}
        {hoveredCell === cellId && (
          <div className="absolute inset-0 bg-[#0d101a]/95 backdrop-blur-sm p-1.5 flex flex-col justify-center text-left text-[6.5px] leading-tight text-slate-300 font-semibold pointer-events-none select-none z-10">
            <span className="text-cyan-400 font-extrabold font-mono uppercase truncate">Tile: {cellId}</span>
            <span className="mt-0.5">Scale: {scaleMap[level] || "N/A"}</span>
            <span>Res: {resMap[level] || "N/A"}</span>
            <span className="text-emerald-400 font-mono text-[5.5px] mt-0.5 truncate">Click to divide</span>
          </div>
        )}
      </button>
    );
  };

  // DMS coordinate conversion
  const formatDMS = (value: number, isLat: boolean): string => {
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = Math.floor((absValue - degrees) * 60);
    const seconds = Math.round(((absValue - degrees) * 60 - minutes) * 60 * 10) / 10;
    const suffix = isLat ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "W");
    return `${degrees}°${minutes.toString().padStart(2, "0")}'${seconds.toFixed(1).padStart(4, "0")}"${suffix}`;
  };

  // Haversine Distance mapping
  const calculateHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Drop pin placemark coordinates
  const handlePlacemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPlacemarkCoords && placemarkInputName.trim()) {
      const newPin: CustomPlacemark = {
        id: Math.random().toString(),
        name: placemarkInputName.trim(),
        lat: tempPlacemarkCoords.lat,
        lng: tempPlacemarkCoords.lng
      };
      setCustomPlacemarks((prev) => [...prev, newPin]);
      setTerminalLogs((prev) => [
        ...prev,
        `[PLACEMARK] Pinned: "${newPin.name}" at ${newPin.lat.toFixed(3)}°, ${newPin.lng.toFixed(3)}°`
      ]);
      setShowPlacemarkModal(false);
      setPlacemarkInputName("");
      setTempPlacemarkCoords(null);
      setActiveTool("none");
    }
  };

  // Map toggle
  const handleToggle2D3D = () => {
    setIs3DMode((prev) => !prev);
    setTerminalLogs((prev) => [
      ...prev,
      `[PROJECTION] Unwrapping view coordinates to ${!is3DMode ? "3D Spherical Globe" : "2D Flat Mercator Map"}`
    ]);
  };

  // -------------------------------------------------------------
  // SIMULATOR CORE CANVAS RENDER LOOP
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (!earthCanvasNode) return;

    const canvas = earthCanvasNode;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = width || canvas.parentElement?.getBoundingClientRect().width || 800;
        const h = height || canvas.parentElement?.getBoundingClientRect().height || 500;
        canvas.width = w * (window.devicePixelRatio || 1);
        canvas.height = h * (window.devicePixelRatio || 1);
        ctx.imageSmoothingEnabled = true;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let dragStartX = 0;
    let dragStartY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      if (activeTool === "placemark" && mouseHoverCoordsRef.current) {
        setTempPlacemarkCoords({ ...mouseHoverCoordsRef.current });
        setShowPlacemarkModal(true);
        return;
      }

      if (activeTool === "line" && mouseHoverCoordsRef.current) {
        setMeasuringPoints((prev) => [...prev, { ...mouseHoverCoordsRef.current! }]);
        setTerminalLogs((prev) => [
          ...prev,
          `[MEASURE] Path node inserted at ${mouseHoverCoordsRef.current!.lat.toFixed(3)}°, ${mouseHoverCoordsRef.current!.lng.toFixed(3)}°`
        ]);
        return;
      }

      if (activeTool === "polygon" && mouseHoverCoordsRef.current) {
        setDrawPolygonPoints((prev) => [...prev, { ...mouseHoverCoordsRef.current! }]);
        return;
      }

      mouseIsDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 420;
      const cam = earthCameraRef.current;
      const R_scale = 135;
      const planetDepth = cam.z;
      const projRad = (R_scale / planetDepth) * fov;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const interp = cam.globeInterpolation;

      if (interp > 0.05) {
        if (d <= projRad) {
          const xs = dx / projRad;
          const ys = dy / projRad;
          const zs = -Math.sqrt(1 - xs * xs - ys * ys);

          const activePitch = cam.pitch * interp;
          const activeYaw = cam.yaw * interp;

          const cosP = Math.cos(-activePitch);
          const sinP = Math.sin(-activePitch);
          const yw = ys * cosP + zs * sinP;
          const zw = -ys * sinP + zs * cosP;
          const xw = xs;

          const cosY = Math.cos(-activeYaw);
          const sinY = Math.sin(-activeYaw);
          const xp = xw * cosY + zw * sinY;
          const zp = -xw * sinY + zw * cosY;
          const yp = yw;

          const latRad = Math.asin(yp);
          const lngRad = Math.atan2(xp, zp) - 0.001 * historicalYear;

          const lat = Math.max(-90, Math.min(90, latRad * (180 / Math.PI)));
          let lng = lngRad * (180 / Math.PI);
          lng = ((lng + 180) % 360) - 180;
          if (lng < -180) lng += 360;

          mouseHoverCoordsRef.current = { lat, lng };

          if (coordsTextRef.current) {
            coordsTextRef.current.textContent = `${formatDMS(lat, true)}   ${formatDMS(lng, false)}`;
          }
          if (elevationTextRef.current) {
            const simulatedElev = Math.abs(Math.round(Math.sin(lat * 5) * Math.cos(lng * 5) * 850 + 200));
            elevationTextRef.current.textContent = `Elev: ${simulatedElev} m`;
          }
        } else {
          mouseHoverCoordsRef.current = null;
          if (coordsTextRef.current) {
            coordsTextRef.current.textContent = `Camera orbit center coordinates`;
          }
          if (elevationTextRef.current) {
            elevationTextRef.current.textContent = `Vacuum depth`;
          }
        }
      } else {
        const flatScaleX = R_scale * 1.5 * (fov / planetDepth);
        const flatScaleY = R_scale * 1.0 * (fov / planetDepth);

        const lng = (dx / flatScaleX) * 180;
        const lat = -(dy / flatScaleY) * 90;

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          mouseHoverCoordsRef.current = { lat, lng };
          if (coordsTextRef.current) {
            coordsTextRef.current.textContent = `${formatDMS(lat, true)}   ${formatDMS(lng, false)}`;
          }
          if (elevationTextRef.current) {
            elevationTextRef.current.textContent = `Elev: Flat Map baseline`;
          }
        } else {
          mouseHoverCoordsRef.current = null;
        }
      }

      if (!mouseIsDraggingRef.current) return;
      const mdx = e.clientX - lastMousePosRef.current.x;
      const mdy = e.clientY - lastMousePosRef.current.y;

      if (is3DMode) {
        cam.yaw += mdx * 0.005;
        cam.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, cam.pitch - mdy * 0.005));
      } else {
        cam.yaw += mdx * 0.008;
        cam.pitch = Math.max(-0.5, Math.min(0.5, cam.pitch - mdy * 0.008));
      }

      cam.targetYaw = cam.yaw;
      cam.targetPitch = cam.pitch;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      mouseIsDraggingRef.current = false;

      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4 && mouseHoverCoordsRef.current && activeTool === "none") {
        const { lat, lng } = mouseHoverCoordsRef.current;
        handleGlobeClickRef.current(lat, lng);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    let animationFrameId: number;

    const render = () => {
      const cam = earthCameraRef.current;
      const fov = 420;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Handle Fly-To camera easing
      if (cam.isTransitioning) {
        cam.transitionTimer += 0.02;
        const u = Math.min(1, cam.transitionTimer);
        const s = 3 * u * u - 2 * u * u * u;

        cam.yaw = cam.yaw + s * (cam.targetYaw - cam.yaw);
        cam.pitch = cam.pitch + s * (cam.targetPitch - cam.pitch);
        cam.z = cam.z + s * (cam.targetZ - cam.z);

        if (u >= 1) {
          cam.isTransitioning = false;
        }
      }

      // Projection flattening interpolations
      const targetInterp = is3DMode ? 1.0 : 0.0;
      cam.globeInterpolation += (targetInterp - cam.globeInterpolation) * 0.08;
      const interp = cam.globeInterpolation;

      const activePitch = cam.pitch * interp;
      const activeYaw = cam.yaw;

      const cosY = Math.cos(-activeYaw);
      const sinY = Math.sin(-activeYaw);
      const cosP = Math.cos(-activePitch);
      const sinP = Math.sin(-activePitch);

      ctx.fillStyle = "#010204";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. GORGEOUS SPACE STARS BACKGROUND
      if (showSpaceStars) {
        const time = Date.now() * 0.0012;
        for (let i = 0; i < 240; i++) {
          const sx = (Math.sin(i * 324.56) * 0.5 + 0.5) * canvas.width;
          const sy = (Math.cos(i * 123.89) * 0.5 + 0.5) * canvas.height;
          const size = Math.abs(Math.sin(i * 99)) * 1.4 + 0.5;
          const alpha = 0.25 + 0.75 * Math.abs(Math.sin(time + i));

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const R_scale = 135;
      const planetDepth = cam.z;
      const projRad = (R_scale / planetDepth) * fov;

      if (altitudeTextRef.current) {
        altitudeTextRef.current.textContent = `Camera Alt: ${Math.round(planetDepth * 148).toLocaleString()} km`;
      }
      if (scaleTextRef.current) {
        const scaleVal = Math.round(planetDepth * 2.5);
        scaleTextRef.current.textContent = `${scaleVal} km`;
      }
      if (scaleLineRef.current) {
        const linePixelWidth = Math.max(20, Math.min(180, 20000 / planetDepth));
        scaleLineRef.current.style.width = `${linePixelWidth}px`;
      }

      const projectCoords = (lat: number, lng: number) => {
        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;

        const x3d = R_scale * Math.cos(latRad) * Math.sin(lngRad + 0.001 * historicalYear);
        const y3d = R_scale * Math.sin(latRad);
        const z3d = R_scale * Math.cos(latRad) * Math.cos(lngRad + 0.001 * historicalYear);

        const x2d = (lng / 180) * R_scale * 1.5;
        const y2d = (lat / 90) * R_scale * 1.0;
        const z2d = -10;

        const px = (1 - interp) * x2d + interp * x3d;
        const py = (1 - interp) * y2d + interp * y3d;
        const pz = (1 - interp) * z2d + interp * z3d;

        const r_x = px * cosY - pz * sinY;
        const r_z = px * sinY + pz * cosY;
        const f_y = py * cosP - r_z * sinP;
        const f_z = py * sinP + r_z * cosP + planetDepth;

        const screenX = cx + (r_x / f_z) * fov;
        const screenY = cy + (f_y / f_z) * fov;

        let visible = true;
        if (interp > 0.1) {
          const dot = x3d * (0 - px) + y3d * (0 - py) + z3d * (planetDepth - pz);
          visible = dot > 0;
        }

        return { x: screenX, y: screenY, z: f_z, visible };
      };

      // 2. PHOTOREALISTIC OCEAN BASE SPHERE
      if (interp > 0.05) {
        const oceanGrad = ctx.createRadialGradient(
          cx - projRad * 0.25,
          cy - projRad * 0.25,
          projRad * 0.05,
          cx,
          cy,
          projRad
        );
        oceanGrad.addColorStop(0, "#1b427b"); // bright satellite blue
        oceanGrad.addColorStop(0.5, "#0b2046"); // medium deep blue
        oceanGrad.addColorStop(0.85, "#040b19"); // midnight shadows
        oceanGrad.addColorStop(1.0, "#01040a"); // space horizon border

        ctx.fillStyle = oceanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, projRad, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#0c1524";
        const flatW = R_scale * 1.5 * (fov / planetDepth) * 2;
        const flatH = R_scale * 1.0 * (fov / planetDepth) * 2;
        ctx.fillRect(cx - flatW / 2, cy - flatH / 2, flatW, flatH);
      }

      // 3. WGS-84 LATITUDE / LONGITUDE GRIDS
      if (showGridLines) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.16)";
        ctx.lineWidth = 0.5;

        for (let lat = -75; lat <= 75; lat += 15) {
          ctx.beginPath();
          let active = false;
          for (let lng = -180; lng <= 180; lng += 5) {
            const p1 = projectCoords(lat, lng);
            if (p1.visible && p1.z > 5) {
              if (!active) {
                ctx.moveTo(p1.x, p1.y);
                active = true;
              } else {
                ctx.lineTo(p1.x, p1.y);
              }
            } else {
              active = false;
            }
          }
          ctx.stroke();
        }

        for (let lng = -180; lng <= 180; lng += 15) {
          ctx.beginPath();
          let active = false;
          for (let lat = -80; lat <= 80; lat += 5) {
            const p1 = projectCoords(lat, lng);
            if (p1.visible && p1.z > 5) {
              if (!active) {
                ctx.moveTo(p1.x, p1.y);
                active = true;
              } else {
                ctx.lineTo(p1.x, p1.y);
              }
            } else {
              active = false;
            }
          }
          ctx.stroke();
        }
      }

      // 4. SATELLITE STYLE CONTINENTS & POLAR ICE CAPS (OR REAL HIGH-RESOLUTION EARTH TEXTURE SHADER)
      let textureRendered = false;

      if (mapStyle === "satellite" && textureLoaded && textureDataRef.current && interp > 0.05) {
        const tex = textureDataRef.current;
        const radius = Math.round(projRad);
        
        // Dynamic grid limit for absolute fluid performance (60 FPS) on all screens
        const projSize = Math.min(135, radius); 
        const scaleRatio = radius / projSize;
        
        const bufferCanvas = document.createElement("canvas");
        bufferCanvas.width = projSize * 2;
        bufferCanvas.height = projSize * 2;
        const bCtx = bufferCanvas.getContext("2d");
        
        if (bCtx) {
          const imgData = bCtx.createImageData(projSize * 2, projSize * 2);
          const pixels = imgData.data;
          
          const texWidth = tex.width;
          const texHeight = tex.height;
          const texData = tex.data;
          
          const size = projSize;
          const size2 = size * 2;
          
          const activeYaw = cam.yaw;
          const activePitch = cam.pitch * interp;
          
          const cosP = Math.cos(-activePitch);
          const sinP = Math.sin(-activePitch);
          const cosY = Math.cos(-activeYaw);
          const sinY = Math.sin(-activeYaw);
          
          for (let yPixel = 0; yPixel < size2; yPixel++) {
            const dy = yPixel - size;
            const dy2 = dy * dy;
            
            for (let xPixel = 0; xPixel < size2; xPixel++) {
              const dx = xPixel - size;
              const d2 = dx * dx + dy2;
              
              if (d2 <= size * size) {
                const x = dx / size;
                const y = dy / size;
                const z = -Math.sqrt(1 - x * x - y * y);
                
                // Rotations X-axis
                const y1 = y * cosP + z * sinP;
                const z1 = -y * sinP + z * cosP;
                const x1 = x;
                
                // Rotations Y-axis
                const x2 = x1 * cosY - z1 * sinY;
                const z2 = x1 * sinY + z1 * cosY;
                const y2 = y1;
                
                // Spherical projection
                const latRad = Math.asin(y2);
                const lngRad = Math.atan2(x2, z2) - 0.001 * historicalYear;
                
                // Texture coordinates
                const u = (lngRad + Math.PI) / (2 * Math.PI);
                const v = (Math.PI / 2 - latRad) / Math.PI;
                
                // Clamp coordinates
                const tx = Math.min(texWidth - 1, Math.max(0, Math.floor(u * texWidth)));
                const ty = Math.min(texHeight - 1, Math.max(0, Math.floor(v * texHeight)));
                
                const idx = (ty * texWidth + tx) * 4;
                const pIdx = (yPixel * size2 + xPixel) * 4;
                
                const r = texData[idx];
                const g = texData[idx + 1];
                const b = texData[idx + 2];
                
                if (spectralMode === "thermal") {
                  // Thermal heat map false color mapping
                  const val = (r + g + b) / 3;
                  pixels[pIdx] = Math.min(255, val * 1.5 + 50); // Red high
                  pixels[pIdx + 1] = Math.max(0, val - 30);      // Green medium
                  pixels[pIdx + 2] = Math.min(255, (255 - val) * 0.8 + 20); // Blue inverted
                } else if (spectralMode === "ndvi") {
                  // NDVI vegetation index mapping (highlight chlorophyll canopy density)
                  const greenExcess = g - Math.max(r, b);
                  if (greenExcess > 2) {
                    pixels[pIdx] = 16;
                    pixels[pIdx + 1] = Math.min(255, 120 + greenExcess * 5);
                    pixels[pIdx + 2] = 64;
                  } else {
                    const val = (r + g + b) / 3;
                    pixels[pIdx] = Math.min(255, val * 0.8 + 40);
                    pixels[pIdx + 1] = Math.min(255, val * 0.7 + 25);
                    pixels[pIdx + 2] = Math.min(255, val * 0.5 + 10);
                  }
                } else {
                  // Natural satellite true color
                  pixels[pIdx] = r;
                  pixels[pIdx + 1] = g;
                  pixels[pIdx + 2] = b;
                }
                
                pixels[pIdx + 3] = 255;
              }
            }
          }
          
          bCtx.putImageData(imgData, 0, 0);
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, projRad, 0, Math.PI * 2);
          ctx.clip();
          
          ctx.drawImage(
            bufferCanvas,
            0,
            0,
            size2,
            size2,
            cx - projRad,
            cy - projRad,
            projRad * 2,
            projRad * 2
          );
          ctx.restore();
          textureRendered = true;
        }
      }

      if (!textureRendered) {
        const landGrad = ctx.createLinearGradient(cx - projRad, cy - projRad, cx + projRad, cy + projRad);
        if (mapStyle === "satellite") {
          landGrad.addColorStop(0, "#2c5e3b"); // rich emerald vegetation
          landGrad.addColorStop(0.45, "#3e7049");
          landGrad.addColorStop(0.75, "#8a7550"); // desert savannah
          landGrad.addColorStop(1, "#1c3824"); // shadows
        } else if (mapStyle === "shaded") {
          landGrad.addColorStop(0, "#a16207"); // contour elevation gold
          landGrad.addColorStop(0.5, "#ca8a04");
          landGrad.addColorStop(1, "#451a03");
        } else {
          landGrad.addColorStop(0, "#083344"); // neon cyber grids
          landGrad.addColorStop(0.5, "#155e75");
          landGrad.addColorStop(1, "#020617");
        }

        ctx.lineWidth = Math.max(0.6, Math.min(2.5, 450 / planetDepth));

        EARTH_CONTINENTS.forEach((continent, index) => {
          ctx.beginPath();
          let active = false;

          // Custom filled textures based on land style
          if (mapStyle === "satellite") {
            if (index === 6 || index === 5) {
              // polar snow caps (Antarctica and Greenland)
              ctx.fillStyle = "rgba(241, 245, 249, 0.95)";
              ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
            } else {
              ctx.fillStyle = landGrad;
              ctx.strokeStyle = "rgba(74, 150, 95, 0.5)"; // lush coastal margins
            }
          } else if (mapStyle === "shaded") {
            ctx.fillStyle = landGrad;
            ctx.strokeStyle = "rgba(234, 179, 8, 0.6)";
          } else {
            ctx.fillStyle = "rgba(6, 182, 212, 0.05)";
            ctx.strokeStyle = "rgba(34, 211, 238, 0.85)";
          }

          for (let i = 0; i <= continent.length; i++) {
            const pt = continent[i % continent.length];
            const p1 = projectCoords(pt.lat, pt.lng);

            if (p1.visible && p1.z > 5) {
              if (!active) {
                ctx.moveTo(p1.x, p1.y);
                active = true;
              } else {
                ctx.lineTo(p1.x, p1.y);
              }
            } else {
              active = false;
            }
          }
          ctx.fill();
          ctx.stroke();
        });
      }

      // 5. TRANSLUCENT ATMOSPHERIC CLOUDS OVERLAY
      if (showAtmosphere && interp > 0.05) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, projRad, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.shadowColor = "rgba(255, 255, 255, 0.1)";
        ctx.shadowBlur = 6;
        ctx.lineWidth = Math.max(8, projRad * 0.12);

        const cloudTime = Date.now() * 0.0003;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const cyOffset = cy + Math.sin(cloudTime + i) * projRad * 0.45;
          ctx.moveTo(cx - projRad, cyOffset);
          ctx.bezierCurveTo(
            cx - projRad * 0.5,
            cyOffset + Math.cos(cloudTime * 0.5 + i) * projRad * 0.25,
            cx + projRad * 0.5,
            cyOffset - Math.sin(cloudTime * 0.5 + i) * projRad * 0.25,
            cx + projRad,
            cyOffset
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. GLOWING OZONE ENVELOPE LAYER
      if (showAtmosphere && interp > 0.2) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
        ctx.lineWidth = Math.max(1, Math.min(8, 250 / planetDepth));

        ctx.beginPath();
        ctx.arc(cx, cy, projRad, 0, Math.PI * 2);
        ctx.stroke();

        const atmosGrad = ctx.createRadialGradient(cx, cy, projRad - 3, cx, cy, projRad + 14);
        atmosGrad.addColorStop(0, "rgba(6, 182, 212, 0.09)");
        atmosGrad.addColorStop(0.3, "rgba(99, 102, 241, 0.04)");
        atmosGrad.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.fillStyle = atmosGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, projRad + 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. USER PLACEMARK VECTORS
      customPlacemarks.forEach((pin) => {
        const pNode = projectCoords(pin.lat, pin.lng);
        if (pNode.visible && pNode.z > 5) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(pNode.x, pNode.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pNode.x, pNode.y, 7, 0, Math.PI * 2);
          ctx.stroke();

          if (showLabels) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowBlur = 4;
            ctx.fillText(pin.name, pNode.x, pNode.y - 10);
            ctx.shadowBlur = 0;
          }
        }
      });

      // 8. RULER MEASUREMENT CHANNELS
      if (measuringPoints.length > 0) {
        ctx.strokeStyle = "rgba(234, 179, 8, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        let active = false;

        measuringPoints.forEach((pt) => {
          const node = projectCoords(pt.lat, pt.lng);
          if (node.visible && node.z > 5) {
            if (!active) {
              ctx.moveTo(node.x, node.y);
              active = true;
            } else {
              ctx.lineTo(node.x, node.y);
            }
          } else {
            active = false;
          }
        });
        ctx.stroke();

        ctx.fillStyle = "#eab308";
        measuringPoints.forEach((pt) => {
          const node = projectCoords(pt.lat, pt.lng);
          if (node.visible) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        let totalDist = 0;
        for (let idx = 0; idx < measuringPoints.length - 1; idx++) {
          totalDist += calculateHaversineDistance(
            measuringPoints[idx].lat,
            measuringPoints[idx].lng,
            measuringPoints[idx + 1].lat,
            measuringPoints[idx + 1].lng
          );
        }

        if (measuringPoints.length > 0) {
          const lastNode = projectCoords(
            measuringPoints[measuringPoints.length - 1].lat,
            measuringPoints[measuringPoints.length - 1].lng
          );
          if (lastNode.visible) {
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "left";
            ctx.fillText(`Path: ${totalDist.toFixed(1)} km`, lastNode.x + 8, lastNode.y + 3);
          }
        }
      }

      // 9. PRESET SCAN LABELS
      if (showLabels) {
        ORBITAL_TARGETS.forEach((target) => {
          const pNode = projectCoords(target.latVal, target.lngVal);
          if (pNode.visible && pNode.z > 5 && planetDepth < 700) {
            ctx.fillStyle = "rgba(34, 211, 238, 0.95)";
            ctx.beginPath();
            ctx.arc(pNode.x, pNode.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 3;
            ctx.fillText(target.name.split(",")[0], pNode.x, pNode.y - 7);
            ctx.shadowBlur = 0;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    earthCanvasNode,
    customPlacemarks,
    measuringPoints,
    drawPolygonPoints,
    activeTool,
    showAtmosphere,
    showGridLines,
    showSpaceStars,
    showLabels,
    mapStyle,
    is3DMode,
    historicalYear
  ]);

  // -------------------------------------------------------------
  // STREET VIEW PANORAMA SCROLL LOOP
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (!streetViewActive || !streetViewPanoRef) return;

    const canvas = streetViewPanoRef;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const panoImageObj = new Image();
    panoImageObj.src = selectedTarget.image;
    panoImageObj.onload = () => {
      setStreetViewPanoImage(panoImageObj);
    };

    let animationFrameId: number;

    const renderPano = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (streetViewPanoImage) {
        const img = streetViewPanoImage;
        const scaleFactor = img.height / canvas.height;
        const cropWidth = canvas.width * scaleFactor;

        let sx = Math.round((streetViewPanoYaw / (2 * Math.PI)) * img.width) % img.width;
        if (sx < 0) sx += img.width;

        const drawWidth1 = Math.min(img.width - sx, cropWidth);
        const screenWidth1 = drawWidth1 / scaleFactor;

        ctx.drawImage(img, sx, 0, drawWidth1, img.height, 0, 0, screenWidth1, canvas.height);

        if (drawWidth1 < cropWidth) {
          const drawWidth2 = cropWidth - drawWidth1;
          ctx.drawImage(img, 0, 0, drawWidth2, img.height, screenWidth1, 0, drawWidth2 / scaleFactor, canvas.height);
        }
      } else {
        ctx.fillStyle = "#22d3ee";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("LOCATING 360° STREET VIEW TILES...", canvas.width / 2, canvas.height / 2);
      }

      animationFrameId = requestAnimationFrame(renderPano);
    };

    const handlePanoMouseDown = (e: MouseEvent) => {
      mouseIsDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePanoMouseMove = (e: MouseEvent) => {
      if (!mouseIsDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      setStreetViewPanoYaw((prev) => (prev - dx * 0.005) % (2 * Math.PI));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePanoMouseUp = () => {
      mouseIsDraggingRef.current = false;
    };

    canvas.addEventListener("mousedown", handlePanoMouseDown);
    window.addEventListener("mousemove", handlePanoMouseMove);
    window.addEventListener("mouseup", handlePanoMouseUp);

    renderPano();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handlePanoMouseDown);
      window.removeEventListener("mousemove", handlePanoMouseMove);
      window.removeEventListener("mouseup", handlePanoMouseUp);
    };
  }, [streetViewActive, streetViewPanoRef, streetViewPanoImage, streetViewPanoYaw, selectedTarget]);

  return (
    <div className="w-screen h-screen absolute top-0 left-0 z-50 bg-black select-none text-white overflow-hidden flex flex-col font-sans">
      
      {/* 1. AUTHENTIC GOOGLE EARTH WEB APP TOP TOOLBAR */}
      <div className="w-full bg-[#0f111a] border-b border-white/10 px-5 py-2.5 flex items-center justify-between z-30 select-none shadow-xl shrink-0">
        
        {/* Left Side: Logo and Search box */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Earth Logo */}
          <button 
            onClick={() => {
              const cam = earthCameraRef.current;
              cam.targetYaw = 0.8;
              cam.targetPitch = 0.15;
              cam.targetZ = 750;
              cam.isTransitioning = true;
              cam.transitionTimer = 0;
              setTerminalLogs(prev => [...prev, `[RESET] Standard camera coordinates locked.`]);
            }}
            className="flex items-center gap-2 cursor-pointer outline-none active:scale-95 transition-transform"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "35s" }} />
            </div>
            <span className="font-extrabold text-[12.5px] tracking-wide text-white uppercase font-mono">
              Google <span className="text-cyan-400">Earth</span>
            </span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Pill Search Field */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#171a26] border border-white/10 rounded-full py-1 px-3.5 gap-2.5 shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coordinates (e.g. 10.2, 105.9)..."
              className="bg-transparent border-none text-[11px] text-white placeholder-slate-400 focus:outline-none w-44 md:w-56 selection:bg-cyan-500/35 font-medium"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-[9.5px] font-extrabold uppercase transition-colors cursor-pointer active:scale-95"
            >
              Search
            </button>
          </form>
        </div>

        {/* Center Side: Horizontal Action Tool shortcuts */}
        <div className="flex items-center gap-1 bg-[#171a26]/75 border border-white/5 p-1 rounded-full shadow-lg">
          
          {/* Navigation undo/redo history stack */}
          <button
            disabled={historyStack.length === 0}
            onClick={handleUndo}
            className="p-2 rounded-full transition-all active:scale-90 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Undo camera tilt"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            className="p-2 rounded-full transition-all active:scale-90 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Redo camera tilt"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-white/10 mx-1" />

          {/* Historical archive slider year */}
          <button
            onClick={() => setShowHistorySlider(!showHistorySlider)}
            className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
              showHistorySlider ? "bg-cyan-500 text-black font-extrabold" : "text-slate-300 hover:bg-white/5"
            }`}
            title="Historical Archive Slider"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Dropping pin placemark */}
          <button
            onClick={() => {
              setActiveTool(activeTool === "placemark" ? "none" : "placemark");
              setTerminalLogs((prev) => [
                ...prev,
                `[TOOLBOX] Placemark tool active. Click on sphere to drop custom pin.`
              ]);
            }}
            className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
              activeTool === "placemark" ? "bg-red-500 text-white" : "text-slate-300 hover:bg-white/5"
            }`}
            title="Drop Placemark Pin"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Path Ruler Distance */}
          <button
            onClick={() => {
              setActiveTool(activeTool === "line" ? "none" : "line");
              setMeasuringPoints([]);
            }}
            className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
              activeTool === "line" ? "bg-yellow-500 text-black" : "text-slate-300 hover:bg-white/5"
            }`}
            title="Haversine Path Ruler"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          {/* Layer grid toggle */}
          <button
            onClick={() => {
              setIsLeftSidebarOpen(true);
              setActiveSidebarSection("layers");
            }}
            className={`p-2 rounded-full cursor-pointer transition-colors hover:bg-white/5 ${
              isLeftSidebarOpen && activeSidebarSection === "layers" ? "text-cyan-400" : "text-slate-300"
            }`}
            title="Multispectral Blend Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Coordinate grid gridlines */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
              showGridLines ? "text-cyan-400 bg-cyan-500/10" : "text-slate-300 hover:bg-white/5"
            }`}
            title="Coordinate Grids Lines"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* View labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
              showLabels ? "text-indigo-400 bg-indigo-500/10" : "text-slate-300 hover:bg-white/5"
            }`}
            title="Borders & Region Labels"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Settings & User Profile initials */}
        <div className="flex items-center gap-3 shrink-0">
          
          <button
            onClick={() => {
              setIsLeftSidebarOpen(true);
              setActiveSidebarSection("manual");
            }}
            className="p-2 hover:bg-white/5 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="GIS manual and documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsLeftSidebarOpen(true);
              setActiveSidebarSection("console");
            }}
            className="p-2 hover:bg-white/5 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Status telemetry console logs"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Standard status upgrade buttons */}
          <div className="flex flex-col text-right hidden sm:flex select-text font-sans">
            <span className="text-[10.5px] font-extrabold text-white tracking-wide leading-none">Standard</span>
            <span className="text-[7.5px] text-cyan-400/80 hover:text-cyan-400 cursor-pointer font-semibold underline mt-0.5">
              Upgrade now
            </span>
          </div>

          {/* Profile initial */}
          <div className="w-7 h-7 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[11px] font-mono flex items-center justify-center shadow-lg border border-cyan-400/30 cursor-pointer active:scale-95 transition-transform" title="Nguyen Chi Trung">
            N
          </div>
        </div>
      </div>

      {/* 2. MAIN IMMERSIVE GIS VIEWPORT CANVAS BOX */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#010204]">
        
        {/* The 3D satellite coordinates sphere canvas */}
        <canvas
          ref={earthCanvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing relative z-0"
        />

        {/* COLLAPSED DRAWER BUTTON (when sidebar is closed) */}
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className="absolute left-4 top-4 z-10 p-2 bg-[#0d101a]/95 border border-white/10 text-slate-300 hover:text-white rounded-xl shadow-2xl transition-colors cursor-pointer hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5 font-bold text-[10.5px] uppercase tracking-wider"
          >
            <Sliders className="w-3.5 h-3.5" /> Sidebar Controls
          </button>
        )}

        {/* DRAGGABLE LEFT COLLAPSIBLE SIDEBAR PANEL (Drawer style) */}
        <AnimatePresence>
          {isLeftSidebarOpen && (
            <motion.div
              initial={{ x: -330 }}
              animate={{ x: 0 }}
              exit={{ x: -330 }}
              transition={{ type: "spring", stiffness: 220, damping: 25 }}
              className="absolute left-4 top-4 bottom-4 w-[310px] bg-[#0d101a]/96 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-3xl flex flex-col overflow-hidden z-20 select-none text-left"
            >
              {/* Drawer Header navs */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/20">
                <span className="text-[11px] font-black tracking-widest text-cyan-400 uppercase font-mono">
                  GIS Sandbox Settings
                </span>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Slider tabs switcher */}
              <div className="p-3 pb-0 shrink-0">
                <div className="grid grid-cols-5 gap-0.5 p-1 bg-black/40 border border-white/5 rounded-xl text-[7.5px] font-black uppercase text-center shrink-0">
                  {(["places", "layers", "quadtree", "manual", "console"] as const).map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSidebarSection(section)}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                        activeSidebarSection === section
                          ? "bg-white/10 text-white font-black"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tab rendering */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                
                {/* 1. PLACES preset scanner */}
                {activeSidebarSection === "places" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        Preset Places Focus
                      </h3>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold font-medium">
                        Select geological sectors below to coordinate direct satellite orbit camera transits.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                      {ORBITAL_TARGETS.map((target) => (
                        <button
                          key={target.id}
                          onClick={() => handleSelectTarget(target)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-left text-[10px] transition-all flex items-center justify-between cursor-pointer group hover:scale-[0.99] ${
                            selectedTarget.id === target.id
                              ? "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/10 font-bold"
                              : "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-extrabold truncate">{target.name}</span>
                            <span className={`text-[8.5px] font-mono ${selectedTarget.id === target.id ? "text-black/75" : "text-slate-400"}`}>
                              {target.lat} / {target.lng}
                            </span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${selectedTarget.id === target.id ? "text-black rotate-90" : "text-slate-400 group-hover:translate-x-0.5"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. MULTISPECTRAL radiometry layers */}
                {activeSidebarSection === "layers" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        Multispectral Band Blend
                      </h3>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold font-medium">
                        Toggle different satellite spectral bands to highlight environmental changes under the coordinates.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 my-1">
                      {(["visible", "thermal", "ndvi"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setSpectralMode(mode);
                            setTerminalLogs(prev => [...prev, `[LAYERS] Blending spectral index: ${mode.toUpperCase()} bands.`]);
                          }}
                          className={`py-2 px-3 rounded-xl border text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                            spectralMode === mode
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-white/5 bg-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                            spectralMode === mode ? "border-emerald-400" : "border-muted-foreground/45"
                          }`}>
                            {spectralMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold">{mode} Spectrum</span>
                            <span className="text-[7.5px] opacity-75 font-mono capitalize">
                              {mode === "visible" ? "Natural RGB color" : mode === "thermal" ? "Thermal heat bands" : "Chlorophyll index"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-cyan-500/10 bg-cyan-950/5 p-3 flex flex-col gap-1.5 text-[8.5px] text-slate-300 leading-relaxed font-semibold">
                      <h4 className="font-bold text-cyan-300 text-[9.5px] uppercase font-mono">Spectrum Specs</h4>
                      <p className="opacity-90 leading-normal font-medium">{
                        spectralMode === "thermal" 
                          ? "Detects longwave thermal radiation. White/hot highlights hot concrete islands, while deep blues highlight cool vegetation canopies."
                          : spectralMode === "ndvi"
                          ? "Computes near-infrared chlorophyll absorption. High contrast highlights canopy density, delta agriculture health, and vegetation margin."
                          : "Corresponds to standard RGB visible spectrum. Excellent for observing geological boundaries, silt runs, and ocean distributaries."
                      }</p>
                    </div>
                  </div>
                )}

                {/* 3. QUADTREE simulator */}
                {activeSidebarSection === "quadtree" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          Quadtree LOD subdivisions
                        </h3>
                        <button onClick={() => setSubdividedCells(new Set(["t"]))} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors cursor-pointer select-none">
                          Reset
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold font-medium">
                        Click cells to recursively partition grids into nested 2x2 quadrants, simulating dynamic level-of-detail.
                      </p>
                    </div>

                    <div className="w-full aspect-square bg-black/40 border border-white/5 rounded-2xl p-1 relative overflow-hidden shadow-inner max-w-[250px] mx-auto shrink-0">
                      <div className="w-full h-full relative">
                        {renderQuadtreeCell("t")}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MANUAL manual instruction page */}
                {activeSidebarSection === "manual" && (
                  <div className="flex flex-col gap-3 text-[10px] text-slate-300 leading-relaxed">
                    <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                      <h3 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                        <Info className="w-3.5 h-3.5 text-cyan-400" /> GIS Scientific manual
                      </h3>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold font-medium">
                        Learn how authentic GIS spatial mapping engines like Google Earth calculate projections.
                      </p>
                    </div>

                    <div className="space-y-3 font-semibold">
                      <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1">
                        <h4 className="font-bold text-cyan-300 uppercase font-mono">1. Spatial Quadtrees</h4>
                        <p className="opacity-90 text-[8.5px] leading-normal font-medium">
                          Saves bandwidth by loading global regions at Level 0 (low resolution), then recursively partitioning sectors into zoom key subdivisions only as camera altitude drops.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1">
                        <h4 className="font-bold text-cyan-300 uppercase font-mono">2. Orthorectification</h4>
                        <p className="opacity-90 text-[8.5px] leading-normal font-medium">
                          Corrects skew distortions caused by satellite capture angles and topographic reliefs, projecting pixel positions onto flat plane coordinates.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1">
                        <h4 className="font-bold text-cyan-300 uppercase font-mono">3. WGS-84 Coordinates</h4>
                        <p className="opacity-90 text-[8.5px] leading-normal font-medium">
                          A spatial math spheroid defining exact latitude/longitude coordinates to model global vectors consistently across GPS networks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CONSOLE live terminal logs */}
                {activeSidebarSection === "console" && (
                  <div className="flex flex-col gap-3 h-full min-h-0">
                    <div className="flex flex-col gap-1 shrink-0">
                      <h3 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Telemetry Status Logs
                      </h3>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold font-medium">
                        Live stream of GIS calculations, orbit passes, and coordinate projections.
                      </p>
                    </div>

                    <div className="flex-1 min-h-[220px] bg-black/40 border border-white/5 rounded-2xl p-3 font-mono text-[8.5px] leading-relaxed text-cyan-300/80 overflow-y-auto my-1 selection:bg-cyan-500/35">
                      {terminalLogs.map((log, index) => (
                        <div key={index} className="truncate">
                          {log}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>

                    <div className="flex items-center justify-between text-[7.5px] text-muted-foreground/60 font-mono shrink-0 select-none border-t border-white/5 pt-2">
                      <span>Buffer: 40 packets</span>
                      <span className="animate-pulse">Active Link online</span>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. HISTORICAL ARCHIVE FLOATING YEAR SLIDER (Bottom Left overlay) */}
        {showHistorySlider && (
          <div className="absolute top-4 right-[72px] z-10 bg-[#0d101a]/95 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-2xl flex flex-col gap-2 text-left select-none min-w-[200px] animate-in fade-in slide-in-from-top-3 duration-200">
            <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-cyan-400" /> Historical satellite year
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1984"
                max="2026"
                value={historicalYear}
                onChange={(e) => {
                  const yr = Number(e.target.value);
                  setHistoricalYear(yr);
                  if (yr % 5 === 0 || yr === 2026) {
                    setTerminalLogs(prev => [...prev, `[ARCHIVE] Rendering satellite grid layer maps for year ${yr}...`]);
                  }
                }}
                className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg cursor-pointer shrink-0"
              />
              <span className="text-[11px] font-mono font-bold text-cyan-200 shrink-0">{historicalYear}</span>
            </div>
          </div>
        )}

        {/* 4. PLACEMARK dropped pin info modal */}
        {showPlacemarkModal && tempPlacemarkCoords && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <form
              onSubmit={handlePlacemarkSubmit}
              className="w-full max-w-sm rounded-[24px] border border-white/15 bg-[#0d101a] p-5 shadow-2xl text-left select-none flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Pin className="w-4 h-4 text-red-500 animate-bounce" />
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  Create Custom Placemark
                </h4>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-normal">
                Coordinate node locked: <span className="font-mono text-cyan-300 font-bold">{tempPlacemarkCoords.lat.toFixed(4)}°, {tempPlacemarkCoords.lng.toFixed(4)}°</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase text-slate-400">Placemark Label</label>
                <input
                  type="text"
                  required
                  value={placemarkInputName}
                  onChange={(e) => setPlacemarkInputName(e.target.value)}
                  placeholder="e.g. My research camp, Locked target"
                  className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 selection:bg-cyan-500/35"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlacemarkModal(false);
                    setActiveTool("none");
                    setTempPlacemarkCoords(null);
                  }}
                  className="py-2 px-4 rounded-xl border border-white/5 hover:bg-white/5 text-[10px] font-extrabold uppercase text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-extrabold uppercase cursor-pointer active:scale-95"
                >
                  Save Pin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. FLOATING BOTTOM-LEFT PREVIEW CARD & COPYRIGHT ATTRIBUTION */}
        <div className="absolute bottom-5 left-5 z-10 flex items-end gap-4 select-none">
          
          {/* Flat projection preview card */}
          <button
            onClick={handleToggle2D3D}
            className="w-16 h-16 rounded-xl border border-white/20 hover:border-cyan-400 bg-slate-900/80 flex flex-col items-center justify-center gap-1 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-[9px] font-black text-cyan-400 tracking-wider font-mono">
              {is3DMode ? "FLAT MAP" : "3D GLOBE"}
            </span>
            <div className="w-9 h-5 rounded border border-white/10 bg-black/40 flex items-center justify-center font-mono text-[7px] text-slate-300 font-extrabold">
              {is3DMode ? "2D View" : "3D View"}
            </div>
          </button>

          {/* Attributions and copyright */}
          <div className="flex flex-col text-left font-mono text-[8.5px] text-slate-400 select-text leading-tight bg-black/45 p-1.5 px-2.5 rounded-xl border border-white/5 backdrop-blur-sm select-none">
            <span className="text-[11.5px] font-black tracking-tight text-white/95 leading-none">
              Google <span className="text-cyan-400 font-bold">Earth</span>
            </span>
            <span className="opacity-55 text-[7px] mt-1 select-none font-semibold">Data: NASA / NOAA / USGS / ESRI</span>
          </div>
        </div>

        {/* 6. FLOATING BOTTOM-RIGHT VERTICAL NAVIGATION CIRCLE STACK */}
        <div className="absolute bottom-5 right-5 z-10 flex flex-col items-end gap-4 select-none">
          
          {/* Stack circle buttons */}
          <div className="flex flex-col gap-1.5 p-1.5 bg-[#0d101a]/95 border border-white/10 rounded-2xl shadow-3xl">
            
            {/* Compass rotating needle */}
            <button
              onClick={() => {
                const cam = earthCameraRef.current;
                cam.targetYaw = 0.8;
                cam.targetPitch = 0.15;
                cam.isTransitioning = true;
                cam.transitionTimer = 0;
                setTerminalLogs(prev => [...prev, `[COMPASS] Compass aligned exactly North.`]);
              }}
              className="p-2 hover:bg-white/15 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90 flex items-center justify-center relative"
              title="Align North"
            >
              <Compass 
                className="w-5 h-5 text-cyan-400 transition-transform duration-300"
                style={{ transform: `rotate(${-earthCameraRef.current.yaw * 57.3}deg)` }}
              />
            </button>

            <div className="h-px bg-white/10 my-0.5" />

            {/* Pegman Street View yellow silhouette toggle */}
            <button
              onClick={() => {
                setStreetViewActive(!streetViewActive);
                setTerminalLogs((prev) => [
                  ...prev,
                  `[STREETVIEW] ${!streetViewActive ? "Street View enabled. Panoramic ground tiles locked." : "Street View disabled."}`
                ]);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
                streetViewActive ? "bg-amber-400 text-black shadow-inner shadow-black/15 scale-[1.03]" : "text-slate-300 hover:bg-white/15"
              }`}
              title="Street View Pegman"
            >
              <span className="text-[12.5px] filter drop-shadow">👤</span>
            </button>

            {/* Tilt angle */}
            <button
              onClick={handleToggle2D3D}
              className={`p-2 hover:bg-white/15 rounded-xl transition-colors cursor-pointer active:scale-90 font-mono text-[9px] font-black text-center ${
                is3DMode ? "text-cyan-400" : "text-slate-500"
              }`}
              title="Toggle Flat 2D Map / 3D Globe"
            >
              {is3DMode ? "3D" : "2D"}
            </button>

            <div className="h-px bg-white/10 my-0.5" />

            {/* Zooms */}
            <button
              onClick={() => {
                const cam = earthCameraRef.current;
                cam.z = Math.max(300, cam.z - 65);
                cam.targetZ = cam.z;
              }}
              className="p-2 hover:bg-white/15 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const cam = earthCameraRef.current;
                cam.z = Math.min(2000, cam.z + 65);
                cam.targetZ = cam.z;
              }}
              className="p-2 hover:bg-white/15 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Hover dynamic DMS coordinates and elevations */}
          <div className="flex flex-col items-end gap-1 font-mono text-[8.5px] text-slate-400 bg-black/80 border border-white/15 p-2 px-3 rounded-xl min-w-[210px] text-right shadow-2xl select-none">
            <span ref={coordsTextRef} className="text-white font-extrabold tracking-wide">
              Hover globe for coordinates
            </span>
            <div className="flex items-center gap-3 opacity-75 border-t border-white/10 pt-1 mt-1 font-bold">
              <span ref={elevationTextRef}>Elev: 0 m</span>
              <span ref={altitudeTextRef}>Camera Alt: 0 km</span>
            </div>
          </div>

          {/* Dynamic scaling distance scale line */}
          <div className="flex flex-col gap-1 items-end mr-1 select-none leading-none">
            <span ref={scaleTextRef} className="text-[8px] font-mono font-black text-slate-400">8,000 km</span>
            <div 
              ref={scaleLineRef}
              className="h-[2px] bg-white border-x border-white shadow-2xl transition-all duration-300"
              style={{ width: "80px" }}
            />
          </div>
        </div>

        {/* 7. DRAGGABLE STREET VIEW 360-DEGREE VIEWPORT PANORAMA */}
        <AnimatePresence>
          {streetViewActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="absolute bottom-5 left-[100px] z-20 w-80 rounded-[20px] border border-white/15 bg-[#0d101a]/95 backdrop-blur-md p-4 shadow-3xl flex flex-col gap-3 text-left animate-in select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 bg-black/10">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                  👤 Ground Street View Panorama
                </span>
                <button
                  onClick={() => setStreetViewActive(false)}
                  className="text-slate-400 hover:text-white text-[11px] font-mono shrink-0 cursor-pointer font-extrabold"
                >
                  ✕
                </button>
              </div>
              <p className="text-[9px] leading-relaxed text-slate-300 font-semibold font-medium">
                Drag inside frame below to look around in 360° at locked preset region: <span className="text-amber-400 font-black">{selectedTarget.name.split(",")[0]}</span>
              </p>
              
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black cursor-move">
                <canvas
                  ref={(node) => setStreetViewPanoRef(node)}
                  width={280}
                  height={158}
                  className="w-full h-full block"
                />
                <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none text-[7px] font-mono text-white/50 bg-black/25 py-0.5">
                  ◀ Drag mouse to rotate view 360° ▶
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 8. COORDINATE TELEMETRY HUD DRAWER */}
        <AnimatePresence>
          {showTelemetryHUD && (
            <motion.div
              initial={{ x: 350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute top-4 right-4 bottom-4 w-[335px] z-30 rounded-[24px] border border-white/10 bg-[#0d101a]/85 backdrop-blur-xl p-5 shadow-3xl flex flex-col gap-4 text-left select-none text-white overflow-hidden"
            >
              {/* Glowing header bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                      Live Telemetry Lock
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                    Geodetic Explorer
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowTelemetryHUD(false);
                    setSelectedCoords(null);
                  }}
                  className="w-7 h-7 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-[11px] font-mono cursor-pointer transition-all active:scale-90"
                >
                  ✕
                </button>
              </div>

              {telemetryLoading ? (
                // Pulse loader skeleton
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative w-16 h-16 rounded-full border border-cyan-500/20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
                    <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                      Pinging OSM & Meteo Nodes...
                    </span>
                    <span className="text-[8.5px] font-mono text-cyan-400/75">
                      Acquiring WGS-84 coordinates
                    </span>
                  </div>
                </div>
              ) : telemetryError ? (
                // Error card
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 text-lg">
                    ⚠️
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                      Connection Interrupted
                    </span>
                    <p className="text-[9.5px] text-slate-400 leading-normal font-semibold">
                      {telemetryError}
                    </p>
                  </div>
                  <button
                    onClick={() => selectedCoords && handleGlobeClick(selectedCoords.lat, selectedCoords.lng)}
                    className="mt-2 py-1.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[9.5px] font-extrabold uppercase transition-all cursor-pointer"
                  >
                    Retry Link
                  </button>
                </div>
              ) : telemetryData ? (
                // Loaded HUD Interface
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* Location card */}
                  <div className="bg-black/45 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                          Locked Coordinates Place Name
                        </span>
                        <p className="text-[10.5px] font-semibold text-white leading-normal">
                          {telemetryData.placeName}
                        </p>
                      </div>
                    </div>

                    {/* Badge details */}
                    <div className="grid grid-cols-2 gap-2 mt-1.5 border-t border-white/5 pt-2 text-[9px]">
                      {telemetryData.city && (
                        <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-slate-400">City: </span>
                          <span className="text-white font-mono font-bold">{telemetryData.city}</span>
                        </div>
                      )}
                      {telemetryData.state && (
                        <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-slate-400">Region: </span>
                          <span className="text-white font-mono font-bold">{telemetryData.state}</span>
                        </div>
                      )}
                      {telemetryData.country && (
                        <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5 col-span-2 text-center">
                          <span className="text-slate-400">Country: </span>
                          <span className="text-cyan-300 font-black tracking-wide uppercase">{telemetryData.country}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Geodetic Grid Stats */}
                  <div className="bg-black/45 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest font-mono">
                      WGS-84 Ellipsoidal Metrics
                    </span>
                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="flex flex-col text-left">
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase">Latitude</span>
                        <span className="text-[10px] text-slate-200 font-black">
                          {selectedCoords?.lat.toFixed(6)}° {selectedCoords && selectedCoords.lat >= 0 ? "N" : "S"}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase">Longitude</span>
                        <span className="text-[10px] text-slate-200 font-black">
                          {selectedCoords?.lng.toFixed(6)}° {selectedCoords && selectedCoords.lng >= 0 ? "E" : "W"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 flex flex-col gap-0.5 text-left font-mono">
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase">DMS Geodetic Lock</span>
                      <span className="text-[9px] text-cyan-300 font-bold leading-normal">
                        {selectedCoords && getDMS(selectedCoords.lat, selectedCoords.lng)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">⛰️</span>
                        <div className="flex flex-col text-left">
                          <span className="text-[7px] font-mono text-slate-500 uppercase">Terrain Elev</span>
                          <span className="text-[9.5px] font-mono font-bold text-slate-200">{telemetryData.elevation} m</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex flex-col text-left">
                          <span className="text-[7px] font-mono text-slate-500 uppercase">Local Time</span>
                          <span className="text-[9.5px] font-mono font-bold text-slate-200">{telemetryData.localTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Atmospheric Weather Stats */}
                  <div className="bg-black/45 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest font-mono">
                        Atmospheric Sensors
                      </span>
                      <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                        <span className="text-[8.5px] text-cyan-300 font-bold">
                          {getWeatherDesc(telemetryData.weatherCode).icon} {getWeatherDesc(telemetryData.weatherCode).text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="flex items-center gap-2.5">
                        <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="flex flex-col text-left">
                          <span className="text-[7.5px] text-slate-500 font-bold uppercase">Temperature</span>
                          <span className="text-[11px] font-mono font-black text-slate-100">
                            {telemetryData.temp.toFixed(1)}°C
                          </span>
                          <span className="text-[7.5px] text-slate-400/80 font-mono">
                            Feels: {telemetryData.apparentTemp.toFixed(1)}°C
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
                        <div className="flex flex-col text-left">
                          <span className="text-[7.5px] text-slate-500 font-bold uppercase">Humidity</span>
                          <span className="text-[11px] font-mono font-black text-slate-100">
                            {telemetryData.humidity}%
                          </span>
                          <span className="text-[7.5px] text-slate-400/80 font-mono">
                            Precip: {telemetryData.precipitation} mm
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Wind className="w-4 h-4 text-teal-400 shrink-0" />
                        <div className="flex flex-col text-left">
                          <span className="text-[7.5px] text-slate-500 font-bold uppercase">Wind Velocity</span>
                          <span className="text-[11px] font-mono font-black text-slate-100">
                            {telemetryData.windSpeed.toFixed(1)} km/h
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="flex flex-col text-left">
                          <span className="text-[7.5px] text-slate-500 font-bold uppercase">Cloud Coverage</span>
                          <span className="text-[11px] font-mono font-black text-slate-100">
                            {telemetryData.cloudCover}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & telemetry latency stats */}
                  <div className="mt-auto pt-2 flex flex-col gap-2.5">
                    <div className="flex gap-2">
                      <button
                        onClick={handleFlyToCoords}
                        className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-black" /> FLY TO COORDINATES
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[8px] font-mono text-slate-500">
                      <span>Server ping delay: <span className="text-cyan-400 font-bold">{telemetryData.latency}ms</span></span>
                      <span>Link status: <span className="text-emerald-400 font-bold">STABLE</span></span>
                    </div>
                  </div>

                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
