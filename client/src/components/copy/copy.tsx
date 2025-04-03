
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint } from "@fortawesome/free-solid-svg-icons";
import DateTime from "../../components/dateTime";
import { useState } from 'react'
import scanImg from '../../assets/img/chatgpt-scan.png'
import { Button, TextField } from '@mui/material'
import ModalForPayment from '../payment/modalForPayment'

const Copy = () => {
    const [tap, setTap] = useState<boolean>(false);
    const [margin, setMargin] = useState<number>(0);
    const [colorTheme, setColorTheme] = useState<string>("Colored");
    const [numberCopy, setNumberCopy] = useState<number>(1);
    const [summary, setSummary] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [totalPay, setTotalPay] = useState<number>(0)

    const handleClick = (Val:string) => {
        if(Val === "back"){
            window.location.href = "/"
        }
        else if(Val === "tap"){
            setTap(true)
        }
        else if (Val === "grayscale"){
            setMargin(0);
            setColorTheme("Colored");
        }
        else if (Val === "colored"){
            setMargin(136);
            setColorTheme("Gray Scale");
        }
        else if (Val === "backSummary"){
            setSummary(false);
            setTap(false);
        }
    }

    const handleInc = () => {
        const increment = numberCopy + 1
        setNumberCopy(increment)
    }
    
    const handleDec = () => {
        if(numberCopy !== 1){
            const increment = numberCopy - 1
            setNumberCopy(increment)
        }
    }

    const handleSetup = (val:boolean) => {
        setModal(val);
    }

    const handleModalChange = (val: boolean) => {
        setModal(val);
    }

    const handleClickBtnTotCost = (colorTheme:string, copies: number) => {
        setSummary(true);
        if(colorTheme==="Gray Scale"){
            const total = (5)*copies;
            setTotalPay(total) 
        }
        else{
            const total = (10)*copies;
            setTotalPay(total) 
        }
    }
    return (
        <div style={{background: "#5686e7", 
            height: "100%", 
            width: "100%", 
            position: "absolute", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center"
            }}>
            <div className="print-dateTime">
                <DateTime />
            </div>
            <div style={{position: "absolute", 
                float: "left", 
                top: "0",
                marginTop: "20px",
                background: "#5686e7", 
                cursor: "pointer"}}
                onClick={()=> handleClick("back")}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="prevIcon"/>
            </div>
            {tap ? (
            <div onClick={() => handleClick("tap")} style={{
                width: "500px",
                height: "400px",
                background: "white",
                borderRadius: "10px",
                border: "5px solid rgb(37, 37, 100)"
            }}>
                {summary ? (<div>
                    <h2 style={{}}>Summary</h2>
                    <div style={{marginLeft: "40px"}}>
                        <p className="textContent" style={{marginTop: "-15px"}}>
                            <h3>No. of Copies:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"22px"}}>{numberCopy}</h3>
                        </p>
                        <p className="textContent">
                            <h3>Color Variant:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"25px"}}>{colorTheme}</h3>
                        </p>
                        <p className="textContent">
                            <h3>Output:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"77px"}}>Total Cost</h3>
                        </p>
                        <div style={{display: "grid", gap: "20px", margin: "40px 80px 0 50px"}}>
                            <TextField id="outlined-basic" label="To Pay:" variant="outlined" value={`${totalPay}.00 PHP`} aria-readonly sx={{
                                '& .MuiInputBase-input': {
                                textAlign: 'right'
                                }
                            }} />
                            <TextField id="outlined-basic" label="Inserted Coin:" variant="outlined" value="0.00 PHP" sx={{
                                '& .MuiInputBase-input': {
                                textAlign: 'right' 
                                }
                            }} />
                        </div>
                        <Button onClick={()=>handleClick("backSummary")} style={{bottom: "-90px", 
                                borderRadius: "20px",
                                background: "grey", 
                                color: "white", 
                                fontWeight: "600", 
                                position: "relative", 
                                zIndex:"12",
                                left: "90px"
                            }} 
                            variant="contained">
                                <FontAwesomeIcon icon={faArrowLeft} />&nbsp; Back
                        </Button>
                        <Button onClick={()=>handleSetup(true)} style={{top: "20px", 
                                borderRadius: "20px",
                                background: "rgb(0, 216, 47)", 
                                color: "white", 
                                fontWeight: "600", 
                                position: "relative", 
                                zIndex:"12",
                                width: "200px",
                                fontSize: "18px",
                                left: "-60px"
                            }} 
                            variant="contained">
                                Print &nbsp;<FontAwesomeIcon icon={faPrint} />
                        </Button>
                    </div>
                </div>):(<div>
                    <h2 style={{marginLeft: "120px", width: "250px", marginBottom: "50px"}}>Scan Options</h2>
                    <div style={{display: "flex", marginLeft: "40px"}}>
                        <h3>No of Copies:</h3> 
                        <h3 style={{fontWeight: "100", marginLeft:"65px", zIndex:"11"}}>{numberCopy}</h3>
                        <div style={{position: "absolute", marginLeft: "130px"}}>
                            <button onClick={handleDec} style={{border: "none", background: "white"}}>
                                <h2 style={{cursor: "pointer", 
                                    color: "#5686e7", 
                                    fontSize: "20px",
                                    padding: "0 9px 0px 8px",
                                    border: "2px solid #5686e7",
                                    borderRadius: "30px", 
                                    zIndex:"10"
                                }}>-</h2>
                            </button>
                            <button onClick={handleInc} style={{border: "none", background: "white"}}>
                                <h2 style={{cursor: "pointer", 
                                    color: "#5686e7", 
                                    fontSize: "20px",
                                    marginLeft: "40px", 
                                    padding: "1px 7px 0 6px",
                                    border: "2px solid #5686e7",
                                    borderRadius: "30px", 
                                    zIndex:"10"
                                }}>+</h2>
                            </button>
                        </div>
                    </div>
                    <div style={{display: "flex", marginLeft: "80px", marginTop: "30px"}}>
                        <div style={{position:"absolute", 
                            padding:"24.5px",
                            borderRadius:"30px", 
                            width:"135px",
                            background: margin === 0 ? "linear-gradient(45deg, purple, blue)" : "linear-gradient(45deg, black, grey)",
                            marginLeft: `${margin}px`,
                            transition: "margin-left .3s ease"
                        }}></div>
    
                        <button onClick={()=>{handleClick("grayscale")}} style={{border:"none", 
                            background: "grey", 
                            color: "white", 
                            fontSize: "25px", 
                            paddingRight: "40px",
                            padding: "10px 20px", 
                            cursor: "pointer", 
                            borderRadius: "30px 0 0 30px"
                        }}>
                            Grayscale
                        </button>
    
                        <button onClick={()=>handleClick("colored")} style={{border:"none", 
                            background: "#5686e7", 
                            color: "white", 
                            fontSize: "25px", 
                            padding: "10px 40px", 
                            cursor: "pointer", 
                            borderRadius: "0 30px 30px 0"
                        }}>
                            Colored
                        </button>
                    </div>
                    <Button variant="contained" onClick={() => handleClickBtnTotCost(colorTheme, numberCopy)} 
                        style={{marginTop: "20px", 
                            fontSize:"25px", 
                            fontWeight: "500", 
                            borderRadius: "30px", 
                            padding: "3px 40px", 
                            width: "320px", 
                            left: "-5px", 
                            color: "white", 
                            background: "rgb(7, 179, 7)",
                            textTransform: 'capitalize'
                        }}>
                        Total Cost
                    </Button>
                </div>)}
            </div>) 
            : (<div onClick={() => handleClick("tap")} style={{
                width: "600px",
                height: "600px",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{position: "relative", marginTop: "80px"}}><p style={{color: "white", fontWeight: "bold", position: "absolute", left: "150px", top: "20px"}}>Insert your document <br/> on the scanner</p></div>
                <img src={scanImg} alt="scanning" style={{
                    width: "400px",
                    top: "200px",
                    height: "400px",
                    borderRadius: "100px"
                }}/>
                <div style={{position: "relative", top: "-10px"}}><p style={{color: "white"}}>Tap to proceed</p></div>
            </div>)}
 
            {modal && (
                <div>
                    <ModalForPayment toPay={totalPay} isModal={modal} handleCancel={handleModalChange}/>
                </div>
            )}
        </div>
    )
}

export default Copy;