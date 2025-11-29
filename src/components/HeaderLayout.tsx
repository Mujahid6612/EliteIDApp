import Logo from "./Logo"
interface HeaderLayoutProps {
    screenName: string,
    style?: React.CSSProperties
}
const HeaderLayout = ({screenName, style}:HeaderLayoutProps) => {
  return (
    <div className="d-flex-sb header-layout">
    <Logo logoWidth="contain-logo"/>
    <p className="screen-name" style={{color: "white", ...style}}>{screenName}</p>
    </div>
  )
}

export default HeaderLayout