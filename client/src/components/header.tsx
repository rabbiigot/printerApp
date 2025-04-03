import React from 'react';
import { Button } from '@mui/material';
import '../assets/css/header.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import DateTime from './dateTime'

const Header: React.FC = () => {

  return (
    <div className="header-container">
      <div style={{position: "absolute", top: "0", display: "flex", width: "300px", left:"-650px"}}>
        <DateTime/>
      </div>
      <div style={{position: "fixed", right:"20px", top: "20px"}}>
        <Button sx={{color: "white", 
            background: "royalblue", 
            borderRadius: "20px", 
            padding: "5px 20px",
        }}>
            Sign in <FontAwesomeIcon icon={faUserTie} style={{fontSize:"20px", marginLeft: "10px"}} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
