import React from "react";
import { Wheel } from "react-custom-roulette";

const SpinWheelComponent = ({ mustSpin, prizeNumber, onStopSpinning }) => {
  const data = [
    { option: "15% OFF", style: { backgroundColor: "#f8ecee", textColor: "#2b2b2b" } },
    { option: "FREE SHIPPING", style: { backgroundColor: "#2b2b2b", textColor: "#ffffff" } },
    { option: "Not Lucky", style: { backgroundColor: "#e9d9dc", textColor: "#2b2b2b" } },
    { option: "25% OFF", style: { backgroundColor: "#f8ecee", textColor: "#2b2b2b" } },
    { option: "FREE SHIPPING", style: { backgroundColor: "#2b2b2b", textColor: "#ffffff" } },
    { option: "Not Lucky", style: { backgroundColor: "#e9d9dc", textColor: "#2b2b2b" } },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0" }}>
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        onStopSpinning={onStopSpinning}
        backgroundColors={["#ffffff"]}
        textColors={["#2b2b2b"]}
        outerBorderColor="#e9d9dc"
        outerBorderWidth={5}
        innerBorderColor="#ffffff"
        innerRadius={10}
        radiusLineColor="#e9d9dc"
        radiusLineWidth={2}
        fontSize={16}
      />
    </div>
  );
};

export default SpinWheelComponent;
