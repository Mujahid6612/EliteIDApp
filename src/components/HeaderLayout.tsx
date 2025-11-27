import Logo from "./Logo";
import { APP_VERSION } from "../constants";
interface HeaderLayoutProps {
  screenName: string;
}
const HeaderLayout = ({ screenName }: HeaderLayoutProps) => {
  return (
    <div className="d-flex-sb header-layout" style={{ position: "relative" }}>
      <Logo logoWidth="contain-logo" />
      <p className="screen-name" style={{ color: "white" }}>
        {screenName}
      </p>
      <p
        style={{
          position: "absolute",
          top: "5px",
          right: "10px",
          color: "white",
          fontSize: "10px",
          margin: "0",
          fontWeight: "300",
        }}
      >
        v{APP_VERSION}
      </p>
    </div>
  );
};

export default HeaderLayout;
