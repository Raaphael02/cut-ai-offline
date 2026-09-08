/* =====================================================
   Main Application Module - CUT-AI
   ===================================================== */

const App = {
    state: {
        currentImage: null,
        currentImageFile: null,
        analysis: null,
        svgData: null,
        pngDataUrl: null,
        isProcessing: false
    },

    async init() {
        try {
            console.log('CUT-AI initializing...');

            // Initialize modules
            await AI.init();
            
            // Setup event listeners
            this.setupEventListeners();

            // Load saved settings
            this.loadSettings();

            // Show main screen
            this.showScreen('mainScreen');
            
            console.log('CUT-AI initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Anwendung konnte nicht initialisiert werden');
        }
    },

    setupEventListeners() {
        // Image input
        document.getElementById('galleryButton').addEventListener('click', () => this.openGallery());
        document.getElementById('cameraButton').addEventListener('click', () => this.openCamera());
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageSelect(e));

        // Generate button
        document.getElementById('generateButton').addEventListener('click', () => this.generateCrossSection());

        // Result actions
        document.getElementById('downloadPNGButton').addEventListener('click', () => this.downloadPNG());
        document.getElementById('downloadSVGButton').addEventListener('click', () => this.downloadSVG());
        document.getElementById('newAnalysisButton').addEventListener('click', () => this.newAnalysis());

        // Error handling
        document.getElementById('errorRetryButton').addEventListener('click', () => this.showScreen('mainScreen'));
    },

    loadSettings() {
        const savedSettings = Storage.getLocalStorage('settings');
        if (savedSettings) {
            document.getElementById('cutType').value = savedSettings.cutType || 'auto';
            document.getElementById('style').value = savedSettings.style || 'technical';
            document.getElementById('detail').value = savedSettings.detail || 'balanced';
            document.getElementById('hatching').value = savedSettings.hatching || 'diagonal';
        }
    },

    saveSettings() {
        const settings = {
            cutType: document.getElementById('cutType').value,
            style: document.getElementById('style').value,
            detail: document.getElementById('detail').value,
            hatching: document.getElementById('hatching').value
        };
        Storage.setLocalStorage('settings', settings);
    },

    openGallery() {
        document.getElementById('imageInput').click();
    },

    async openCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Create camera modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: black;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            `;

            const video = document.createElement('video');
            video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            video.autoplay = true;
            video.playsinline = true;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                position: absolute;
                bottom: 20px;
                display: flex;
                gap: 10px;
                z-index: 1001;
            `;

            const captureBtn = document.createElement('button');
            captureBtn.textContent = '📷 Aufnahme';
            captureBtn.style.cssText = `
                padding: 12px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 1em;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Abbrechen';
            closeBtn.style.cssText = `
                padding: 12px 20px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 1em;
            `;

            captureBtn.onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                canvas.toBlob((blob) => {
                    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                    this.processImageFile(file);
                    modal.remove();
                    stream.getTracks().forEach(track => track.stop());
                });
            };

            closeBtn.onclick = () => {
                modal.remove();
                stream.getTracks().forEach(track => track.stop());
            };

            video.srcObject = stream;
            modal.appendChild(video);
            buttonsContainer.appendChild(captureBtn);
            buttonsContainer.appendChild(closeBtn);
            modal.appendChild(buttonsContainer);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Camera access error:', error);
            this.showError('Kamera konnte nicht geöffnet werden. Überprüfen Sie die Berechtigungen.');
        }
    },

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    },

    async processImageFile(file) {
        try {
            const img = await ImageAnalysis.loadImage(file);
            this.state.currentImage = img;
            this.state.currentImageFile = file;

            // Update UI
            const preview = document.getElementById('imagePreview');
            const placeholder = document.getElementById('noImagePlaceholder');

            preview.src = img.src;
            preview.style.display = 'block';
            placeholder.style.display = 'none';

            // Enable generate button
            document.getElementById('generateButton').disabled = false;
        } catch (error) {
            console.error('Image processing error:', error);
            this.showError('Bild konnte nicht verarbeitet werden');
        }
    },

    async generateCrossSection() {
        if (!this.state.currentImage) {
            this.showError('Bitte wählen Sie zunächst ein Bild aus');
            return;
        }

        try {
            this.state.isProcessing = true;
            this.showScreen('processingScreen');
            this.saveSettings();

            // Get settings
            const settings = {
                cutType: document.getElementById('cutType').value === 'auto' 
                    ? null 
                    : document.getElementById('cutType').value,
                style: document.getElementById('style').value,
                detail: document.getElementById('detail').value,
                hatching: document.getElementById('hatching').value,
                instructions: document.getElementById('instructions').value
            };

            // Step 1: Load image
            await this.updateProgress('load', 10);
            await new Promise(r => setTimeout(r, 300));

            // Step 2: Analyze image
            await this.updateProgress('analyze', 25);
            const basicAnalysis = await ImageAnalysis.analyzeImage(this.state.currentImage, settings);
            await new Promise(r => setTimeout(r, 400));

            // Step 3: Detect features
            await this.updateProgress('detect', 40);
            const edges = basicAnalysis.edges;
            await new Promise(r => setTimeout(r, 400));

            // Step 4: Reconstruct structure
            await this.updateProgress('structure', 55);
            const aiAnalysis = await AI.analyzeImage(this.state.currentImage);
            await new Promise(r => setTimeout(r, 400));

            // Step 5: Calculate cut
            await this.updateProgress('cut', 70);
            let cutType = settings.cutType;
            if (!cutType) {
                cutType = aiAnalysis.recommendedCutType || basicAnalysis.edges.quality === 'hoch' 
                    ? 'cross' 
                    : 'half';
            }
            await new Promise(r => setTimeout(r, 400));

            // Step 6: Generate labels
            await this.updateProgress('label', 85);
            const mergedAnalysis = {
                ...aiAnalysis,
                ...basicAnalysis,
                components: aiAnalysis.components || basicAnalysis.components || []
            };
            await new Promise(r => setTimeout(r, 400));

            // Step 7: Render
            await this.updateProgress('render', 95);
            const renderSettings = { ...settings, cutType: cutType };
            const svgData = Renderer.generateCrossSection(mergedAnalysis, renderSettings);

            if (!svgData) {
                throw new Error('SVG generation failed');
            }

            this.state.analysis = mergedAnalysis;
            this.state.svgData = svgData;

            // Convert SVG to PNG
            const canvas = await Renderer.svgToCanvas(svgData, 600, 700);
            this.state.pngDataUrl = Renderer.canvasToPNG(canvas);

            // Save to local storage
            await Storage.saveAnalysis({
                objectName: mergedAnalysis.objectType?.type || 'Objekt',
                cutType: cutType,
                svgData: svgData,
                pngDataUrl: this.state.pngDataUrl,
                components: mergedAnalysis.components || [],
                analysis: mergedAnalysis,
                settings: renderSettings
            });

            await this.updateProgress('render', 100);
            await new Promise(r => setTimeout(r, 300));

            this.displayResult(mergedAnalysis, cutType);
        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Fehler bei der Erzeugung des Schnittbilds: ' + error.message);
        } finally {
            this.state.isProcessing = false;
        }
    },

    async updateProgress(stepId, progress) {
        const fill = document.getElementById('progressFill');
        if (fill) fill.style.width = progress + '%';

        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepIdAttr = step.getAttribute('data-step');
            if (stepIdAttr === stepId) {
                step.classList.add('active');
                step.querySelector('.step-icon').textContent = '⏳';
            } else if (progress >= 100) {
                step.classList.add('completed');
                step.querySelector('.step-icon').textContent = '✓';
            }
        });

        const statusMap = {
            load: 'Bild wird geladen...',
            analyze: 'Objekt wird analysiert...',
            detect: 'Konturen werden erkannt...',
            structure: 'Innenstruktur wird rekonstruiert...',
            cut: 'Schnitt wird berechnet...',
            label: 'Beschriftungen werden erzeugt...',
            render: 'Darstellung wird gerendert...'
        };

        const status = document.getElementById('processingStatus');
        if (status) status.textContent = statusMap[stepId] || 'Verarbeitung...';
    },

    displayResult(analysis, cutType) {
        // Set object name
        document.getElementById('objectName').textContent = analysis.objectType?.type || 'Technische Schnittdarstellung';

        // Display SVG
        const svgContainer = document.getElementById('svgContainer');
        svgContainer.innerHTML = this.state.svgData;

        // Result info
        const cutTypeLabels = {
            'cross': 'Querschnitt',
            'longitudinal': 'Längsschnitt',
            'half': 'Halbschnitt',
            'layers': 'Schichtaufbau',
            'cutaway': 'Cutaway-Darstellung'
        };

        document.getElementById('resultCutType').textContent = cutTypeLabels[cutType] || cutType;
        document.getElementById('resultComponentCount').textContent = (analysis.components || []).length;

        // Display components
        const componentsContainer = document.getElementById('componentsContainer');
        componentsContainer.innerHTML = '<h3>🔍 Erkannte Komponenten:</h3>';

        (analysis.components || []).forEach(comp => {
            const confColor = comp.confidence > 0.7 ? 'high' : comp.confidence > 0.5 ? 'medium' : 'low';
            const confPercent = Math.round(comp.confidence * 100);

            const div = document.createElement('div');
            div.className = 'component-item';
            div.innerHTML = `
                <div class="component-name">${comp.name}</div>
                <div class="component-description">${comp.description || 'Erkannte Komponente'}</div>
                <span class="component-confidence ${confColor}">${confPercent}% sicher</span>
            `;
            componentsContainer.appendChild(div);
        });

        // Display analysis summary
        const analysisContainer = document.getElementById('analysisContainer');
        analysisContainer.innerHTML = `
            <h3>📊 Analyse-Zusammenfassung:</h3>
            <div class="analysis-text">
                <p><strong>Objekttyp:</strong> ${analysis.objectType?.type || 'Unbekannt'}</p>
                <p><strong>Komplexität:</strong> ${analysis.complexity?.level || 'Mittel'}</p>
                <p><strong>Symmetrie:</strong> ${analysis.symmetry?.isSymmetric ? 'Symmetrisch' : 'Asymmetrisch'}</p>
                <p><strong>Erkannte Materialien:</strong> ${(analysis.materials || ['Unbekannt']).join(', ')}</p>
                <p><strong>Analyse-Methode:</strong> Lokale Bildverarbeitung</p>
                <p><strong>Hinweis:</strong> Dies ist eine Rekonstruktion basierend auf sichtbaren Merkmalen. Die tatsächliche innere Struktur kann abweichen.</p>
            </div>
        `;

        this.showScreen('resultScreen');
    },

    downloadPNG() {
        if (this.state.pngDataUrl) {
            const timestamp = new Date().toISOString().slice(0, 10);
            Renderer.downloadPNG(this.state.pngDataUrl, `CUT-AI-Schnittbild-${timestamp}.png`);
        }
    },

    downloadSVG() {
        if (this.state.svgData) {
            const timestamp = new Date().toISOString().slice(0, 10);
            Renderer.downloadSVG(this.state.svgData, `CUT-AI-Schnittbild-${timestamp}.svg`);
        }
    },

    newAnalysis() {
        // Reset state
        this.state.currentImage = null;
        this.state.currentImageFile = null;
        this.state.analysis = null;
        this.state.svgData = null;
        this.state.pngDataUrl = null;

        // Reset UI
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('noImagePlaceholder').style.display = 'flex';
        document.getElementById('generateButton').disabled = true;
        document.getElementById('instructions').value = '';

        this.showScreen('mainScreen');
    },

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
    },

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.showScreen('errorScreen');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
