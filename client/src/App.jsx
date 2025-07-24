import { useState } from 'react'
import './App.css'

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/divider/divider.js';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="md-typescale-display-medium">Material Web Components</h1>
        <p className="md-typescale-body-large">Vite + React + Material Design 3</p>
      </header>

      {/* Main content */}
      <main className="main-content">
        {/* Counter Card */}
        <md-elevated-card className="demo-card">
          <div className="card-content">
            <h2 className="md-typescale-headline-medium">Interactive Counter</h2>
            <p className="md-typescale-body-medium">
              Click the button below to increment the counter using Material Web Components.
            </p>
            <div className="counter-section">
              <p className="md-typescale-title-large">Count: {count}</p>
              <md-filled-button onClick={() => setCount(count + 1)}>
                Increment Counter
              </md-filled-button>
              <md-outlined-button onClick={() => setCount(0)}>
                Reset
              </md-outlined-button>
            </div>
          </div>
        </md-elevated-card>

        {/* Form Demo Card */}
        <md-elevated-card className="demo-card">
          <div className="card-content">
            <h2 className="md-typescale-headline-medium">Form Controls</h2>
            <p className="md-typescale-body-medium">
              Check out these Material Design 3 form controls in action!
            </p>
            
            <form className="demo-form">
              <div className="form-section">
                <h3 className="md-typescale-title-medium">Checkboxes</h3>
                <label className="checkbox-label">
                  <md-checkbox checked></md-checkbox>
                  <span className="md-typescale-body-medium">Material Design 3</span>
                </label>
                <label className="checkbox-label">
                  <md-checkbox></md-checkbox>
                  <span className="md-typescale-body-medium">Web Components</span>
                </label>
              </div>

              <md-divider></md-divider>

              <div className="form-section">
                <h3 className="md-typescale-title-medium">Radio Buttons</h3>
                <div className="radio-group">
                  <label className="radio-label">
                    <md-radio name="theme" checked></md-radio>
                    <span className="md-typescale-body-medium">Light Theme</span>
                  </label>
                  <label className="radio-label">
                    <md-radio name="theme"></md-radio>
                    <span className="md-typescale-body-medium">Dark Theme</span>
                  </label>
                  <label className="radio-label">
                    <md-radio name="theme"></md-radio>
                    <span className="md-typescale-body-medium">Auto Theme</span>
                  </label>
                </div>
              </div>

              <md-divider></md-divider>

              <div className="form-section">
                <h3 className="md-typescale-title-medium">Text Fields</h3>
                <md-outlined-text-field 
                  label="Your Name" 
                  placeholder="Enter your name"
                  style={{ width: '100%', marginBottom: '16px' }}>
                </md-outlined-text-field>
                <md-outlined-text-field 
                  label="Favorite Color" 
                  value="Purple"
                  style={{ width: '100%' }}>
                </md-outlined-text-field>
              </div>

              <div className="form-actions">
                <md-outlined-button type="reset">Reset Form</md-outlined-button>
                <md-filled-button type="submit">Submit</md-filled-button>
              </div>
            </form>
          </div>
        </md-elevated-card>

        {/* Typography Demo Card */}
        <md-elevated-card className="demo-card">
          <div className="card-content">
            <h2 className="md-typescale-headline-medium">Typography Scale</h2>
            <p className="md-typescale-body-medium">
              Material Design 3 typography scale using Roboto font.
            </p>
            
            <div className="typography-demo">
              <h1 className="md-typescale-display-large">Display Large</h1>
              <h2 className="md-typescale-display-medium">Display Medium</h2>
              <h3 className="md-typescale-headline-large">Headline Large</h3>
              <h4 className="md-typescale-headline-medium">Headline Medium</h4>
              <h5 className="md-typescale-title-large">Title Large</h5>
              <h6 className="md-typescale-title-medium">Title Medium</h6>
              <p className="md-typescale-body-large">Body Large - This is body text in the large size.</p>
              <p className="md-typescale-body-medium">Body Medium - This is body text in the medium size.</p>
              <p className="md-typescale-label-large">Label Large</p>
              <p className="md-typescale-label-medium">Label Medium</p>
            </div>
          </div>
        </md-elevated-card>
      </main>
    </div>
  )
}
  
export default App
