import { useState, useEffect } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { Link } from 'react-router-dom';
import logo from '../assets/img/473784450_963220275277928_6665052720062980500_n.png'
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faCopy } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/header';

const Home: React.FC = () => {
    const [services, setServices] = useState<string[]>([""]);

    const SetService = () => {
        setServices(["Print", "Copy"])
    }

    useEffect(() => {
        SetService();
      }, []); 

    
    return(
        <div className="Home">
            <header className="App-header">
                <Header />
                <div style={{marginTop: "100px"}}>
                    <h2 style={{marginLeft: "40px", position: "relative"}}>Welcome to</h2>
                    <h1 style={{position: "relative", top: "-50px", fontSize:"60px",  marginLeft: "100px"}}>INKSYNC</h1>
                    <p style={{fontSize: "15px", position: "relative", marginLeft: "110px",top: "-90px"}}>Print at your convenience, pay with ease.</p>
                    <img src={logo} alt="logo" style={{position: "relative", float: "left", top: "-260px", height: "160px", width: "160px", marginLeft: "-40px"}}/>
                    <p style={{fontSize: "20px",  position: "relative", top: "-80px", marginTop:"40px", left:"-50px"}}>Select a service</p>
                </div>

                <div className="Service" style={{position: "relative", top:"-150px", display: "flex", gap:"20px"}}>
                    {services.map((service: string, index: number) => (
                        <Link to={service === "Print" ? "/print" : "/copy"} style={{textDecoration: "none"}}>
                            <Card key={index}>
                                <CardActionArea
                                    sx={{
                                    height: '100%',
                                    '&[data-active]': {
                                        backgroundColor: 'action.selected',
                                        '&:hover': {
                                        backgroundColor: 'action.selectedHover',
                                        },
                                    },
                                    }}
                                >
                                    <CardContent sx={{ height: '100%', width: "90px" }}>
                                            <Typography variant="h5" component="div">
                                                {service==="Print" ? 
                                                    <FontAwesomeIcon icon={faPrint} style={{fontSize: "50px", color: "black"}}/> 
                                                    : 
                                                    <FontAwesomeIcon icon={faCopy} style={{fontSize: "50px", color: "black"}}/>}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {service}
                                            </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Link>
                    ))}
                </div>
            </header>
        </div>
    )
}

export default Home