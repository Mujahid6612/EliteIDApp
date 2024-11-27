import logo from "../assets/images/Elite-Logo-white.png"
interface LogoProps {
  logoWidth?: "full-logo" | "contain-logo",
}
const Logo = ({logoWidth}: LogoProps) => {
  return (
    <div className={logoWidth === "full-logo" ? "full-logo" : ""}>
    <img
      src={logo}
      alt="logo"
      className={logoWidth ? logoWidth : "logo"}
      style={{width: logoWidth === "full-logo" ? "100px" : ""}}
    />
    </div>
  )
}

export default Logo