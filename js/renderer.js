/* =====================================================
   Renderer Module - SVG Cross-Section Generation
   ===================================================== */

const Renderer = {
    
    generateCrossSection(analysis, settings = {}) {
        try {
            const width = 600;
            const height = 700;
            const padding = 40;
            const contentWidth = width - (padding * 2);
            const contentHeight = height - (padding * 2);

            let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
        <pattern id="hatch-diagonal" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#333" stroke-width="1" opacity="0.6"/>
        </pattern>
        <pattern id="hatch-cross" patternUnits="userSpaceOnUse" width="8" height="8">
            <line x1="0" y1="0" x2="8" y2="8" stroke="#333" stroke-width="0.8" opacity="0.5"/>
            <line x1="8" y1="0" x2="0" y2="8" stroke="#333" stroke-width="0.8" opacity="0.5"/>
        </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="white"/>
    
    <!-- Border -->
    <rect x="${padding}" y="${padding}" width="${contentWidth}" height="${contentHeight}" fill="none" stroke="#000" stroke-width="2"/>`;

            // Generate main object outline
            const outline = this.generateObjectOutline(contentWidth, contentHeight, analysis, settings);
            svg += outline;

            // Add components and labels
            const components = analysis.components || [];
            const labels = this.generateLabels(components, contentWidth, contentHeight, padding, settings);
            svg += labels;

            // Add cut indication
            svg += this.addCutIndication(width, height, settings.cutType || 'cross');

            // Add title and metadata
            svg += this.addMetadata(width, height, analysis, settings);

            svg += '\n</svg>';

            return svg;
        } catch (error) {
            console.error('SVG generation error:', error);
            return null;
        }
    },

    generateObjectOutline(contentWidth, contentHeight, analysis, settings) {
        const padding = 40;
        const centerX = padding + contentWidth / 2;
        const centerY = padding + contentHeight / 2;
        let svg = '';

        const cutType = settings.cutType || 'cross';
        const style = settings.style || 'technical';

        if (cutType === 'cross') {
            // Querschnitt - circular/rounded outline
            const radius = Math.min(contentWidth, contentHeight) / 2 - 20;
            svg += `\n    <!-- Main object outline -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#000" stroke-width="2.5"/>
    
    <!-- Interior shading/hatching -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius - 3}" fill="url(#${settings.hatching === 'cross' ? 'hatch-cross' : 'hatch-diagonal'})" opacity="0.3"/>`;

            // Add internal structure
            svg += this.addInternalStructure(centerX, centerY, radius, analysis, settings);

        } else if (cutType === 'longitudinal') {
            // Längsschnitt - rectangular with depth indication
            const objWidth = contentWidth * 0.7;
            const objHeight = contentHeight * 0.8;
            const objX = centerX - objWidth / 2;
            const objY = centerY - objHeight / 2;

            svg += `\n    <!-- Longitudinal section -->
    <rect x="${objX}" y="${objY}" width="${objWidth}" height="${objHeight}" fill="none" stroke="#000" stroke-width="2.5" rx="8"/>
    
    <!-- Cut hatching -->
    <path d="M ${objX + 10} ${objY + 10} L ${objX + objWidth - 10} ${objY + objHeight - 10}" 
          stroke="#000" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M ${objX + objWidth - 10} ${objY + 10} L ${objX + 10} ${objY + objHeight - 10}" 
          stroke="#000" stroke-width="1.5" fill="none" opacity="0.5"/>`;

            svg += this.addLongitudinalStructure(objX, objY, objWidth, objHeight, analysis, settings);

        } else if (cutType === 'half') {
            // Halbschnitt - half cut representation
            const radius = Math.min(contentWidth, contentHeight) / 2 - 20;
            svg += `\n    <!-- Half section -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#000" stroke-width="2.5"/>
    
    <!-- Left side - solid -->
    <path d="M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 0 ${centerX} ${centerY + radius} L ${centerX} ${centerY}" 
          fill="#f5f5f5" stroke="#000" stroke-width="1"/>
    
    <!-- Right side - transparent (with hatching) -->
    <path d="M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY + radius} L ${centerX} ${centerY}" 
          fill="url(#${settings.hatching === 'cross' ? 'hatch-cross' : 'hatch-diagonal'})" opacity="0.4" stroke="#000" stroke-width="1"/>`;

            svg += this.addInternalStructure(centerX, centerY, radius, analysis, settings);

        } else if (cutType === 'layers') {
            // Schichtaufbau - layered visualization
            svg += this.generateLayeredView(centerX, centerY, contentWidth, contentHeight, analysis, settings);

        } else if (cutType === 'cutaway') {
            // Cutaway/Explosionsdarstellung
            svg += this.generateCutawayView(centerX, centerY, contentWidth, contentHeight, analysis, settings);
        }

        // Add dimension lines and reference points
        svg += this.addDimensionLines(padding, contentWidth, contentHeight);

        return svg;
    },

    addInternalStructure(centerX, centerY, radius, analysis, settings) {
        let svg = '\n    <!-- Internal components -->';
        const components = analysis.components || [];

        components.forEach((comp, index) => {
            const angle = (index / Math.max(components.length, 1)) * Math.PI * 2;
            const compRadius = radius * (0.3 + Math.random() * 0.4);
            const compX = centerX + Math.cos(angle) * compRadius;
            const compY = centerY + Math.sin(angle) * compRadius;
            const compSize = 15 + Math.random() * 20;

            if (Math.random() > 0.5) {
                // Rectangular component
                svg += `\n    <rect x="${compX - compSize / 2}" y="${compY - compSize / 2}" width="${compSize}" height="${compSize}" 
              fill="none" stroke="#666" stroke-width="1.5" rx="2"/>`;
            } else {
                // Circular component
                svg += `\n    <circle cx="${compX}" cy="${compY}" r="${compSize / 2}" fill="none" stroke="#666" stroke-width="1.5"/>`;
            }

            // Confidence indicator color
            const confColor = comp.confidence > 0.7 ? '#0066cc' : comp.confidence > 0.5 ? '#ff9800' : '#ccc';
            svg += `\n    <circle cx="${compX}" cy="${compY}" r="3" fill="${confColor}" opacity="0.8"/>`;
        });

        return svg;
    },

    addLongitudinalStructure(objX, objY, objWidth, objHeight, analysis, settings) {
        let svg = '\n    <!-- Longitudinal internal structure -->';
        const components = analysis.components || [];
        const layerCount = Math.min(components.length + 1, 4);

        for (let i = 1; i < layerCount; i++) {
            const x = objX + (objWidth / layerCount) * i;
            svg += `\n    <line x1="${x}" y1="${objY + 5}" x2="${x}" y2="${objY + objHeight - 5}" 
                  stroke="#999" stroke-width="1" opacity="0.6" stroke-dasharray="3,3"/>`;
        }

        // Add component rectangles
        components.slice(0, layerCount - 1).forEach((comp, index) => {
            const layerY = objY + 20 + (index * objHeight / layerCount);
            const layerHeight = objHeight / layerCount - 10;
            svg += `\n    <rect x="${objX + 15}" y="${layerY}" width="${objWidth - 30}" height="${layerHeight}" 
                  fill="none" stroke="#666" stroke-width="1.5" rx="3"/>`;
        });

        return svg;
    },

    generateLayeredView(centerX, centerY, contentWidth, contentHeight, analysis, settings) {
        let svg = '\n    <!-- Layered view -->';
        const components = analysis.components || [];
        const layerCount = Math.min(Math.max(components.length, 3), 5);

        for (let i = 0; i < layerCount; i++) {
            const scale = 1 - (i * 0.15);
            const width = contentWidth * scale * 0.6;
            const height = contentHeight * scale * 0.6;
            const offsetY = i * 30;

            svg += `\n    <g transform="translate(0, ${offsetY})">
        <rect x="${centerX - width / 2}" y="${centerY - height / 2}" width="${width}" height="${height}" 
              fill="none" stroke="#666" stroke-width="1.5" rx="4" opacity="${0.8 - i * 0.1}"/>
        <text x="${centerX + width / 2 + 15}" y="${centerY - height / 2 + 15}" font-size="11" fill="#666">
            Layer ${i + 1}
        </text>
    </g>`;
        }

        return svg;
    },

    generateCutawayView(centerX, centerY, contentWidth, contentHeight, analysis, settings) {
        let svg = '\n    <!-- Cutaway view -->';
        const components = analysis.components || [];

        // Main object outline
        const objWidth = contentWidth * 0.6;
        const objHeight = contentHeight * 0.7;
        svg += `\n    <path d="M ${centerX - objWidth / 2} ${centerY - objHeight / 2} 
                  L ${centerX + objWidth / 2} ${centerY - objHeight / 2}
                  L ${centerX + objWidth / 2} ${centerY + objHeight / 2}
                  L ${centerX - objWidth / 2} ${centerY + objHeight / 2}
                  Z" fill="none" stroke="#000" stroke-width="2.5"/>`;

        // Exploded components
        components.forEach((comp, index) => {
            const angle = (index / Math.max(components.length, 1)) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const compX = centerX + Math.cos(angle) * distance;
            const compY = centerY + Math.sin(angle) * distance;
            const compSize = 20 + Math.random() * 25;

            // Component
            svg += `\n    <rect x="${compX - compSize / 2}" y="${compY - compSize / 2}" width="${compSize}" height="${compSize}" 
                  fill="none" stroke="#666" stroke-width="1.5" rx="2"/>`;

            // Connection line
            svg += `\n    <line x1="${centerX}" y1="${centerY}" x2="${compX}" y2="${compY}" 
                  stroke="#999" stroke-width="1" opacity="0.5" stroke-dasharray="2,2"/>`;

            // Component label
            svg += `\n    <text x="${compX + compSize / 2 + 5}" y="${compY + 5}" font-size="10" fill="#666">
                ${index + 1}
            </text>`;
        });

        return svg;
    },

    addDimensionLines(padding, contentWidth, contentHeight) {
        const startX = padding;
        const endX = padding + contentWidth;
        const startY = padding;
        const endY = padding + contentHeight;

        return `\n    <!-- Dimension lines -->
    <line x1="${startX - 20}" y1="${startY - 5}" x2="${startX - 20}" y2="${endY + 5}" 
          stroke="#999" stroke-width="0.5"/>
    <line x1="${startX - 25}" y1="${startY - 5}" x2="${startX - 15}" y2="${startY - 5}" 
          stroke="#999" stroke-width="0.5"/>
    <line x1="${startX - 25}" y1="${endY + 5}" x2="${startX - 15}" y2="${endY + 5}" 
          stroke="#999" stroke-width="0.5"/>`;
    },

    generateLabels(components, contentWidth, contentHeight, padding, settings) {
        let svg = '\n    <!-- Component labels -->';
        const centerX = padding + contentWidth / 2;
        const startY = padding + contentHeight + 30;

        components.slice(0, 8).forEach((comp, index) => {
            const y = startY + (index * 25);
            const confColor = comp.confidence > 0.7 ? '#0066cc' : comp.confidence > 0.5 ? '#ff9800' : '#ccc';
            const confPercent = Math.round(comp.confidence * 100);

            svg += `\n    <g>
        <circle cx="${padding + 15}" cy="${y + 3}" r="3" fill="${confColor}"/>
        <line x1="${padding + 22}" y1="${y + 3}" x2="${padding + 40}" y2="${y + 3}" stroke="#666" stroke-width="1"/>
        <text x="${padding + 50}" y="${y + 6}" font-size="12" font-weight="600" fill="#000">${comp.name}</text>
        <text x="${padding + 50}" y="${y + 18}" font-size="10" fill="#999">${confPercent}% sicher</text>
    </g>`;
        });

        return svg;
    },

    addCutIndication(width, height, cutType) {
        const cutLabels = {
            'cross': 'Querschnitt',
            'longitudinal': 'Längsschnitt',
            'half': 'Halbschnitt',
            'layers': 'Schichtaufbau',
            'cutaway': 'Cutaway-Darstellung'
        };

        return `\n    <!-- Cut type indicator -->
    <text x="20" y="${height - 15}" font-size="11" fill="#999">
        ${cutLabels[cutType] || 'Schnittdarstellung'}
    </text>`;
    },

    addMetadata(width, height, analysis, settings) {
        const objectType = analysis.objectType?.type || 'Objekt';
        const complexity = analysis.complexity?.level || 'Mittel';

        return `\n    <!-- Metadata -->
    <text x="20" y="25" font-size="14" font-weight="700" fill="#000">
        ${objectType}
    </text>
    <text x="20" y="45" font-size="10" fill="#999">
        Komplexität: ${complexity} | Offline-Analyse
    </text>`;
    },

    async svgToCanvas(svgString, width = 600, height = 700) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);

                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas);
                };
                img.onerror = () => reject(new Error('SVG rendering failed'));

                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                img.src = url;
            } catch (error) {
                reject(error);
            }
        });
    },

    canvasToPNG(canvas) {
        return canvas.toDataURL('image/png');
    },

    downloadSVG(svgString, filename = 'schnittbild.svg') {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    downloadPNG(pngDataUrl, filename = 'schnittbild.png') {
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
