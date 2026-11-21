export function Controls() {
  return (
    <>
      <div className="card">
        <h3>Keyboard & mouse</h3>
        <ul className="list">
          <li>
            <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys — move
          </li>
          <li>
            <kbd>Shift</kbd> — run · <kbd>Space</kbd> — jump
          </li>
          <li>
            <kbd>E</kbd> — interact with the highlighted object
          </li>
          <li>
            <kbd>M</kbd> — world map · <kbd>Esc</kbd> — close panel or menu
          </li>
          <li>Drag to look around · scroll to zoom</li>
          <li>Click the ground to walk there · click any glowing-marked object to visit it</li>
        </ul>
      </div>
      <div className="card">
        <h3>Touch</h3>
        <ul className="list">
          <li>Use the joystick to move (push far to run)</li>
          <li>Drag the view to look · pinch to zoom · tap the ground to walk</li>
          <li>Tap the yellow button to open nearby objects</li>
        </ul>
      </div>
      <div className="card">
        <h3>In a hurry?</h3>
        <p style={{ margin: 0 }}>
          Open the <strong>Explore</strong> menu to jump straight to any section, use the map to travel
          instantly, or switch to the <a href="#/classic">classic portfolio view</a>.
        </p>
      </div>
    </>
  );
}
