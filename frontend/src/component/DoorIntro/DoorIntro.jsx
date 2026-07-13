import "./DoorIntro.css";
import logo from "../../assets/logo/white_logo.png";

function DoorIntro() {
    return (
      <div className="doorIntro">
  
        <div className="introLogo">
          <img src={logo} alt="ZIPDAUM" />
        </div>
  
        <div className="door leftDoor"></div>
        <div className="door rightDoor"></div>
  
      </div>
    );
  }
  
  export default DoorIntro;