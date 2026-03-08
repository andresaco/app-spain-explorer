import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { GeoElement, GameMode } from '../types';

interface MapProps {
  mode: GameMode;
  currentTarget: GeoElement | null;
  onSelect: (id: string) => void;
  feedback: 'correct' | 'wrong' | null;
  selectedId: string | null;
}

export const SpainMap: React.FC<MapProps> = ({ mode, currentTarget, onSelect, feedback, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [provincesData, setProvincesData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);

  useEffect(() => {
    // Fetching GeoJSON data for Spain and neighbors
    const fetchMaps = async () => {
      try {
        const fetchJson = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return res.json();
        };

        const [commData, provData, wData] = await Promise.all([
          fetchJson('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-communities.geojson'),
          fetchJson('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson'),
          fetchJson('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson').catch(err => {
            console.warn('Neighbor map failed to load, continuing without it:', err);
            return null;
          })
        ]);
        
        setGeoData(commData);
        setProvincesData(provData);
        setWorldData(wData);
      } catch (error) {
        console.error('Error loading maps:', error);
      }
    };
    fetchMaps();
  }, []);

  useEffect(() => {
    if (!svgRef.current || (!geoData && !provincesData)) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;

    // Projection focused on Spain
    const projection = d3.geoConicConformal()
      .center([-3.7, 40])
      .parallels([35, 45])
      .scale(2800)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append('g');

    // Draw background countries (neighbors)
    if (worldData) {
      const neighbors = ['PRT', 'FRA', 'MAR', 'DZA', 'AND', 'GIB'];
      const neighborFeatures = worldData.features.filter((f: any) => 
        neighbors.includes(f.properties.iso_a3) || 
        ['Portugal', 'France', 'Morocco', 'Algeria', 'Andorra'].includes(f.properties.name)
      );

      g.selectAll('path.neighbor')
        .data(neighborFeatures)
        .enter()
        .append('path')
        .attr('class', 'neighbor')
        .attr('d', pathGenerator as any)
        .attr('fill', '#f1f5f9')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 0.5);
    }

    // Add a box for Canary Islands BEFORE regions so regions are on top
    g.append('rect')
      .attr('x', 20)
      .attr('y', 420)
      .attr('width', 220)
      .attr('height', 140)
      .attr('fill', 'white')
      .attr('stroke', '#94a3b8')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-width', 1)
      .attr('rx', 10);

    // Helper to handle Canary Islands shift in the GeoJSON
    const processFeatures = (features: any[]) => {
      return features.map(f => {
        const feature = JSON.parse(JSON.stringify(f));
        const name = feature.properties.name || '';
        if (name.includes('Canarias') || name.includes('Palmas') || name.includes('Tenerife')) {
          // Adjusted shift to fit exactly in the box [20, 420, 220, 140]
          const shiftX = 5.5;
          const shiftY = 7.0;
          if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map((poly: any) => 
              poly.map((ring: any) => ring.map((coord: any) => [coord[0] + shiftX, coord[1] + shiftY]))
            );
          } else if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map((ring: any) => 
              ring.map((coord: any) => [coord[0] + shiftX, coord[1] + shiftY])
            );
          }
        }
        return feature;
      });
    };

    // Draw base map (all regions)
    let dataToDraw = mode === 'provinces' ? provincesData : geoData;
    if (!dataToDraw || !dataToDraw.features) {
      console.log('No data to draw yet:', { mode, hasGeo: !!geoData, hasProv: !!provincesData });
      return;
    }

    const processedFeatures = processFeatures(dataToDraw.features);
    
    // --- Algoritmo de Coloración de Mapas ---
    const getMapColoring = (features: any[]) => {
      const adjacency: { [key: string]: Set<string> } = {};
      const pointToRegions: { [key: string]: string[] } = {};

      // 1. Mapear cada punto a las regiones que lo contienen
      features.forEach(f => {
        const id = f.properties.name || f.properties.id;
        adjacency[id] = new Set();
        
        const coords = f.geometry.type === 'MultiPolygon' 
          ? f.geometry.coordinates.flat(2) 
          : f.geometry.coordinates.flat(1);
          
        coords.forEach((pt: any) => {
          const key = `${pt[0].toFixed(4)},${pt[1].toFixed(4)}`; // Redondeo para evitar errores de precisión
          if (!pointToRegions[key]) pointToRegions[key] = [];
          if (!pointToRegions[key].includes(id)) pointToRegions[key].push(id);
        });
      });

      // 2. Construir lista de adyacencia
      Object.values(pointToRegions).forEach(ids => {
        if (ids.length > 1) {
          for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
              adjacency[ids[i]].add(ids[j]);
              adjacency[ids[j]].add(ids[i]);
            }
          }
        }
      });

      // 3. Asignación voraz de colores
      const colors: { [key: string]: number } = {};
      const sortedIds = Object.keys(adjacency).sort(); // Orden estable

      sortedIds.forEach(id => {
        const neighborColors = Array.from(adjacency[id])
          .map(neighborId => colors[neighborId])
          .filter(c => c !== undefined);
        
        let color = 0;
        while (neighborColors.includes(color)) color++;
        colors[id] = color;
      });

      return colors;
    };

    const regionColors = getMapColoring(processedFeatures);
    const colorPalette = d3.schemeSet3;
    
    g.selectAll('path.region')
      .data(processedFeatures)
      .enter()
      .append('path')
      .attr('class', 'region transition-colors duration-300 cursor-pointer')
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        const name = d.properties.name || '';
        const id = d.properties.id || name;
        if (selectedId === id || selectedId === name) {
          return feedback === 'correct' ? '#22c55e' : '#ef4444';
        }
        // Usar el color asignado por el algoritmo
        return colorPalette[regionColors[id] % colorPalette.length];
      })
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .on('click', (event, d: any) => {
        const name = d.properties.name || '';
        const id = d.properties.id || name;
        onSelect(id);
      })
      .on('mouseover', function(event, d: any) {
        const name = d.properties.name || '';
        const id = d.properties.id || name;
        const baseColor = colorPalette[regionColors[id] % colorPalette.length];
        d3.select(this).attr('fill', d3.color(baseColor)?.darker(0.5).toString() || baseColor);
      })
      .on('mouseout', function(event, d: any) {
        const name = d.properties.name || '';
        const id = d.properties.id || name;
        if (selectedId !== id && selectedId !== name) {
          d3.select(this).attr('fill', colorPalette[regionColors[id] % colorPalette.length]);
        } else {
          d3.select(this).attr('fill', feedback === 'correct' ? '#22c55e' : '#ef4444');
        }
      });

    // Special markers for Ceuta and Melilla
    const enclaves = [
      { name: 'Ceuta', coords: [-5.3, 35.88] },
      { name: 'Melilla', coords: [-2.9, 35.29] }
    ];

    g.selectAll('circle.enclave-marker')
      .data(enclaves)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => projection(d.coords as [number, number])?.[0] || 0)
      .attr('cy', (d: any) => projection(d.coords as [number, number])?.[1] || 0)
      .attr('r', 8)
      .attr('fill', (d: any) => {
        if (selectedId === d.name) {
          return feedback === 'correct' ? '#22c55e' : '#ef4444';
        }
        return colorPalette[regionColors[d.name] % colorPalette.length];
      })
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('class', 'cursor-pointer transition-all duration-300')
      .on('click', (event, d: any) => {
        onSelect(d.name);
      })
      .on('mouseover', function(event, d: any) {
        const baseColor = colorPalette[regionColors[d.name] % colorPalette.length];
        d3.select(this)
          .attr('r', 12)
          .attr('stroke-width', 3)
          .attr('fill', d3.color(baseColor)?.darker(0.5).toString() || baseColor);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('r', 8)
          .attr('stroke-width', 2)
          .attr('fill', () => {
            if (selectedId === d.name) {
              return feedback === 'correct' ? '#22c55e' : '#ef4444';
            }
            return colorPalette[regionColors[d.name] % colorPalette.length];
          });
      });

    // Add Mountain Markers if in mountain mode
    if (mode === 'mountains') {
      const mountains = [
        { name: 'Pirineos', coords: [0.5, 42.5] },
        { name: 'Cordillera Cantábrica', coords: [-4.5, 43.0] },
        { name: 'Sistema Central', coords: [-4.0, 40.5] },
        { name: 'Sistema Ibérico', coords: [-1.5, 41.0] },
        { name: 'Sistemas Béticos', coords: [-3.0, 37.5] },
        { name: 'Sierra Morena', coords: [-5.0, 38.5] },
        { name: 'Teide', coords: [-16.6, 28.3] },
      ];

      g.selectAll('path.mountain-icon')
        .data(mountains)
        .enter()
        .append('path')
        .attr('d', d3.symbol().type(d3.symbolTriangle).size(200))
        .attr('transform', (d: any) => {
          const p = projection(d.coords as [number, number]);
          return p ? `translate(${p[0]},${p[1]})` : '';
        })
        .attr('fill', '#451a03')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('class', 'cursor-pointer hover:scale-125 transition-transform')
        .on('click', (event, d: any) => {
          onSelect(d.name);
        });
    }

  }, [geoData, provincesData, worldData, mode, feedback, selectedId, onSelect]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-sky-50 rounded-3xl overflow-hidden border-4 border-white shadow-inner">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full max-h-[80vh]"
      />
    </div>
  );
};
