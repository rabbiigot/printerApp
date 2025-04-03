import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTrash, faArrowLeft, faPrint, faSquareCaretUp, faSquareCaretDown } from "@fortawesome/free-solid-svg-icons";
import DateTime from "../../components/dateTime";
import axios from 'axios';
import flashimg from '../../assets/img/flash.png';
import shield from '../../assets/img/shield.webp';
import '../../assets/css/qrMethod.css';
import {Vortex} from 'react-loader-spinner'
import { Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio  } from '@mui/material';
import * as pdfjs from 'pdfjs-dist';
import ModalForPayment from '../../components/payment/modalForPayment'

const truncateString = (str: string, maxLength: number) => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...'; 
    }
    return str; 
};

const Flashdrive = () => {
    const [pdfs, setPdfs] = useState<string[]>([]);
    const [file, setFile] = useState<string>("");
    const [fileName, setFileName] = useState('');
    const [modal, setModal] = useState<boolean>(false);
    const [pageCount, setPageCount] = useState<number>(0);
    const [value, setValue] = useState<string>("");
    const [numberCopy, setNumberCopy] = useState<number>(1);
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [summary, setSummary] = useState<boolean>(false);
    const [margin, setMargin] = useState<number>(0);
    const [colorTheme, setColorTheme] = useState<string>("");
    const [totalPay, setTotalPay] = useState<number>(0);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [toDelFile, setToDelFile] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/flashdrive')
            .then(response => {
                setPdfs(response.data.pdfs);
            })
            .catch(error => {
                console.error('Error fetching PDF files:', error);
            });
    }, []);

    const handleClick = () => {
        window.location.href = "/print"
    }

    const handleFileSelect = async (file:string) => {
        const selectedPath = `http://localhost:5000/api/pdfsflash/${file}`;
        setFile(selectedPath);
        setFileName(file);
        const loadingTask = pdfjs.getDocument(selectedPath);
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages)
    };

    const handleClickBtn = (Val:string) => {
    if(Val === "") {
        setFile("");
        setSummary(false);
    }
    else if (Val === "TotalCost") {
        setSummary(true);
    }
    else if (Val === "back") {
        setSummary(false);
    }
    else if (Val === "grayscale"){
        setMargin(0);
        setColorTheme("Colored");
    }
    else if (Val === "colored"){
        setMargin(136);
        setColorTheme("Gray Scale");
    }
    else if (Val === "cancelDelete"){
        setModalDelete(false);
    }
    else if (pdfs.includes(Val)) {
        setModalDelete(true);
        setToDelFile(Val)
    }
    }
    const handleClickBtnTotCost = (colorTheme:string, copies: number, to: string, from: string) => {
    setSummary(true);
    const numberTo = Number(to);
    const numberFrom = Number(from);
    if(value==="SpecificPages") {
        const totPages = (numberTo - numberFrom) + 1;
        if(colorTheme==="Gray Scale"){
            const total = (totPages*5)*copies;
            setTotalPay(total) 
        }
        else{
            const total = (totPages*10)*copies;
            setTotalPay(total) 
        }
    }
    else{
        if(colorTheme==="Gray Scale"){
            const total = (pageCount*5)*copies;
            setTotalPay(total) 
        }
        else{
            const total = (pageCount*10)*copies;
            setTotalPay(total) 
        }
    }
    }
    const handleSetup = (val:boolean) => {
        setModal(val);
    }
    const handleModalChange = (val: boolean) => {
        setModal(val);
    }
    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
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
    const handleFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFrom(event.target.value); 
    };
    const handleTo = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTo(event.target.value); 
    };

    const handleRefreshClick = () => {
        axios.get('http://localhost:5000/api/flashdrive')
        .then(response => {
            setPdfs(response.data.pdfs);
        })
        .catch(error => {
            console.error('Error fetching PDF files:', error);
            setPdfs([]);
        });
    }

    const handleDelete = async (fileName: string) => {
    try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/deleteflash/${fileName}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('File deleted successfully');
        } else {
            console.error('Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    } finally {
        setTimeout(() => {
            setModalDelete(false);
            setLoading(false); 
            axios.get('http://localhost:5000/api/flashdrive')
                .then((response) => {
                setPdfs(response.data.pdfs); 
                })
                .catch((error) => {
                    setPdfs([]);
                    console.error('Error fetching PDF files:', error);
                });
            }, 1000);
    }
    };
    
    return (
        <div style={{background: "#5686e7", height:"100%", width: "100%", position: "absolute"}}>
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

        {file!=="" ? (
            <div>
                <div className="iframeCover" style={{padding: "10px", 
                    background: "#5686e7", 
                    position: "absolute", 
                    borderBottom:"6px solid rgb(37, 37, 100)", 
                    left: "45px", height: "38px", 
                    width:"440px", 
                    zIndex: "11"}}>
                </div>

                <iframe src={file} title="iframePdf" className="iframeStyle" style={{
                        position:"absolute",
                        width: "450px",
                        zIndex: "10",
                        left: "50px",
                        border: "none",
                        outline: "5px solid rgb(37, 37, 100)"
                    }}
                />
                <button onClick={()=>handleClickBtn("")}style={{position: "absolute", border: "none", padding: "10px", paddingBottom: "20px", background: "rgb(37, 37, 100)", color: "white", borderRadius: "10px 0", top: "90px",right: "50px", cursor: "pointer"}}>
                    Scan Flashdrive
                </button>
            </div>
        ) : (
            <div>
                <h3 style={{top: "355px", left: "185px", color: "white", borderRadius: "5px", padding: "5px", position: "absolute"}}>Flash Drive Inserted</h3>
                <img src={flashimg} alt="qrcode" style={{zIndex: "10",position: "absolute", borderRadius: "5px", padding: "20px", top: "150px", left: "150px", height: "200px", width: "200px"}}/>
                <img src={shield} alt="qrcode" style={{zIndex: "10",position: "absolute", borderRadius: "5px", padding: "20px", top: "230px", left: "250px", height: "120px", width: "120px"}}/>
                <div style={{position: "absolute", color: "white", top:"450px", left: "150px", borderRadius: "5px", outline: "1px solid white", padding: "20px 60px 10px 50px" }}>
                    <h4 style={{color:"black", left: "-20px", top: "-10px", width: "300px", position: "absolute"}}>Print & Copy Rate per page</h4>
                    <p>Grayscale  - 5.00 pesos <br/>Colored - 10.00 pesos</p>
                </div>
                <button style={{
                    padding: "10px 20px",
                    borderRadius:"30px",
                    border: "none",
                    background: "rgb(53, 180, 64)",
                    color: "white",
                    fontSize: "15px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    top: "70px",
                    outline: "2px solid rgb(31, 117, 38)",
                    right: "340px", 
                    position: "absolute"
                }} onClick={()=>handleRefreshClick()}>
                    Rescan flashdrive
                </button>
            </div>
        )}

        <div className="pdfFiles">
            {file !== "" ? (
                <div style={{position:"absolute"}}>
                    {!summary ? 
                    (<div style={{textAlign: "left", paddingTop: "5px",paddingLeft: "50px", width:"200px"}}>
                        <h2 style={{marginLeft: "240px", width: "250px"}}>Print Options</h2>
                        <p className="textContent" style={{width: "500px"}}>
                            <h3>Filename:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"50px"}}>{truncateString(fileName, 25)}</h3>
                        </p>
                        <p className="textContent" style={{marginBottom:"20px"}}>
                            <h3>Total Pages:</h3>
                            <h3 style={{fontWeight: "100", marginLeft:"30px"}}>{pageCount}</h3>
                        </p>
                        <FormControl>
                            <FormLabel id="demo-controlled-radio-buttons-group" sx={{fontSize: "18px", marginBottom:"50px", fontWeight: "700", color: "black"}}>Pages to print:</FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={value}
                                    onChange={handleChange}
                                    sx={{marginLeft: "150px", width: "200px", padding: "0", top: "-5px", position: "absolute"}}
                                >
                                    <FormControlLabel value="AllPages" control={<Radio />} label="All Pages" />
                                    <FormControlLabel value="SpecificPages" control={<Radio />} label="Specific Page(s)" />
                                </RadioGroup>
                        </FormControl>
                        {value==="SpecificPages" && (
                            <div style={{display: "flex", margin:"10px 10px 10px 150px", width: "200px", gap:"10px"}}>
                                <TextField id="from" onChange={handleFrom} label="from" variant="outlined" value={from} type="number"/>
                                <TextField id="to" onChange={handleTo} label="To" variant="outlined" value={to} type="number"/>
                            </div>
                        )}

                        <p className="textContent" style={{width: "300px"}}>
                            <h3>No of Copies:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"20px"}}>{numberCopy}</h3>
                            <div>
                                <button onClick={handleInc} style={{border: "none", background: "white"}}>
                                    <FontAwesomeIcon style={{cursor: "pointer", 
                                        color: "#5686e7", 
                                        fontSize: "20px",
                                        position: "absolute", 
                                        left: "170px"
                                    }} 
                                    icon={faSquareCaretUp} />
                                </button>
                                <button onClick={handleDec} style={{border: "none", background: "white"}}>
                                    <FontAwesomeIcon style={{cursor: "pointer", 
                                        color: "#5686e7", 
                                        fontSize: "20px",
                                        position: "absolute", 
                                        left: "170px", 
                                        marginTop: "15px"
                                    }} 
                                    icon={faSquareCaretDown} />
                                </button>
                            </div>
                        </p>

                        <div style={{marginTop: "100px", display: "flex", marginLeft: "150px"}}>
                            <div style={{position:"absolute", 
                                padding:"24.5px",
                                borderRadius:"30px", 
                                width:"135px",
                                background: margin === 0 ? "linear-gradient(45deg, purple, blue)" : "linear-gradient(45deg, black, grey)",
                                marginLeft: `${margin}px`,
                                transition: "margin-left .3s ease"
                            }}></div>

                            <button onClick={()=>{handleClickBtn("grayscale")}} style={{border:"none", 
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

                            <button onClick={()=>handleClickBtn("colored")} style={{border:"none", 
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

                        <Button variant="contained" onClick={() => handleClickBtnTotCost(colorTheme, numberCopy, to, from)} 
                            style={{marginTop: "20px", 
                                fontSize:"25px", 
                                fontWeight: "500", 
                                borderRadius: "30px", 
                                padding: "3px 40px", 
                                width: "320px", 
                                marginLeft: "150px", 
                                color: "white", 
                                background: "rgb(7, 179, 7)",
                                textTransform: 'capitalize'
                            }}>
                            Total Cost
                        </Button>
                    </div>) : 
                    (<div style={{marginLeft: "50px"}}>
                        <h2 style={{marginLeft: "200px", marginTop: "25px"}}>Summary</h2>
                        <p className="textContent" style={{width: "100%"}}>
                            <h3>Filename:</h3> 
                            <h3 style={{fontWeight: "100", marginLeft:"60px"}}>{fileName}</h3>
                        </p>
                        <p className="textContent" style={{marginBottom:"20px"}}>
                            <h3>Pages to print:</h3><h3 style={{fontWeight: "100", marginLeft:"17px"}}>
                                {value==="SpecificPages"? (`${from} - ${to}`):(`1 - ${pageCount}`)}
                            </h3>
                        </p>
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
                        <div style={{display: "grid", gap: "20px", marginTop: "40px", marginLeft: "195px", width: "200px"}}>
                            <TextField id="outlined-basic" label="To Pay:" variant="outlined" value={totalPay + ".00 PHP"} aria-readonly sx={{
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
                        <Button onClick={()=>handleClickBtn("back")} style={{bottom: "-150px", 
                                borderRadius: "20px",
                                background: "grey", 
                                color: "white", 
                                fontWeight: "600", 
                                position: "absolute", 
                                zIndex:"12",
                                left: "50px"
                            }} 
                            variant="contained">
                                <FontAwesomeIcon icon={faArrowLeft} />&nbsp; Back
                        </Button>
                        <Button onClick={()=>handleSetup(true)} style={{top: "430px", 
                                borderRadius: "20px",
                                background: "rgb(0, 216, 47)", 
                                color: "white", 
                                fontWeight: "600", 
                                position: "absolute", 
                                zIndex:"12",
                                width: "200px",
                                fontSize: "18px",
                                left: "250px"
                            }} 
                            variant="contained">
                                Print &nbsp;<FontAwesomeIcon icon={faPrint} />
                        </Button>
                    </div>)}
                </div>
                ) : (
                pdfs.length === 0 ? (
                    <p style={{ position: "absolute", top: "40%", left: "40%" }}>
                        No PDF files found.
                    </p>
                ) : (
                    pdfs.map((pdf, index) => (
                    <div key={index}>
                        <button onClick={()=>handleClickBtn(pdf)} style={{
                            position: "absolute",
                            marginLeft: "11px",
                            borderRadius: "50%",
                            padding: "2px 7px 3px 7px",
                            border: "none",
                            color:"white",
                            top: "10px",
                            cursor: "pointer",
                            background: "grey"
                        }}>x</button>
                        <div onClick={() => handleFileSelect(pdf)} style={{ cursor: "pointer" }}>
                        <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: "50px", color: "red" }} />
                        <div>{truncateString(pdf, 25)}</div>
                        </div>
                    </div>
                    ))
                )
            )}
        </div>

        {modal && (
            <div>
                <ModalForPayment toPay={totalPay} isModal={modal} handleCancel={handleModalChange}/>
            </div>
        )}

        {modalDelete && (
            <div style={{position: "absolute",
                margin: "0", 
                padding: "0", 
                background: "rgb(0, 0, 0, .5)", 
                width: "100%", 
                height: "100%", 
                zIndex: "1000"
              }}>
                <div className="modal" style={{position: "absolute", 
                    borderRadius: "10px", 
                    border:"none", 
                    padding: "10px", 
                    width: "350px", 
                    top: "40%", 
                    left: "38%", 
                    height:"150px", 
                    background: "white",
                    textAlign: "center"}}>   
                    {loading ? (<div>
                        <FontAwesomeIcon style={{color: "red", position: "absolute", fontSize: "25px",top: "58px", left: "174px"}} icon={faTrash} />
                        <Vortex
                            visible={true}
                            height="120"
                            width="120"
                            ariaLabel="vortex-loading"
                            wrapperStyle={{}}
                            wrapperClass="vortex-wrapper"
                            colors={['red', 'red', 'red', 'red', 'red', 'red']}
                        />
                        <p style={{top: "110px", left: "50px", position: "absolute",}}>Please wait while we delete your file...</p>
                    </div>) : 
                    (<div>
                        <p>Are you sure you want to delete this file?</p>
                        <h5>{toDelFile}</h5>
                        <Button variant="contained" onClick={()=>{handleClickBtn("cancelDelete")}} style={{
                            position: "absolute",
                            bottom:"20px",
                            left: "150px",
                            background: "red"
                        }}>Cancel</Button>
                        <Button variant="contained" onClick={()=>{handleDelete(toDelFile)}} style={{
                            position: "absolute",
                            bottom:"20px",
                            left: "250px",
                        }}>Confirm</Button>
                    </div>)}
                </div>
              </div>
        )}
    </div>
    )
}

export default Flashdrive;