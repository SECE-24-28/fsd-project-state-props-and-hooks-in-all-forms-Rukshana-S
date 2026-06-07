import adminBg from "../Assets/images/admin_background.png";

export const adminBgStyle = {
  backgroundImage: `url(${adminBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
};

export const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  zIndex: 0,
};
