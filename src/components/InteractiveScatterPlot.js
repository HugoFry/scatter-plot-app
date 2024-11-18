import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { rgb } from 'd3-color';  


const CATEGORIES = [
  { id: 3, name: "Pacemaker" },
  { id: 12, name: "Unilateral pleural effusion" },
  { id: 8, name: "Post-surgical hardware" },
  { id: 7, name: "Clear lung fields" },
  { id: 2, name: "Dialysis catheter" },
  { id: 14, name: "Mediastinal shift" },
  { id: 4, name: "Breathing tube" },
  { id: 5, name: "Feeding tube" },
  { id: 9, name: "Orthopaedic implants" },
  { id: 10, name: "Spinal abnormalities" },
  { id: 13, name: "Bilateral pleural effusions" },
  { id: 19, name: "Tortuous aorta" },
  { id: 25, name: "COPD" }
];

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map(cat => cat.id));

const InteractiveScatterPlot = () => {
  const [data, setData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlotReady, setIsPlotReady] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const wrapText = (text, maxLength = 50) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines.join('<br>');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/features.json');
        const jsonData = await response.json();
        
        const transformedData = Object.entries(jsonData).map(([index, pointData]) => ({
          index: parseInt(index),
          x: pointData.embedding[0],
          y: pointData.embedding[1],
          description: pointData.description,
          wrappedDescription: wrapText(pointData.description),
          labels: pointData.labels || []
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const axisRanges = useMemo(() => {
    if (!data.length) return null;
    return {
      xMin: Math.min(...data.map(d => d.x)) - 5,
      xMax: Math.max(...data.map(d => d.x)) + 5,
      yMin: Math.min(...data.map(d => d.y)) - 5,
      yMax: Math.max(...data.map(d => d.y)) + 5
    };
  }, [data]);

  const plotLayout = useMemo(() => {
    if (!axisRanges) return null;
    
    return {
      autosize: true,
      height: 500,
      margin: { l: 50, r: 50, t: 30, b: 50 },
      xaxis: {
        gridcolor: '#eef2f6',
        showgrid: true,
        zeroline: false,
        linecolor: '#e2e8f0',
        tickfont: { size: 12, color: '#64748b' },
        range: [axisRanges.xMin, axisRanges.xMax]
      },
      yaxis: {
        gridcolor: '#eef2f6',
        showgrid: true,
        zeroline: false,
        linecolor: '#e2e8f0',
        tickfont: { size: 12, color: '#64748b' },
        range: [axisRanges.yMin, axisRanges.yMax]
      },
      showlegend: false,
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      hovermode: 'closest',
      modebar: {
        bgcolor: 'transparent',
        color: '#94a3b8',
        activecolor: '#0ea5e9'
      }
    };
  }, [axisRanges]);

  const plotData = useMemo(() => {
    const getPointColor = (point) => {
      if (!selectedCategory) return '#0ea5e9';  // sky-500
      // Filter valid labels before checking
      const validLabels = point.labels.filter(label => VALID_CATEGORY_IDS.has(label));
      return validLabels.includes(selectedCategory) ? '#22c55e' : '#0ea5e9';  // green-500 : sky-500
    };
  
    const getPointOpacity = (point) => {
      if (!selectedCategory) return 0.6;
      // Filter valid labels before checking
      const validLabels = point.labels.filter(label => VALID_CATEGORY_IDS.has(label));
      return validLabels.includes(selectedCategory) ? 1 : 0.3;
    };
  
    return [{
      x: data.map(d => d.x),
      y: data.map(d => d.y),
      mode: 'markers',
      type: 'scattergl',
      marker: { 
        color: data.map(getPointColor),
        size: 6,
        opacity: data.map(getPointOpacity),
        line: {
          color: data.map(d => {
            const color = getPointColor(d);
            return rgb(color).darker(0.5).toString();
          }),
          width: 1.5
        }
      },
      text: data.map(d => d.wrappedDescription),
      hoverinfo: 'text',
      hoverlabel: {
        bgcolor: 'white',
        bordercolor: '#0ea5e9',
        font: { size: 13 },
        align: 'left'
      },
      ids: data.map((_, index) => index.toString())
    }];
  }, [data, selectedCategory]);

  const handlePointClick = useCallback((event) => {
    if (!isPlotReady) return;
    
    if (event?.points?.[0]) {
      const pointIndex = event.points[0].pointNumber;
      const clickedPoint = data[pointIndex];
      if (clickedPoint) {
        setSelectedPoint(clickedPoint);
      }
    }
  }, [data, isPlotReady]);

  const handlePlotInitialized = useCallback((figure) => {
    setTimeout(() => {
      setIsPlotReady(true);
    }, 1000);
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-sky-900 font-medium">Loading visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 font-sans">
          🩻 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">
            SAE-Rad Feature Visualization
          </span> 🤖
        </h1>
      </div>

      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">

          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 font-medium mb-4">
              Geometry of chest X-ray features extracted by SAE-Rad
            </p>
            <a 
              href="https://openreview.net/pdf?id=ZLAQ6Pjf9y" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-lg hover:from-indigo-700 hover:to-sky-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Read our paper 📑 
            </a>
          </div>

          <div className="flex justify-center mb-8">
            <CategorySelector
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          <div
            className="bg-gray-50/80 rounded-2xl p-6 mb-6 shadow-inner"
            style={{
              height: '600px', // Fixed height
              overflow: 'hidden', // Prevent content spillover
              position: 'relative', // To keep Plot constrained
            }}
          >
            {data.length > 0 && plotLayout && (
              <Plot
                data={plotData}
                layout={plotLayout}
                config={{
                  displayModeBar: true,
                  modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'],
                  responsive: true,
                  scrollZoom: true,
                  useWebGL: true,
                }}
                onClick={handlePointClick}
                onInitialized={handlePlotInitialized}
                onUpdate={handlePlotInitialized}
                style={{
                  width: '100%',
                  height: '100%', // Ensures Plot fits the container
                }}
                useResizeHandler={true}
              />
            )}
          </div>

          {selectedPoint && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-sky-50/80 backdrop-blur-sm rounded-2xl p-6 border border-sky-100 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-sky-900">
                    Feature {selectedPoint.index}
                  </h3>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sky-800 text-lg mb-4">{selectedPoint.description}</p>
                    {selectedPoint.labels.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {/* Filter labels to only show valid categories */}
                          {selectedPoint.labels
                            .filter(labelId => VALID_CATEGORY_IDS.has(labelId))
                            .map(labelId => (
                              <span key={labelId} className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                                {CATEGORIES.find(cat => cat.id === labelId)?.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <img
                      src={`https://d1kcxzhfa4ovsd.cloudfront.net/highest_activating_images/${selectedPoint.index}.png`}
                      alt={`Highest activating image for feature ${selectedPoint.index}`}
                      className="w-full rounded-lg shadow-md"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-xl p-4 inline-block shadow-sm">
          💡 Interactive visualization of SAE features. Each point represents a learned feature from the chest X-ray images.
          Select a category to highlight relevant points, or click points to explore the feature space.
        </p>
      </div>
    </div>
  );
};

export default InteractiveScatterPlot;