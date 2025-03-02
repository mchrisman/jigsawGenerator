class HandyEqualizer {
    constructor(containerQuerySelector, numBands = 7, onChange = null) {
        this.container = document.querySelector(containerQuerySelector);
        if (!this.container) throw new Error('Container not found');
        
        this.numBands = numBands;
        this.onChange = onChange;
        this.isLocked = false;
        this.debounceTimeout = null;
        this.lastPositions = null;
        
        this.initializeDOM();
        this.initializeEventListeners();
    }

    initializeDOM() {
        this.container.classList.add('heq-container');
        
        // Create controls
        const controls = document.createElement('div');
        controls.classList.add('heq-controls');
        
        this.modeToggle = document.createElement('button');
        this.modeToggle.classList.add('heq-control-btn');
        this.modeToggle.textContent = '🔓';
        
        this.resetButton = document.createElement('button');
        this.resetButton.classList.add('heq-control-btn');
        this.resetButton.textContent = '↺';
        
        controls.appendChild(this.modeToggle);
        controls.appendChild(this.resetButton);
        
        // Create sliders container
        this.slidersContainer = document.createElement('div');
        this.slidersContainer.classList.add('heq-sliders');
        this.slidersContainer.style.gap = '0.7em';
        
        // Create sliders
        this.sliders = [];
        for (let i = 0; i < this.numBands; i++) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('heq-slider-wrap');
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = '0';
            slider.step = '1';
            
            wrapper.appendChild(slider);
            this.slidersContainer.appendChild(wrapper);
            this.sliders.push(slider);
        }
        
        // Add everything to container
        this.container.appendChild(controls);
        this.container.appendChild(this.slidersContainer);
    }

    initializeEventListeners() {
        const handleSliderChange = (event, index) => {
            if (this.isLocked) {
                const currentVal = parseFloat(event.target.value);
                const positions = this.getEQ();
                
                if (this.lastPositions === null) {
                    this.lastPositions = positions;
                }
                
                const diff = currentVal/100 - this.lastPositions[index];
                
                const newPositions = positions.map((pos, i) => {
                    if (i === index) return currentVal/100;
                    return pos + diff;
                });
                
                if (newPositions.some(pos => pos < 0 || pos > 1)) {
                    this.setEQ(this.lastPositions);
                    return;
                }
                
                this.setEQ(newPositions);
                this.lastPositions = newPositions;
            }
            
            if (this.onChange) {
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = setTimeout(() => {
                    this.onChange(this.getEQ());
                }, 50);
            }
        };

        this.sliders.forEach((slider, index) => {
            slider.addEventListener('mousedown', (e) => {
                if (this.isLocked) {
                    this.lastPositions = this.getEQ();
                }
            });
            
            slider.addEventListener('input', (e) => handleSliderChange(e, index));
            
            slider.addEventListener('mouseup', () => {
                this.lastPositions = null;
            });
        });

        this.modeToggle.addEventListener('click', () => {
            this.isLocked = !this.isLocked;
            this.slidersContainer.style.gap = this.isLocked ? '0' : '0.7em';
            this.modeToggle.textContent = this.isLocked ? '🔒' : '🔓';
        });

        this.resetButton.addEventListener('click', () => {
            this.setEQ(new Array(this.numBands).fill(0));
            if (this.onChange) this.onChange(this.getEQ());
        });
    }

    getEQ() {
        return this.sliders.map(slider => parseFloat(slider.value) / 100);
    }

    setEQ(positions) {
        if (!Array.isArray(positions) || positions.length !== this.numBands) {
            throw new Error('Invalid positions array');
        }
        
        positions.forEach((pos, i) => {
            if (pos < 0 || pos > 1) {
                throw new Error('Position values must be between 0 and 1');
            }
            this.sliders[i].value = Math.round(pos * 100);
        });
    }
}

// Demo usage
document.addEventListener('DOMContentLoaded', () => {
    const eq = new HandyEqualizer('#demo-equalizer', 7, (positions) => {
        console.log('EQ changed:', positions);
    });
});
