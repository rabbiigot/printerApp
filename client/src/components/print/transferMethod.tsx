import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft, faQrcode} from "@fortawesome/free-solid-svg-icons";
import flashdrive from '../../assets/img/usb-brands.svg'
import { useState, useEffect } from "react";
import { CardActionArea, CardContent, Card, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import '../../assets/css/transferMethod.css'
import logo from '../../assets/img/473784450_963220275277928_6665052720062980500_n.png'
import DateTime from "../../components/dateTime"

const PrintMethod = () => {
    const [method, setMethod] = useState<string[]>([""]);
    
    const SetMethod = () => {
        setMethod(["QR", "Flashdrive"])
    }

    useEffect(() => {
        SetMethod();
    }, []); 

    const handleClick = () => {
        window.location.href = "/"
    }

    return (
        <div style={{background:"#5686e7", height:"100%", width: "100%", position: "absolute"}}>
            <div className="print-dateTime">
                <DateTime />
            </div>
            <div style={{position: "relative", 
                float: "left", 
                marginTop: "20px",
                background: "#5686e7", 
                cursor: "pointer"}}
                onClick={()=> handleClick()}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="prevIcon"/>
            </div>

            <img src={logo} alt="logo" style={{position: "absolute", height: "200px", left:"575px", top: "120px"}}/>

            <div style={{position: "relative", top:"50%", fontWeight: "500",marginRight:"20px", textAlign: "center", color: "white"}}>
                Select a File-Transfer Method
            </div>

            <div style={{position: "relative", top: "55%",marginRight:"20px", justifyContent:"center", display: "flex", gap:"20px"}}>
            {method.map((method: string, index: number) => (
                <Link to={method === "QR" ? "/print/qrscan" : "/print/flashdrive"} style={{textDecoration: "none"}}>
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
                                        {method==="QR" ? 
                                            <FontAwesomeIcon icon={faQrcode} style={{fontSize: "80px", color: "black"}}/> 
                                            : 
                                            <img src={flashdrive} alt="flashdrive" style={{fontSize: "50px", color: "black"}}/>
                                        }
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {method}
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Link>
            ))}
            </div>
        </div>
    )
}

export default PrintMethod;