export function Controls() {
  return (
    <>
      <div className="card">
        <h3>Keyboard & mouse</h3>
        <ul className="list">
          <li>
            <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys - move
          </li>
          <li>
            <kbd>Shift</kbd> - run · <kbd>Space</kbd> - jump
          </li>
          <li>
            <strong>Mouse look:</strong> click the world to capture the mouse, then just move it to look
            around. <kbd>Esc</kbd> releases it (it also lets go whenever a panel or menu opens). Scroll to
            zoom.
          </li>
          <li>
            <kbd>E</kbd> - interact with the highlighted object (a click does the same while the mouse is
            captured)
          </li>
          <li>
            <kbd>M</kbd> - world map · <kbd>Esc</kbd> - close panel or menu
          </li>
          <li>
            Prefer the classic way? Turn off <em>Mouse look</em> in Settings, then drag to look and click the
            ground to walk or any marked object to visit it.
          </li>
        </ul>
      </div>
      <div className="card">
        <h3>Paintball gun (optional)</h3>
        <ul className="list">
          <li>
            <kbd>F</kbd> or the paint button - take out or put away the gun
          </li>
          <li>
            With the mouse captured, the camera moves over your shoulder and the centre crosshair is where
            shots go
          </li>
          <li>
            Click to shoot (balls arc with gravity); without mouse capture, click where you want to shoot
          </li>
          <li>Shoot an exhibit or sign to open it (not during a game)</li>
          <li>Games, targets and enemies live on the Splat Arena island and never block the main routes</li>
        </ul>
      </div>
      <div className="card">
        <h3>Touch</h3>
        <ul className="list">
          <li>Use the joystick to move (push far to run)</li>
          <li>Drag the view to look · pinch to zoom · tap the ground to walk</li>
          <li>Tap the yellow button to open nearby objects</li>
          <li>Paint button - gun out, then tap where you want to shoot</li>
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
