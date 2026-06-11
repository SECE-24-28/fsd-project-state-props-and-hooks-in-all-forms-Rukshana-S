import React, { useState, useEffect, useRef } from "react";
import "../Assets/Css/spinWheelComponent.css";

const data = [
  { option: "15% OFF", bg: "#efe3e5", color: "#2f2f2f" },
  { option: "FREE SHIPPING", bg: "#2f2f2f", color: "#ffffff" },
  { option: "Not Lucky", bg: "#efe3e5", color: "#2f2f2f" },
  { option: "25% OFF", bg: "#2f2f2f", color: "#ffffff" },
  { option: "FREE SHIPPING", bg: "#efe3e5", color: "#2f2f2f" },
  { option: "Not Lucky", bg: "#2f2f2f", color: "#ffffff" },
];

const SpinWheelComponent = ({ mustSpin, prizeNumber, onStopSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (mustSpin && !isSpinning) {
      setIsSpinning(true);
      
      const totalRotations = Math.floor(rotation / 360);
      // 5 full extra rotations for the animation + target offset
      const nextRotation = (totalRotations + 5) * 360 + (360 - (prizeNumber * 60));
      
      setRotation(nextRotation);
    }
  }, [mustSpin, prizeNumber, isSpinning, rotation]);

  const handleTransitionEnd = () => {
    if (isSpinning) {
      setIsSpinning(false);
      if (onStopSpinning) {
        onStopSpinning();
      }
    }
  };

  return (
    <div className="wheel-wrapper">
      <div className="pointer-container">
        <div className="pointer"></div>
      </div>
      <div 
        className="wheel" 
        ref={wheelRef}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? "transform 5s cubic-bezier(.17,.67,.12,.99)" : "none"
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="wheel-inner">
          {data.map((item, i) => (
            <div 
              key={i} 
              className="wheel-text-wrapper"
              style={{ transform: `rotate(${i * 60}deg)` }}
            >
              <div className="wheel-text" style={{ color: item.color }}>
                {item.option}
              </div>
            </div>
          ))}
          <div className="hub"></div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelComponent;
