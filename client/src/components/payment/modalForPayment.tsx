import { Button, TextField} from '@mui/material';
import React from 'react'

interface ModalForPaymentProps {
    toPay: number;
    isModal: boolean;
    handleCancel: (val:boolean) => void;
}

const ModalForPayment: React.FC<ModalForPaymentProps> = ({ toPay, isModal, handleCancel }) =>  {

    const handleSetup = (val:boolean) => {
        handleCancel(val);
    }

    return (
        <div style={{position: "absolute",
            margin: "0", 
            padding: "0", 
            background: "rgb(0, 0, 0, .5)", 
            width: "100%", 
            height: "100%", 
            zIndex: "1000",
            top: "0", left: "0"
          }}>
            {isModal && (
            <div className="modal" style={{position: "absolute", 
                borderRadius: "20px", 
                border:"none", 
                padding: "20px", 
                width: "600px", 
                top: "10%", 
                left: "28%", 
                height:"450px", 
                background: "white",
                textAlign: "center"}}>   
                <h2>Please Insert Coin</h2>
                <p style={{fontSize: "15px"}}>Note: Automatically prints once payment is completed <br/>or matches the total amount due.</p>
                <hr/>
                <div style={{display: "grid", gap: "20px", marginTop: "60px", width: "250px",marginLeft:"180px", alignItems: "center"}}>
                    <TextField id="outlined-basic" label="To Pay:" variant="outlined" value={toPay + ".00 PHP"} aria-readonly sx={{
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
                <Button variant="contained" onClick={()=>{handleSetup(false)}} style={{
                    position: "absolute",
                    bottom:"20px",
                    left: "280px",
                    background: "red"
                }}>Cancel</Button>
            </div>)}
          </div>
    )
}

export default ModalForPayment;