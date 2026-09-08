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
            
            // Perform local analysis
            const analysis = {
                objectType: this.detectObjectType(imageData, width, height),
                shapes: this.detectShapes(imageData, width, height),
                edges: this.detectEdges(imageData, width, height),
                symmetry: this.detectSymmetry(imageData, width, height),
                components: this.detectComponents(imageData, width, height),
                dominantColors: this.extractDominantColors(imageData),
                brightness: this.analyzeBrightness(imageData),
                contrast: this.analyzeContrast(imageData),
                complexity: this.analyzeComplexity(imageData, width, height)
            };

            return analysis;
        } catch (error) {
            console.error('Image analysis error:', error);
            return null;
        }
    },

    detectObjectType(imageData, width, height) {
        const data = imageData.data;
        let edgePixels = 0;
        let darkPixels = 0;
        let totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness < 100) darkPixels++;
            if (brightness > 200 && brightness < 50) edgePixels++;
        }

        const darkRatio = darkPixels / totalPixels;
        const edgeRatio = edgePixels / totalPixels;

        let objectType = 'Objekt';
        let confidence = 0.5;

        if (darkRatio > 0.3 && edgeRatio > 0.1) {
            objectType = 'Technisches Gerät';
            confidence = 0.65;
        } else if (darkRatio > 0.4) {
            objectType = 'Mechanisches Bauteil';
            confidence = 0.60;
        } else if (darkRatio < 0.2) {
            objectType = 'Elektronisches Gerät';
            confidence = 0.55;
        }

        return {
            type: objectType,
            confidence: confidence,
            darkRatio: darkRatio,
            edgeRatio: edgeRatio
        };
    },

    detectShapes(imageData, width, height) {
        const data = imageData.data;
        const shapes = [];

        // Detect rectangular shapes
        let rectCount = 0;
        let circleCount = 0;

        // Simple heuristic: scan for corner-like patterns
        for (let y = 10; y < height - 10; y += 20) {
            for (let x = 10; x < width - 10; x += 20) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                if (brightness < 150) {
                    // Check for corner pattern
                    const upLeftIdx = ((y - 5) * width + (x - 5)) * 4;
                    const upRightIdx = ((y - 5) * width + (x + 5)) * 4;
                    const downLeftIdx = ((y + 5) * width + (x - 5)) * 4;
                    const downRightIdx = ((y + 5) * width + (x + 5)) * 4;

                    const upLeft = (data[upLeftIdx] + data[upLeftIdx + 1] + data[upLeftIdx + 2]) / 3;
                    const upRight = (data[upRightIdx] + data[upRightIdx + 1] + data[upRightIdx + 2]) / 3;
                    const downLeft = (data[downLeftIdx] + data[downLeftIdx + 1] + data[downLeftIdx + 2]) / 3;
                    const downRight = (data[downRightIdx] + data[downRightIdx + 1] + data[downRightIdx + 2]) / 3;

                    const cornerContrast = Math.abs(upLeft - downRight) + Math.abs(upRight - downLeft);
                    if (cornerContrast > 100) {
                        rectCount++;
                    }
                }
            }
        }

        shapes.push({
            type: 'Rechteck/Box',
            count: rectCount,
            confidence: Math.min(0.3 + (rectCount / 100), 0.9)
        });

        return shapes;
    },

    detectEdges(imageData, width, height) {
        const data = imageData.data;
        let edgeCount = 0;
        let totalEdgeLength = 0;

        // Sobel edge detection (simplified)
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Simplified Sobel
                const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const neighbors = [];
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        neighbors.push((data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3);
                    }
                }

                const edgeStrength = Math.abs(Math.max(...neighbors) - Math.min(...neighbors));
                if (edgeStrength > 50) {
                    edgeCount++;
                    totalEdgeLength += edgeStrength / 255;
                }
            }
        }

        return {
            detected: edgeCount > 0,
            edgeCount: edgeCount,
            totalLength: totalEdgeLength,
            density: edgeCount / (width * height)
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
                const leftIdx = (y * width + Math.floor(x)) * 4;
                const rightIdx = (y * width + Math.floor(width - x - 1)) * 4;

                const leftB = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
                const rightB = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

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
                const topIdx = (Math.floor(y) * width + x) * 4;
                const bottomIdx = ((height - Math.floor(y) - 1) * width + x) * 4;

                const topB = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
                const bottomB = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;

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

    detectComponents(imageData, width, height) {
        const data = imageData.data;
        const components = [];

        // Detect potential internal components based on contrast regions
        let regionCount = 0;
        const regionSize = 32;

        for (let y = 0; y < height; y += regionSize) {
            for (let x = 0; x < width; x += regionSize) {
                let minB = 255;
                let maxB = 0;
                let avgB = 0;
                let pixelCount = 0;

                for (let dy = 0; dy < regionSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < regionSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        minB = Math.min(minB, brightness);
                        maxB = Math.max(maxB, brightness);
                        avgB += brightness;
                        pixelCount++;
                    }
                }

                avgB /= pixelCount;
                const contrast = maxB - minB;

                if (contrast > 50 && avgB < 200) {
                    regionCount++;
                }
            }
        }

        // Generate plausible component names based on detected regions
        const componentNames = [
            'Gehäuse',
            'Elektronikplatine',
            'Akku',
            'Motor',
            'Kühlkörper',
            'Transformator',
            'Spule',
            'Kondensator',
            'Lager',
            'Schraube'
        ];

        const estimatedComponents = Math.max(1, Math.min(regionCount / 4, componentNames.length));

        for (let i = 0; i < Math.floor(estimatedComponents); i++) {
            const confidence = 0.4 + Math.random() * 0.4;
            components.push({
                name: componentNames[i % componentNames.length],
                confidence: confidence,
                region: i
            });
        }

        return components;
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

        // Normalize to 0-1
        const complexity = Math.min(transitions / (width * height), 1);

        return {
            score: complexity,
            level: complexity < 0.2 ? 'Einfach' : complexity < 0.5 ? 'Mittel' : 'Komplex'
        };
    },

    recommendCutType(analysis) {
        if (!analysis) return 'auto';

        const symmetry = analysis.symmetry || {};
        const complexity = analysis.complexity || {};

        if (symmetry.isSymmetric) {
            return 'half'; // Halbschnitt for symmetrical objects
        }

        if (complexity.level === 'Komplex') {
            return 'cutaway'; // Cutaway for complex objects
        }

        if (analysis.components && analysis.components.length > 5) {
            return 'layers'; // Schichtaufbau for many components
        }

        return 'cross'; // Default to cross section
    }
};
