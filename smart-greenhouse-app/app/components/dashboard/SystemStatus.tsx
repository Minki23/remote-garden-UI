const SystemStatus = ({battery, }:{battery}) => {
  return (
    <div className="system-status">
      <h2>System Status</h2>
      <p>All systems operational.</p>
      <ul>
        <li>Temperature: 22°C</li>
        <li>Humidity: 60%</li>
        <li>Light: 75%</li>
      </ul>
    </div>
  );
}