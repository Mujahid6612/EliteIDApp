import Logo from "./Logo"
interface HeaderLayoutProps {
    screenName: string,
}
const HeaderLayout = ({screenName}:HeaderLayoutProps) => {
  return (
    <div className="d-flex-sb header-layout">
    <Logo logoWidth="contain-logo"/>
    <p className="screen-name" style={{color: "white"}}>{screenName}</p>
    </div>
  )
}

export default HeaderLayout