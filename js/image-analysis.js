/* =====================================================
   Image Analysis Module - Local Image Processing
   ===================================================== */

const ImageAnalysis = {
    
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    },

    async analyzeImage(imageElement, settings = {}) {
        try {
            // Resize image for processing
            const canvas = document.createElement('canvas');
            const maxSize = 1024;
            let width = imageElement.width;
            let height = imageElement.height;

            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageElement, 0, 0, width, height);

            // Extract image data
            const imageData = ctx.getImageData(0, 0, width, height);
            
            // Perform comprehensive local analysis
            const edges = this.detectEdges(imageData, width, height);
            const contours = this.detectContours(imageData, width, height);
            const shapes = this.detectShapes(contours, width, height);
            
            const analysis = {
                objectType: this.detectObjectType(imageData, width, height),
                shapes: shapes,
                edges: edges,
                contours: contours,
                symmetry: this.detectSymmetry(imageData, width, height),
                components: this.detectComponentsFromContours(contours, shapes, imageData, width, height),
                dominantColors: this.extractDominantColors(imageData),
                brightness: this.analyzeBrightness(imageData),
                contrast: this.analyzeContrast(imageData),
                complexity: this.analyzeComplexity(imageData, width, height),
                edgeMap: edges.map,
                imageWidth: width,
                imageHeight: height
            };

            return analysis;
        } catch (error) {
            console.error('Image analysis error:', error);
            return null;
        }
    },

    // Verbesserte Kantenerkennung mit Sobel-Filter
    detectEdges(imageData, width, height) {
        const data = imageData.data;
        const edgeMap = new Uint8Array(width * height);
        let edgeCount = 0;
        let maxEdge = 0;

        // Sobel edge detection
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                // Sobel X
                const sobelX = 
                    -this.getBrightness(data, width, x - 1, y - 1) - 2 * this.getBrightness(data, width, x - 1, y) - this.getBrightness(data, width, x - 1, y + 1) +
                    this.getBrightness(data, width, x + 1, y - 1) + 2 * this.getBrightness(data, width, x + 1, y) + this.getBrightness(data, width, x + 1, y + 1);

                // Sobel Y
                const sobelY = 
                    -this.getBrightness(data, width, x - 1, y - 1) - 2 * this.getBrightness(data, width, x, y - 1) - this.getBrightness(data, width, x + 1, y - 1) +
                    this.getBrightness(data, width, x - 1, y + 1) + 2 * this.getBrightness(data, width, x, y + 1) + this.getBrightness(data, width, x + 1, y + 1);

                const magnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
                edgeMap[y * width + x] = Math.min(255, magnitude / 4);

                if (magnitude > 40) {
                    edgeCount++;
                    maxEdge = Math.max(maxEdge, magnitude);
                }
            }
        }

        const edgeDensity = edgeCount / (width * height);
        
        return {
            detected: edgeCount > 0,
            edgeCount: edgeCount,
            density: edgeDensity,
            quality: edgeDensity > 0.1 ? 'hoch' : edgeDensity > 0.05 ? 'mittel' : 'niedrig',
            map: edgeMap,
            maxMagnitude: maxEdge
        };
    },

    // Konturerkennung
    detectContours(imageData, width, height) {
        const data = imageData.data;
        const contours = [];
        const visited = new Set();
        
        // Schwellenwert für Kantenerkennung
        const threshold = 100;
        
        // Finde alle Kantenpixel
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const brightness = (r + g + b) / 3;
                
                // Prüfe auf Kontrast zu Nachbarn
                let hasContrast = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nidx = ((y + dy) * width + (x + dx)) * 4;
                        const nb = (data[nidx] + data[nidx + 1] + data[nidx + 2]) / 3;
                        if (Math.abs(brightness - nb) > threshold) {
                            hasContrast = true;
                            break;
                        }
                    }
                    if (hasContrast) break;
                }
                
                if (hasContrast) {
                    const key = `${x},${y}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        contours.push({ x, y, brightness });
                    }
                }
            }
        }
        
        return contours;
    },

    // Erkenne Formen aus Konturen
    detectShapes(contours, width, height) {
        const shapes = [];
        
        if (contours.length < 10) {
            return shapes;
        }
        
        // Gruppiere Konturen in Clustern
        const clusters = this.clusterPoints(contours, 50);
        
        clusters.forEach(cluster => {
            if (cluster.length < 5) return;
            
            // Berechne Bounding Box
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;
            
            cluster.forEach(p => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });
            
            const w = maxX - minX;
            const h = maxY - minY;
            const aspect = w / Math.max(h, 1);
            
            let shapeType = 'Unbekannt';
            let confidence = 0.4;
            
            // Erkenne Formtyp
            if (aspect > 0.7 && aspect < 1.3) {
                shapeType = 'Rechteck';
                confidence = 0.7;
            } else if (aspect > 1.5) {
                shapeType = 'Horizontale Struktur';
                confidence = 0.6;
            } else if (aspect < 0.67) {
                shapeType = 'Vertikale Struktur';
                confidence = 0.6;
            }
            
            shapes.push({
                type: shapeType,
                x: minX,
                y: minY,
                width: w,
                height: h,
                area: w * h,
                confidence: confidence,
                pointCount: cluster.length
            });
        });
        
        // Sortiere nach Größe
        shapes.sort((a, b) => b.area - a.area);
        
        return shapes.slice(0, 10); // Max 10 Formen
    },

    // Clustering-Hilfsfunktion
    clusterPoints(points, maxDistance) {
        const clusters = [];
        const used = new Set();
        
        for (let i = 0; i < points.length; i++) {
            if (used.has(i)) continue;
            
            const cluster = [points[i]];
            used.add(i);
            
            for (let j = i + 1; j < points.length; j++) {
                if (used.has(j)) continue;
                
                const dist = Math.hypot(
                    points[i].x - points[j].x,
                    points[i].y - points[j].y
                );
                
                if (dist < maxDistance) {
                    cluster.push(points[j]);
                    used.add(j);
                }
            }
            
            if (cluster.length > 0) {
                clusters.push(cluster);
            }
        }
        
        return clusters;
    },

    // Erkenne Komponenten basierend auf erkannten Konturen
    detectComponentsFromContours(contours, shapes, imageData, width, height) {
        const components = [];
        
        const componentNames = [
            'Äußeres Gehäuse',
            'Inneres Modul',
            'Strukturelement',
            'Interne Komponente',
            'Verbindungselement',
            'Schichten-Grenze',
            'Technisches Element',
            'Strukturteil',
            'Elektronisches Element',
            'Mechanisches Teil'
        ];
        
        // Nutze erkannte Formen als Basis für Komponenten
        shapes.slice(0, 5).forEach((shape, idx) => {
            // Konfidenz basierend auf erkannter Formgröße und Punktanzahl
            const sizeConfidence = Math.min(shape.area / (width * height), 1);
            const densityConfidence = Math.min(shape.pointCount / 100, 1);
            const confidence = Math.max(0.3, (sizeConfidence + densityConfidence) / 2 * 0.9);
            
            components.push({
                name: componentNames[idx % componentNames.length],
                description: `${shape.type} - Erkannte innere Komponente`,
                confidence: confidence,
                region: idx,
                x: (shape.x + shape.width / 2) / width,
                y: (shape.y + shape.height / 2) / height,
                shape: shape
            });
        });
        
        // Fallback: Wenn keine Formen erkannt wurden, generiere basierend auf Konturen
        if (components.length === 0 && contours.length > 0) {
            const avgConfidence = Math.min(contours.length / 200, 0.9);
            components.push({
                name: 'Erkannte Struktur',
                description: 'Komplexe innere Struktur basierend auf Konturen',
                confidence: avgConfidence,
                region: 0,
                x: 0.5,
                y: 0.5
            });
        }
        
        return components;
    },

    detectObjectType(imageData, width, height) {
        const data = imageData.data;
        let edgePixels = 0;
        let darkPixels = 0;
        let brightPixels = 0;
        let totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness < 80) darkPixels++;
            else if (brightness > 200) brightPixels++;
        }

        const darkRatio = darkPixels / totalPixels;
        const brightRatio = brightPixels / totalPixels;

        let objectType = 'Technisches Objekt';
        let confidence = 0.6;

        if (darkRatio > 0.4) {
            objectType = 'Elektronisches/dunkles Gerät';
            confidence = 0.7;
        } else if (brightRatio > 0.5) {
            objectType = 'Helles/transparentes Objekt';
            confidence = 0.65;
        } else if (darkRatio > 0.2 && brightRatio > 0.2) {
            objectType = 'Gemischtes technisches Gerät';
            confidence = 0.65;
        }

        return {
            type: objectType,
            confidence: confidence,
            darkRatio: darkRatio,
            brightRatio: brightRatio
        };
    },

    detectSymmetry(imageData, width, height) {
        const data = imageData.data;
        let horizontalSymmetry = 0;
        let verticalSymmetry = 0;
        const samples = 50;

        // Check horizontal symmetry
        for (let i = 0; i < samples; i++) {
            const y = Math.floor(Math.random() * height);
            const midX = width / 2;

            for (let x = 0; x < midX; x += Math.floor(midX / 10)) {
                const leftB = this.getBrightness(data, width, Math.floor(x), y);
                const rightB = this.getBrightness(data, width, Math.floor(width - x - 1), y);

                if (Math.abs(leftB - rightB) < 30) {
                    horizontalSymmetry++;
                }
            }
        }

        // Check vertical symmetry
        for (let i = 0; i < samples; i++) {
            const x = Math.floor(Math.random() * width);
            const midY = height / 2;

            for (let y = 0; y < midY; y += Math.floor(midY / 10)) {
                const topB = this.getBrightness(data, width, x, Math.floor(y));
                const bottomB = this.getBrightness(data, width, x, Math.floor(height - y - 1));

                if (Math.abs(topB - bottomB) < 30) {
                    verticalSymmetry++;
                }
            }
        }

        return {
            horizontal: Math.min(horizontalSymmetry / (samples * 10), 1),
            vertical: Math.min(verticalSymmetry / (samples * 10), 1),
            isSymmetric: horizontalSymmetry > samples * 3 || verticalSymmetry > samples * 3
        };
    },

    extractDominantColors(imageData) {
        const data = imageData.data;
        const colorMap = {};
        const colors = [];

        // Sample every 10th pixel
        for (let i = 0; i < data.length; i += 40) {
            const r = Math.round(data[i] / 50) * 50;
            const g = Math.round(data[i + 1] / 50) * 50;
            const b = Math.round(data[i + 2] / 50) * 50;
            const key = `${r},${g},${b}`;

            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Get top 3 colors
        Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .forEach(([key, count]) => {
                const [r, g, b] = key.split(',').map(Number);
                colors.push({
                    rgb: `rgb(${r},${g},${b})`,
                    hex: `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`,
                    frequency: count
                });
            });

        return colors;
    },

    analyzeBrightness(imageData) {
        const data = imageData.data;
        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        return totalBrightness / (data.length / 4) / 255;
    },

    analyzeContrast(imageData) {
        const data = imageData.data;
        let minB = 255;
        let maxB = 0;

        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            minB = Math.min(minB, brightness);
            maxB = Math.max(maxB, brightness);
        }

        return (maxB - minB) / 255;
    },

    analyzeComplexity(imageData, width, height) {
        const data = imageData.data;
        let transitions = 0;
        let lastB = (data[0] + data[1] + data[2]) / 3;

        for (let i = 4; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (Math.abs(brightness - lastB) > 30) {
                transitions++;
            }
            lastB = brightness;
        }

        const complexity = Math.min(transitions / (width * height), 1);

        return {
            score: complexity,
            level: complexity < 0.2 ? 'Einfach' : complexity < 0.5 ? 'Mittel' : 'Komplex'
        };
    },

    // Hilfsfunktion für Helligkeit
    getBrightness(data, width, x, y) {
        const idx = (y * width + x) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    },

    recommendCutType(analysis) {
        if (!analysis) return 'auto';

        const symmetry = analysis.symmetry || {};
        const complexity = analysis.complexity || {};
        const contourCount = (analysis.contours || []).length;

        if (symmetry.isSymmetric) {
            return 'half';
        }

        if (complexity.level === 'Komplex' && contourCount > 100) {
            return 'cutaway';
        }

        if ((analysis.components || []).length > 5) {
            return 'layers';
        }

        return 'cross';
    }
};
